// routes/apiKeyRoutes.js
const express = require('express');
const router = express.Router();
const apiKeyService = require('../services/apiKeyService');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { csrfProtection } = require('../middleware/csrfMiddleware');
router.use(authenticateJWT)

// Generate API key
router.post('/generate', csrfProtection, async (req, res) => {
    //const { id } = req.body;
    userId = req.user.id; 
    try {
        const result = await apiKeyService.generateApiKey(userId);
        res.json(result);
    } catch (error) {
        logger.error(`Error generating API key for user ${id}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// Get all API keys
router.get('/', csrfProtection, async (req, res) => {
    userId = req.user.id; 
    try {
        const keys = await apiKeyService.getApiKeys(userId);
        res.json(keys);
    } catch (error) {
        logger.error(`Error fetching API keys for user ${id}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// Delete an API key (using the key in the request body)
router.delete('/delete', csrfProtection, async (req, res) => {
    const { apiKey } = req.body; // API key passed in the request body
    if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' });
    }

    try {
        await apiKeyService.deleteApiKey(apiKey);
        res.json({ message: 'API key deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting API key ${apiKey}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
