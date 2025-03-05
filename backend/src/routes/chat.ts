import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { ChatMessage } from '../models/ChatMessage';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Middleware to check message limits for non-authenticated users
const checkMessageLimit = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.user) {
        // Authenticated users have no limit
        return next();
    }

    const sessionId = req.headers['session-id'] as string;
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required for anonymous users' });
    }

    // Count messages for this session
    const messageCount = await ChatMessage.countDocuments({
        sessionId,
        role: 'user',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    const maxFreeMessages = parseInt(process.env.MAX_FREE_MESSAGES || '4');
    if (messageCount >= maxFreeMessages) {
        return res.status(403).json({
            error: 'Free message limit reached',
            message: 'Please login to continue chatting',
            remainingMessages: 0
        });
    }

    // Set remaining messages in response
    res.locals.remainingMessages = maxFreeMessages - messageCount;
    next();
};

// Send a message
router.post('/message', optionalAuth, checkMessageLimit, async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user?._id;
        const sessionId = req.headers['session-id'] as string || uuidv4();

        // Store the message
        const message = new ChatMessage({
            content,
            role: 'user',
            userId,
            sessionId: userId ? null : sessionId,
        });
        await message.save();

        // If authenticated, increment message count
        if (userId) {
            await User.findByIdAndUpdate(userId, { $inc: { messageCount: 1 } });
        }

        // TODO: Process with AI and get response
        const aiResponse = "AI response placeholder";

        // Store AI response
        const aiMessage = new ChatMessage({
            content: aiResponse,
            role: 'assistant',
            userId,
            sessionId: userId ? null : sessionId,
        });
        await aiMessage.save();

        res.json({
            message: aiMessage,
            remainingMessages: res.locals.remainingMessages || null,
            sessionId
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get chat history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const messages = await ChatMessage.find({
            userId: req.user._id
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router; 