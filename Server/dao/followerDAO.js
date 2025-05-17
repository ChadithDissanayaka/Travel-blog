// dao/followerDAO.js
const db = require('../config/databaseCon');
const logger = require('../utils/logger');

class FollowerDAO {
    // Get all followers for a user (who is following the login user)
    async getFollowersForUser(userId) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT users.id AS follower_id, users.username 
        FROM followers
        JOIN users ON followers.follower_id = users.id
        WHERE followers.following_id = ?
      `;
            db.all(query, [userId], (err, rows) => {
                if (err) {
                    logger.error(`Error fetching followers for user ${userId}: ${err.message}`);
                    reject(err);
                } else {
                    resolve(rows); // Return an array of follower IDs and usernames
                }
            });
        });
    }

    // Get all users who the login user is following
    async getFollowingForUser(userId) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT users.id AS following_id, users.username 
        FROM followers
        JOIN users ON followers.following_id = users.id
        WHERE followers.follower_id = ?
      `;
            db.all(query, [userId], (err, rows) => {
                if (err) {
                    logger.error(`Error fetching following users for user ${userId}: ${err.message}`);
                    reject(err);
                } else {
                    resolve(rows); // Return an array of followed user IDs and usernames
                }
            });
        });
    }

    // Follow a user
    async followUser(followerId, followingId) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)';
            db.run(query, [followerId, followingId], function (err) {
                if (err) {
                    logger.error(`Error following user: ${err.message}`);
                    reject(err);
                } else {
                    resolve({ message: 'Followed successfully' });
                }
            });
        });
    }

    // Unfollow a user
    async unfollowUser(followerId, followingId) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM followers WHERE follower_id = ? AND following_id = ?';
            db.run(query, [followerId, followingId], function (err) {
                if (err) {
                    logger.error(`Error unfollowing user: ${err.message}`);
                    reject(err);
                } else {
                    resolve({ message: 'Unfollowed successfully' });
                }
            });
        });
    }
}

module.exports = new FollowerDAO();
