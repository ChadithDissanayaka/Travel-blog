// src/services/shortLink.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// Generate a random 6-char slug
const generateSlug = () => crypto.randomBytes(3).toString('hex');

// Validate URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validate custom slug: alphanumeric + hyphens only, 3-50 chars
const isValidSlug = (slug) => /^[a-z0-9-]{3,50}$/.test(slug);

const createShortLink = async (userId, originalUrl, customSlug = null) => {
  if (!isValidUrl(originalUrl)) {
    const err = new Error('Invalid URL. Please include http:// or https://');
    err.status = 400;
    throw err;
  }

  // Reuse existing short link if created by the same user for the same URL (only if no custom slug is requested)
  if (!customSlug) {
    const existing = await prisma.shortLink.findFirst({
      where: { userId: Number(userId), originalUrl },
      select: {
        id: true,
        slug: true,
        originalUrl: true,
        clicks: true,
        createdAt: true,
      },
    });
    if (existing) return existing;
  }

  let slug = customSlug ? customSlug.toLowerCase().trim() : generateSlug();

  if (customSlug && !isValidSlug(slug)) {
    const err = new Error('Slug must be 3-50 characters: lowercase letters, numbers, and hyphens only.');
    err.status = 400;
    throw err;
  }

  // Ensure slug is unique — retry up to 5 times for auto-generated ones
  let attempts = 0;
  while (attempts < 5) {
    const existing = await prisma.shortLink.findUnique({ where: { slug } });
    if (!existing) break;
    if (customSlug) {
      // If this exact slug already belongs to the same user pointing at the same URL, reuse it
      if (existing.userId === Number(userId) && existing.originalUrl === originalUrl) {
        return {
          id: existing.id,
          slug: existing.slug,
          originalUrl: existing.originalUrl,
          clicks: existing.clicks,
          createdAt: existing.createdAt,
        };
      }
      const err = new Error('That slug is already taken. Try a different one.');
      err.status = 409;
      throw err;
    }
    slug = generateSlug();
    attempts++;
  }

  return prisma.shortLink.create({
    data: { userId, originalUrl, slug },
    select: {
      id: true,
      slug: true,
      originalUrl: true,
      clicks: true,
      createdAt: true,
    },
  });
};

const getUserLinks = async (userId) => {
  return prisma.shortLink.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      originalUrl: true,
      clicks: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deleteShortLink = async (userId, id) => {
  const link = await prisma.shortLink.findFirst({ where: { id: Number(id), userId } });
  if (!link) {
    const err = new Error('Link not found or you do not have permission to delete it.');
    err.status = 404;
    throw err;
  }
  await prisma.shortLink.delete({ where: { id: Number(id) } });
};

const resolveSlug = async (slug, userAgent, referer) => {
  const link = await prisma.shortLink.findUnique({ where: { slug } });
  if (!link) return null;

  // Record click asynchronously — don't await to keep redirect fast
  prisma.shortLink.update({
    where: { id: link.id },
    data: {
      clicks: { increment: 1 },
      clickLogs: {
        create: { userAgent: userAgent || null, referer: referer || null },
      },
    },
  }).catch(() => {}); // fire-and-forget

  return link.originalUrl;
};

const getLinkStats = async (userId, id) => {
  const link = await prisma.shortLink.findFirst({
    where: { id: Number(id), userId },
    include: {
      clickLogs: {
        orderBy: { clickedAt: 'desc' },
        take: 50,
      },
    },
  });
  if (!link) {
    const err = new Error('Link not found.');
    err.status = 404;
    throw err;
  }
  return link;
};

module.exports = { createShortLink, getUserLinks, deleteShortLink, resolveSlug, getLinkStats };
