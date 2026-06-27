// src/controllers/country.controller.js
const countryService = require('../services/country.service');
const logger = require('../utils/logger');

/**
 * GET /api/countries
 */
const getAllCountries = async (req, res, next) => {
  try {
    const result = await countryService.getAllCountries();
    res.json(result);
  } catch (error) {
    logger.error(`Error fetching countries: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/countries/:name
 */
const getCountryByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const result = await countryService.getCountryByName(name);
    res.json(result);
  } catch (error) {
    logger.error(`Error fetching country data for ${req.params.name}: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllCountries,
  getCountryByName,
};
