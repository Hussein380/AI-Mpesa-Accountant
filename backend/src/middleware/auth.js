const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware to authenticate users via JWT
const auth = async (req, res, next) => {
    try {
        console.log('auth: Authenticating request');
        
        // Check for Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            console.log('auth: No Authorization header found');
            return res.status(401).json({ 
                message: 'Authentication required',
                error: 'No authorization token provided'
            });
        }

        console.log('auth: Authorization header found');
        
        // Extract and verify token
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            console.log('auth: Empty token');
            return res.status(401).json({ 
                message: 'Authentication required',
                error: 'Empty token provided'
            });
        }
        
        console.log('auth: Token extracted, verifying...');
        
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            console.log('auth: Token verified, user ID:', decoded.id);
            
            // Find user
            const user = await User.findById(decoded.id);
            if (!user) {
                console.log('auth: User not found for ID:', decoded.id);
                return res.status(401).json({ 
                    message: 'Authentication failed',
                    error: 'User not found'
                });
            }
            
            console.log('auth: User found:', user.email);
            
            // Set user and token on request object
            req.user = {
                id: user._id,
                email: user.email,
                name: user.name
            };
            req.token = token;
            next();
        } catch (jwtError) {
            console.error('auth: JWT verification error:', jwtError);
            return res.status(401).json({ 
                message: 'Authentication failed',
                error: 'Invalid or expired token'
            });
        }
    } catch (error) {
        console.error('auth: Authentication error:', error);
        res.status(500).json({ 
            message: 'Server error during authentication',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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
        if (!token) {
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findById(decoded.id);
            
            if (user) {
                req.user = {
                    id: user._id,
                    email: user.email,
                    name: user.name
                };
                req.token = token;
            }
            next();
        } catch (jwtError) {
            // Continue without authentication if token is invalid
            console.log('optionalAuth: Invalid token, continuing without auth');
            next();
        }
    } catch (error) {
        // Continue without authentication
        console.error('optionalAuth: Error:', error);
        next();
    }
};

module.exports = {
    auth,
    optionalAuth
}; 