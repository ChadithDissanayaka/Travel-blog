// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const logger = require('../utils/logger'); // Import the logger

// Register route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const result = await authService.register({ username, email, password });
    logger.info(`New user registered: ${username}`); // Log user registration
    res.json(result);
  } catch (error) {
    logger.error(`Registration failed for ${username}: ${error.message}`); // Log error
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await authService.login(username, password);
    if (!result) {
      logger.warn(`Failed login attempt for user: ${username}`); // Log failed login
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set JWT and CSRF tokens in cookies
    res.cookie('jwt', result.accessToken, { httpOnly: true, sameSite: 'strict', secure: true });
    res.cookie('csrf-token', result.csrfToken, { httpOnly: false, sameSite: 'strict', secure: true });

    logger.info(`User logged in: ${username}`); // Log successful login
    res.json({ message: 'Login successful', user: result.user, csrfToken: result.csrfToken, apiKey: result.apiKey  });
  } catch (error) {
    logger.error(`Login failed for ${username}: ${error.message}`); // Log error
    res.status(500).json({ error: error.message });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.clearCookie('csrf-token');
  logger.info('User logged out'); // Log logout
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
