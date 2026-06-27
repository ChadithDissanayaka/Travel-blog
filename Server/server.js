// server.js — Entry point
// Loads environment variables and starts the HTTP server
require('dotenv').config();

const app = require('./src/app');
const logger = require('./src/utils/logger');
const dataSeeder = require('./src/utils/dataSeeder');

const port = process.env.PORT || 3000;

// Seed database and start the server
(async () => {
  try {
    await dataSeeder.seed();
  } catch (error) {
    logger.error(`Failed to seed database during startup: ${error.message}`);
  }

  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
})();
