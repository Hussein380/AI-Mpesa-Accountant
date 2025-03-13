const Transaction = require('../models/transaction.model');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Debug log to verify the model is loaded correctly
console.log('Transaction model loaded:', typeof Transaction);
console.log('Transaction model methods:', Object.keys(Transaction));
console.log('Mongoose connection state:', mongoose.connection.readyState);

const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('getTransactions: Processing request for user:', userId);

        // Build query
        const query = { user: userId };
        console.log('getTransactions: Query:', JSON.stringify(query));

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Date filtering
        if (req.query.startDate && req.query.endDate) {
            query.date = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }

        // Get total count for pagination
        let total = 0;
        try {
            total = await Transaction.countDocuments(query);
            console.log('getTransactions: Total count:', total);
        } catch (countError) {
            console.error('getTransactions: Error counting documents:', countError);
            // Continue with total = 0
        }

        // Fallback count if the first method fails
        if (total === 0) {
            try {
                const allDocs = await Transaction.find(query).select('_id');
                total = allDocs.length;
                console.log('getTransactions: Fallback count:', total);
            } catch (fallbackError) {
                console.error('getTransactions: Fallback count error:', fallbackError);
                // Continue with total = 0
            }
        }

        // Execute query with pagination
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        console.log('getTransactions: Found transactions:', transactions.length);

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);

        // Return standardized success response
        return sendSuccess(res, {
            transactions,
            pagination: {
                total,
                page,
                pages: totalPages
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