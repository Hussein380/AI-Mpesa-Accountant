// Import Gemini service
const geminiService = require('../services/gemini.service');
const User = require('../models/user.model');
const ChatSession = require('../models/chat.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');

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
        return sendError(
          res, 
          'Free message limit reached. Please sign up to continue.', 
          'FREE_LIMIT_REACHED', 
          403,
          { limitReached: true }
        );
      }
      
      // Increment the message count for this session
      if (req.session) {
        req.session.messageCount = (req.session.messageCount || 0) + 1;
      }
    }

    // Get or create chat session
    let chatSession;
    if (userId) {
      if (sessionId) {
        chatSession = await ChatSession.findOne({ 
          _id: sessionId,
          user: userId
        });
      }
      
      if (!chatSession) {
        chatSession = new ChatSession({
          user: userId,
          messages: []
        });
        await chatSession.save();
      }
    }

    // Process the message with Gemini
    const aiResponse = await geminiService.generateChatResponse(message, userId);

    // Save the message and response to the chat session if authenticated
    if (userId && chatSession) {
      chatSession.messages.push(
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse }
      );
      await chatSession.save();
    }

    return sendSuccess(res, {
      response: aiResponse,
      sessionId: chatSession?._id
    }, 'AI response generated successfully');
  } catch (error) {
    console.error('Chat completion error:', error);
    return sendError(res, 'Error generating AI response', 'AI_ERROR', 500);
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
      return sendError(res, 'Statement not found', 'STATEMENT_NOT_FOUND', 404);
    }

    // Get transactions linked to this statement
    const Transaction = require('../models/transaction.model');
    const transactions = await Transaction.find({
      user: userId,
      date: {
        $gte: statement.startDate,
        $lte: statement.endDate
      }
    }).sort({ date: 1 });

    if (transactions.length === 0) {
      return sendError(res, 'No transactions found for this statement', 'NO_TRANSACTIONS', 400);
    }

    // Generate analysis using Gemini
    const analysis = await geminiService.analyzeTransactions(transactions);

    // Update statement with analysis
    statement.analysis = analysis;
    statement.isAnalyzed = true;
    await statement.save();

    return sendSuccess(res, {
      statementId,
      analysis
    }, 'Statement analyzed successfully');
  } catch (error) {
    console.error('Statement analysis error:', error);
    return sendError(res, 'Error analyzing statement', 'ANALYSIS_ERROR', 500);
  }
};

/**
 * Categorize transactions using AI
 */
exports.categorizeTransactions = async (req, res) => {
  try {
    const { transactionIds } = req.body;
    const userId = req.user.id;

    if (!transactionIds || !Array.isArray(transactionIds)) {
      return sendError(res, 'Transaction IDs must be provided as an array', 'INVALID_INPUT', 400);
    }

    // Get transactions
    const Transaction = require('../models/transaction.model');
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
      user: userId
    });

    if (transactions.length === 0) {
      return sendError(res, 'No transactions found with the provided IDs', 'NO_TRANSACTIONS', 404);
    }

    // Generate categories using Gemini
    const categorizedTransactions = await geminiService.categorizeTransactions(transactions);

    // Update transactions with categories
    const updatePromises = categorizedTransactions.map(async (transaction) => {
      await Transaction.findByIdAndUpdate(
        transaction._id,
        { category: transaction.category }
      );
      return transaction;
    });

    const updatedTransactions = await Promise.all(updatePromises);

    return sendSuccess(res, updatedTransactions, 'Transactions categorized successfully');
  } catch (error) {
    console.error('Transaction categorization error:', error);
    return sendError(res, 'Error categorizing transactions', 'CATEGORIZATION_ERROR', 500);
  }
}; 