// routes/countryRoutes.js
const express = require('express');
const router = express.Router();
const countriesService = require('../services/countryService');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');

// Countries endpoints (protected by API key)
router.get('/', apiKeyMiddleware, async (req, res) => {
    try {
        const result = await countriesService.getAllCountries();
        res.json(result);
    } catch (error) {
        logger.error(`Error fetching countries: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:name', apiKeyMiddleware, async (req, res) => {
    try {
        const { name } = req.params;
        const result = await countriesService.getCountryByName(name);
        res.json(result);
    } catch (error) {
        logger.error(`Error fetching country data for ${req.params.name}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
