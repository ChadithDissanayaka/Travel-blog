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

  // Get users that the logged-in user is not following
  async getUnfollowingUsers(userId) {
    try {
      const allUsers = await followerDAO.getAllUsers();

      const followingUsers = await followerDAO.getFollowingForUser(userId);

      // Extract the IDs of the users the logged-in user is following
      const followingIds = new Set(followingUsers.map(user => user.following_id));

      // Filter out users that the logged-in user is following
      const unfollowingUsers = allUsers.filter(user => !followingIds.has(user.id) && user.id !== userId);

      return unfollowingUsers;
    } catch (error) {
      throw new Error(`Error in getUnfollowingUsers: ${error.message}`);
    }
  }


}

module.exports = new FollowService();
