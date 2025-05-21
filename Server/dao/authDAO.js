// dao/authDAO.js
const db = require('../config/databaseCon');
const logger = require('../utils/logger'); 

class AuthDAO {
  // Create a new user
  async createUser(userData) {
    return new Promise((resolve, reject) => {
      const { username, email, password } = userData;
      const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';

      db.run(query, [username, email, password], function (err) {
        if (err) {
          logger.error(`Error creating user: ${err.message}`); 
          reject(err);
        } else {
          logger.info(`User created with ID: ${this.lastID}`);
          resolve(this.lastID); 
        }
      });
    });
  }

  // Find a user by username
  async findUserByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE username = ?';

      db.get(query, [username], (err, row) => {
        if (err) {
          logger.error(`Error finding user by username: ${err.message}`);
          reject(err);
        } else {
          logger.info(`User found: ${username}`); 
          resolve(row); 
        }
      });
    });
  }

  // Find a user by their ID
  async findUserById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';

      db.get(query, [id], (err, row) => {
        if (err) {
          logger.error(`Error finding user by ID: ${err.message}`); 
          reject(err);
        } else {
          logger.info(`User found by ID: ${id}`); 
          resolve(row); 
        }
      });
    });
  }


  // Find user by email
  async findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';

      db.get(query, [email], (err, row) => {
        if (err) {
          logger.error(`Error fetching user by email ${email}: ${err.message}`);
          reject(err);
        } else {
          resolve(row); 
        }
      });
    });
  }

  // Update user password
  async updateUserPassword(userId, newPassword) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET password = ? WHERE id = ?';

      db.run(query, [newPassword, userId], function (err) {
        if (err) {
          logger.error(`Error updating password for user ID ${userId}: ${err.message}`);
          reject(err);
        } else {
          resolve(); 
        }
      });
    });
  }
}


module.exports = new AuthDAO();
