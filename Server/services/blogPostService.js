const blogPostDAO = require('../dao/blogPostDAO');
const authDAO = require('../dao/authDAO');
const logger = require('../utils/logger');
const commentService = require('./commentService');
class BlogPostService {
  // Fetch all blog posts with like, dislike, and comment counts
  async getAllBlogPosts() {
    try {
      const posts = await blogPostDAO.getAllBlogPosts();
      // Add author and profile_picture information to the posts
      for (let post of posts) {
        const user = await authDAO.findUserById(post.user_id);
        post.author = user.username;
        post.profile_picture = user.profile_picture;
      }
      logger.info('Fetched all blog posts.');
      return posts;
    } catch (error) {
      logger.error(`Error fetching blog posts: ${error.message}`);
      throw new Error(`Error fetching blog posts: ${error.message}`);
    }
  }

  // Fetch a specific blog post by ID with like, dislike, and comment counts
  async getBlogPostById(postId) {
    try {
      const post = await blogPostDAO.getBlogPostById(postId);
      const comments = await commentService.getCommentsForPost(postId);
      // Add author and profile_picture information to the posts
      if (post) {
        const user = await authDAO.findUserById(post.user_id);
        post.author = user.username;
        post.profile_picture = user.profile_picture;
        post.comments = comments;
      }
      return post;
    } catch (error) {
      logger.error(`Error fetching blog post: ${error.message}`);
      throw new Error(`Error fetching blog post: ${error.message}`);
    }
  }

  // Fetch blog posts for a specific user by user ID with like, dislike, and comment counts
  async getBlogPostsByUserId(userId) {
    try {
      const posts = await blogPostDAO.getBlogPostsByUserId(userId);
      // Add author and profile_picture information to the posts
      for (let post of posts) {
        const user = await authDAO.findUserById(post.user_id);
        post.author = user.username;
        post.profile_picture = user.profile_picture;
      }
      logger.info(`Fetched blog posts for user with ID: ${userId}`);
      return posts;
    } catch (error) {
      logger.error(`Error fetching blog posts for user ${userId}: ${error.message}`);
      throw new Error(`Error fetching blog posts for user: ${error.message}`);
    }
  }

  // Search for blog posts by country name or username with like, dislike, and comment counts
  async searchBlogPosts(searchQuery, page = 1, pageSize = 10) {
    try {
      const posts = await blogPostDAO.searchBlogPosts(searchQuery, page, pageSize);
      // Add author and profile_picture information to the posts
      for (let post of posts) {
        const user = await authDAO.findUserById(post.user_id);
        post.author = user.username;
        post.profile_picture = user.profile_picture;
      }
      logger.info(`Fetched blog posts matching search query: ${searchQuery}`);
      return posts;
    } catch (error) {
      logger.error(`Error during blog post search: ${error.message}`);
      throw new Error(`Error during blog post search: ${error.message}`);
    }
  }

  // Fetch the most commented blog posts (with like, dislike, and comment counts)
  async getMostCommentedBlogPosts(limit = 5) {
    try {
      const posts = await blogPostDAO.getMostCommentedBlogPosts(limit);
      // Add author and profile_picture information to the posts
      for (let post of posts) {
        const user = await authDAO.findUserById(post.user_id);
        post.author = user.username;
        post.profile_picture = user.profile_picture;
      }
      logger.info(`Fetched ${limit} most commented blog posts.`);
      return posts;
    } catch (error) {
      logger.error(`Error fetching most commented blog posts: ${error.message}`);
      throw new Error(`Error fetching most commented blog posts: ${error.message}`);
    }
  }

  // Fetch recent blog posts (with like, dislike, and comment counts)
  async getRecentBlogPosts(limit = 5) {
    try {
      const posts = await blogPostDAO.getRecentBlogPosts(limit);
      // Add author and profile_picture information to the posts
      for (let post of posts) {
        const user = await authDAO.findUserById(post.user_id);
        post.author = user.username;
        post.profile_picture = user.profile_picture;
      }
      logger.info(`Fetched ${limit} recent blog posts.`);
      return posts;
    } catch (error) {
      logger.error(`Error fetching recent blog posts: ${error.message}`);
      throw new Error(`Error fetching recent blog posts: ${error.message}`);
    }
  }

  // Fetch popular blog posts (based on likes or comments) with like, dislike, and comment counts
  async getPopularBlogPosts(limit = 5) {
    try {
      const posts = await blogPostDAO.getPopularBlogPosts(limit);
      // Add author and profile_picture information to the posts
      for (let post of posts) {
        const user = await authDAO.findUserById(post.user_id);
        post.author = user.username;
        post.profile_picture = user.profile_picture;
      }
      logger.info(`Fetched ${limit} popular blog posts.`);
      return posts;
    } catch (error) {
      logger.error(`Error fetching popular blog posts: ${error.message}`);
      throw new Error(`Error fetching popular blog posts: ${error.message}`);
    }
  }

  // Create a new blog post (with an optional image)
  async createBlogPost(userId, title, content, countryName, dateOfVisit, image) {
    try {
      const result = await blogPostDAO.createBlogPost(userId, title, content, countryName, dateOfVisit, image);
      const postId = result.postId;

      // Add author and profile_picture information to the posts
      const post = await blogPostDAO.getBlogPostById(postId);
      const user = await authDAO.findUserById(userId);
      post.author = user.username;
      post.profile_picture = user.profile_picture;

      logger.info(`Blog post created by user ${userId}`);
      return post;
    } catch (error) {
      logger.error(`Error creating blog post: ${error.message}`);
      throw new Error(`Error creating blog post: ${error.message}`);
    }
  }

  // Update an existing blog post (with an optional image)
  async updateBlogPost(postId, title, content, countryName, dateOfVisit, image) {
    try {
      const result = await blogPostDAO.updateBlogPost(postId, title, content, countryName, dateOfVisit, image);
      logger.info(`Blog post updated with ID: ${postId}`);
      return { message: 'Blog post updated successfully', postId, title, content, countryName, dateOfVisit, image };
    } catch (error) {
      logger.error(`Error updating blog post: ${error.message}`);
      throw new Error(`Error updating blog post: ${error.message}`);
    }
  }

  // Delete a blog post
  async deleteBlogPost(postId) {
    try {
      const result = await blogPostDAO.deleteBlogPost(postId);
      logger.info(`Blog post deleted with ID: ${postId}`);
      return result;
    } catch (error) {
      logger.error(`Error deleting blog post: ${error.message}`);
      throw new Error(`Error deleting blog post: ${error.message}`);
    }
  }

  // Get blog posts from users the logged-in user is following (paginated and mixed order)
  async getBlogPostsByUserIds(userIds, page = 1, pageSize = 5) {
    try {
      const posts = await blogPostDAO.getBlogPostsByUserIds(userIds, page, pageSize);
      // Add author and profile_picture information to the posts
      for (let post of posts) {
        const user = await authDAO.findUserById(post.user_id);
        post.author = user.username;
        post.profile_picture = user.profile_picture;
      }
      logger.info(`Fetched blog posts from followed users with IDs: ${userIds}`);
      return posts;
    } catch (error) {
      logger.error(`Error fetching blog posts from followed users: ${error.message}`);
      throw new Error(`Error fetching blog posts from followed users: ${error.message}`);
    }
  }
}

module.exports = new BlogPostService();
