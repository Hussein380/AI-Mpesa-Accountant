const Statement = require('../models/statement.model');
const path = require('path');
const fs = require('fs');

/**
 * Upload M-Pesa statement
 */
exports.uploadStatement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { name, startDate, endDate } = req.body;
    
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide name, start date, and end date' });
    }

    // Create new statement
    const statement = new Statement({
      user: req.user.id,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      // Handle file path differently based on environment
      originalFile: process.env.NODE_ENV === 'production' 
        ? `memory-${Date.now()}-${req.file.originalname}` // Just a reference in production
        : req.file.path, // Actual file path in development
      transactions: [] // Will be populated after processing
    });

    await statement.save();

    // In a real implementation, you would:
    // 1. Process the file to extract transactions (using req.file.buffer in production)
    // 2. Update the statement with the extracted data
    // 3. Calculate totals

    // For production (Vercel), you would process the file directly from memory
    // const fileBuffer = req.file.buffer; // Available in memory storage

    res.status(201).json({
      message: 'Statement uploaded successfully',
      statement: {
        id: statement._id,
        name: statement.name,
        startDate: statement.startDate,
        endDate: statement.endDate
      }
    });
  } catch (error) {
    console.error('Statement upload error:', error);
    res.status(500).json({ message: 'Server error during statement upload' });
  }
};

/**
 * Get all statements for a user
 */
exports.getStatements = async (req, res) => {
  try {
    const statements = await Statement.find({ user: req.user.id })
      .select('name startDate endDate totalIncome totalExpenses finalBalance isAnalyzed createdAt')
      .sort({ createdAt: -1 });

    res.json(statements);
  } catch (error) {
    console.error('Get statements error:', error);
    res.status(500).json({ message: 'Server error while fetching statements' });
  }
};

/**
 * Get a specific statement
 */
exports.getStatementById = async (req, res) => {
  try {
    const statement = await Statement.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!statement) {
      return res.status(404).json({ message: 'Statement not found' });
    }

    res.json(statement);
  } catch (error) {
    console.error('Get statement error:', error);
    res.status(500).json({ message: 'Server error while fetching statement' });
  }
};

/**
 * Delete a statement
 */
exports.deleteStatement = async (req, res) => {
  try {
    const statement = await Statement.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!statement) {
      return res.status(404).json({ message: 'Statement not found' });
    }

    // Delete the file if it exists and we're in development mode
    if (process.env.NODE_ENV !== 'production' && 
        statement.originalFile && 
        fs.existsSync(statement.originalFile)) {
      fs.unlinkSync(statement.originalFile);
    }

    await Statement.deleteOne({ _id: req.params.id });

    res.json({ message: 'Statement deleted successfully' });
  } catch (error) {
    console.error('Delete statement error:', error);
    res.status(500).json({ message: 'Server error while deleting statement' });
  }
}; 