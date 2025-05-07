const winston = require("winston");

// Define custom log formats
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create a logger instance with different transports
const logger = winston.createLogger({
  level: "info", // Default level to log. You can change it to "debug" for more detailed logs.
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Timestamp format
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Adds color to the logs
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "logs/app.log", // Logs will be written to this file
      level: "info", // Logs of 'info' level and higher
    }),
    new winston.transports.File({
      filename: "logs/errors.log", // Logs errors here
      level: "error", // Log only errors
    }),
  ],
});

module.exports = logger;
