// src/app.js
const express    = require('express');
const path       = require('path');
const morgan     = require('morgan');
const cors       = require('cors');
const cookieParser = require('cookie-parser');

const logger        = require('./utils/logger');
const routes        = require('./routes');
const errorHandler  = require('./middlewares/errorHandler.middleware');
const { csrfProtection } = require('./middlewares/csrf.middleware');

const { redirect } = require('./controllers/shortLink.controller');

const app = express();

// ─── Global Middlewares ──────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(csrfProtection);
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Public redirect for short links
app.get('/s/:slug', redirect);

// ─── API Routes ──────────────────────────────────────────
app.use('/api', routes);

// ─── Error Handler ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
