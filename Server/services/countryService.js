// services/CountryService.js
const axios = require('axios');
const logger = require('../utils/logger');

class CountryService {
  // Get all country data
  async getAllCountries() {
    try {
      const url = "https://restcountries.com/v3.1/all?fields=name,currencies,capital,languages,flags";
      const response = await axios.get(url);
      logger.info("Fetched all country data.");
      return response.data;
    } catch (error) {
      logger.error("Error fetching countries data: " + error);
      throw new Error("Error fetching countries data");
    }
  }

  // Get country data by country name
  async getCountryByName(name) {
    try {
      const url = `https://restcountries.com/v3.1/name/${name}?fields=name,currencies,capital,languages,flags`;
      const response = await axios.get(url);
      logger.info(`Fetched data for country: ${name}`);
      return response.data;
    } catch (error) {
      logger.error("Error fetching country data: " + error);
      throw new Error("Error fetching country data");
    }
  }
}

module.exports = new CountryService();
