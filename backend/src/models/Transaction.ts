import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    user: mongoose.Types.ObjectId;
    transactionId: string;
    date: Date;
    type: 'SENT' | 'RECEIVED' | 'PAYMENT' | 'WITHDRAWAL' | 'DEPOSIT' | 'OTHER';
    amount: number;
    balance?: number;
    recipient?: string;
    sender?: string;
    description?: string;
    category: 'FOOD' | 'TRANSPORT' | 'UTILITIES' | 'ENTERTAINMENT' | 'SHOPPING' | 'HEALTH' | 'EDUCATION' | 'OTHER';
    source: 'PDF' | 'SMS' | 'MANUAL';
    createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Add index for better query performance
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
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
        type: Number
    },
    recipient: {
        type: String
    },
    sender: {
        type: String
    },
    description: {
        type: String
    },
    category: {
        type: String,
        enum: ['FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'SHOPPING', 'HEALTH', 'EDUCATION', 'OTHER'],
        default: 'OTHER'
    },
    source: {
        type: String,
        enum: ['PDF', 'SMS', 'MANUAL'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add compound index for user + date for efficient user-specific date queries
TransactionSchema.index({ user: 1, date: -1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema); 