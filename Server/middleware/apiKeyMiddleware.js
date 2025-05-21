const apiKeyService = require('../services/apiKeyService');
const logger = require('../utils/logger');

const apiKeyMiddleware = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(403).json({ error: 'API key required' });
    }

    try {
        // Check if the API key is valid
        const validKey = await apiKeyService.validateApiKey(apiKey);


        if (!validKey) {
            return res.status(403).json({ error: 'Invalid API key' });
        }

        // Log API key usage
        await apiKeyService.logUsage(validKey.id, req.originalUrl, true);

        next();
    } catch (error) {
        logger.error(`Error in API key validation: ${error.message}`);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = apiKeyMiddleware;
