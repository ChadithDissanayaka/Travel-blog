// src/routes/album.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/album.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { upload, uploadToCloudinary } = require('../utils/upload');

// All album routes require authentication — albums visible to registered users only
router.use(authenticateJWT);

// ─── Public (to registered users) ────────────────────────
router.get('/feed/recent', ctrl.getRecentAlbums);           // GET /api/albums/feed/recent
router.get('/feed/following', ctrl.getFollowingAlbums);     // GET /api/albums/feed/following
router.get('/map/:userId', ctrl.getVisitedCountries);       // GET /api/albums/map/:userId
router.get('/user/:userId', ctrl.getUserAlbums);            // GET /api/albums/user/:userId
router.get('/:id', ctrl.getAlbum);                         // GET /api/albums/:id

// ─── Protected (owner only) ───────────────────────────────
router.post('/', upload, uploadToCloudinary, ctrl.createAlbum);     // POST   /api/albums
router.put('/:id', upload, uploadToCloudinary, ctrl.updateAlbum);   // PUT    /api/albums/:id
router.delete('/:id', ctrl.deleteAlbum);                            // DELETE /api/albums/:id

module.exports = router;
