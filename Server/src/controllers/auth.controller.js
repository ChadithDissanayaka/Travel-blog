// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const result = await authService.register({ username, email, password });
    logger.info(`New user registered: ${username}`);
    res.json(result);
  } catch (error) {
    logger.error(`Registration failed for ${username}: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const result = await authService.login(username, password);
    if (!result) {
      logger.warn(`Failed login attempt for user: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    logger.info(`User logged in: ${username}`);
    res.json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    logger.error(`Login failed for ${username}: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
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
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  logger.info('User logged out');
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  resetPassword,
  logout,
};
