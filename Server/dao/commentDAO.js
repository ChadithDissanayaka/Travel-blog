const db = require('../config/databaseCon');
const logger = require('../utils/logger');

class CommentDAO {
    // Add a comment to a blog post
    async addComment(userId, postId, commentText) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO comments (user_id, post_id, comment_text) VALUES (?, ?, ?)';
            
            db.run(query, [userId, postId, commentText], function (err ,rows) {
                if (err) {
                    logger.error(`Error adding comment: ${err.message}`);
                    reject(err);
                } else {
                    logger.info(`Comment added to post ${postId}`);
                    resolve(rows);
                }
            });
        });
    }

    // Get comments for a blog post
    async getCommentsForPost(postId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM comments WHERE post_id = ?';
            
            db.all(query, [postId], (err, rows) => {
                if (err) {
                    logger.error(`Error fetching comments for post ${postId}: ${err.message}`);
                    reject(err);
                } else {
                    resolve(rows); 
                }
            });
        });
    }
}

module.exports = new CommentDAO();
