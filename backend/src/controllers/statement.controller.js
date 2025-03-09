const Statement = require('../models/statement.model');
const path = require('path');
const fs = require('fs');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Upload M-Pesa statement
 */
exports.uploadStatement = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 'NO_FILE', 400);
    }

    const { name, startDate, endDate } = req.body;
    
    if (!name || !startDate || !endDate) {
      return sendError(res, 'Please provide name, start date, and end date', 'MISSING_FIELDS', 400);
    }

    // Create new statement
    const statement = new Statement({
      user: req.user.id,
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      processed: false
    });

    // Save statement to database
    await statement.save();

    return sendSuccess(res, statement, 'Statement uploaded successfully', 201);
  } catch (error) {
    console.error('Statement upload error:', error);
    return sendError(res, 'Server error during statement upload', 'STATEMENT_UPLOAD_ERROR', 500);
  }
};

/**
 * Get all statements for a user
 */
exports.getStatements = async (req, res) => {
  try {
    const statements = await Statement.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    return sendSuccess(res, statements, 'Statements retrieved successfully');
  } catch (error) {
    console.error('Get statements error:', error);
    return sendError(res, 'Server error while fetching statements', 'STATEMENTS_FETCH_ERROR', 500);
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
      return sendError(res, 'Statement not found', 'STATEMENT_NOT_FOUND', 404);
    }

    return sendSuccess(res, statement, 'Statement retrieved successfully');
  } catch (error) {
    console.error('Get statement error:', error);
    return sendError(res, 'Server error while fetching statement', 'STATEMENT_FETCH_ERROR', 500);
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
      return sendError(res, 'Statement not found', 'STATEMENT_NOT_FOUND', 404);
    }

    // Delete the statement
    await Statement.deleteOne({ _id: req.params.id });

    return sendSuccess(res, { id: req.params.id }, 'Statement deleted successfully');
  } catch (error) {
    console.error('Delete statement error:', error);
    return sendError(res, 'Server error while deleting statement', 'STATEMENT_DELETE_ERROR', 500);
  }
}; 