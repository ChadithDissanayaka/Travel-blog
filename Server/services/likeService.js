// services/likeService.js
const likeDAO = require('../dao/likeDAO');
const logger = require('../utils/logger');

class LikeService {
    async likePost(userId, postId, isLike) {
        try {
            await likeDAO.likePost(userId, postId, isLike);
            logger.info(`User ${userId} ${isLike ? 'liked' : 'disliked'} post ${postId}`);
        } catch (error) {
            logger.error(`Error liking post ${postId}: ${error.message}`);
            throw new Error(`Error liking post: ${error.message}`);
        }
    }

    async getLikesForPost(postId) {
        try {
            const likes = await likeDAO.getLikesForPost(postId);
            logger.info(`Likes retrieved for post ${postId}`);
            return likes;
        } catch (error) {
            logger.error(`Error fetching likes for post ${postId}: ${error.message}`);
            throw new Error(`Error fetching likes for post: ${error.message}`);
        }
    }

    async getDislikesForPost(postId) {
        try {
            const dislikes = await likeDAO.getDislikesForPost(postId);
            logger.info(`Dislikes retrieved for post ${postId}`);
            return dislikes;
        } catch (error) {
            logger.error(`Error fetching dislikes for post ${postId}: ${error.message}`);
            throw new Error(`Error fetching dislikes for post: ${error.message}`);
        }
    }
}

module.exports = new LikeService();
