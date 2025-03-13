const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, deleteProfile } = require('../controllers/user.controller');
const { auth } = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, getProfile);

// Update user profile
router.put('/profile', auth, updateProfile);

// Delete user profile
router.delete('/profile', auth, deleteProfile);

module.exports = router; 