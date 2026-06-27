// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { generateTokens } = require('../config/jwt.config');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new user and generate tokens.
   */
  async register(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
        },
      });

      const { accessToken } = generateTokens(user);

      // Remove sensitive data before returning
      const { password, ...safeUser } = user;

      logger.info(`User registered with ID: ${user.id}`);
      return { accessToken, user: safeUser };
    } catch (error) {
      logger.error(`Error during registration: ${error.message}`);
      throw new Error(`Registration error: ${error.message}`);
    }
  }

  /**
   * Authenticate a user by username and password.
   */
  async login(username, password) {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        logger.warn(`Failed login attempt for non-existing user: ${username}`);
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        logger.warn(`Failed login attempt for user: ${username} (incorrect password)`);
        return null;
      }

      const { accessToken } = generateTokens(user);

      // Get follower/following counts
      const [followersCount, followingCount] = await Promise.all([
        prisma.follower.count({ where: { followingId: user.id } }),
        prisma.follower.count({ where: { followerId: user.id } }),
      ]);

      // Remove sensitive data
      const { password: _, ...safeUser } = user;
      safeUser.followers = followersCount;
      safeUser.following = followingCount;

      logger.info(`User logged in: ${username}`);
      return { accessToken, user: safeUser };
    } catch (error) {
      logger.error(`Error during login: ${error.message}`);
      throw new Error(`Login error: ${error.message}`);
    }
  }

  /**
   * Reset a user's password by email.
   */
  async resetPassword(email, newPassword) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        logger.warn(`User with email ${email} not found`);
        return null;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      logger.info(`Password reset for user with email: ${email}`);
      return true;
    } catch (error) {
      logger.error(`Error resetting password for ${email}: ${error.message}`);
      throw new Error(`Password reset error: ${error.message}`);
    }
  }
}

module.exports = new AuthService();
