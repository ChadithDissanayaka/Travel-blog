// dao/blogPostDAO.js
const db = require('../config/databaseCon');
const logger = require('../utils/logger');

class BlogPostDAO {
  // Fetch all blog posts with like, dislike, and comment counts
  async getAllBlogPosts() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*, 
               COALESCE(SUM(CASE WHEN likes.is_like = 1 THEN 1 ELSE 0 END), 0) AS like_count,
               COALESCE(SUM(CASE WHEN likes.is_like = 0 THEN 1 ELSE 0 END), 0) AS dislike_count,
               COALESCE(COUNT(DISTINCT comments.comment_id), 0) AS comment_count
        FROM blog_posts
        LEFT JOIN likes ON blog_posts.post_id = likes.post_id
        LEFT JOIN comments ON blog_posts.post_id = comments.post_id
        GROUP BY blog_posts.post_id
      `;
      db.all(query, [], (err, rows) => {
        if (err) {
          logger.error(`Error fetching blog posts: ${err.message}`);
          reject(err);
        } else {
          resolve(rows);  // Return an array of posts
        }
      });
    });
  }

  // Fetch a specific blog post by ID with like, dislike, and comment counts
  async getBlogPostById(postId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*, 
               COALESCE(SUM(CASE WHEN likes.is_like = 1 THEN 1 ELSE 0 END), 0) AS like_count,
               COALESCE(SUM(CASE WHEN likes.is_like = 0 THEN 1 ELSE 0 END), 0) AS dislike_count,
               COALESCE(COUNT(DISTINCT comments.comment_id), 0) AS comment_count
        FROM blog_posts
        LEFT JOIN likes ON blog_posts.post_id = likes.post_id
        LEFT JOIN comments ON blog_posts.post_id = comments.post_id
        WHERE blog_posts.post_id = ?
        GROUP BY blog_posts.post_id
      `;
      db.get(query, [postId], (err, row) => {
        if (err) {
          logger.error(`Error fetching blog post by ID: ${err.message}`);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Fetch blog posts for a specific user by user ID with like, dislike, and comment counts
  async getBlogPostsByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*, 
               COALESCE(SUM(CASE WHEN likes.is_like = 1 THEN 1 ELSE 0 END), 0) AS like_count,
               COALESCE(SUM(CASE WHEN likes.is_like = 0 THEN 1 ELSE 0 END), 0) AS dislike_count,
               COALESCE(COUNT(DISTINCT comments.comment_id), 0) AS comment_count
        FROM blog_posts
        LEFT JOIN likes ON blog_posts.post_id = likes.post_id
        LEFT JOIN comments ON blog_posts.post_id = comments.post_id
        WHERE blog_posts.user_id = ?
        GROUP BY blog_posts.post_id
      `;
      db.all(query, [userId], (err, rows) => {
        if (err) {
          logger.error(`Error fetching blog posts for user ${userId}: ${err.message}`);
          reject(err);
        } else {
          resolve(rows);  // Return all blog posts for the user with counts
        }
      });
    });
  }

  // Search for blog posts by country name or username with like, dislike, and comment counts
  async searchBlogPosts(searchQuery, page, pageSize) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*, 
               COALESCE(SUM(CASE WHEN likes.is_like = 1 THEN 1 ELSE 0 END), 0) AS like_count,
               COALESCE(SUM(CASE WHEN likes.is_like = 0 THEN 1 ELSE 0 END), 0) AS dislike_count,
               COALESCE(COUNT(DISTINCT comments.comment_id), 0) AS comment_count
        FROM blog_posts
        LEFT JOIN likes ON blog_posts.post_id = likes.post_id
        LEFT JOIN comments ON blog_posts.post_id = comments.post_id
        WHERE blog_posts.country_name LIKE ? OR blog_posts.title LIKE ?
        GROUP BY blog_posts.post_id
        LIMIT ? OFFSET ?
      `;
      const searchTerm = `%${searchQuery}%`;
      const offset = (page - 1) * pageSize;

      db.all(query, [searchTerm, searchTerm, pageSize, offset], (err, rows) => {
        if (err) {
          logger.error(`Error searching blog posts: ${err.message}`);
          reject(err);
        } else {
          resolve(rows);  // Return filtered blog posts with counts
        }
      });
    });
  }

  // Fetch the most commented blog posts (with like, dislike, and comment counts)
  async getMostCommentedBlogPosts(limit = 5) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*, 
               COALESCE(SUM(CASE WHEN likes.is_like = 1 THEN 1 ELSE 0 END), 0) AS like_count,
               COALESCE(SUM(CASE WHEN likes.is_like = 0 THEN 1 ELSE 0 END), 0) AS dislike_count,
               COALESCE(COUNT(DISTINCT comments.comment_id), 0) AS comment_count
        FROM blog_posts
        LEFT JOIN likes ON blog_posts.post_id = likes.post_id
        LEFT JOIN comments ON blog_posts.post_id = comments.post_id
        GROUP BY blog_posts.post_id
        ORDER BY comment_count DESC
        LIMIT ?
      `;
      db.all(query, [limit], (err, rows) => {
        if (err) {
          logger.error(`Error fetching most commented blog posts: ${err.message}`);
          reject(err);
        } else {
          resolve(rows);  // Return the most commented blog posts with counts
        }
      });
    });
  }

  // Fetch recent blog posts (with like, dislike, and comment counts)
  async getRecentBlogPosts(limit = 5) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*, 
               COALESCE(SUM(CASE WHEN likes.is_like = 1 THEN 1 ELSE 0 END), 0) AS like_count,
               COALESCE(SUM(CASE WHEN likes.is_like = 0 THEN 1 ELSE 0 END), 0) AS dislike_count,
               COALESCE(COUNT(DISTINCT comments.comment_id), 0) AS comment_count
        FROM blog_posts
        LEFT JOIN likes ON blog_posts.post_id = likes.post_id
        LEFT JOIN comments ON blog_posts.post_id = comments.post_id
        GROUP BY blog_posts.post_id
        ORDER BY blog_posts.created_at DESC
        LIMIT ?
      `;
      db.all(query, [limit], (err, rows) => {
        if (err) {
          logger.error(`Error fetching recent blog posts: ${err.message}`);
          reject(err);
        } else {
          resolve(rows);  // Return the most recent blog posts with counts
        }
      });
    });
  }

  // Fetch popular blog posts (based on likes or comments) with like, dislike, and comment counts
  async getPopularBlogPosts(limit = 5) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*, 
               COALESCE(SUM(CASE WHEN likes.is_like = 1 THEN 1 ELSE 0 END), 0) AS like_count,
               COALESCE(SUM(CASE WHEN likes.is_like = 0 THEN 1 ELSE 0 END), 0) AS dislike_count,
               COALESCE(COUNT(DISTINCT comments.comment_id), 0) AS comment_count
        FROM blog_posts
        LEFT JOIN likes ON blog_posts.post_id = likes.post_id
        LEFT JOIN comments ON blog_posts.post_id = comments.post_id
        GROUP BY blog_posts.post_id
        ORDER BY like_count DESC, comment_count DESC
        LIMIT ?
      `;
      db.all(query, [limit], (err, rows) => {
        if (err) {
          logger.error(`Error fetching popular blog posts: ${err.message}`);
          reject(err);
        } else {
          resolve(rows);  // Return the popular blog posts with counts
        }
      });
    });
  }

  // Create a new blog post (with an optional image)
  async createBlogPost(userId, title, content, countryName, dateOfVisit, image) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO blog_posts (user_id, title, content, country_name, date_of_visit, image)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.run(query, [userId, title, content, countryName, dateOfVisit, image], function (err) {
        if (err) {
          logger.error(`Error creating blog post: ${err.message}`);
          reject(err);
        } else {
          resolve({ postId: this.lastID });
        }
      });
    });
  }

  // Update a blog post (with an optional image)
  async updateBlogPost(postId, title, content, countryName, dateOfVisit, image) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE blog_posts
        SET title = ?, content = ?, country_name = ?, date_of_visit = ?, image = ?
        WHERE post_id = ?
      `;
      db.run(query, [title, content, countryName, dateOfVisit, image, postId], function (err) {
        if (err) {
          logger.error(`Error updating blog post: ${err.message}`);
          reject(err);
        } else {
          resolve({ message: 'Blog post updated successfully' });
        }
      });
    });
  }

  // Delete a blog post
  async deleteBlogPost(postId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM blog_posts WHERE post_id = ?';
      db.run(query, [postId], function (err) {
        if (err) {
          logger.error(`Error deleting blog post: ${err.message}`);
          reject(err);
        } else {
          resolve({ message: 'Blog post deleted successfully' });
        }
      });
    });
  }

  // Get blog posts from users the logged-in user is following (paginated and mixed order)
  async getBlogPostsByUserIds(userIds, page = 1, pageSize = 5) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*, 
               COALESCE(SUM(CASE WHEN likes.is_like = 1 THEN 1 ELSE 0 END), 0) AS like_count,
               COALESCE(SUM(CASE WHEN likes.is_like = 0 THEN 1 ELSE 0 END), 0) AS dislike_count,
               COALESCE(COUNT(comments.id), 0) AS comment_count
        FROM blog_posts
        LEFT JOIN likes ON blog_posts.post_id = likes.post_id
        LEFT JOIN comments ON blog_posts.post_id = comments.post_id
        WHERE blog_posts.user_id IN (${userIds.join(',')})
        GROUP BY blog_posts.post_id
        ORDER BY blog_posts.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const offset = (page - 1) * pageSize;

      db.all(query, [pageSize, offset], (err, rows) => {
        if (err) {
          logger.error(`Error fetching blog posts by followed users: ${err.message}`);
          reject(err);
        } else {
          resolve(rows);  // Return blog posts from the followed users
        }
      });
    });
  }
}

module.exports = new BlogPostDAO();
