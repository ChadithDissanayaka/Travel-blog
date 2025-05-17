const db = require('../config/databaseCon');
const logger = require('../utils/logger');

class BlogPostDAO {
  // Utility function to get the counts for likes, dislikes, and comments for a post
  async getPostCounts(postId) {
    return new Promise((resolve, reject) => {
      const likeCountQuery = `
        SELECT 
          COALESCE(SUM(CASE WHEN likes.is_like = 1 THEN 1 ELSE 0 END), 0) AS like_count,
          COALESCE(SUM(CASE WHEN likes.is_like = 0 THEN 1 ELSE 0 END), 0) AS dislike_count
        FROM likes
        WHERE likes.post_id = ?
      `;

      const commentCountQuery = `
        SELECT COALESCE(COUNT(comments.comment_id), 0) AS comment_count
        FROM comments
        WHERE comments.post_id = ?
      `;

      db.get(likeCountQuery, [postId], (err, likeRow) => {
        if (err) {
          logger.error(`Error fetching like counts: ${err.message}`);
          reject(err);
        } else {
          db.get(commentCountQuery, [postId], (err, commentRow) => {
            if (err) {
              logger.error(`Error fetching comment count: ${err.message}`);
              reject(err);
            } else {
              resolve({
                like_count: likeRow.like_count,
                dislike_count: likeRow.dislike_count,
                comment_count: commentRow.comment_count
              });
            }
          });
        }
      });
    });
  }

  // Fetch all blog posts with like, dislike, and comment counts
  async getAllBlogPosts() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*
        FROM blog_posts
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          logger.error(`Error fetching blog posts: ${err.message}`);
          reject(err);
        } else {
          // For each post, fetch the counts and attach them
          const postsWithCounts = [];
          let countPromises = [];

          rows.forEach(row => {
            countPromises.push(this.getPostCounts(row.post_id).then(counts => {
              row.like_count = counts.like_count;
              row.dislike_count = counts.dislike_count;
              row.comment_count = counts.comment_count;
              postsWithCounts.push(row);
            }));
          });

          // Wait for all promises to resolve before sending the response
          Promise.all(countPromises).then(() => {
            resolve(postsWithCounts);
          }).catch(error => reject(error));
        }
      });
    });
  }

  // Fetch a specific blog post by ID with like, dislike, and comment counts
  async getBlogPostById(postId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*
        FROM blog_posts
        WHERE blog_posts.post_id = ?
      `;

      db.get(query, [postId], (err, row) => {
        if (err) {
          logger.error(`Error fetching blog post by ID: ${err.message}`);
          reject(err);
        } else if (row) {
          // Fetch the like, dislike, and comment counts
          this.getPostCounts(postId).then(counts => {
            row.like_count = counts.like_count;
            row.dislike_count = counts.dislike_count;
            row.comment_count = counts.comment_count;
            resolve(row);
          }).catch(error => reject(error));
        } else {
          reject(new Error('Blog post not found'));
        }
      });
    });
  }

  // Fetch blog posts for a specific user by user ID with like, dislike, and comment counts
  async getBlogPostsByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*
        FROM blog_posts
        WHERE blog_posts.user_id = ?
      `;

      db.all(query, [userId], (err, rows) => {
        if (err) {
          logger.error(`Error fetching blog posts for user ${userId}: ${err.message}`);
          reject(err);
        } else {
          // For each post, fetch the counts and attach them
          const postsWithCounts = [];
          let countPromises = [];

          rows.forEach(row => {
            countPromises.push(this.getPostCounts(row.post_id).then(counts => {
              row.like_count = counts.like_count;
              row.dislike_count = counts.dislike_count;
              row.comment_count = counts.comment_count;
              postsWithCounts.push(row);
            }));
          });

          // Wait for all promises to resolve before sorting and sending the response
          Promise.all(countPromises).then(() => {
            // Sort the posts by like_count and comment_count in descending order
            postsWithCounts.sort((a, b) => {
              // Sort first by like_count, then by comment_count
              if (b.like_count !== a.like_count) {
                return b.like_count - a.like_count;
              }
              return b.comment_count - a.comment_count;
            });

            resolve(postsWithCounts);
          }).catch(error => reject(error));
        }
      });
    });
  }

  // Search for blog posts by country name or username with like, dislike, and comment counts
  async searchBlogPosts(searchQuery, page, pageSize) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*
        FROM blog_posts
        WHERE blog_posts.country_name LIKE ? OR blog_posts.title LIKE ?
        LIMIT ? OFFSET ?
      `;
      const searchTerm = `%${searchQuery}%`;
      const offset = (page - 1) * pageSize;

      db.all(query, [searchTerm, searchTerm, pageSize, offset], (err, rows) => {
        if (err) {
          logger.error(`Error searching blog posts: ${err.message}`);
          reject(err);
        } else {
          // For each post, fetch the counts and attach them
          const postsWithCounts = [];
          let countPromises = [];

          rows.forEach(row => {
            countPromises.push(this.getPostCounts(row.post_id).then(counts => {
              row.like_count = counts.like_count;
              row.dislike_count = counts.dislike_count;
              row.comment_count = counts.comment_count;
              postsWithCounts.push(row);
            }));
          });

          // Wait for all promises to resolve before sending the response
          Promise.all(countPromises).then(() => {
            resolve(postsWithCounts);
          }).catch(error => reject(error));
        }
      });
    });
  }

  // Fetch the most commented blog posts (with like, dislike, and comment counts)
  async getMostCommentedBlogPosts(limit = 5) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*
        FROM blog_posts
        ORDER BY blog_posts.created_at DESC
        LIMIT ?
      `;

      db.all(query, [limit], (err, rows) => {
        if (err) {
          logger.error(`Error fetching most commented blog posts: ${err.message}`);
          reject(err);
        } else {
          // For each post, fetch the counts and attach them
          const postsWithCounts = [];
          let countPromises = [];

          rows.forEach(row => {
            countPromises.push(this.getPostCounts(row.post_id).then(counts => {
              row.like_count = counts.like_count;
              row.dislike_count = counts.dislike_count;
              row.comment_count = counts.comment_count;
              postsWithCounts.push(row);
            }));
          });

          // Wait for all promises to resolve before sorting and sending the response
          Promise.all(countPromises).then(() => {
            // Sort the posts by comment_count in descending order
            postsWithCounts.sort((a, b) => b.comment_count - a.comment_count);
            resolve(postsWithCounts);
          }).catch(error => reject(error));
        }

      });
    });
  }

  // Fetch recent blog posts (with like, dislike, and comment counts)
  async getRecentBlogPosts(limit = 5) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT blog_posts.*
        FROM blog_posts
        WHERE blog_posts.created_at <= datetime('now')
        ORDER BY blog_posts.created_at DESC
        LIMIT ?
      `;

      db.all(query, [limit], (err, rows) => {
        if (err) {
          logger.error(`Error fetching recent blog posts: ${err.message}`);
          reject(err);
        } else {
          // For each post, fetch the counts and attach them
          const postsWithCounts = [];
          let countPromises = [];

          rows.forEach(row => {
            countPromises.push(this.getPostCounts(row.post_id).then(counts => {
              row.like_count = counts.like_count;
              row.dislike_count = counts.dislike_count;
              row.comment_count = counts.comment_count;
              postsWithCounts.push(row);
            }));
          });

          // Wait for all promises to resolve before sending the response
          Promise.all(countPromises).then(() => {
            resolve(postsWithCounts);
          }).catch(error => reject(error));
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

  // Fetch popular blog posts (based on likes or comments) with like, dislike, and comment counts
  async getPopularBlogPosts(limit = 5) {
    return new Promise((resolve, reject) => {
      const query = `
      SELECT blog_posts.*
      FROM blog_posts
      ORDER BY blog_posts.created_at DESC
      LIMIT ?
    `;

      db.all(query, [limit], async (err, rows) => {
        if (err) {
          logger.error(`Error fetching popular blog posts: ${err.message}`);
          reject(err);
        } else {
          // For each post, fetch the counts (like, dislike, comment counts)
          const postsWithCounts = [];
          let countPromises = [];

          for (let row of rows) {
            countPromises.push(
              this.getPostCounts(row.post_id).then(counts => {
                row.like_count = counts.like_count;
                row.dislike_count = counts.dislike_count;
                row.comment_count = counts.comment_count;
                postsWithCounts.push(row);
              })
            );
          }

          // Wait for all promises to resolve before sending the response
          try {
            await Promise.all(countPromises);
            // Sort the posts based on like_count and comment_count in descending order
            postsWithCounts.sort((a, b) => {
              if (b.like_count !== a.like_count) {
                return b.like_count - a.like_count;
              }
              return b.comment_count - a.comment_count;
            });
            resolve(postsWithCounts);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  // Fetch blog posts by user IDs (from the users the logged-in user is following)
  async getBlogPostsByUserIds(userIds, page = 1, pageSize = 5) {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * pageSize;
      const query = `
      SELECT blog_posts.*
      FROM blog_posts
      WHERE blog_posts.user_id IN (${userIds.join(',')})  -- Filter by the followed users
      ORDER BY blog_posts.created_at DESC
      LIMIT ? OFFSET ?  -- Pagination
    `;

      db.all(query, [pageSize, offset], async (err, rows) => {
        if (err) {
          logger.error(`Error fetching blog posts by user IDs: ${err.message}`);
          reject(err);
        } else {
          // For each post, fetch the counts (like, dislike, comment counts)
          const postsWithCounts = [];
          let countPromises = [];

          rows.forEach(row => {
            countPromises.push(
              this.getPostCounts(row.post_id).then(counts => {
                row.like_count = counts.like_count;
                row.dislike_count = counts.dislike_count;
                row.comment_count = counts.comment_count;
                postsWithCounts.push(row);
              })
            );
          });

          // Wait for all promises to resolve before returning the response
          try {
            await Promise.all(countPromises);
            resolve(postsWithCounts); // Return the posts with counts
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }
}

module.exports = new BlogPostDAO();
