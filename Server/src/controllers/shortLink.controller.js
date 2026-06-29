// src/controllers/shortLink.controller.js
const shortLinkService = require('../services/shortLink.service');

const createLink = async (req, res, next) => {
  try {
    const { originalUrl, customSlug } = req.body;
    if (!originalUrl) return res.status(400).json({ error: 'originalUrl is required.' });
    const link = await shortLinkService.createShortLink(req.user.id, originalUrl, customSlug || null);
    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
};

const getMyLinks = async (req, res, next) => {
  try {
    const links = await shortLinkService.getUserLinks(req.user.id);
    res.json(links);
  } catch (err) {
    next(err);
  }
};

const deleteLink = async (req, res, next) => {
  try {
    await shortLinkService.deleteShortLink(req.user.id, req.params.id);
    res.json({ message: 'Link deleted.' });
  } catch (err) {
    next(err);
  }
};

const getLinkStats = async (req, res, next) => {
  try {
    const stats = await shortLinkService.getLinkStats(req.user.id, req.params.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

// Public redirect — no auth required
const redirect = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userAgent = req.headers['user-agent'];
    const referer = req.headers['referer'];
    const destination = await shortLinkService.resolveSlug(slug, userAgent, referer);
    if (!destination) return res.status(404).json({ error: 'Short link not found.' });
    res.redirect(302, destination);
  } catch (err) {
    next(err);
  }
};

module.exports = { createLink, getMyLinks, deleteLink, getLinkStats, redirect };
