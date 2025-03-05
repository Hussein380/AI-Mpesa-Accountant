const express = require('express');
const router = express.Router();
const { uploadStatement, getStatements, getStatementById, deleteStatement } = require('../controllers/statement.controller');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Upload M-Pesa statement
router.post('/upload', authenticate, upload.single('statement'), uploadStatement);

// Get all statements for a user
router.get('/', authenticate, getStatements);

// Get a specific statement
router.get('/:id', authenticate, getStatementById);

// Delete a statement
router.delete('/:id', authenticate, deleteStatement);

module.exports = router; 