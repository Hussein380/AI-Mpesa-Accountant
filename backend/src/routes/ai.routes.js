const express = require('express');
const router = express.Router();
const { chatCompletion, analyzeStatement } = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Chat with AI (requires authentication)
router.post('/chat', authenticate, chatCompletion);

// Free chat endpoint (limited to 3 messages)
router.post('/free-chat', chatCompletion);

// Analyze M-Pesa statement
router.post('/analyze-statement', authenticate, analyzeStatement);

module.exports = router; 
 