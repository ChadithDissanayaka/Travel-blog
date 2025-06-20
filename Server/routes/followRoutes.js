const express = require('express');
const router = express.Router();
const followService = require('../services/followService');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { csrfProtection } = require('../middleware/csrfMiddleware');

// Apply JWT and Csrf protection
router.use(authenticateJWT);
router.use(csrfProtection);

// Follow a user
router.post('/follow/:followingId', async (req, res) => {
  const followingId = req.params.followingId;
  const followerId = req.user.id; // Get the logged-in user's ID

  if (followerId === parseInt(followingId)) {
    return res.status(400).json({ error: "You cannot follow yourself." });
  }

  try {
    const result = await followService.followUser(followerId, followingId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfollow a user
router.post('/unfollow/:followingId', async (req, res) => {
  const followingId = req.params.followingId;
  const followerId = req.user.id; // Get the logged-in user's ID

  try {
    const result = await followService.unfollowUser(followerId, followingId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all followers for the logged-in user
router.get('/followers', async (req, res) => {
  const userId = req.user.id; // Get the logged-in user's ID

  try {
    const followers = await followService.getFollowersForUser(userId);
    res.json(followers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users the logged-in user is following
router.get('/following', async (req, res) => {
  const userId = req.user.id; 

  try {
    const following = await followService.getFollowingForUser(userId);
    res.json(following);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unfollowing users for the logged-in user
router.get('/unfollowing-users', async (req, res) => {
  const userId = req.user.id; 

  try {
    const unfollowingUsers = await followService.getUnfollowingUsers(userId);
    res.json(unfollowingUsers); // Return the unfollowing users list
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
