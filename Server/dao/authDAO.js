// dao/authDAO.js
const db = require('../config/databaseCon'); // Import the SQLite database connection
const logger = require('../utils/logger'); // Import the logger

class AuthDAO {
  // Create a new user
  async createUser(userData) {
    return new Promise((resolve, reject) => {
      const { username, email, password } = userData;
      const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      
      db.run(query, [username, email, password], function (err) {
        if (err) {
          logger.error(`Error creating user: ${err.message}`); // Log error
          reject(err);
        } else {
          logger.info(`User created with ID: ${this.lastID}`); // Log successful user creation
          resolve(this.lastID); // Returns the last inserted row's ID
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
          logger.error(`Error finding user by username: ${err.message}`); // Log error
          reject(err);
        } else {
          logger.info(`User found: ${username}`); // Log successful user lookup
          resolve(row); // row is an object representing the user
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
          logger.error(`Error finding user by ID: ${err.message}`); // Log error
          reject(err);
        } else {
          logger.info(`User found by ID: ${id}`); // Log successful user lookup
          resolve(row); // row is an object representing the user
        }
      });
    });
  }
}

module.exports = new AuthDAO();
