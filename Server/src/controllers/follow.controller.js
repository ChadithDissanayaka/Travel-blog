// src/controllers/follow.controller.js
const followService = require('../services/follow.service');

/**
 * POST /api/follow/follow/:followingId (protected)
 */
const followUser = async (req, res, next) => {
  const followingId = parseInt(req.params.followingId);
  const followerId = req.user.id;

  if (followerId === followingId) {
    return res.status(400).json({ error: 'You cannot follow yourself.' });
  }

  try {
    const result = await followService.followUser(followerId, followingId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/follow/unfollow/:followingId (protected)
 */
const unfollowUser = async (req, res, next) => {
  const followingId = parseInt(req.params.followingId);
  const followerId = req.user.id;

  try {
    const result = await followService.unfollowUser(followerId, followingId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/follow/followers (protected)
 */
const getFollowers = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const followers = await followService.getFollowersForUser(userId);
    res.json(followers);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/follow/following (protected)
 */
const getFollowing = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const following = await followService.getFollowingForUser(userId);
    res.json(following);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/follow/unfollowing-users (protected)
 */
const getUnfollowingUsers = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const unfollowingUsers = await followService.getUnfollowingUsers(userId);
    res.json(unfollowingUsers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUnfollowingUsers,
};
