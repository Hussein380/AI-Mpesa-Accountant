import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Generate JWT token
const generateToken = (userId: string) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// User signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Create user data object
        const userData: any = {
            name,
            email,
            password
        };

        // Only add phoneNumber if it's a non-empty string
        if (phoneNumber && typeof phoneNumber === 'string' && phoneNumber.trim() !== '') {
            // Check if phone number is already in use
            const existingPhoneUser = await User.findOne({ phoneNumber: phoneNumber.trim() });
            if (existingPhoneUser) {
                return res.status(400).json({ error: 'Phone number already in use' });
            }
            userData.phoneNumber = phoneNumber.trim();
        }

        // Create new user
        const user = new User(userData);
        await user.save();

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(201).json({
            message: 'User created successfully',
            user,
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id.toString());

        res.json({
            message: 'Login successful',
            user,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify token and get user
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        user: req.user
    });
});

// Logout (optional - can be handled client-side)
router.post('/logout', authenticateToken, (req, res) => {
    // In a real app, you might want to invalidate the token
    // For now, we'll just return a success message
    res.json({ message: 'Logged out successfully' });
});

export default router; 