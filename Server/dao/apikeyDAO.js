// dao/apiKeyDAO.js
const db = require('../config/databaseCon');
const logger = require('../utils/logger');

class ApiKeyDAO {
    // Create a new API key
    async createApiKey(userId) {
        return new Promise((resolve, reject) => {
            const apiKey = require('crypto').randomBytes(32).toString('hex'); // Generate a secure random API key
            const query = 'INSERT INTO api_keys (key, user_id) VALUES (?, ?)';

            db.run(query, [apiKey, userId], function (err) {
                if (err) {
                    logger.error(`Error creating API key for user ${userId}: ${err.message}`);
                    reject(err);
                } else {
                    logger.info(`API key created for user ${userId}`);
                    resolve({ apiKey, id: this.lastID });
                }
            });
        });
    }

    // Get all API keys for a user
    async getApiKeysByUserId(userId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM api_keys WHERE user_id = ?';

            db.all(query, [userId], (err, rows) => {
                if (err) {
                    logger.error(`Error fetching API keys for user ${userId}: ${err.message}`);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Validate an API key by checking if it exists in the api_keys table
    async getApiKeyByKey(apiKey) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM api_keys WHERE key = ?';

            db.get(query, [apiKey], (err, row) => {
                if (err) {
                    logger.error(`Error fetching API key ${apiKey}: ${err.message}`);
                    reject(err);
                } else {
                    if (row) {
                        logger.info(`API key ${apiKey} is valid`);
                        resolve(row);
                    } else {
                        logger.warn(`API key ${apiKey} not found`);
                        resolve(null); // No API key found
                    }
                }
            });
        });
    }
    
    // Delete an API key by its key (updated to search by key, not by ID)
    async deleteApiKeyByKey(apiKey) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM api_keys WHERE key = ?';

            db.run(query, [apiKey], function (err) {
                if (err) {
                    logger.error(`Error deleting API key ${apiKey}: ${err.message}`);
                    reject(err);
                } else {
                    logger.info(`API key ${apiKey} deleted`);
                    resolve();
                }
            });
        });
    }

    // Log API key usage
    async logApiKeyUsage(apiKeyId, endpoint, success) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO api_key_usage_logs (api_key_id, endpoint, success) VALUES (?, ?, ?)';

            db.run(query, [apiKeyId, endpoint, success], function (err) {
                if (err) {
                    logger.error(`Error logging API key usage for key ID ${apiKeyId}: ${err.message}`);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Increment usage count for an API key
    async incrementUsageCount(apiKeyId) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE api_keys SET usage_count = usage_count + 1 WHERE id = ?';

            db.run(query, [apiKeyId], function (err) {
                if (err) {
                    logger.error(`Error updating usage count for API key ID ${apiKeyId}: ${err.message}`);
                    reject(err);
                } else {
                    logger.info(`Successfully updated usage count for API key ID ${apiKeyId}`);
                    resolve();
                }
            });
        });
    }
}

module.exports = new ApiKeyDAO();
