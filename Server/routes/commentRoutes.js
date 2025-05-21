const express = require('express');
const router = express.Router();
const commentService = require('../services/commentService');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { csrfProtection } = require('../middleware/csrfMiddleware');

// Apply JWT and CSRF protection
router.use(authenticateJWT);
router.use(csrfProtection);

// Add a comment
router.post('/add/:postId', async (req, res) => {
    const { postId } = req.params;
    const { commentText } = req.body;
    try {
        const comment = await commentService.addComment(req.user.id, postId, commentText);
        res.json({ message: 'Comment added', comment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get comments for a post
router.get('/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
        const comments = await commentService.getCommentsForPost(postId);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
