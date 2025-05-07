// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/authMiddleware');
const { csrfProtection } = require('../middleware/csrfMiddleware');
const logger = require('../utils/logger'); // Import the logger

// Apply both JWT and CSRF protection
router.use(authenticateJWT);
router.use(csrfProtection);

// Protected route example
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    // Simulate profile update logic here
    logger.info(`User profile updated: ${userId}`); // Log profile update
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    logger.error(`Error updating profile for user ${req.user.id}: ${error.message}`); // Log error
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
