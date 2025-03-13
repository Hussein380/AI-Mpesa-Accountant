const express = require('express');
const router = express.Router();
const { 
  processSms, 
  getStatements, 
  getStatementById, 
  deleteStatement,
  getStatementStatistics
} = require('../controllers/statement.controller');
const { auth } = require('../middleware/auth');

// Process M-Pesa SMS
router.post('/process-sms', auth, processSms);

// Get all statements for a user
router.get('/', auth, getStatements);

// Get statement statistics
router.get('/statistics', auth, getStatementStatistics);

// Get a specific statement
router.get('/:id', auth, getStatementById);

// Delete a statement
router.delete('/:id', auth, deleteStatement);

module.exports = router; 