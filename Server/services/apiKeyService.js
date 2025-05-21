const apiKeyDAO = require('../dao/apikeyDAO');
const authDAO = require('../dao/authDAO');
const logger = require('../utils/logger');

class ApiKeyService {
    // Generate an API key for a user
    async generateApiKey(userId) {
        try {
            logger.info(`Attempting to generate an API key for user ${userId}`);

            const user = await authDAO.findUserById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            const result = await apiKeyDAO.createApiKey(userId);
            logger.info(`Successfully generated API key for user ${userId}`);
            return result;
        } catch (error) {
            logger.error(`Error generating API key for user ${userId}: ${error.message}`);
            throw new Error(`Error generating API key: ${error.message}`);
        }
    }

    // Get the list of API keys for a user
    async getApiKeys(userId) {
        try {
            logger.info(`Fetching API keys for user ${userId}`);

            const keys = await apiKeyDAO.getApiKeysByUserId(userId);
            logger.info(`Successfully fetched API keys for user ${userId}`);
            return keys;
        } catch (error) {
            logger.error(`Error fetching API keys for user ${userId}: ${error.message}`);
            throw new Error(`Error fetching API keys: ${error.message}`);
        }
    }

    // Validate an API key
    async validateApiKey(apiKey) {
        try {
            logger.info(`Validating API key: ${apiKey}`);
            const validKey = await apiKeyDAO.getApiKeyByKey(apiKey);

            if (!validKey) {
                logger.warn(`API key ${apiKey} is invalid or not found`);
                return null; y
            }
            
            logger.info(`API key ${apiKey} is valid.`);
            return validKey;
        } catch (error) {
            logger.error(`Error validating API key ${apiKey}: ${error.message}`);
            throw new Error(`Error validating API key: ${error.message}`);
        }
    }

    // Delete an API key
    async deleteApiKey(apiKey) {
        try {
            logger.info(`Attempting to delete API key: ${apiKey}`);

            await apiKeyDAO.deleteApiKeyByKey(apiKey);
            logger.info(`Successfully deleted API key: ${apiKey}`);
        } catch (error) {
            logger.error(`Error deleting API key ${apiKey}: ${error.message}`);
            throw new Error(`Error deleting API key: ${error.message}`);
        }
    }

    // Log API key usage
    async logUsage(apiKeyId, endpoint, success) {
        try {
            logger.info(`Logging API key usage for API key ID ${apiKeyId}, endpoint: ${endpoint}`);

            // Log the usage in the logs table
            await apiKeyDAO.logApiKeyUsage(apiKeyId, endpoint, success);

            // Increment the usage count for the API key
            await apiKeyDAO.incrementUsageCount(apiKeyId);

            logger.info(`Successfully logged API key usage for API key ID ${apiKeyId}`);
        } catch (error) {
            logger.error(`Error logging API key usage for API key ID ${apiKeyId}: ${error.message}`);
            throw new Error(`Error logging API key usage: ${error.message}`);
        }
    }
}

module.exports = new ApiKeyService();
