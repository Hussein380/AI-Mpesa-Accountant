import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    sessionId: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema); 