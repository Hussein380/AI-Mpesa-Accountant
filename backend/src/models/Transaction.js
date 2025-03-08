const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransactionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Add index for better query performance
    },
    transactionId: {
        type: String,
        required: true,
        index: true // Not unique to allow for imports from different sources
    },
    date: {
        type: Date,
        required: true,
        index: true // Add index for date-based queries
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
    // Update mpesaReference field to handle null values better
    mpesaReference: {
        type: String,
        default: undefined,  // Use undefined instead of null
        index: false,  // Remove direct index on this field
        sparse: false  // Remove sparse option since we're not indexing directly
    }
});

// Add compound index for user + date for efficient user-specific date queries
TransactionSchema.index({ user: 1, date: -1 });

// Add compound index for user + transactionId for efficient lookups and to prevent duplicates per user
TransactionSchema.index({ user: 1, transactionId: 1 }, { unique: true });

// Create a compound index for mpesaReference + user if mpesaReference is needed for lookups
TransactionSchema.index({ mpesaReference: 1, user: 1 }, { 
    unique: true,
    sparse: true,  // Only index documents where mpesaReference exists
    partialFilterExpression: { mpesaReference: { $exists: true, $ne: null, $ne: '' } }
});

// Drop the problematic mpesaReference index if it exists
const Transaction = mongoose.model('Transaction', TransactionSchema);

// Attempt to drop the index after model initialization
// This will run when the application starts
mongoose.connection.on('connected', async () => {
    try {
        await mongoose.connection.db.collection('transactions').dropIndex('mpesaReference_1');
        console.log('Dropped mpesaReference index successfully');
    } catch (error) {
        // Index might not exist, which is fine
        console.log('Note: mpesaReference index might not exist or was already dropped');
    }
    
    try {
        await mongoose.connection.db.collection('transactions').dropIndex('phoneNumber_1');
        console.log('Dropped phoneNumber index successfully');
    } catch (error) {
        // Index might not exist, which is fine
        console.log('Note: phoneNumber index might not exist or was already dropped');
    }
});

module.exports = Transaction; 