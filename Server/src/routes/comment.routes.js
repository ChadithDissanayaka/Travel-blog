// src/routes/comment.routes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// Public route
router.get('/:postId', commentController.getComments);

// Protected routes
router.use(authenticateJWT);

router.post('/add/:postId', commentController.addComment);

module.exports = router;
