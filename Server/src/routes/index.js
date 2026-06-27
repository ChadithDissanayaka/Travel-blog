// src/routes/index.js
// Central route aggregator — registers all route modules in one place
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const countryRoutes = require('./country.routes');
const blogPostRoutes = require('./blogPost.routes');
const userRoutes = require('./user.routes');
const likeRoutes = require('./like.routes');
const commentRoutes = require('./comment.routes');
const followRoutes = require('./follow.routes');

router.use('/auth', authRoutes);
router.use('/countries', countryRoutes);
router.use('/blogposts', blogPostRoutes);
router.use('/user', userRoutes);
router.use('/likes', likeRoutes);
router.use('/comments', commentRoutes);
router.use('/follow', followRoutes);

// CSRF token generation endpoint
const crypto = require('crypto');
router.get('/csrf-token', (req, res) => {
  let token = req.cookies && req.cookies._csrf;
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    res.cookie('_csrf', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  }
  res.json({ csrfToken: token });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running.' });
});

module.exports = router;
