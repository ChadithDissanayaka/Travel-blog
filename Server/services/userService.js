// services/userService.js
const db = require('../config/databaseCon');
const logger = require('../utils/logger');

class UserService {
  // Update user profile (username, address, description, and profile picture)
  async updateUserProfile(userId, username, address, description, profilePicture) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users
        SET username = ?, address = ?, description = ?, profile_picture = ?
        WHERE id = ?
      `;
      db.run(query, [username, address, description, profilePicture, userId], function (err) {
        if (err) {
          logger.error(`Error updating user profile: ${err.message}`);
          reject(err);
        } else {
          resolve({ message: 'User profile updated successfully', username, address, description, profilePicture, userId});
        }
      });
    });
  }

  // Get user profile (userId, username, address, description, created_at, profile picture)
  async getUserProfile(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, username, address, description, created_at, profile_picture
        FROM users
        WHERE id = ?
      `;
      db.get(query, [userId], (err, row) => {
        if (err) {
          logger.error(`Error fetching user profile: ${err.message}`);
          reject(err);
        } else {
          resolve(row); // Return user profile data
        }
      });
    });
  }

  async getAllUsers() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id AS user_id, username
        FROM users
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          logger.error(`Error fetching users: ${err.message}`);
          reject(err);
        } else {
          resolve(rows); // Return list of users with user_id and username
        }
      });
    });
  }
}

module.exports = new UserService();
