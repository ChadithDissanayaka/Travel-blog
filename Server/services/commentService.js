// services/commentService.js
const commentDAO = require('../dao/commentDAO');
const logger = require('../utils/logger');

class CommentService {
    async addComment(userId, postId, commentText) {
        try {
            const result = await commentDAO.addComment(userId, postId, commentText);
            logger.info(`Comment added by user ${userId} on post ${postId}`);
            return result;
        } catch (error) {
            logger.error(`Error adding comment on post ${postId}: ${error.message}`);
            throw new Error(`Error adding comment: ${error.message}`);
        }
    }

    async getCommentsForPost(postId) {
        try {
            const comments = await commentDAO.getCommentsForPost(postId);
            logger.info(`Comments fetched for post ${postId}`);
            return comments;
        } catch (error) {
            logger.error(`Error fetching comments for post ${postId}: ${error.message}`);
            throw new Error(`Error fetching comments for post: ${error.message}`);
        }
    }
}

module.exports = new CommentService();
