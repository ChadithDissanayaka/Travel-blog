// src/services/like.service.js
const prisma = require('../lib/prisma');
const logger = require('../utils/logger');

class LikeService {
  /**
   * Like or dislike a post. Uses upsert to handle insert-or-update in one call.
   */
  async likePost(userId, postId, isLike) {
    const parsedPostId = parseInt(postId);

    try {
      // Check existing status
      const existing = await prisma.like.findUnique({
        where: {
          userId_postId: { userId, postId: parsedPostId },
        },
      });

      if (existing) {
        // If same action, reject
        if (existing.isLike === isLike) {
          throw new Error(`You have already ${isLike ? 'liked' : 'disliked'} this post.`);
        }

        // Otherwise, update the existing record
        await prisma.like.update({
          where: {
            userId_postId: { userId, postId: parsedPostId },
          },
          data: { isLike },
        });

        logger.info(`User ${userId} changed their ${isLike ? 'like' : 'dislike'} for post ${postId}`);
        return { message: `${isLike ? 'Like' : 'Dislike'} updated successfully` };
      }

      // Create new like/dislike
      await prisma.like.create({
        data: {
          userId,
          postId: parsedPostId,
          isLike,
        },
      });

      logger.info(`User ${userId} ${isLike ? 'liked' : 'disliked'} post ${postId}`);
      return { message: `${isLike ? 'Like' : 'Dislike'} recorded successfully` };
    } catch (error) {
      logger.error(`Error liking/disliking post ${postId}: ${error.message}`);
      throw new Error(`Error liking/disliking post: ${error.message}`);
    }
  }

  /**
   * Get total likes for a post.
   */
  async getLikesForPost(postId) {
    try {
      const count = await prisma.like.count({
        where: { postId: parseInt(postId), isLike: true },
      });
      logger.info(`Likes retrieved for post ${postId}`);
      return count;
    } catch (error) {
      logger.error(`Error fetching likes for post ${postId}: ${error.message}`);
      throw new Error(`Error fetching likes for post: ${error.message}`);
    }
  }

  /**
   * Get total dislikes for a post.
   */
  async getDislikesForPost(postId) {
    try {
      const count = await prisma.like.count({
        where: { postId: parseInt(postId), isLike: false },
      });
      logger.info(`Dislikes retrieved for post ${postId}`);
      return count;
    } catch (error) {
      logger.error(`Error fetching dislikes for post ${postId}: ${error.message}`);
      throw new Error(`Error fetching dislikes for post: ${error.message}`);
    }
  }
}

module.exports = new LikeService();
