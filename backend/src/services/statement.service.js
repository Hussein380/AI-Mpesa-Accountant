const Statement = require('../models/statement.model');
const Transaction = require('../models/transaction.model');
const smsParser = require('./smsParser.service');
const geminiService = require('./gemini.service');
const mongoose = require('mongoose');

/**
 * Service for managing statements and their processing
 */
class StatementService {
  /**
   * Process an SMS message
   * @param {string} smsText - SMS message text
   * @param {string} userId - User ID
   * @returns {Object} Processing result
   */
  async processSmsMessage(smsText, userId) {
    try {
      // Parse the SMS message
      const parseResult = smsParser.parseSms(smsText);
      
      if (!parseResult.success) {
        return {
          success: false,
          error: parseResult.error
        };
      }
      
      // Check if this is a bulk transaction (combined statement)
      if (parseResult.isBulk && parseResult.transactions) {
        // Create a virtual statement for the bulk transactions
        const firstTransaction = parseResult.transactions[0];
        const lastTransaction = parseResult.transactions[parseResult.transactions.length - 1];
        
        // Calculate financial totals
        let totalIncome = 0;
        let totalExpenses = 0;
        
        parseResult.transactions.forEach(transaction => {
          if (transaction.type === 'RECEIVED') {
            totalIncome += transaction.amount;
          } else {
            totalExpenses += transaction.amount;
          }
        });
        
        // Create statement record
        const statement = new Statement({
          user: userId,
          filename: `Combined_Statement_${firstTransaction.mpesaReference}`,
          originalFilename: `Combined_Statement_${firstTransaction.mpesaReference}`,
          fileSize: smsText.length,
          mimeType: 'text/plain',
          startDate: firstTransaction.date,
          endDate: lastTransaction.date,
          format: 'MPESA_COMBINED',
          confidence: 0.8,
          transactionCount: parseResult.transactions.length,
          totalIncome,
          totalExpenses,
          netAmount: totalIncome - totalExpenses,
          processed: true,
          lastProcessed: new Date()
        });
        
        await statement.save();
        
        // Prepare transactions for saving
        const transactions = parseResult.transactions.map(transaction => ({
          ...transaction,
          user: userId,
          statementRef: statement._id
        }));
        
        // Save transactions
        const savedTransactions = await Transaction.insertMany(transactions);
        
        // Categorize transactions using Gemini AI
        try {
          await this.categorizeTransactions(savedTransactions, userId);
        } catch (categorizationError) {
          console.error('Error categorizing transactions:', categorizationError);
          // Continue without categorization
        }
        
        return {
          success: true,
          statement,
          transactions: savedTransactions,
          isBulk: true
        };
      } else {
        // Single transaction
        // Prepare transaction for saving
        const transaction = {
          ...parseResult.transaction,
          user: userId
        };
        
        // Save transaction
        const savedTransaction = await new Transaction(transaction).save();
        
        // Categorize transaction using Gemini AI
        try {
          await this.categorizeTransactions([savedTransaction], userId);
        } catch (categorizationError) {
          console.error('Error categorizing transaction:', categorizationError);
          // Continue without categorization
        }
        
        return {
          success: true,
          transaction: savedTransaction
        };
      }
    } catch (error) {
      console.error('Error processing SMS message:', error);
      return {
        success: false,
        error: {
          message: 'Failed to process SMS message',
          details: error.message,
          code: 'PROCESSING_ERROR'
        }
      };
    }
  }
  
  /**
   * Delete a statement and its transactions
   * @param {string} statementId - Statement ID
   * @param {string} userId - User ID
   * @returns {Object} Deletion result
   */
  async deleteStatement(statementId, userId) {
    try {
      // Find the statement
      const statement = await Statement.findOne({
        _id: statementId,
        user: userId
      });
      
      if (!statement) {
        return {
          success: false,
          error: {
            message: 'Statement not found',
            code: 'NOT_FOUND'
          }
        };
      }
      
      // Delete transactions linked to this statement
      const deleteResult = await Transaction.deleteMany({
        statementRef: statementId,
        user: userId
      });
      
      // Delete the statement
      await Statement.deleteOne({ _id: statementId });
      
      return {
        success: true,
        message: 'Statement and associated transactions deleted',
        transactionsDeleted: deleteResult.deletedCount
      };
    } catch (error) {
      console.error('Error deleting statement:', error);
      return {
        success: false,
        error: {
          message: 'Failed to delete statement',
          details: error.message,
          code: 'DELETION_ERROR'
        }
      };
    }
  }
  
  /**
   * Get statement statistics
   * @param {string} userId - User ID
   * @returns {Object} Statement statistics
   */
  async getStatementStatistics(userId) {
    try {
      const totalStatements = await Statement.countDocuments({ user: userId });
      const processedStatements = await Statement.countDocuments({ user: userId, processed: true });
      const totalTransactions = await Transaction.countDocuments({ user: userId });
      
      // Get income and expense totals
      const aggregationResult = await Transaction.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: {
            _id: null,
            totalIncome: { $sum: { $cond: [{ $eq: ["$type", "RECEIVED"] }, "$amount", 0] } },
            totalExpenses: { $sum: { $cond: [{ $in: ["$type", ["SENT", "PAYMENT", "WITHDRAWAL"]] }, "$amount", 0] } }
          }
        }
      ]);
      
      const financials = aggregationResult.length > 0 ? aggregationResult[0] : { totalIncome: 0, totalExpenses: 0 };
      
      return {
        success: true,
        statistics: {
          totalStatements,
          processedStatements,
          totalTransactions,
          totalIncome: financials.totalIncome,
          totalExpenses: financials.totalExpenses,
          netAmount: financials.totalIncome - financials.totalExpenses
        }
      };
    } catch (error) {
      console.error('Error getting statement statistics:', error);
      return {
        success: false,
        error: {
          message: 'Failed to get statement statistics',
          details: error.message,
          code: 'STATISTICS_ERROR'
        }
      };
    }
  }
  
  /**
   * Categorize transactions using Gemini AI
   * @param {Array} transactions - Transactions to categorize
   * @param {string} userId - User ID
   * @returns {Array} Categorized transactions
   */
  async categorizeTransactions(transactions, userId) {
    try {
      // Skip if no transactions
      if (!transactions || transactions.length === 0) {
        return [];
      }
      
      // Use Gemini AI to categorize transactions
      const categorizedTransactions = await geminiService.categorizeTransactions(transactions);
      
      // Update transactions with categories
      const updatePromises = categorizedTransactions.map(async (transaction) => {
        await Transaction.findByIdAndUpdate(
          transaction._id,
          { category: transaction.category }
        );
        return transaction;
      });
      
      return await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error categorizing transactions:', error);
      throw error;
    }
  }
}

module.exports = new StatementService(); 