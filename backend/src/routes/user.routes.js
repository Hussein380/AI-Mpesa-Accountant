const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, deleteProfile } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Get user profile
router.get('/profile', authenticate, getProfile);

// Update user profile
router.put('/profile', authenticate, updateProfile);

// Delete user profile
router.delete('/profile', authenticate, deleteProfile);

module.exports = router; 