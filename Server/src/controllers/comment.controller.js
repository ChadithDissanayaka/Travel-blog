// src/controllers/comment.controller.js
const commentService = require('../services/comment.service');

/**
 * GET /api/comments/:postId
 */
const getComments = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const comments = await commentService.getCommentsForPost(postId);
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/comments/add/:postId (protected)
 */
const addComment = async (req, res, next) => {
  const { postId } = req.params;
  const { commentText } = req.body;
  try {
    const comment = await commentService.addComment(req.user.id, postId, commentText);
    res.json({ message: 'Comment added', comment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  addComment,
};
