const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware to authenticate users via JWT
const auth = async (req, res, next) => {
    try {
        console.log('auth: Authenticating request');
        
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            console.log('auth: No Authorization header found');
            return res.status(401).json({ error: 'Authentication required' });
        }

        console.log('auth: Authorization header found');
        
        const token = authHeader.replace('Bearer ', '');
        console.log('auth: Token extracted, verifying...');
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            console.log('auth: Token verified, user ID:', decoded.id);
            
            const user = await User.findById(decoded.id);
            if (!user) {
                console.log('auth: User not found for ID:', decoded.id);
                return res.status(401).json({ error: 'User not found' });
            }
            
            console.log('auth: User found:', user.email);
            req.user = user;
            req.token = token;
            next();
        } catch (jwtError) {
            console.error('auth: JWT verification error:', jwtError);
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('auth: Authentication error:', error);
        res.status(401).json({ error: 'Please authenticate' });
    }
};

// Optional authentication - doesn't require auth but will use it if provided
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return next();
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        const user = await User.findById(decoded.id);
        if (user) {
            req.user = user;
            req.token = token;
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = {
    auth,
    optionalAuth
}; 