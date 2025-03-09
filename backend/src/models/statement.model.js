const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['debit', 'credit'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balance: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  notes: String
});

const statementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  format: {
    type: String,
    enum: ['MPESA_STANDARD', 'MPESA_BUSINESS', 'MPESA_LEGACY', 'MPESA_COMBINED', 'OTHER'],
    default: 'OTHER'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  transactionCount: {
    type: Number,
    default: 0
  },
  totalIncome: {
    type: Number,
    default: 0
  },
  totalExpenses: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    default: 0
  },
  processed: {
    type: Boolean,
    default: false
  },
  processingErrors: [{
    message: String,
    code: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  reprocessCount: {
    type: Number,
    default: 0
  },
  lastProcessed: {
    type: Date
  },
  analysis: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

statementSchema.index({ user: 1, startDate: -1 });
statementSchema.index({ user: 1, processed: 1 });

const Statement = mongoose.model('Statement', statementSchema);

module.exports = Statement; 