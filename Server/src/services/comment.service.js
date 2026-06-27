// src/services/comment.service.js
const prisma = require('../lib/prisma');
const logger = require('../utils/logger');

class CommentService {
  /**
   * Add a comment to a blog post.
   */
  async addComment(userId, postId, commentText) {
    try {
      const comment = await prisma.comment.create({
        data: {
          userId,
          postId: parseInt(postId),
          commentText,
        },
        include: {
          user: {
            select: { username: true, profilePicture: true },
          },
        },
      });

      logger.info(`Comment added by user ${userId} on post ${postId}`);
      return {
        comment_id: comment.commentId,
        post_id: comment.postId,
        user_id: comment.userId,
        comment_text: comment.commentText,
        created_at: comment.createdAt,
        author: comment.user.username,
        profile_picture: comment.user.profilePicture,
      };
    } catch (error) {
      logger.error(`Error adding comment on post ${postId}: ${error.message}`);
      throw new Error(`Error adding comment: ${error.message}`);
    }
  }

  /**
   * Get all comments for a blog post with author info.
   */
  async getCommentsForPost(postId) {
    try {
      const comments = await prisma.comment.findMany({
        where: { postId: parseInt(postId) },
        include: {
          user: {
            select: { username: true, profilePicture: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = comments.map((c) => ({
        comment_id: c.commentId,
        post_id: c.postId,
        user_id: c.userId,
        comment_text: c.commentText,
        created_at: c.createdAt,
        author: c.user.username,
        profile_picture: c.user.profilePicture,
      }));

      logger.info(`Comments fetched for post ${postId}`);
      return formatted;
    } catch (error) {
      logger.error(`Error fetching comments for post ${postId}: ${error.message}`);
      throw new Error(`Error fetching comments for post: ${error.message}`);
    }
  }
}

module.exports = new CommentService();
