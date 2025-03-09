const Statement = require('../models/statement.model');
const statementService = require('../services/statement.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Process M-Pesa SMS message
 */
exports.processSms = async (req, res) => {
  try {
    const { smsText } = req.body;
    
    if (!smsText) {
      return sendError(res, 'No SMS text provided', 'NO_SMS_TEXT', 400);
    }

    // Process the SMS message
    const result = await statementService.processSmsMessage(smsText, req.user.id);

    if (!result.success) {
      return sendError(res, result.error.message, result.error.code, 400);
    }

    // Check if this is a bulk transaction (combined statement)
    if (result.isBulk) {
      return sendSuccess(res, {
        statement: result.statement,
        transactions: result.transactions,
        transactionCount: result.transactions.length
      }, 'Combined statement processed successfully', 201);
    }

    return sendSuccess(res, {
      transaction: result.transaction
    }, 'SMS processed successfully', 201);
  } catch (error) {
    console.error('SMS processing error:', error);
    return sendError(res, 'Server error during SMS processing', 'SMS_PROCESSING_ERROR', 500);
  }
};

/**
 * Get all statements for a user
 */
exports.getStatements = async (req, res) => {
  try {
    const statements = await Statement.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    return sendSuccess(res, statements, 'Statements retrieved successfully');
  } catch (error) {
    console.error('Get statements error:', error);
    return sendError(res, 'Server error while fetching statements', 'STATEMENTS_FETCH_ERROR', 500);
  }
};

/**
 * Get a specific statement
 */
exports.getStatementById = async (req, res) => {
  try {
    const statement = await Statement.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!statement) {
      return sendError(res, 'Statement not found', 'STATEMENT_NOT_FOUND', 404);
    }

    return sendSuccess(res, statement, 'Statement retrieved successfully');
  } catch (error) {
    console.error('Get statement error:', error);
    return sendError(res, 'Server error while fetching statement', 'STATEMENT_FETCH_ERROR', 500);
  }
};

/**
 * Delete a statement and its transactions
 */
exports.deleteStatement = async (req, res) => {
  try {
    const result = await statementService.deleteStatement(req.params.id, req.user.id);
    
    if (!result.success) {
      return sendError(res, result.error.message, result.error.code, result.error.code === 'NOT_FOUND' ? 404 : 400);
    }

    return sendSuccess(res, {
      id: req.params.id,
      transactionsDeleted: result.transactionsDeleted
    }, 'Statement and associated transactions deleted successfully');
  } catch (error) {
    console.error('Delete statement error:', error);
    return sendError(res, 'Server error while deleting statement', 'STATEMENT_DELETE_ERROR', 500);
  }
};

/**
 * Get statement statistics
 */
exports.getStatementStatistics = async (req, res) => {
  try {
    const result = await statementService.getStatementStatistics(req.user.id);
    
    if (!result.success) {
      return sendError(res, result.error.message, result.error.code, 400);
    }

    return sendSuccess(res, result.statistics, 'Statement statistics retrieved successfully');
  } catch (error) {
    console.error('Get statement statistics error:', error);
    return sendError(res, 'Server error while fetching statement statistics', 'STATISTICS_ERROR', 500);
  }
}; 