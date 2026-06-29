// src/controllers/blogPost.controller.js
const blogPostService = require('../services/blogPost.service');
const followService = require('../services/follow.service');

/**
 * GET /api/blogposts
 */
const getAllBlogPosts = async (req, res, next) => {
  try {
    const posts = await blogPostService.getAllBlogPosts();
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogposts/search?query=...&page=...&pageSize=...
 */
const searchBlogPosts = async (req, res, next) => {
  const { query, page = 1, pageSize = 10 } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const results = await blogPostService.searchBlogPosts(query, page, pageSize);
    res.json(results);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogposts/mostCommented?limit=...
 */
const getMostCommentedBlogPosts = async (req, res, next) => {
  const { limit = 6 } = req.query;
  try {
    const posts = await blogPostService.getMostCommentedBlogPosts(limit);
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogposts/recent?limit=...
 */
const getRecentBlogPosts = async (req, res, next) => {
  const { limit = 6 } = req.query;
  try {
    const posts = await blogPostService.getRecentBlogPosts(limit);
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogposts/popular?limit=...
 */
const getPopularBlogPosts = async (req, res, next) => {
  const { limit = 6 } = req.query;
  try {
    const posts = await blogPostService.getPopularBlogPosts(limit);
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogposts/:postId
 */
const getBlogPostById = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await blogPostService.getBlogPostById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogposts/user/:userId (protected)
 */
const getBlogPostsByUserId = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const posts = await blogPostService.getBlogPostsByUserId(userId);
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/blogposts/create (protected)
 */
const createBlogPost = async (req, res, next) => {
  const { title, content, countryName, dateOfVisit, albumId, postLinks } = req.body;
  const userId = req.user.id;
  const image = req.fileUrl || null;

  if (!title || !content || !countryName || !dateOfVisit) {
    return res.status(400).json({ error: 'All fields except image/album are required' });
  }

  // Validate dateOfVisit value and year bounds
  const parsedDate = Date.parse(dateOfVisit);
  if (isNaN(parsedDate)) {
    return res.status(400).json({ error: 'dateOfVisit must be a valid parseable date string' });
  }
  const dateObj = new Date(parsedDate);
  if (dateObj.getFullYear() < 1000 || dateObj.getFullYear() > 3000) {
    return res.status(400).json({ error: 'dateOfVisit must be between year 1000 and 3000' });
  }

  let parsedLinks = [];
  if (postLinks) {
    try {
      parsedLinks = typeof postLinks === 'string' ? JSON.parse(postLinks) : postLinks;
    } catch (e) {
      console.warn(`Failed to parse postLinks: ${e.message}`);
    }
  }

  try {
    const result = await blogPostService.createBlogPost(
      userId,
      title,
      content,
      countryName,
      dateOfVisit,
      image,
      albumId || null,
      parsedLinks
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/blogposts/:postId (protected)
 */
const updateBlogPost = async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, countryName, dateOfVisit, albumId, postLinks } = req.body;
  const updatedImage = req.fileUrl || undefined;

  // Validate dateOfVisit if provided
  if (dateOfVisit) {
    const parsedDate = Date.parse(dateOfVisit);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: 'dateOfVisit must be a valid parseable date string' });
    }
    const dateObj = new Date(parsedDate);
    if (dateObj.getFullYear() < 1000 || dateObj.getFullYear() > 3000) {
      return res.status(400).json({ error: 'dateOfVisit must be between year 1000 and 3000' });
    }
  }

  try {
    // Check ownership
    const existingPost = await blogPostService.getBlogPostById(postId);
    if (existingPost.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You do not own this post.' });
    }

    let parsedLinks = undefined;
    if (postLinks !== undefined) {
      try {
        parsedLinks = typeof postLinks === 'string' ? JSON.parse(postLinks) : postLinks;
      } catch (e) {
        console.warn(`Failed to parse postLinks: ${e.message}`);
      }
    }

    // albumId: pass as string (or null/undefined) — service handles conversion
    const result = await blogPostService.updateBlogPost(
      postId,
      title,
      content,
      countryName,
      dateOfVisit,
      updatedImage,
      albumId,
      parsedLinks
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/blogposts/delete/:postId (protected)
 */
const deleteBlogPost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const result = await blogPostService.deleteBlogPost(postId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blogposts/following/blogposts (protected)
 */
const getFollowingBlogPosts = async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, pageSize = 5 } = req.query;

  try {
    const following = await followService.getFollowingForUser(userId);
    const followingIds = following.map((f) => f.following_id);
    const posts = await blogPostService.getBlogPostsByUserIds(followingIds, page, pageSize);
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBlogPosts,
  searchBlogPosts,
  getMostCommentedBlogPosts,
  getRecentBlogPosts,
  getPopularBlogPosts,
  getBlogPostById,
  getBlogPostsByUserId,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getFollowingBlogPosts,
};
