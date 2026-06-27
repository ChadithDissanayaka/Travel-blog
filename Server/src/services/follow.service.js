// src/services/follow.service.js
const prisma = require('../lib/prisma');
const logger = require('../utils/logger');

class FollowService {
  /**
   * Get followers of a specific user.
   */
  async getFollowersForUser(userId) {
    try {
      const followers = await prisma.follower.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: { id: true, username: true },
          },
        },
      });

      logger.info(`Fetched followers for user with ID: ${userId}`);
      return followers.map((f) => ({
        follower_id: f.follower.id,
        username: f.follower.username,
      }));
    } catch (error) {
      logger.error(`Error fetching followers for user ${userId}: ${error.message}`);
      throw new Error(`Error fetching followers: ${error.message}`);
    }
  }

  /**
   * Get all users the user is following.
   */
  async getFollowingForUser(userId) {
    try {
      const following = await prisma.follower.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: { id: true, username: true },
          },
        },
      });

      logger.info(`Fetched following users for user with ID: ${userId}`);
      return following.map((f) => ({
        following_id: f.following.id,
        username: f.following.username,
      }));
    } catch (error) {
      logger.error(`Error fetching following users for user ${userId}: ${error.message}`);
      throw new Error(`Error fetching following users: ${error.message}`);
    }
  }

  /**
   * Follow a user.
   */
  async followUser(followerId, followingId) {
    try {
      await prisma.follower.create({
        data: {
          followerId,
          followingId: parseInt(followingId),
        },
      });

      logger.info(`${followerId} followed ${followingId}`);
      return { message: 'Followed successfully' };
    } catch (error) {
      logger.error(`Error following user ${followingId}: ${error.message}`);
      throw new Error(`Error following user: ${error.message}`);
    }
  }

  /**
   * Unfollow a user.
   */
  async unfollowUser(followerId, followingId) {
    try {
      await prisma.follower.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: parseInt(followingId),
          },
        },
      });

      logger.info(`${followerId} unfollowed ${followingId}`);
      return { message: 'Unfollowed successfully' };
    } catch (error) {
      logger.error(`Error unfollowing user ${followingId}: ${error.message}`);
      throw new Error(`Error unfollowing user: ${error.message}`);
    }
  }

  /**
   * Get users that the logged-in user is NOT following.
   * Uses a single Prisma query with NOT filter instead of fetching all + filtering in JS.
   */
  async getUnfollowingUsers(userId) {
    try {
      // Get IDs of users being followed
      const followingRecords = await prisma.follower.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      const followingIds = followingRecords.map((f) => f.followingId);

      // Fetch users not in the following list and not the current user
      const unfollowingUsers = await prisma.user.findMany({
        where: {
          id: {
            notIn: [...followingIds, userId],
          },
        },
        select: {
          id: true,
          username: true,
        },
      });

      return unfollowingUsers;
    } catch (error) {
      logger.error(`Error in getUnfollowingUsers: ${error.message}`);
      throw new Error(`Error in getUnfollowingUsers: ${error.message}`);
    }
  }
}

module.exports = new FollowService();
