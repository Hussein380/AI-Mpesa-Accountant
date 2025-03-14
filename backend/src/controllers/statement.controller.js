const Statement = require('../models/statement.model');
const statementService = require('../services/statement.service');
const pdfParserService = require('../services/pdfParser.service');
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

/**
 * Process M-Pesa PDF statement
 */
exports.processPdf = async (req, res) => {
  try {
    const { pdfData, statementId, statementDate, statementPeriod } = req.body;
    const userId = req.user.id;
    
    console.log('processPdf: Starting PDF processing for user:', userId);
    console.log('processPdf: PDF data type:', typeof pdfData);
    console.log('processPdf: PDF data summary length:', pdfData.summaryData ? pdfData.summaryData.length : 'N/A');
    
    if (!pdfData) {
      return sendError(res, 'No PDF data provided', 'NO_PDF_DATA', 400);
    }

    // Ensure all data has source set to PDF
    if (pdfData.summaryData) {
      pdfData.summaryData.forEach(item => {
        item.source = 'PDF';
      });
      console.log('processPdf: Added source=PDF to all summary data items');
    }

    // Ensure statement has source set to PDF
    if (pdfData.statement) {
      pdfData.statement.source = 'PDF';
    }

    // Ensure customer info has source set to PDF
    if (pdfData.customerInfo) {
      pdfData.customerInfo.source = 'PDF';
    }
    
    // Process the PDF statement
    const statementInfo = {
      statementId,
      statementDate,
      statementPeriod
    };
    
    console.log('processPdf: Calling pdfParserService with statement info:', statementInfo);
    
    const result = await pdfParserService.processPdfStatement(pdfData, userId, statementInfo);
    
    console.log('processPdf: PDF processing result:', {
      transactionCount: result.transactions.length,
      income: result.stats.income,
      expenses: result.stats.expenses,
      totalAmount: result.stats.income - result.stats.expenses
    });
    
    // Log the first few transactions for debugging
    if (result.transactions.length > 0) {
      console.log('processPdf: First transaction example:', {
        id: result.transactions[0]._id,
        type: result.transactions[0].type,
        amount: result.transactions[0].amount,
        source: result.transactions[0].source,
        description: result.transactions[0].description
      });
      
      // Count transactions by type
      const types = [...new Set(result.transactions.map(t => t.type))];
      const typeCount = types.reduce((acc, type) => {
        acc[type] = result.transactions.filter(t => t.type === type).length;
        return acc;
      }, {});
      console.log('processPdf: Transactions by type:', typeCount);
    }

    // Update statement if statementId is provided
    if (statementId) {
      console.log('processPdf: Updating statement with ID:', statementId);
      await Statement.findByIdAndUpdate(statementId, {
        processed: true,
        transactionCount: result.stats.count,
        totalIncome: result.stats.income,
        totalExpenses: result.stats.expenses,
        netAmount: result.stats.income - result.stats.expenses,
        source: 'PDF' // Explicitly set source as PDF
      });
      console.log('processPdf: Statement updated successfully');
    }

    return sendSuccess(res, {
      transactions: result.transactions,
      stats: result.stats,
      statement: {
        _id: statementId || `pdf-${Date.now()}`,
        source: 'PDF',
        processed: true,
        transactionCount: result.stats.count,
        totalIncome: result.stats.income,
        totalExpenses: result.stats.expenses,
        netAmount: result.stats.income - result.stats.expenses
      }
    }, 'PDF statement processed successfully', 200);
  } catch (error) {
    console.error('Error processing PDF statement:', error);
    return sendError(res, error.message || 'Failed to process PDF statement', 'PDF_PROCESSING_ERROR', 500);
  }
}; 