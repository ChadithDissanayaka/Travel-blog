// src/controllers/user.controller.js
const userService = require('../services/user.service');

/**
 * PUT /api/user/profile/edit (protected)
 */
const editProfile = async (req, res, next) => {
  const { username, address, description } = req.body;
  const userId = req.user.id;
  const profilePicture = req.fileUrl || null;

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    const currentProfile = await userService.getUserProfile(userId);
    const updatedProfilePicture = profilePicture || currentProfile.profilePicture;

    const result = await userService.updateUserProfile(userId, username, address, description, updatedProfilePicture);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/user/profile (protected)
 */
const getProfile = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const userProfile = await userService.getUserProfile(userId);
    res.json(userProfile);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/user/all (protected)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/user/profile/:username (protected)
 */
const getProfileByUsername = async (req, res, next) => {
  const { username } = req.params;
  const loggedInUserId = req.user.id;

  try {
    const userProfile = await userService.getUserProfileByUsername(username);
    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current logged in user follows this user
    const followRecord = await require('../lib/prisma').follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: loggedInUserId,
          followingId: userProfile.id,
        },
      },
    });

    res.json({
      ...userProfile,
      isFollowing: !!followRecord,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  editProfile,
  getProfile,
  getAllUsers,
  getProfileByUsername,
};
