// Import Gemini service
const geminiService = require('../services/gemini.service');
const contextEnrichmentService = require('../services/contextEnrichment.service');
const User = require('../models/user.model');
const ChatSession = require('../models/chat.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Define constants
const FREE_MESSAGE_LIMIT = parseInt(process.env.MAX_FREE_MESSAGES) || 3;

/**
 * Handle chat completion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.chatCompletion = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user ? req.user.id : null;
    
    // Validate input
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Message is required', code: 'MISSING_MESSAGE' },
        statusCode: 400
      });
    }
    
    // Get financial context if user is authenticated
    let financialContext = null;
    let hasFinancialContext = false;
    let hasVisualizationReferences = false;
    
    if (userId) {
      // Extract query intent
      const queryIntent = await contextEnrichmentService.extractQueryIntent(message);
      
      // Only enrich financial queries
      if (queryIntent.isFinancialQuery) {
        // Get financial summary
        const summary = await contextEnrichmentService.getFinancialSummary(userId);
        
        // Get relevant transactions
        const transactions = await contextEnrichmentService.getRelevantTransactions(userId, message);
        
        // Create financial context
        financialContext = contextEnrichmentService.createFinancialContext(summary, transactions, message);
      }
    }
    
    // Format messages for Gemini
    const formattedMessages = Array.isArray(history) ? history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) : [];
    
    // Add current message
    formattedMessages.push({
      role: 'user',
      content: message
    });
    
    // Generate chat completion
    const completion = await geminiService.generateChatCompletion(formattedMessages, { 
      financialContext 
    });
    
    // Extract response data
    const responseText = completion.text;
    hasFinancialContext = completion.hasFinancialContext;
    hasVisualizationReferences = completion.hasVisualizationReferences;
    
    // Return response
    return res.status(200).json({
      success: true,
      message: 'Chat completion generated successfully',
      data: {
        response: responseText,
        hasFinancialContext,
        hasVisualizationReferences
      }
    });
  } catch (error) {
    console.error('Error in chat completion:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to generate chat completion', code: 'CHAT_COMPLETION_ERROR' },
      statusCode: 500
    });
  }
};

/**
 * Extract query intent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.extractQueryIntent = async (req, res) => {
  try {
    const { query } = req.body;
    
    // Validate input
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Query is required', code: 'MISSING_QUERY' },
        statusCode: 400
      });
    }
    
    // Extract query intent
    const intent = await contextEnrichmentService.extractQueryIntent(query);
    
    // Return response
    return res.status(200).json({
      success: true,
      message: 'Query intent extracted successfully',
      data: intent
    });
  } catch (error) {
    console.error('Error extracting query intent:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to extract query intent', code: 'QUERY_INTENT_ERROR' },
      statusCode: 500
    });
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