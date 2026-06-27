// src/routes/follow.routes.js
const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// All follow routes are protected
router.use(authenticateJWT);

router.post('/follow/:followingId', followController.followUser);
router.post('/unfollow/:followingId', followController.unfollowUser);
router.get('/followers', followController.getFollowers);
router.get('/following', followController.getFollowing);
router.get('/unfollowing-users', followController.getUnfollowingUsers);

module.exports = router;
