// src/routes/blogPost.routes.js
const express = require('express');
const router = express.Router();
const blogPostController = require('../controllers/blogPost.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { upload, uploadToCloudinary } = require('../utils/upload');

// ─── Public routes ───────────────────────────────────────
router.get('/', blogPostController.getAllBlogPosts);
router.get('/search', blogPostController.searchBlogPosts);
router.get('/mostCommented', blogPostController.getMostCommentedBlogPosts);
router.get('/recent', blogPostController.getRecentBlogPosts);
router.get('/popular', blogPostController.getPopularBlogPosts);
router.get('/:postId', blogPostController.getBlogPostById);

// ─── Protected routes ────────────────────────────────────
router.use(authenticateJWT);

router.get('/user/:userId', blogPostController.getBlogPostsByUserId);
router.post('/create', upload, uploadToCloudinary, blogPostController.createBlogPost);
router.put('/update/:postId', upload, uploadToCloudinary, blogPostController.updateBlogPost);
router.delete('/delete/:postId', blogPostController.deleteBlogPost);
router.get('/following/blogposts', blogPostController.getFollowingBlogPosts);

module.exports = router;
