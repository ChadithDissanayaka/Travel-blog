// src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes      = require('./auth.routes');
const countryRoutes   = require('./country.routes');
const blogPostRoutes  = require('./blogPost.routes');
const userRoutes      = require('./user.routes');
const likeRoutes      = require('./like.routes');
const commentRoutes   = require('./comment.routes');
const followRoutes    = require('./follow.routes');
const albumRoutes     = require('./album.routes');
const postLinkRoutes  = require('./postLink.routes');
const shortLinkRoutes = require('./shortLink.routes');

router.use('/auth',      authRoutes);
router.use('/countries', countryRoutes);
router.use('/blogposts', blogPostRoutes);
router.use('/user',      userRoutes);
router.use('/likes',     likeRoutes);
router.use('/comments',  commentRoutes);
router.use('/follow',    followRoutes);
router.use('/albums',    albumRoutes);
router.use('/postlinks', postLinkRoutes);
router.use('/links',     shortLinkRoutes);

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

router.get('/health', (_req, res) => res.json({ status: 'OK' }));

module.exports = router;
