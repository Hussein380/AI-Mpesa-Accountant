const express = require('express');
const { auth } = require('../middleware/auth');
const {
    getTransactions,
    createTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    bulkCreateTransactions,
    getBalance
} = require('../controllers/transaction.controller.js');
const Transaction = require('../models/transaction.model.js');
const { sendSuccess, sendError } = require('../utils/apiResponse');

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

// Add this route after the other routes
router.post('/fix-pdf-transactions', async (req, res) => {
    try {
        console.log('Fixing PDF transactions for user:', req.user.id);
        
        // Find all PDF transactions for this user
        const pdfTransactions = await Transaction.find({ 
            user: req.user.id,
            source: 'PDF'
        });
        console.log(`Found ${pdfTransactions.length} PDF transactions`);
        
        // Count transactions by type
        const typeCount = {};
        pdfTransactions.forEach(t => {
            typeCount[t.type] = (typeCount[t.type] || 0) + 1;
        });
        console.log('Transactions by type:', typeCount);
        
        let updatedCount = 0;
        
        // Update summary transactions
        const summaryTransactions = pdfTransactions.filter(t => 
            t.description && t.description.includes('M-Pesa Statement Summary')
        );
        console.log(`Found ${summaryTransactions.length} summary transactions`);
        
        if (summaryTransactions.length > 0) {
            for (const transaction of summaryTransactions) {
                if (transaction.type !== 'RECEIVED') {
                    console.log(`Updating summary transaction ${transaction._id} from type ${transaction.type} to RECEIVED`);
                    transaction.type = 'RECEIVED';
                    await transaction.save();
                    updatedCount++;
                }
            }
        }
        
        // Update income transactions (with "Received" in description)
        const incomeTransactions = pdfTransactions.filter(t => 
            t.description && t.description.includes('Received')
        );
        console.log(`Found ${incomeTransactions.length} income transactions`);
        
        if (incomeTransactions.length > 0) {
            for (const transaction of incomeTransactions) {
                if (transaction.type !== 'RECEIVED') {
                    console.log(`Updating income transaction ${transaction._id} from type ${transaction.type} to RECEIVED`);
                    transaction.type = 'RECEIVED';
                    await transaction.save();
                    updatedCount++;
                }
            }
        }
        
        // Update expense transactions (with "Sent" in description)
        const expenseTransactions = pdfTransactions.filter(t => 
            t.description && t.description.includes('Sent')
        );
        console.log(`Found ${expenseTransactions.length} expense transactions`);
        
        if (expenseTransactions.length > 0) {
            for (const transaction of expenseTransactions) {
                if (transaction.type !== 'SENT' && transaction.type !== 'PAYMENT' && transaction.type !== 'WITHDRAWAL') {
                    // Determine the appropriate type based on transaction description
                    let newType = 'SENT';
                    if (transaction.description.includes('Payment') || transaction.description.includes('Pay')) {
                        newType = 'PAYMENT';
                    } else if (transaction.description.includes('Withdraw')) {
                        newType = 'WITHDRAWAL';
                    }
                    
                    console.log(`Updating expense transaction ${transaction._id} from type ${transaction.type} to ${newType}`);
                    transaction.type = newType;
                    await transaction.save();
                    updatedCount++;
                }
            }
        }
        
        // Update transactions with PDF in transactionId
        const pdfIdTransactions = await Transaction.find({ 
            user: req.user.id,
            transactionId: { $regex: 'PDF', $options: 'i' },
            source: { $ne: 'PDF' }
        });
        console.log(`Found ${pdfIdTransactions.length} transactions with PDF in transactionId but wrong source`);
        
        if (pdfIdTransactions.length > 0) {
            for (const transaction of pdfIdTransactions) {
                console.log(`Updating transaction ${transaction._id} source to PDF`);
                transaction.source = 'PDF';
                await transaction.save();
                updatedCount++;
            }
        }
        
        return sendSuccess(res, { 
            updatedCount,
            typeCountBefore: typeCount,
            pdfTransactionCount: pdfTransactions.length
        }, `Successfully updated ${updatedCount} PDF transactions`);
    } catch (error) {
        console.error('Error fixing PDF transactions:', error);
        return sendError(res, 'Failed to fix PDF transactions', 'PDF_FIX_ERROR', 500);
    }
});

module.exports = router; 