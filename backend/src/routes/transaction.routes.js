const express = require('express');
const { auth } = require('../middleware/auth.js');
const {
    getTransactions,
    createTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    bulkCreateTransactions,
    getBalance
} = require('../controllers/transaction.controller.js');

const router = express.Router();

// Log all requests to this router
router.use((req, res, next) => {
    console.log(`Transaction route: ${req.method} ${req.originalUrl}`);
    next();
});

// All routes require authentication
router.use(auth);

// Get user balance - using the existing auth middleware
router.get('/balance', getBalance);

// Get all transactions with pagination and filters
router.get('/', getTransactions);

// Get a single transaction by ID
router.get('/:id', getTransactionById);

// Create a new transaction
router.post('/', createTransaction);

// Bulk create transactions
router.post('/bulk', bulkCreateTransactions);

// Update a transaction
router.put('/:id', updateTransaction);

// Delete a transaction
router.delete('/:id', deleteTransaction);

module.exports = router; 