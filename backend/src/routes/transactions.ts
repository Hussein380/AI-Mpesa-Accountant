import express from 'express';
import { auth } from '../middleware/auth';
import {
    getTransactions,
    createTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    bulkCreateTransactions
} from '../controllers/transactionController';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all transactions with pagination and filters
router.get('/', getTransactions);

// Create a new transaction
router.post('/', createTransaction);

// Bulk create transactions (for importing statements)
router.post('/bulk', bulkCreateTransactions);

// Get a specific transaction
router.get('/:id', getTransactionById);

// Update a transaction
router.put('/:id', updateTransaction);

// Delete a transaction
router.delete('/:id', deleteTransaction);

export default router; 