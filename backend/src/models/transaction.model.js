const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema
const TransactionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    transactionId: {
        type: String,
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['SENT', 'RECEIVED', 'PAYMENT', 'WITHDRAWAL', 'DEPOSIT', 'OTHER'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        default: null
    },
    recipient: {
        type: String,
        default: ''
    },
    sender: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'SHOPPING', 'HEALTH', 'EDUCATION', 'TRANSFER', 'BILLS', 'OTHER'],
        default: 'OTHER'
    },
    source: {
        type: String,
        enum: ['PDF', 'SMS', 'MANUAL', 'TEST'],
        default: 'MANUAL'
    },
    mpesaReference: {
        type: String,
        index: true
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 1
    },
    format: {
        type: String,
        enum: ['MPESA_STANDARD', 'MPESA_BUSINESS', 'MPESA_LEGACY', 'MPESA_RECEIVED', 'MPESA_SENT', 'MPESA_BUSINESS_PAYMENT', 'MPESA_WITHDRAWAL', 'MPESA_AIRTIME', 'MPESA_COMBINED', 'OTHER'],
        default: 'OTHER'
    },
    parsingMethod: {
        type: String,
        default: 'standard'
    },
    statementRef: {
        type: Schema.Types.ObjectId,
        ref: 'Statement',
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add compound indexes for better query performance
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, category: 1 });
TransactionSchema.index({ user: 1, type: 1 });

// Create and export the model
// Make sure to use 'Transaction' as the model name (first parameter)
const Transaction = mongoose.model('Transaction', TransactionSchema);

// Export the model directly
module.exports = Transaction; 