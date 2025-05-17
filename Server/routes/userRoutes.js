// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { authenticateJWT } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');  // Import multer configuration for file uploads

// Protected route - Requires authentication
router.use(authenticateJWT);

// Edit user profile (Allow updating username, address, description, and profile picture)
router.put('/profile/edit', upload.single('profile_picture'), async (req, res) => {
  const { username, address, description } = req.body;
  const userId = req.user.id; // Get the logged-in user's ID
  const profilePicture = req.file ? req.file.path : null; // Image path (optional)

  // Validate input fields
  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    const result = await userService.updateUserProfile(userId, username, address, description, profilePicture);
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

// routes/userRoutes.js
router.get('/all', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
