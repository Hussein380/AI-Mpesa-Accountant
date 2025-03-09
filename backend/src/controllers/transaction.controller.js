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

        // Create new transaction with user ID
        const transaction = new Transaction({
            ...req.body,
            user: userId
        });

        // Save to database
        const savedTransaction = await transaction.save();
        console.log('createTransaction: Transaction saved:', savedTransaction._id);

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

        // Add user ID to each transaction
        const transactionsWithUser = req.body.transactions.map(transaction => ({
            ...transaction,
            user: userId
        }));

        // Insert all transactions
        const insertedTransactions = await Transaction.insertMany(transactionsWithUser);
        console.log(`bulkCreateTransactions: Inserted ${insertedTransactions.length} transactions`);

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

module.exports = {
    getTransactions,
    createTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    bulkCreateTransactions
}; 