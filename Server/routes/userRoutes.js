const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { upload, uploadToCloudinary } = require('../utils/upload');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { csrfProtection } = require('../middleware/csrfMiddleware');

// Apply JWT and CSRF protection
router.use(authenticateJWT);
router.use(csrfProtection);

// Edit user profile (Allow updating username, address, description, and profile picture)
router.put('/profile/edit', upload, uploadToCloudinary, async (req, res) => {
  const { username, address, description } = req.body;
  const userId = req.user.id; 
  const profilePicture = req.fileUrl || null; // If a new image was uploaded, get the Cloudinary URL

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    const currentProfile = await userService.getUserProfile(userId);

    // If no new profile picture, keep the existing one
    const updatedProfilePicture = profilePicture || currentProfile.profile_picture;

    const result = await userService.updateUserProfile(userId, username, address, description, updatedProfilePicture);
    res.json(result); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile details (userId, username, address, description, created_at, profile picture)
router.get('/profile', async (req, res) => {
  const userId = req.user.id; // Get the logged-in user's ID

  try {
    const userProfile = await userService.getUserProfile(userId);
    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users Id and names
router.get('/all', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
