// services/followService.js
const followerDAO = require('../dao/followerDAO');
const logger = require('../utils/logger');

class FollowService {
  // Get followers of a specific user (followers of the login user)
  async getFollowersForUser(userId) {
    try {
      const followers = await followerDAO.getFollowersForUser(userId);
      logger.info(`Fetched followers for user with ID: ${userId}`);
      return followers;
    } catch (error) {
      logger.error(`Error fetching followers for user ${userId}: ${error.message}`);
      throw new Error(`Error fetching followers: ${error.message}`);
    }
  }

  // Get all users the login user is following
  async getFollowingForUser(userId) {
    try {
      const following = await followerDAO.getFollowingForUser(userId);
      logger.info(`Fetched following users for user with ID: ${userId}`);
      return following;
    } catch (error) {
      logger.error(`Error fetching following users for user ${userId}: ${error.message}`);
      throw new Error(`Error fetching following users: ${error.message}`);
    }
  }

  // Follow a user
  async followUser(followerId, followingId) {
    try {
      const result = await followerDAO.followUser(followerId, followingId);
      logger.info(`${followerId} followed ${followingId}`);
      return result;
    } catch (error) {
      logger.error(`Error following user ${followingId}: ${error.message}`);
      throw new Error(`Error following user: ${error.message}`);
    }
  }

  // Unfollow a user
  async unfollowUser(followerId, followingId) {
    try {
      const result = await followerDAO.unfollowUser(followerId, followingId);
      logger.info(`${followerId} unfollowed ${followingId}`);
      return result;
    } catch (error) {
      logger.error(`Error unfollowing user ${followingId}: ${error.message}`);
      throw new Error(`Error unfollowing user: ${error.message}`);
    }
  }
}

module.exports = new FollowService();
