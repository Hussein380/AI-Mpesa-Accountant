const Transaction = require('../models/Transaction.js');
const mongoose = require('mongoose');

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
        console.log('getTransactions: Pagination:', { page, limit });

        // Verify Transaction model is available
        if (!Transaction || typeof Transaction.find !== 'function') {
            console.error('getTransactions: Transaction model is not properly initialized');
            console.error('getTransactions: Transaction type:', typeof Transaction);
            return res.status(500).json({ 
                message: 'Internal server error: Database model not initialized properly' 
            });
        }

        // Get total count for pagination - using a more compatible approach
        let totalCount = 0;
        try {
            // Try the most modern approach first
            totalCount = await Transaction.countDocuments({ user: userId });
        } catch (countError) {
            console.error('getTransactions: Error using countDocuments:', countError);
            try {
                // Fall back to count() if countDocuments() is not available
                totalCount = await Transaction.count({ user: userId });
            } catch (fallbackError) {
                console.error('getTransactions: Error using count:', fallbackError);
                // Last resort: get all documents and count them in memory
                const allDocs = await Transaction.find({ user: userId }).lean();
                totalCount = allDocs.length;
            }
        }
        console.log('getTransactions: Total transactions for user:', totalCount);

        if (totalCount === 0) {
            console.log('getTransactions: No transactions found for user');
            return res.status(200).json({ 
                transactions: [], 
                pagination: { 
                    total: 0, 
                    page, 
                    pages: 0 
                },
                stats: {
                    income: 0,
                    expenses: 0,
                    balance: 0
                }
            });
        }

        // Get transactions with pagination
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        // Get filtered count - using a more compatible approach
        let total = 0;
        try {
            // Try the most modern approach first
            total = await Transaction.find(query).countDocuments();
        } catch (countError) {
            try {
                // Fall back to count() if countDocuments() is not available
                total = await Transaction.find(query).count();
            } catch (fallbackError) {
                // Last resort: get all documents and count them in memory
                const allDocs = await Transaction.find(query);
                total = allDocs.length;
            }
        }

        console.log('getTransactions: Found transactions:', transactions.length);
        console.log('getTransactions: Total matching query:', total);
        
        if (transactions.length > 0) {
            console.log('getTransactions: Sample transaction:', JSON.stringify(transactions[0]));
        }

        // Calculate total income and expenses
        const allTransactions = await Transaction.find({ user: userId });
        const stats = allTransactions.reduce(
            (acc, transaction) => {
                if (transaction.type === 'RECEIVED') {
                    acc.income += transaction.amount;
                } else if (['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(transaction.type)) {
                    acc.expenses += transaction.amount;
                }
                return acc;
            },
            { income: 0, expenses: 0 }
        );
        
        // Calculate balance from the most recent transaction or from income - expenses
        let balance = stats.income - stats.expenses;
        
        // Try to get balance from the most recent transaction if available
        const latestTransaction = await Transaction.findOne({ user: userId })
            .sort({ date: -1 })
            .limit(1);
            
        if (latestTransaction && latestTransaction.balance) {
            balance = latestTransaction.balance;
        }
        
        // Add balance to stats
        stats.balance = balance;
        
        console.log('getTransactions: Calculated stats:', JSON.stringify(stats));

        res.json({
            transactions,
            stats,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('getTransactions: Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createTransaction = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const transactionData = {
            ...req.body,
            user: userId,
            date: new Date(req.body.date)
        };

        const transaction = new Transaction(transactionData);
        await transaction.save();

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Error creating transaction' });
    }
};

const getTransactionById = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: userId
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ message: 'Error fetching transaction' });
    }
};

const updateTransaction = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            req.body,
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Error updating transaction' });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: userId
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Error deleting transaction' });
    }
};

const bulkCreateTransactions = async (req, res) => {
    try {
        console.log('bulkCreateTransactions: Request body:', JSON.stringify(req.body));
        
        const userId = req.user?._id;
        if (!userId) {
            console.log('bulkCreateTransactions: No user ID found in request');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        console.log('bulkCreateTransactions: Processing request for user:', userId.toString());
        console.log('bulkCreateTransactions: Transactions count in request:', req.body.transactions?.length || 0);
        
        if (!req.body.transactions || !Array.isArray(req.body.transactions) || req.body.transactions.length === 0) {
            console.log('bulkCreateTransactions: Invalid transactions data in request');
            return res.status(400).json({ message: 'No transactions provided or invalid format' });
        }

        // Log a sample transaction
        console.log('bulkCreateTransactions: Sample transaction from request:', JSON.stringify(req.body.transactions[0]));

        // Check for required fields in transactions
        const invalidTransactions = req.body.transactions.filter((t) => 
            !t.transactionId || !t.date || !t.type || t.amount === undefined);
        
        if (invalidTransactions.length > 0) {
            console.log('bulkCreateTransactions: Found invalid transactions:', invalidTransactions.length);
            console.log('bulkCreateTransactions: First invalid transaction:', JSON.stringify(invalidTransactions[0]));
            return res.status(400).json({ 
                message: 'Some transactions are missing required fields',
                invalidCount: invalidTransactions.length,
                invalidExample: invalidTransactions[0]
            });
        }

        const transactions = req.body.transactions.map((transaction) => ({
            ...transaction,
            user: userId,
            date: new Date(transaction.date),
            // Ensure mpesaReference is undefined rather than null to avoid index issues
            mpesaReference: transaction.mpesaReference || undefined
        }));

        console.log('bulkCreateTransactions: Formatted transactions for database, count:', transactions.length);
        console.log('bulkCreateTransactions: Sample formatted transaction:', JSON.stringify(transactions[0]));

        // Check for duplicate transactionIds within the request
        const transactionIds = transactions.map((t) => t.transactionId);
        const uniqueIds = new Set(transactionIds);
        
        if (uniqueIds.size !== transactionIds.length) {
            console.log('bulkCreateTransactions: Found duplicate transaction IDs');
            return res.status(400).json({ 
                message: 'Duplicate transaction IDs found',
                expected: transactionIds.length,
                unique: uniqueIds.size
            });
        }

        // Check if any transactions already exist in the database
        const existingTransactions = await Transaction.find({
            transactionId: { $in: transactionIds },
            user: userId
        });

        if (existingTransactions.length > 0) {
            console.log('bulkCreateTransactions: Found existing transactions:', existingTransactions.length);
            
            // Filter out existing transactions
            const existingIds = existingTransactions.map(t => t.transactionId);
            const newTransactions = transactions.filter(t => !existingIds.includes(t.transactionId));
            
            console.log('bulkCreateTransactions: Filtered to new transactions only, count:', newTransactions.length);
            
            if (newTransactions.length === 0) {
                return res.status(200).json({
                    message: 'All transactions already exist in the database',
                    count: 0,
                    existing: existingTransactions.length
                });
            }
            
            // Insert only new transactions - use insertMany with ordered: false to continue on error
            try {
                const result = await Transaction.insertMany(newTransactions, { ordered: false });
                console.log('bulkCreateTransactions: Inserted new transactions, count:', result.length);
                
                return res.status(201).json({
                    message: 'Partial transactions created successfully',
                    count: result.length,
                    existing: existingTransactions.length,
                    transactions: result
                });
            } catch (insertError) {
                // If there's a bulk write error but some documents were inserted
                if (insertError.name === 'MongoBulkWriteError' && insertError.result) {
                    console.log('bulkCreateTransactions: Partial insert success:', insertError.result.insertedCount);
                    return res.status(201).json({
                        message: 'Some transactions created successfully',
                        count: insertError.result.insertedCount,
                        existing: existingTransactions.length,
                        error: insertError.message
                    });
                }
                throw insertError;
            }
        }

        // Insert all transactions if none exist - use insertMany with ordered: false to continue on error
        try {
            const result = await Transaction.insertMany(transactions, { ordered: false });
            console.log('bulkCreateTransactions: Inserted all transactions, count:', result.length);
            
            res.status(201).json({
                message: 'Transactions created successfully',
                count: result.length,
                transactions: result
            });
        } catch (insertError) {
            // If there's a bulk write error but some documents were inserted
            if (insertError.name === 'MongoBulkWriteError' && insertError.result) {
                console.log('bulkCreateTransactions: Partial insert success:', insertError.result.insertedCount);
                return res.status(201).json({
                    message: 'Some transactions created successfully',
                    count: insertError.result.insertedCount,
                    error: insertError.message
                });
            }
            throw insertError;
        }
    } catch (error) {
        console.error('bulkCreateTransactions: Error creating transactions:', error);
        res.status(500).json({ message: 'Error creating transactions' });
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