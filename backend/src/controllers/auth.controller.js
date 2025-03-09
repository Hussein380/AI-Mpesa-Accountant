const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'User already exists with this email', 'USER_EXISTS', 400);
    }

    // Check if phone number is already in use (if provided)
    if (phoneNumber && phoneNumber.trim() !== '') {
      const existingPhoneUser = await User.findOne({ phoneNumber: phoneNumber.trim() });
      if (existingPhoneUser) {
        return sendError(res, 'Phone number already in use', 'PHONE_EXISTS', 400);
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber ? phoneNumber.trim() : undefined
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Return user data (without password) and token
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      token
    };

    return sendSuccess(res, userData, 'User registered successfully', 201);
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, 'Server error during registration', 'REGISTRATION_ERROR', 500);
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    console.log('Login request received:', {
      body: req.body,
      headers: req.headers['content-type']
    });

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 'MISSING_FIELDS', 400);
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Return user data (without password) and token
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      token
    };

    return sendSuccess(res, userData, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Server error during login', 'LOGIN_ERROR', 500);
  }
};

/**
 * Forgot password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_RESET_SECRET || 'reset-secret-key',
      { expiresIn: '1h' }
    );

    // In a real application, you would send an email with the reset link
    // For now, we'll just return the token
    res.json({
      message: 'Password reset link sent to your email',
      resetToken
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

/**
 * Reset password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_RESET_SECRET || 'reset-secret-key'
    );

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
}; 