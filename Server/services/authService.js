const bcrypt = require('bcrypt');
const authDAO = require('../dao/authDAO');
const followerDAO = require('../dao/followerDAO');
const apiKeyService = require('../services/apiKeyService');
const { generateTokens } = require('../config/jwt');
const logger = require('../utils/logger'); 

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

      // Generate an API key for the user
      const apiKey = await apiKeyService.generateApiKey(userId);

      // Remove sensitive data (password) from the user object before returning it
      delete user.password;

      logger.info(`User registered with ID: ${user.id}`); 
      return { accessToken, csrfToken, apiKey, user };
    } catch (error) {
      logger.error(`Error during registration: ${error.message}`); 
      throw new Error(`Registration error: ${error.message}`);
    }
  }

  async login(username, password) {
    try {
      const user = await authDAO.findUserByUsername(username);
      if (!user) {
        logger.warn(`Failed login attempt for non-existing user: ${username}`); 
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        logger.warn(`Failed login attempt for user: ${username} (incorrect password)`); 
        return null;
      }

      // Generate tokens
      const { accessToken, csrfToken } = generateTokens(user);

      // GetA an API keys for the logged-in user
      const apiKey = await apiKeyService.getApiKeys(user.id)

      // Remove sensitive data
      delete user.password;
      user.followers = await followerDAO.getFollowersCountForUser(user.id);
      user.following = await followerDAO.getFollowingCountForUser(user.id);
      
      logger.info(`User logged in: ${username}`); 
      return { accessToken, csrfToken, apiKey, user };
    } catch (error) {
      logger.error(`Error during login: ${error.message}`); 
      throw new Error(`Login error: ${error.message}`);
    }
  }

  // Reset password
  async resetPassword(email, newPassword) {
    try {

      const user = await authDAO.findUserByEmail(email);

      if (!user) {
        logger.warn(`User with email ${email} not found`);
        return null; 
      }


      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await authDAO.updateUserPassword(user.id, hashedPassword);

      logger.info(`Password reset for user with email: ${email}`);
      return true; 
    } catch (error) {
      logger.error(`Error resetting password for ${email}: ${error.message}`);
      throw new Error(`Password reset error: ${error.message}`);
    }
  }

}

module.exports = new AuthService();
