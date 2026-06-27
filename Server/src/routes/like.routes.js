// src/routes/like.routes.js
const express = require('express');
const router = express.Router();
const likeController = require('../controllers/like.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// All like routes are protected
router.use(authenticateJWT);

router.post('/like/:postId', likeController.likePost);
router.post('/dislike/:postId', likeController.dislikePost);

module.exports = router;
