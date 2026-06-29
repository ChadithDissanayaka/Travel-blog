// src/routes/postLink.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/postLink.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// GET /api/postlinks/:postId  — public (links visible to everyone reading the post)
router.get('/:postId', ctrl.getPostLinks);

// Protected: must be logged in and own the post
router.use(authenticateJWT);
router.post('/:postId', ctrl.addPostLink);       // POST   /api/postlinks/:postId
router.delete('/:linkId', ctrl.deletePostLink);  // DELETE /api/postlinks/:linkId

module.exports = router;
