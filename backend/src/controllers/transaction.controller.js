const Transaction = require('../models/transaction.model');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Debug log to verify the model is loaded correctly
console.log('Transaction model loaded:', typeof Transaction);
console.log('Transaction model methods:', Object.keys(Transaction));
console.log('Mongoose connection state:', mongoose.connection.readyState);

const getTransactions = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return sendError(res, 'User not authenticated', 'AUTH_ERROR', 401);
        }

        console.log('getTransactions: Processing request for user:', userId);

        // Build query
        const query = { user: userId };
        
        // Add source filter if provided
        if (req.query.source) {
            query.source = req.query.source;
            console.log(`getTransactions: Filtering by source: ${req.query.source}`);
        }
        
        // Add type filter if provided
        if (req.query.type) {
            query.type = req.query.type;
        }
        
        // Add date range filter if provided
        if (req.query.startDate || req.query.endDate) {
            query.date = {};
            if (req.query.startDate) {
                query.date.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.date.$lte = new Date(req.query.endDate);
            }
        }

        console.log('getTransactions: Query:', JSON.stringify(query));

        // Get total count for pagination
        const total = await Transaction.countDocuments(query);
        console.log('getTransactions: Total count:', total);

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get transactions
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        console.log(`getTransactions: Found ${transactions.length} transactions`);
        
        // Log transaction types for debugging
        const types = [...new Set(transactions.map(t => t.type))];
        console.log('getTransactions: Transaction types found:', types);
        
        // Count transactions by type
        const typeCount = types.reduce((acc, type) => {
            acc[type] = transactions.filter(t => t.type === type).length;
            return acc;
        }, {});
        console.log('getTransactions: Transactions by type:', typeCount);
        
        // Count transactions by source
        const sources = [...new Set(transactions.map(t => t.source))];
        const sourceCount = sources.reduce((acc, source) => {
            acc[source] = transactions.filter(t => t.source === source).length;
            return acc;
        }, {});
        console.log('getTransactions: Transactions by source:', sourceCount);
        
        // Log PDF transactions specifically
        const pdfTransactions = transactions.filter(t => t.source === 'PDF');
        console.log(`getTransactions: PDF transactions count: ${pdfTransactions.length}`);
        
        if (pdfTransactions.length > 0) {
            console.log('getTransactions: First PDF transaction example:', {
                id: pdfTransactions[0]._id,
                type: pdfTransactions[0].type,
                amount: pdfTransactions[0].amount,
                source: pdfTransactions[0].source,
                description: pdfTransactions[0].description
            });
            
            // Calculate PDF totals
            const pdfIncome = pdfTransactions
                .filter(t => t.type === 'RECEIVED')
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                
            const pdfExpenses = pdfTransactions
                .filter(t => ['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(t.type))
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                
            console.log(`getTransactions: PDF income total: ${pdfIncome}`);
            console.log(`getTransactions: PDF expenses total: ${pdfExpenses}`);
            console.log(`getTransactions: PDF net amount: ${pdfIncome - pdfExpenses}`);
            
            // Check for invalid transaction types
            const invalidPdfTransactions = pdfTransactions.filter(t => 
                !['RECEIVED', 'SENT', 'PAYMENT', 'WITHDRAWAL', 'DEPOSIT'].includes(t.type)
            );
            
            if (invalidPdfTransactions.length > 0) {
                console.log(`getTransactions: Found ${invalidPdfTransactions.length} PDF transactions with invalid types`);
                console.log('getTransactions: Invalid PDF transaction types:', 
                    [...new Set(invalidPdfTransactions.map(t => t.type))]
                );
                
                // Log the first few invalid transactions
                console.log('getTransactions: Invalid PDF transaction examples:', 
                    invalidPdfTransactions.slice(0, 3).map(t => ({
                        id: t._id,
                        type: t.type,
                        amount: t.amount,
                        description: t.description
                    }))
                );
            }
        }

        return sendSuccess(res, {
            transactions,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        }, 'Transactions retrieved successfully');
    } catch (error) {
        console.error('getTransactions: Error:', error);
        return sendError(res, 'Failed to retrieve transactions', 'TRANSACTION_FETCH_ERROR', 500);
    }
};

const createTransaction = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return sendError(res, 'User not authenticated', 'AUTH_ERROR', 401);
        }

        // Ensure balance is a number if provided
        const transactionData = { ...req.body, user: userId };
        
        // Convert balance to a number if it's a string
        if (transactionData.balance !== undefined && transactionData.balance !== null) {
            transactionData.balance = Number(transactionData.balance);
            
            // If conversion resulted in NaN, set to null
            if (isNaN(transactionData.balance)) {
                transactionData.balance = null;
            }
        }
        
        // Create new transaction with user ID
        const transaction = new Transaction(transactionData);

        // Save to database
        const savedTransaction = await transaction.save();
        console.log('createTransaction: Transaction saved:', savedTransaction._id);
        console.log('createTransaction: Transaction balance:', savedTransaction.balance);

        return sendSuccess(res, savedTransaction, 'Transaction created successfully', 201);
    } catch (error) {
        console.error('createTransaction: Error:', error);
        return sendError(res, 'Failed to create transaction', 'TRANSACTION_CREATE_ERROR', 500);
    }
};

const getTransactionById = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return sendError(res, 'User not authenticated', 'AUTH_ERROR', 401);
        }

        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: userId
        });

        if (!transaction) {
            return sendError(res, 'Transaction not found', 'NOT_FOUND', 404);
        }

        return sendSuccess(res, transaction, 'Transaction retrieved successfully');
    } catch (error) {
        console.error('getTransactionById: Error:', error);
        return sendError(res, 'Failed to retrieve transaction', 'TRANSACTION_FETCH_ERROR', 500);
    }
};

const updateTransaction = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return sendError(res, 'User not authenticated', 'AUTH_ERROR', 401);
        }

        // Find and update the transaction
        const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTransaction) {
            return sendError(res, 'Transaction not found', 'NOT_FOUND', 404);
        }

        return sendSuccess(res, updatedTransaction, 'Transaction updated successfully');
    } catch (error) {
        console.error('updateTransaction: Error:', error);
        return sendError(res, 'Failed to update transaction', 'TRANSACTION_UPDATE_ERROR', 500);
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return sendError(res, 'User not authenticated', 'AUTH_ERROR', 401);
        }

        // Find and delete the transaction
        const deletedTransaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: userId
        });

        if (!deletedTransaction) {
            return sendError(res, 'Transaction not found', 'NOT_FOUND', 404);
        }

        return sendSuccess(res, { id: req.params.id }, 'Transaction deleted successfully');
    } catch (error) {
        console.error('deleteTransaction: Error:', error);
        return sendError(res, 'Failed to delete transaction', 'TRANSACTION_DELETE_ERROR', 500);
    }
};

const bulkCreateTransactions = async (req, res) => {
    try {
        console.log('bulkCreateTransactions: Request body:', JSON.stringify(req.body));
        
        const userId = req.user?._id;
        if (!userId) {
            return sendError(res, 'User not authenticated', 'AUTH_ERROR', 401);
        }

        // Check if transactions array exists
        if (!req.body.transactions || !Array.isArray(req.body.transactions)) {
            return sendError(res, 'No transactions provided or invalid format', 'INVALID_INPUT', 400);
        }

        // Add user ID to each transaction and ensure balance is a number
        const transactionsWithUser = req.body.transactions.map(transaction => {
            const processedTransaction = {
            ...transaction,
            user: userId
            };
            
            // Convert balance to a number if it's a string
            if (processedTransaction.balance !== undefined && processedTransaction.balance !== null) {
                processedTransaction.balance = Number(processedTransaction.balance);
                
                // If conversion resulted in NaN, set to null
                if (isNaN(processedTransaction.balance)) {
                    processedTransaction.balance = null;
                }
            }
            
            return processedTransaction;
        });

        // Insert all transactions
        const insertedTransactions = await Transaction.insertMany(transactionsWithUser);
        console.log(`bulkCreateTransactions: Inserted ${insertedTransactions.length} transactions`);
        
        // Log the first transaction's balance for debugging
        if (insertedTransactions.length > 0) {
            console.log('bulkCreateTransactions: First transaction balance:', insertedTransactions[0].balance);
            console.log('bulkCreateTransactions: First transaction balance type:', typeof insertedTransactions[0].balance);
        }

        return sendSuccess(
            res, 
            insertedTransactions, 
            `Successfully created ${insertedTransactions.length} transactions`, 
            201
        );
    } catch (error) {
        console.error('bulkCreateTransactions: Error:', error);
        return sendError(res, 'Failed to create transactions', 'BULK_CREATE_ERROR', 500);
    }
};

/**
 * Get user's current balance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with user's balance
 */
const getBalance = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('getBalance: Processing request for user:', userId);

        // Find the most recent transaction with a balance
        const latestTransaction = await Transaction.findOne(
            { user: userId, balance: { $ne: null } }
        ).sort({ date: -1 });

        if (latestTransaction && latestTransaction.balance !== null) {
            console.log('getBalance: Found latest transaction with balance:', latestTransaction._id);
            return sendSuccess(res, { balance: latestTransaction.balance }, 'Balance retrieved successfully');
        }

        // If no transaction with balance found, calculate from transactions
        console.log('getBalance: No transaction with balance found, calculating from transactions');
        
        // Get all transactions for the user
        const transactions = await Transaction.find({ user: userId }).sort({ date: 1 });
        
        // Calculate balance
        let balance = 0;
        transactions.forEach(transaction => {
            if (transaction.type === 'RECEIVED') {
                balance += transaction.amount;
            } else if (['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(transaction.type)) {
                balance -= transaction.amount;
            }
        });
        
        console.log('getBalance: Calculated balance:', balance);
        return sendSuccess(res, { balance }, 'Balance calculated successfully');
    } catch (error) {
        console.error('getBalance: Error:', error);
        return sendError(res, 'Failed to retrieve balance', 'BALANCE_FETCH_ERROR', 500);
    }
};

module.exports = {
    getTransactions,
    createTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    bulkCreateTransactions,
    getBalance
}; 