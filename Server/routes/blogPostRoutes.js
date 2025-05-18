// routes/blogPostRoutes.js
const express = require('express');
const router = express.Router();
const blogPostService = require('../services/blogPostService');
const followService = require('../services/followService');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { csrfProtection } = require('../middleware/csrfMiddleware');
const { upload, uploadToCloudinary } = require('../utils/upload');

// Public routes - No authentication required

// Get all blog posts with like, dislike, and comment counts
router.get('/', async (req, res) => {
    try {
        const posts = await blogPostService.getAllBlogPosts();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Search for blog posts by country name or username with like, dislike, and comment counts
router.get('/search', async (req, res) => {
    const { query, page = 1, pageSize = 10 } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        const results = await blogPostService.searchBlogPosts(query, page, pageSize);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get the most commented blog posts (with like, dislike, and comment counts)
router.get('/mostCommented', async (req, res) => {
    const { limit = 5 } = req.query; // Limit for the number of posts to return

    try {
        const posts = await blogPostService.getMostCommentedBlogPosts(limit);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recent blog posts (with like, dislike, and comment counts)
router.get('/recent', async (req, res) => {
    const { limit = 5 } = req.query; // Limit for the number of posts to return

    try {
        const posts = await blogPostService.getRecentBlogPosts(limit);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get the most popular blog posts (based on likes or comments)
router.get('/popular', async (req, res) => {
    const { limit = 5 } = req.query; // Limit for the number of posts to return

    try {
        const posts = await blogPostService.getPopularBlogPosts(limit);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Protected routes - Requires authentication
router.use(authenticateJWT); // Ensure authentication for the following routes
//router.use(csrfProtection); // Ensure CSRF protection for the following routes

// Get a specific blog post by ID with like, dislike, and comment counts
router.get('/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
        const post = await blogPostService.getBlogPostById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all blog posts for a specific user by user ID
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;  // Get the user ID from the URL parameter
    try {
        // Make sure the logged-in user is trying to access their own posts
        if (req.user.id !== parseInt(userId)) {
            return res.status(403).json({ error: 'You can only view your own blog posts.' });
        }

        const posts = await blogPostService.getBlogPostsByUserId(userId);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new blog post (Allow image upload for the blog post)
router.post('/create', upload, uploadToCloudinary, async (req, res) => {
    const { title, content, countryName, dateOfVisit } = req.body;
    const userId = req.user.id;
    const image = req.fileUrl || null; // Cloudinary image URL

    // Validate input fields
    if (!title || !content || !countryName || !dateOfVisit) {
        return res.status(400).json({ error: 'All fields (title, content, countryName, dateOfVisit) are required.' });
    }

    try {
        const result = await blogPostService.createBlogPost(userId, title, content, countryName, dateOfVisit, image);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a blog post (Allow image upload for the blog post)
router.put('/update/:postId', upload, uploadToCloudinary, async (req, res) => {
    const { postId } = req.params;
    const { title, content, countryName, dateOfVisit } = req.body;

    // If an image was uploaded, use the Cloudinary URL, otherwise, retain the existing image
    const image = req.fileUrl || null; // If an image was uploaded, get the Cloudinary URL

    // Validate input fields
    if (!title || !content || !countryName || !dateOfVisit) {
        return res.status(400).json({ error: 'All fields (title, content, countryName, dateOfVisit) are required.' });
    }

    try {
        // Fetch the current blog post from the database to retain the existing image if no new image is uploaded
        const currentPost = await blogPostService.getBlogPostById(postId);

        // If no new image is uploaded, retain the existing image URL
        const updatedImage = image || currentPost.image;

        // Call the service to update the blog post
        const result = await blogPostService.updateBlogPost(postId, title, content, countryName, dateOfVisit, updatedImage);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a blog post
router.delete('/delete/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
        const result = await blogPostService.deleteBlogPost(postId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get blog posts from users the logged-in user is following (paginated and mixed order) to chack route
router.get('/following/blogposts', async (req, res) => {
    const userId = req.user.id; // Get the logged-in user's ID
    const { page = 1, pageSize = 5 } = req.query;

    try {
        // Get users the logged-in user is following
        const following = await followService.getFollowingForUser(userId);
        const followingIds = following.map(followedUser => followedUser.following_id);

        // Fetch blog posts from the followed users
        const posts = await blogPostService.getBlogPostsByUserIds(followingIds, page, pageSize);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
