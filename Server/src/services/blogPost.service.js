// src/services/blogPost.service.js
const prisma = require('../lib/prisma');
const logger = require('../utils/logger');

/**
 * Parse a YYYY-MM-DD string as UTC midnight to avoid timezone-shift issues.
 * e.g. "2026-06-27" → Date object at 2026-06-27T00:00:00.000Z
 */
function parseDateUTC(dateStr) {
  const [year, month, day] = String(dateStr).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// Shared include/select for enriching posts with author info and counts
const postWithDetails = {
  include: {
    user: {
      select: {
        username: true,
        profilePicture: true,
      },
    },
    _count: {
      select: {
        comments: true,
      },
    },
  },
};

/**
 * Transform a raw Prisma post result into the API response shape.
 * Flattens user info and counts into top-level fields.
 */
function formatPost(post) {
  const { user, _count } = post;
  return {
    post_id: post.postId,
    user_id: post.userId,
    album_id: post.albumId ?? null,
    title: post.title,
    content: post.content,
    country_name: post.countryName,
    date_of_visit: post.dateOfVisit,
    image: post.image,
    created_at: post.createdAt,
    author: user.username,
    profile_picture: user.profilePicture,
    comment_count: _count.comments,
  };
}

/**
 * Enrich a post with like/dislike counts (separate query for aggregation).
 */
async function enrichWithLikeCounts(post) {
  const [likeCount, dislikeCount] = await Promise.all([
    prisma.like.count({ where: { postId: post.postId, isLike: true } }),
    prisma.like.count({ where: { postId: post.postId, isLike: false } }),
  ]);
  return {
    ...formatPost(post),
    like_count: likeCount,
    dislike_count: dislikeCount,
  };
}

/**
 * Enrich multiple posts with like/dislike counts in parallel.
 */
async function enrichPostsWithLikeCounts(posts) {
  return Promise.all(posts.map(enrichWithLikeCounts));
}

class BlogPostService {
  /**
   * Fetch all blog posts with author info and counts.
   */
  async getAllBlogPosts() {
    try {
      const posts = await prisma.blogPost.findMany({
        ...postWithDetails,
        orderBy: { createdAt: 'desc' },
      });

      const enriched = await enrichPostsWithLikeCounts(posts);
      logger.info('Fetched all blog posts.');
      return enriched;
    } catch (error) {
      logger.error(`Error fetching blog posts: ${error.message}`);
      throw new Error(`Error fetching blog posts: ${error.message}`);
    }
  }

  /**
   * Fetch a single blog post by ID with comments.
   */
  async getBlogPostById(postId) {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { postId: parseInt(postId) },
        include: {
          user: {
            select: { username: true, profilePicture: true },
          },
          comments: {
            include: {
              user: {
                select: { username: true, profilePicture: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          postLinks: {
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: { comments: true },
          },
        },
      });

      if (!post) {
        throw new Error('Blog post not found');
      }

      const [likeCount, dislikeCount] = await Promise.all([
        prisma.like.count({ where: { postId: post.postId, isLike: true } }),
        prisma.like.count({ where: { postId: post.postId, isLike: false } }),
      ]);

      const { user, _count, comments, postLinks } = post;

      return {
        post_id: post.postId,
        user_id: post.userId,
        album_id: post.albumId ?? null,
        title: post.title,
        content: post.content,
        country_name: post.countryName,
        date_of_visit: post.dateOfVisit,
        image: post.image,
        created_at: post.createdAt,
        author: user.username,
        profile_picture: user.profilePicture,
        like_count: likeCount,
        dislike_count: dislikeCount,
        comment_count: _count.comments,
        post_links: postLinks || [],
        comments: comments.map((c) => ({
          comment_id: c.commentId,
          post_id: c.postId,
          user_id: c.userId,
          comment_text: c.commentText,
          created_at: c.createdAt,
          author: c.user.username,
          profile_picture: c.user.profilePicture,
        })),
      };
    } catch (error) {
      logger.error(`Error fetching blog post: ${error.message}`);
      throw new Error(`Error fetching blog post: ${error.message}`);
    }
  }

  /**
   * Fetch blog posts for a specific user, sorted by likes then comments.
   */
  async getBlogPostsByUserId(userId) {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { userId: parseInt(userId) },
        ...postWithDetails,
        orderBy: { createdAt: 'desc' },
      });

      const enriched = await enrichPostsWithLikeCounts(posts);

      // Sort by like_count desc, then comment_count desc
      enriched.sort((a, b) => {
        if (b.like_count !== a.like_count) return b.like_count - a.like_count;
        return b.comment_count - a.comment_count;
      });

      logger.info(`Fetched blog posts for user with ID: ${userId}`);
      return enriched;
    } catch (error) {
      logger.error(`Error fetching blog posts for user ${userId}: ${error.message}`);
      throw new Error(`Error fetching blog posts for user: ${error.message}`);
    }
  }

  /**
   * Search blog posts by country name or title.
   */
  async searchBlogPosts(searchQuery, page = 1, pageSize = 10) {
    try {
      const skip = (page - 1) * pageSize;
      const posts = await prisma.blogPost.findMany({
        where: {
          OR: [
            { countryName: { contains: searchQuery } },
            { title: { contains: searchQuery } },
          ],
        },
        ...postWithDetails,
        skip,
        take: parseInt(pageSize),
        orderBy: { createdAt: 'desc' },
      });

      const enriched = await enrichPostsWithLikeCounts(posts);
      logger.info(`Fetched blog posts matching search query: ${searchQuery}`);
      return enriched;
    } catch (error) {
      logger.error(`Error during blog post search: ${error.message}`);
      throw new Error(`Error during blog post search: ${error.message}`);
    }
  }

  /**
   * Fetch most commented blog posts.
   */
  async getMostCommentedBlogPosts(limit = 5) {
    try {
      const posts = await prisma.blogPost.findMany({
        ...postWithDetails,
        orderBy: {
          comments: { _count: 'desc' },
        },
        take: parseInt(limit),
      });

      const enriched = await enrichPostsWithLikeCounts(posts);
      logger.info(`Fetched ${limit} most commented blog posts.`);
      return enriched;
    } catch (error) {
      logger.error(`Error fetching most commented blog posts: ${error.message}`);
      throw new Error(`Error fetching most commented blog posts: ${error.message}`);
    }
  }

  /**
   * Fetch recent blog posts.
   */
  async getRecentBlogPosts(limit = 5) {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { createdAt: { lte: new Date() } },
        ...postWithDetails,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
      });

      const enriched = await enrichPostsWithLikeCounts(posts);
      logger.info(`Fetched ${limit} recent blog posts.`);
      return enriched;
    } catch (error) {
      logger.error(`Error fetching recent blog posts: ${error.message}`);
      throw new Error(`Error fetching recent blog posts: ${error.message}`);
    }
  }

  /**
   * Fetch popular blog posts (sorted by like count).
   */
  async getPopularBlogPosts(limit = 5) {
    try {
      const posts = await prisma.blogPost.findMany({
        ...postWithDetails,
        orderBy: { createdAt: 'desc' },
        // We fetch more than needed, then sort by like count
        take: parseInt(limit) * 3,
      });

      const enriched = await enrichPostsWithLikeCounts(posts);
      enriched.sort((a, b) => b.like_count - a.like_count);

      logger.info(`Fetched ${limit} popular blog posts.`);
      return enriched.slice(0, parseInt(limit));
    } catch (error) {
      logger.error(`Error fetching popular blog posts: ${error.message}`);
      throw new Error(`Error fetching popular blog posts: ${error.message}`);
    }
  }

  /**
   * Create a new blog post.
   */
  async createBlogPost(userId, title, content, countryName, dateOfVisit, image, albumId = null, postLinks = []) {
    try {
      const post = await prisma.blogPost.create({
        data: {
          userId,
          title,
          content,
          countryName,
          dateOfVisit: parseDateUTC(dateOfVisit),
          image,
          albumId: albumId ? Number(albumId) : null,
          postLinks: {
            create: postLinks.map(link => ({
              title: link.title,
              url: link.url,
              linkType: link.linkType || 'other',
            })),
          },
        },
        include: {
          user: {
            select: { username: true, profilePicture: true },
          },
          postLinks: true,
        },
      });

      logger.info(`Blog post created by user ${userId}`);
      return {
        post_id: post.postId,
        user_id: post.userId,
        album_id: post.albumId ?? null,
        title: post.title,
        content: post.content,
        country_name: post.countryName,
        date_of_visit: post.dateOfVisit,
        image: post.image,
        created_at: post.createdAt,
        author: post.user.username,
        profile_picture: post.user.profilePicture,
        like_count: 0,
        dislike_count: 0,
        comment_count: 0,
        post_links: post.postLinks || [],
      };
    } catch (error) {
      logger.error(`Error creating blog post: ${error.message}`);
      throw new Error(`Error creating blog post: ${error.message}`);
    }
  }

  /**
   * Update an existing blog post.
   */
  async updateBlogPost(postId, title, content, countryName, dateOfVisit, image, albumId = undefined, postLinks = undefined) {
    try {
      const data = {
        title,
        content,
        countryName,
        dateOfVisit: parseDateUTC(dateOfVisit),
        image,
      };
      // Only update albumId if explicitly provided
      if (albumId !== undefined) {
        data.albumId = albumId ? Number(albumId) : null;
      }

      // Handle nested postLinks update atomically inside the same transaction
      if (postLinks !== undefined) {
        await prisma.postLink.deleteMany({ where: { postId: Number(postId) } });
        data.postLinks = {
          create: postLinks.map(link => ({
            title: link.title,
            url: link.url,
            linkType: link.linkType || 'other',
          })),
        };
      }

      const updated = await prisma.blogPost.update({
        where: { postId: parseInt(postId) },
        data,
      });

      logger.info(`Blog post updated with ID: ${postId}`);
      return { message: 'Blog post updated successfully', ...updated };
    } catch (error) {
      logger.error(`Error updating blog post: ${error.message}`);
      throw new Error(`Error updating blog post: ${error.message}`);
    }
  }

  /**
   * Delete a blog post.
   */
  async deleteBlogPost(postId) {
    try {
      await prisma.blogPost.delete({
        where: { postId: parseInt(postId) },
      });

      logger.info(`Blog post deleted with ID: ${postId}`);
      return { message: 'Blog post deleted successfully' };
    } catch (error) {
      logger.error(`Error deleting blog post: ${error.message}`);
      throw new Error(`Error deleting blog post: ${error.message}`);
    }
  }

  /**
   * Get blog posts from followed users (paginated).
   */
  async getBlogPostsByUserIds(userIds, page = 1, pageSize = 5) {
    try {
      const skip = (page - 1) * pageSize;
      const posts = await prisma.blogPost.findMany({
        where: { userId: { in: userIds } },
        ...postWithDetails,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(pageSize),
      });

      const enriched = await enrichPostsWithLikeCounts(posts);
      logger.info(`Fetched blog posts from followed users with IDs: ${userIds}`);
      return enriched;
    } catch (error) {
      logger.error(`Error fetching blog posts from followed users: ${error.message}`);
      throw new Error(`Error fetching blog posts from followed users: ${error.message}`);
    }
  }
}

module.exports = new BlogPostService();
