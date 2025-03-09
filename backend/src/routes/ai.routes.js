const express = require('express');
const router = express.Router();
const { chatCompletion, analyzeStatement, categorizeTransactions } = require('../controllers/ai.controller');
const { auth } = require('../middleware/auth');

// Chat with AI (requires authentication)
router.post('/chat', auth, chatCompletion);

// Free chat endpoint (limited to 3 messages)
router.post('/free-chat', chatCompletion);

// Analyze M-Pesa statement
router.post('/analyze-statement', auth, analyzeStatement);

// Categorize transactions
router.post('/categorize-transactions', auth, categorizeTransactions);

module.exports = router; 
 