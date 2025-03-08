import { Request, Response } from 'express';
import Transaction, { ITransaction } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

export const getTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        console.log('getTransactions: Processing request for user:', userId);

        // Build query
        const query = { user: userId };
        console.log('getTransactions: Query:', JSON.stringify(query));

        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        console.log('getTransactions: Pagination:', { page, limit });

        // Get total count for pagination - using countDocuments on the find query
        const totalCount = await Transaction.find({ user: userId }).countDocuments();
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
                    expenses: 0
                }
            });
        }

        // Get transactions with pagination
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        // Get filtered count - using countDocuments on the find query
        const total = await Transaction.find(query).countDocuments();

        console.log('getTransactions: Found transactions:', transactions.length);
        console.log('getTransactions: Total matching query:', total);

        if (transactions.length > 0) {
            console.log('getTransactions: Sample transaction:', JSON.stringify(transactions[0]));
        }

        // Calculate total income and expenses
        const allTransactions = await Transaction.find({ user: userId });
        const stats = allTransactions.reduce(
            (acc: { income: number; expenses: number }, transaction: any) => {
                if (transaction.type === 'RECEIVED') {
                    acc.income += transaction.amount;
                } else if (['SENT', 'PAYMENT', 'WITHDRAWAL'].includes(transaction.type)) {
                    acc.expenses += transaction.amount;
                }
                return acc;
            },
            { income: 0, expenses: 0 }
        );

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

export const createTransaction = async (req: AuthRequest, res: Response) => {
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

export const getTransactionById = async (req: AuthRequest, res: Response) => {
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

export const updateTransaction = async (req: AuthRequest, res: Response) => {
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

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
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

export const bulkCreateTransactions = async (req: AuthRequest, res: Response) => {
    try {
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
        const invalidTransactions = req.body.transactions.filter((t: any) =>
            !t.transactionId || !t.date || !t.type || t.amount === undefined);

        if (invalidTransactions.length > 0) {
            console.log('bulkCreateTransactions: Found invalid transactions:', invalidTransactions.length);
            return res.status(400).json({
                message: 'Some transactions are missing required fields',
                invalidCount: invalidTransactions.length
            });
        }

        const transactions = req.body.transactions.map((transaction: any) => ({
            ...transaction,
            user: userId,
            date: new Date(transaction.date)
        }));

        console.log('bulkCreateTransactions: Formatted transactions for database, count:', transactions.length);
        console.log('bulkCreateTransactions: Sample formatted transaction:', JSON.stringify(transactions[0]));

        // Check for duplicate transactionIds
        const transactionIds = transactions.map((t: any) => t.transactionId);
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

            // Insert only new transactions
            const result = await Transaction.insertMany(newTransactions);
            console.log('bulkCreateTransactions: Inserted new transactions, count:', result.length);

            return res.status(201).json({
                message: 'Partial transactions created successfully',
                count: result.length,
                existing: existingTransactions.length,
                transactions: result
            });
        }

        // Insert all transactions if none exist
        const result = await Transaction.insertMany(transactions);
        console.log('bulkCreateTransactions: Inserted all transactions, count:', result.length);

        res.status(201).json({
            message: 'Transactions created successfully',
            count: result.length,
            transactions: result
        });
    } catch (error) {
        console.error('bulkCreateTransactions: Error creating transactions:', error);
        res.status(500).json({ message: 'Error creating transactions' });
    }
}; 