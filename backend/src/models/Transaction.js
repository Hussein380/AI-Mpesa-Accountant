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
        enum: ['FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'SHOPPING', 'HEALTH', 'EDUCATION', 'OTHER'],
        default: 'OTHER'
    },
    source: {
        type: String,
        enum: ['PDF', 'SMS', 'MANUAL', 'TEST'],
        default: 'MANUAL'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    mpesaReference: {
        type: String,
        default: undefined
    }
});

// Add indexes
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, transactionId: 1 }, { unique: true });

// Create and export the model
// Make sure to use 'Transaction' as the model name (first parameter)
const TransactionModel = mongoose.model('Transaction', TransactionSchema);

// Export the model directly
module.exports = TransactionModel; 