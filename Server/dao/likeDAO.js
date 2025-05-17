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

    // Get user's like/dislike status for a post
    async getUserLikeStatus(userId, postId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT is_like FROM likes WHERE user_id = ? AND post_id = ?';
            db.get(query, [userId, postId], (err, row) => {
                if (err) {
                    logger.error(`Error fetching like status: ${err.message}`);
                    reject(err);
                } else {
                    resolve(row ? row.is_like : null); // Return like/dislike status or null if no record found
                }
            });
        });
    }

    // Update user's like/dislike status for a post
    async updateUserLikeStatus(userId, postId, isLike) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE likes SET is_like = ? WHERE user_id = ? AND post_id = ?';
            db.run(query, [isLike, userId, postId], function (err) {
                if (err) {
                    logger.error(`Error updating like status: ${err.message}`);
                    reject(err);
                } else {
                    resolve({ message: 'Like status updated' });
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
                    resolve(row.like_count);
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
                    resolve(row.dislike_count);
                }
            });
        });
    }
}

module.exports = new LikeDAO();
