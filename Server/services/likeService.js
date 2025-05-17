const likeDAO = require('../dao/likeDAO');
const logger = require('../utils/logger');

class LikeService {
    // Like or dislike a post with check for previous actions
    async likePost(userId, postId, isLike) {
        try {
            // Check if the user has already liked or disliked the post
            const existingLike = await likeDAO.getUserLikeStatus(userId, postId);

            if (existingLike !== null) {
                // If the existing like status is the same as the new action, reject the request
                if (existingLike === isLike) {
                    logger.info(`User ${userId} has already ${isLike ? 'liked' : 'disliked'} the post ${postId}`);
                    throw new Error(`You have already ${isLike ? 'liked' : 'disliked'} this post.`);
                }

                // If the user has already interacted with the post but wants to change their action,
                // update the existing like/dislike record.
                await likeDAO.updateUserLikeStatus(userId, postId, isLike);
                logger.info(`User ${userId} changed their ${isLike ? 'like' : 'dislike'} for post ${postId}`);
                return { message: `${isLike ? 'Like' : 'Dislike'} updated successfully` };
            } else {
                // If the user hasn't interacted with the post yet, insert the new like/dislike
                await likeDAO.likePost(userId, postId, isLike);
                logger.info(`User ${userId} ${isLike ? 'liked' : 'disliked'} post ${postId}`);
                return { message: `${isLike ? 'Like' : 'Dislike'} recorded successfully` };
            }
        } catch (error) {
            logger.error(`Error liking/disliking post ${postId}: ${error.message}`);
            throw new Error(`Error liking/disliking post: ${error.message}`);
        }
    }

    // Get total likes for a post
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

    // Get total dislikes for a post
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
