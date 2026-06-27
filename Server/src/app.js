// src/app.js
// Express application setup — exports the app for server.js and testing
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const logger = require('./utils/logger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler.middleware');
const cookieParser = require('cookie-parser');
const { csrfProtection } = require('./middlewares/csrf.middleware');

const app = express();

// ─── Global Middlewares ──────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(csrfProtection);

// HTTP request logging
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Serve static files (uploaded images — kept for backwards compat)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── API Routes ──────────────────────────────────────────
app.use('/api', routes);

// ─── Global Error Handler ────────────────────────────────
app.use(errorHandler);

module.exports = app;
