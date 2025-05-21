const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const logger = require('../utils/logger');

// Register route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const result = await authService.register({ username, email, password });
    logger.info(`New user registered: ${username}`);
    res.json(result);
  } catch (error) {
    logger.error(`Registration failed for ${username}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await authService.login(username, password);
    if (!result) {
      logger.warn(`Failed login attempt for user: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set JWT and CSRF tokens in cookies
    res.cookie('jwt', result.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    });

    res.cookie('csrf-token', result.csrfToken, {
      httpOnly: false,
      sameSite: 'strict',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 // 1 Day
    });


    logger.info(`User logged in: ${username}`);
    res.json({ message: 'Login successful', user: result.user, csrfToken: result.csrfToken, apiKey: result.apiKey });
  } catch (error) {
    logger.error(`Login failed for ${username}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const result = await authService.resetPassword(email, newPassword);

    if (result) {
      logger.info(`Password reset successful for user with email: ${email}`);
      return res.json({ message: 'Password reset successfully' });
    } else {
      logger.warn(`Password reset failed for email: ${email}`);
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    logger.error(`Password reset failed for ${email}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.clearCookie('csrf-token');
  logger.info('User logged out');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
