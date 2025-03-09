const express = require('express');
const router = express.Router();
const { uploadStatement, getStatements, getStatementById, deleteStatement } = require('../controllers/statement.controller');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload.middleware');

// Upload M-Pesa statement
router.post('/upload', auth, upload.single('statement'), uploadStatement);

// Get all statements for a user
router.get('/', auth, getStatements);

// Get a specific statement
router.get('/:id', auth, getStatementById);

// Delete a statement
router.delete('/:id', auth, deleteStatement);

module.exports = router; 