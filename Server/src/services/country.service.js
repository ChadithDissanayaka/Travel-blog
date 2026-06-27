// src/services/country.service.js
const axios = require('axios');
const logger = require('../utils/logger');

class CountryService {
  /**
   * Helper to map v5 API structure to the v3.1 structure expected by the client.
   */
  mapCountryToOldFormat(country) {
    const currencies = {};
    if (country.currencies && Array.isArray(country.currencies)) {
      country.currencies.forEach(curr => {
        if (curr.code) {
          currencies[curr.code] = { name: curr.name || '' };
        }
      });
    }

    return {
      name: {
        common: country.names?.common || 'No name available'
      },
      capital: country.capitals ? country.capitals.map(c => c.name) : [],
      currencies,
      flags: {
        svg: country.flag?.url_svg || 'No flag available'
      }
    };
  }

  /**
   * Get all country data from REST Countries API.
   */
  async getAllCountries() {
    try {
      const token = process.env.REST_COUNTRIES_API_TOKEN || 'rc_live_aaf9b145254b41f0a85f51b76011712a';
      const limit = 100;
      let offset = 0;
      let more = true;
      let allObjects = [];

      while (more) {
        const url = `https://api.restcountries.com/countries/v5?response_fields=names.common,flag.url_svg,capitals.name,currencies.code,currencies.name&limit=${limit}&offset=${offset}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = response.data;
        if (data && data.data && Array.isArray(data.data.objects)) {
          allObjects.push(...data.data.objects);
          const meta = data.data.meta;
          more = meta && meta.more;
        } else {
          more = false;
        }
        offset += limit;
      }

      logger.info(`Fetched all country data. Total: ${allObjects.length}`);
      return allObjects.map(country => this.mapCountryToOldFormat(country));
    } catch (error) {
      logger.error(`Error fetching countries data: ${error.message}`);
      throw new Error('Error fetching countries data');
    }
  }

  /**
   * Get country data by name.
   */
  async getCountryByName(name) {
    try {
      const token = process.env.REST_COUNTRIES_API_TOKEN || 'rc_live_aaf9b145254b41f0a85f51b76011712a';
      const url = `https://api.restcountries.com/countries/v5?names.common=${encodeURIComponent(name)}&response_fields=names.common,flag.url_svg,capitals.name,currencies.code,currencies.name`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = response.data;
      const objects = data && data.data && Array.isArray(data.data.objects) ? data.data.objects : [];
      logger.info(`Fetched data for country: ${name}. Found: ${objects.length}`);
      return objects.map(country => this.mapCountryToOldFormat(country));
    } catch (error) {
      logger.error(`Error fetching country data: ${error.message}`);
      throw new Error('Error fetching country data');
    }
  }
}

module.exports = new CountryService();
