// src/controllers/postLink.controller.js
const postLinkService = require('../services/postLink.service');

// GET /api/postlinks/:postId  — public
const getPostLinks = async (req, res, next) => {
  try {
    const links = await postLinkService.getPostLinks(req.params.postId);
    res.json(links);
  } catch (err) { next(err); }
};

// POST /api/postlinks/:postId  — protected, must own the post
const addPostLink = async (req, res, next) => {
  try {
    const { title, url, linkType } = req.body;
    const link = await postLinkService.addPostLink(req.user.id, req.params.postId, { title, url, linkType });
    res.status(201).json(link);
  } catch (err) { next(err); }
};

// DELETE /api/postlinks/:linkId  — protected, must own the post
const deletePostLink = async (req, res, next) => {
  try {
    await postLinkService.deletePostLink(req.user.id, req.params.linkId);
    res.json({ message: 'Link deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getPostLinks, addPostLink, deletePostLink };
