const express = require('express');
const router = express.Router();
const likeService = require('../services/likeService');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { csrfProtection } = require('../middleware/csrfMiddleware');

// Apply JWT and CSRF protection
router.use(authenticateJWT);
router.use(csrfProtection);

// Like a post
router.post('/like/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
        await likeService.likePost(req.user.id, postId, true);
        res.json({ message: 'Post liked' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Dislike a post
router.post('/dislike/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
        await likeService.likePost(req.user.id, postId, false);
        res.json({ message: 'Post disliked' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
