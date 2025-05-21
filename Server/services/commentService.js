const commentDAO = require('../dao/commentDAO');
const logger = require('../utils/logger');
const authDAO = require('../dao/authDAO');

class CommentService {
    async addComment(userId, postId, commentText) {
        try {
            const comment = await commentDAO.addComment(userId, postId, commentText);
            logger.info(`Comment added by user ${userId} on post ${postId}`);
            return comment;
        } catch (error) {
            logger.error(`Error adding comment on post ${postId}: ${error.message}`);
            throw new Error(`Error adding comment: ${error.message}`);
        }
    }

    async getCommentsForPost(postId) {
        try {
            const comments = await commentDAO.getCommentsForPost(postId);
            for (let comment of comments) {
                const user = await authDAO.findUserById(comment.user_id);
                comment.author = user.username;
                comment.profile_picture = user.profile_picture;
            }
            logger.info(`Comments fetched for post ${postId}`);
            return comments;
        } catch (error) {
            logger.error(`Error fetching comments for post ${postId}: ${error.message}`);
            throw new Error(`Error fetching comments for post: ${error.message}`);
        }
    }
}

module.exports = new CommentService();
