// src/services/user.service.js
const prisma = require('../lib/prisma');
const logger = require('../utils/logger');

class UserService {
  /**
   * Update user profile (username, address, description, profile picture).
   */
  async updateUserProfile(userId, username, address, description, profilePicture) {
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          username,
          address,
          description,
          profilePicture,
        },
        select: {
          id: true,
          username: true,
          address: true,
          description: true,
          profilePicture: true,
        },
      });

      logger.info(`User profile updated for user ID: ${userId}`);
      return { message: 'User profile updated successfully', ...updated };
    } catch (error) {
      logger.error(`Error updating user profile: ${error.message}`);
      throw new Error(`Error updating user profile: ${error.message}`);
    }
  }

  /**
   * Get user profile by ID.
   */
  async getUserProfile(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          address: true,
          description: true,
          createdAt: true,
          profilePicture: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error(`Error fetching user profile: ${error.message}`);
      throw new Error(`Error fetching user profile: ${error.message}`);
    }
  }

  /**
   * Get all users (id and username only).
   */
  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
        },
      });

      // Map to match existing API response shape
      return users.map((u) => ({ user_id: u.id, username: u.username }));
    } catch (error) {
      logger.error(`Error fetching users: ${error.message}`);
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  /**
   * Get user profile by Username.
   */
  async getUserProfileByUsername(username) {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          email: true,
          address: true,
          description: true,
          createdAt: true,
          profilePicture: true,
        },
      });

      if (!user) {
        return null;
      }

      // Get follower/following counts
      const [followersCount, followingCount] = await Promise.all([
        prisma.follower.count({ where: { followingId: user.id } }),
        prisma.follower.count({ where: { followerId: user.id } }),
      ]);

      user.followers = followersCount;
      user.following = followingCount;

      return user;
    } catch (error) {
      logger.error(`Error fetching user profile by username ${username}: ${error.message}`);
      throw new Error(`Error fetching user profile by username: ${error.message}`);
    }
  }
}

module.exports = new UserService();
