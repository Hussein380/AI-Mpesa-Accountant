const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return sendError(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    return sendSuccess(res, user, 'User profile retrieved successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, 'Server error while fetching profile', 'PROFILE_FETCH_ERROR', 500);
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, profilePicture } = req.body;
    
    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (profilePicture) updateFields.profilePicture = profilePicture;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return sendError(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    return sendSuccess(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 'Server error while updating profile', 'PROFILE_UPDATE_ERROR', 500);
  }
};

/**
 * Delete user profile
 */
exports.deleteProfile = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id);
    
    if (!deletedUser) {
      return sendError(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    return sendSuccess(res, { id: req.user.id }, 'User deleted successfully');
  } catch (error) {
    console.error('Delete profile error:', error);
    return sendError(res, 'Server error while deleting profile', 'PROFILE_DELETE_ERROR', 500);
  }
}; 