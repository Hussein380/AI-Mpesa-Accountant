// Import Gemini service
const geminiService = require('../services/gemini.service');
const User = require('../models/user.model');
const ChatSession = require('../models/chat.model');

// Define constants
const FREE_MESSAGE_LIMIT = parseInt(process.env.MAX_FREE_MESSAGES) || 3;

/**
 * Chat with AI
 */
exports.chatCompletion = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user ? req.user.id : null;
    
    // Check if this is a free chat (no authentication)
    if (!userId) {
      // For free chat, check if the IP has exceeded the free message limit
      const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      
      // Get the free message limit from environment variables or use default
      const usedMessages = req.session?.messageCount || 0;
      
      if (usedMessages >= FREE_MESSAGE_LIMIT) {
        return res.status(403).json({ 
          message: 'Free message limit reached. Please sign up to continue.',
          limitReached: true
        });
      }
      
      // Increment message count
      if (!req.session) req.session = {};
      req.session.messageCount = (req.session.messageCount || 0) + 1;
    }

    // Get conversation history if sessionId is provided
    let history = [];
    if (sessionId) {
      const chatSession = await ChatSession.findById(sessionId);
      if (chatSession && chatSession.messages) {
        history = chatSession.messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      }
    }

    // Generate AI response using Gemini
    const aiResponse = await geminiService.generateChatResponse(message, history);
    
    // Save the chat message to the database if user is authenticated
    if (userId && sessionId) {
      await ChatSession.findByIdAndUpdate(
        sessionId,
        { 
          $push: { 
            messages: [
              { content: message, sender: 'user' },
              { content: aiResponse, sender: 'ai' }
            ] 
          },
          lastUpdated: new Date()
        },
        { new: true, upsert: true }
      );
    }

    res.json({
      message: aiResponse,
      sessionId: sessionId || 'free-session',
      limitReached: !userId && (req.session?.messageCount >= FREE_MESSAGE_LIMIT)
    });
  } catch (error) {
    console.error('Chat completion error:', error);
    res.status(500).json({ message: 'Server error during AI chat' });
  }
};

/**
 * Analyze M-Pesa statement
 */
exports.analyzeStatement = async (req, res) => {
  try {
    const { statementId } = req.body;
    const userId = req.user.id;

    // Get the statement from the database
    const Statement = require('../models/statement.model');
    const statement = await Statement.findOne({
      _id: statementId,
      user: userId
    });

    if (!statement) {
      return res.status(404).json({ message: 'Statement not found' });
    }

    // Get transactions linked to this statement
    const Transaction = require('../models/Transaction');
    const transactions = await Transaction.find({
      user: userId,
      statement: statementId
    });

    if (transactions.length === 0) {
      // If no transactions are linked to the statement, return a message
      return res.status(400).json({ message: 'No transactions found for this statement' });
    }

    // Use Gemini to analyze transactions
    const insights = await geminiService.analyzeTransactions(transactions);

    // Update statement with analysis results
    await Statement.findByIdAndUpdate(statementId, {
      isAnalyzed: true,
      totalIncome: insights.totalIncome,
      totalExpenses: insights.totalExpenses,
      finalBalance: insights.balance,
      analysisResults: insights
    });

    res.json({
      message: 'Statement analyzed successfully',
      insights
    });
  } catch (error) {
    console.error('Statement analysis error:', error);
    res.status(500).json({ message: 'Server error during statement analysis' });
  }
};

/**
 * Categorize transactions
 */
exports.categorizeTransactions = async (req, res) => {
  try {
    const { transactionIds } = req.body;
    const userId = req.user.id;

    if (!transactionIds || !Array.isArray(transactionIds)) {
      return res.status(400).json({ message: 'Transaction IDs are required' });
    }

    const Transaction = require('../models/Transaction');
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
      user: userId
    });

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found' });
    }

    // Process each transaction
    const results = [];
    for (const transaction of transactions) {
      const category = await geminiService.categorizeTransaction(transaction);
      
      // Update transaction with category
      await Transaction.findByIdAndUpdate(transaction._id, { category });
      
      results.push({
        transactionId: transaction._id,
        category
      });
    }

    res.json({
      message: 'Transactions categorized successfully',
      results
    });
  } catch (error) {
    console.error('Transaction categorization error:', error);
    res.status(500).json({ message: 'Server error during transaction categorization' });
  }
}; 