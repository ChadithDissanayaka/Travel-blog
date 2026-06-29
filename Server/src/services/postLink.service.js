// src/services/postLink.service.js
const prisma = require('../lib/prisma');

const VALID_TYPES = ['hotel', 'map', 'restaurant', 'attraction', 'other'];

const getPostLinks = async (postId) => {
  return prisma.postLink.findMany({
    where: { postId: Number(postId) },
    orderBy: { createdAt: 'asc' },
  });
};

const addPostLink = async (userId, postId, { title, url, linkType }) => {
  // Verify post ownership
  const post = await prisma.blogPost.findFirst({
    where: { postId: Number(postId), userId: Number(userId) },
  });
  if (!post) {
    const err = new Error('Post not found or you do not own it.');
    err.status = 404;
    throw err;
  }

  if (!title || !url) {
    const err = new Error('title and url are required.');
    err.status = 400;
    throw err;
  }

  const type = VALID_TYPES.includes(linkType) ? linkType : 'other';

  return prisma.postLink.create({
    data: {
      postId: Number(postId),
      title,
      url,
      linkType: type,
    },
  });
};

const deletePostLink = async (userId, linkId) => {
  const link = await prisma.postLink.findFirst({
    where: { id: Number(linkId) },
    include: { post: { select: { userId: true } } },
  });
  if (!link || link.post.userId !== Number(userId)) {
    const err = new Error('Link not found or you do not own it.');
    err.status = 404;
    throw err;
  }
  await prisma.postLink.delete({ where: { id: Number(linkId) } });
};

module.exports = { getPostLinks, addPostLink, deletePostLink };
