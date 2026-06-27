// src/routes/country.routes.js
const express = require('express');
const router = express.Router();
const countryController = require('../controllers/country.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// All country routes are protected by JWT authentication
router.use(authenticateJWT);

router.get('/', countryController.getAllCountries);
router.get('/:name', countryController.getCountryByName);

module.exports = router;
