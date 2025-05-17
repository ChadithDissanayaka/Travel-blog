// dao/likeDAO.js
const db = require('../config/databaseCon');
const logger = require('../utils/logger');

class LikeDAO {
    // Like or dislike a blog post
    async likePost(userId, postId, isLike) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO likes (user_id, post_id, is_like) VALUES (?, ?, ?)';

            db.run(query, [userId, postId, isLike], function (err) {
                if (err) {
                    logger.error(`Error liking blog post: ${err.message}`);
                    reject(err);
                } else {
                    logger.info(`User ${userId} ${isLike ? 'liked' : 'disliked'} post ${postId}`);
                    resolve({ message: 'Like recorded' });
                }
            });
        });
    }

    // Get total likes for a post
    async getLikesForPost(postId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ? AND is_like = 1';

            db.get(query, [postId], (err, row) => {
                if (err) {
                    logger.error(`Error fetching likes for post: ${err.message}`);
                    reject(err);
                } else {
                    resolve(row.like_count); // Return the like count
                }
            });
        });
    }

    // Get total dislikes for a post
    async getDislikesForPost(postId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) AS dislike_count FROM likes WHERE post_id = ? AND is_like = 0';

            db.get(query, [postId], (err, row) => {
                if (err) {
                    logger.error(`Error fetching dislikes for post: ${err.message}`);
                    reject(err);
                } else {
                    resolve(row.dislike_count); // Return the dislike count
                }
            });
        });
    }
}

module.exports = new LikeDAO();
