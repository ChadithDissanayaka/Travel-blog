// src/services/album.service.js
const prisma = require('../lib/prisma');

// ─── Albums ──────────────────────────────────────────────

const getAlbumsByUserId = async (userId) => {
  return prisma.album.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { posts: true } },
    },
  });
};

const getAlbumById = async (id) => {
  const album = await prisma.album.findUnique({
    where: { id: Number(id) },
    include: {
      user: { select: { id: true, username: true, profilePicture: true } },
      posts: {
        orderBy: { dateOfVisit: 'asc' },
        include: {
          _count: { select: { comments: true, postLinks: true } },
        },
      },
      _count: { select: { posts: true } },
    },
  });

  if (!album) return null;

  // Map posts to snake_case structure to match the standard BlogPost model expected by client
  album.posts = album.posts.map(post => ({
    post_id: post.postId,
    user_id: post.userId,
    album_id: post.albumId ?? null,
    title: post.title,
    content: post.content,
    country_name: post.countryName,
    date_of_visit: post.dateOfVisit,
    image: post.image,
    created_at: post.createdAt,
    author: album.user.username,
    profile_picture: album.user.profilePicture,
    comment_count: post._count.comments,
    post_links: post.postLinks || [],
  }));

  return album;
};

const createAlbum = async (userId, { title, description, countryName, coverImage }) => {
  if (!title || !countryName) {
    const err = new Error('title and countryName are required.');
    err.status = 400;
    throw err;
  }
  return prisma.album.create({
    data: {
      userId: Number(userId),
      title,
      description: description || null,
      countryName,
      coverImage: coverImage || null,
    },
  });
};

const updateAlbum = async (userId, id, data) => {
  const album = await prisma.album.findFirst({ where: { id: Number(id), userId: Number(userId) } });
  if (!album) {
    const err = new Error('Album not found or you do not own it.');
    err.status = 404;
    throw err;
  }
  return prisma.album.update({
    where: { id: Number(id) },
    data: {
      title: data.title ?? album.title,
      description: data.description ?? album.description,
      countryName: data.countryName ?? album.countryName,
      coverImage: data.coverImage ?? album.coverImage,
    },
  });
};

const deleteAlbum = async (userId, id) => {
  const album = await prisma.album.findFirst({ where: { id: Number(id), userId: Number(userId) } });
  if (!album) {
    const err = new Error('Album not found or you do not own it.');
    err.status = 404;
    throw err;
  }
  await prisma.album.delete({ where: { id: Number(id) } });
};

// ─── Map data — visited countries derived from blog posts + albums ──
const getVisitedCountries = async (userId) => {
  const [posts, albums] = await Promise.all([
    prisma.blogPost.findMany({
      where: { userId: Number(userId) },
      select: { countryName: true },
    }),
    prisma.album.findMany({
      where: { userId: Number(userId) },
      select: {
        countryName: true, id: true, title: true, coverImage: true,
        _count: { select: { posts: true } },
      },
    }),
  ]);

  const postCountries = [...new Set(posts.map(p => p.countryName))];

  const albumsByCountry = {};
  albums.forEach(a => {
    if (!albumsByCountry[a.countryName]) albumsByCountry[a.countryName] = [];
    albumsByCountry[a.countryName].push(a);
  });

  const allCountries = [...new Set([...postCountries, ...Object.keys(albumsByCountry)])];

  return allCountries.map(country => ({
    country,
    postCount: posts.filter(p => p.countryName === country).length,
    albums: albumsByCountry[country] || [],
  }));
};

const getRecentAlbums = async (limit = 6) => {
  return prisma.album.findMany({
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
    include: {
      user: { select: { id: true, username: true, profilePicture: true } },
      _count: { select: { posts: true } },
    },
  });
};

const getFollowingAlbums = async (userId) => {
  const follows = await prisma.follower.findMany({
    where: { followerId: Number(userId) },
    select: { followingId: true },
  });
  const followedUserIds = follows.map(f => f.followingId);

  return prisma.album.findMany({
    where: { userId: { in: followedUserIds } },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, username: true, profilePicture: true } },
      _count: { select: { posts: true } },
    },
  });
};

module.exports = {
  getAlbumsByUserId,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getVisitedCountries,
  getRecentAlbums,
  getFollowingAlbums,
};
