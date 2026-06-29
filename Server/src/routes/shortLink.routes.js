// src/routes/shortLink.routes.js
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/shortLink.controller');

// All routes below require authentication
router.use(authenticateJWT);

// POST   /api/links        → create a new short link
router.post('/', ctrl.createLink);

// GET    /api/links        → list current user's links
router.get('/', ctrl.getMyLinks);

// GET    /api/links/:id/stats → click stats for a link
router.get('/:id/stats', ctrl.getLinkStats);

// DELETE /api/links/:id   → delete a link
router.delete('/:id', ctrl.deleteLink);

module.exports = router;
