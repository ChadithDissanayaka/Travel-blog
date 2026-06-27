// src/controllers/like.controller.js
const likeService = require('../services/like.service');

/**
 * POST /api/likes/like/:postId (protected)
 */
const likePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const result = await likeService.likePost(req.user.id, postId, true);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/likes/dislike/:postId (protected)
 */
const dislikePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const result = await likeService.likePost(req.user.id, postId, false);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  likePost,
  dislikePost,
};
