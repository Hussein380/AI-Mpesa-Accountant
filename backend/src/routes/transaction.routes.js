const express = require('express');
const { auth } = require('../middleware/auth.js');
const {
    getTransactions,
    createTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    bulkCreateTransactions
} = require('../controllers/transaction.controller.js');

const router = express.Router();

// Log all requests to this router
router.use((req, res, next) => {
    console.log(`Transaction route: ${req.method} ${req.originalUrl}`);
    next();
});

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

module.exports = router; 