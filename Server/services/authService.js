// services/authService.js
const bcrypt = require('bcrypt');
const authDAO = require('../dao/authDAO');
const { generateTokens } = require('../config/jwt');
const logger = require('../utils/logger'); // Import the logger

class AuthService {
  async register(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10); // Hash the password
    userData.password = hashedPassword;

    try {
      // Create the user in the database
      const userId = await authDAO.createUser(userData);
      const user = await authDAO.findUserById(userId);

      // Generate both access token (JWT) and CSRF token
      const { accessToken, csrfToken } = generateTokens(user);

      // Remove sensitive data (password) from the user object before returning it
      delete user.password;

      logger.info(`User registered with ID: ${user.id}`); // Log user registration
      return { accessToken, csrfToken, user };
    } catch (error) {
      logger.error(`Error during registration: ${error.message}`); // Log error
      throw new Error(`Registration error: ${error.message}`);
    }
  }

  async login(username, password) {
    try {
      const user = await authDAO.findUserByUsername(username);
      if (!user) {
        logger.warn(`Failed login attempt for non-existing user: ${username}`); // Log failed login attempt
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        logger.warn(`Failed login attempt for user: ${username} (incorrect password)`); // Log failed login attempt
        return null;
      }

      // Generate tokens
      const { accessToken, csrfToken } = generateTokens(user);

      // Remove sensitive data
      delete user.password;

      logger.info(`User logged in: ${username}`); // Log successful login
      return { accessToken, csrfToken, user };
    } catch (error) {
      logger.error(`Error during login: ${error.message}`); // Log error
      throw new Error(`Login error: ${error.message}`);
    }
  }
}

module.exports = new AuthService();
