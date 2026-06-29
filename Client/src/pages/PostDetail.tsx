import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, Edit, Trash2, ArrowLeft, Hotel, Map, UtensilsCrossed, Ticket, Link2, ExternalLink, Share2, Check } from 'lucide-react';
import CommentSection from '../components/BlogPost/CommentSection';
import LikeDislikeButton from '../components/BlogPost/LikeDislikeButton';
import Button from '../components/Common/Button';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/post.service';
import { shortLinkService } from '../services/shortLink.service';
import { DetailPost } from '../types/post';
import type { PostLink } from '../services/postLink.service';

const LINK_CONFIG: Record<string, { icon: typeof Hotel; colorClass: string; label: string }> = {
  hotel:      { icon: Hotel,           colorClass: 'text-blue-700 bg-blue-50 border-blue-200',    label: 'Hotel'      },
  map:        { icon: Map,             colorClass: 'text-teal-700 bg-teal-50 border-teal-200',    label: 'Map'        },
  restaurant: { icon: UtensilsCrossed, colorClass: 'text-orange-700 bg-orange-50 border-orange-200', label: 'Restaurant' },
  attraction: { icon: Ticket,          colorClass: 'text-purple-700 bg-purple-50 border-purple-200', label: 'Attraction' },
  other:      { icon: Link2,           colorClass: 'text-slate-600 bg-slate-50 border-slate-200',  label: 'Link'       },
};

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<DetailPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!post) return;
    setSharing(true);
    try {
      if (user) {
        const originalUrl = window.location.href;
        const link = await shortLinkService.create({ originalUrl });
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
        await navigator.clipboard.writeText(`${baseUrl}/s/${link.slug}`);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to share post:', err);
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setSharing(false);
    }
  };

  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null);
  const [sharingLinkId, setSharingLinkId] = useState<number | null>(null);

  // Map link types to short human-readable abbreviations
  const LINK_TYPE_ABBREV: Record<string, string> = {
    hotel:      'hot',
    map:        'map',
    restaurant: 'res',
    attraction: 'att',
    other:      'lnk',
  };

  // Build a slug base from the post title: lowercase, replace spaces/special chars with hyphens
  const buildSlugBase = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32);

  const handleShareUsefulLink = async (
    e: React.MouseEvent,
    linkId: number,
    originalUrl: string,
    linkType: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSharingLinkId(linkId);
    try {
      if (user) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
        const typeAbbrev = LINK_TYPE_ABBREV[linkType] || 'lnk';
        const titleBase = post ? buildSlugBase(post.title) : 'link';
        const slugBase = `${titleBase}-${typeAbbrev}`;

        // Try slugBase, then slugBase-2, slugBase-3 … until unique
        let link;
        let attempt = 0;
        while (!link) {
          const customSlug = attempt === 0 ? slugBase : `${slugBase}-${attempt + 1}`;
          try {
            link = await shortLinkService.create({ originalUrl, customSlug });
          } catch (err: any) {
            if (err?.response?.status === 409 && attempt < 9) {
              attempt++;
            } else {
              // Fallback: create with auto-generated slug
              link = await shortLinkService.create({ originalUrl });
            }
          }
        }

        await navigator.clipboard.writeText(`${baseUrl}/s/${link.slug}`);
      } else {
        await navigator.clipboard.writeText(originalUrl);
      }
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2500);
    } catch (err) {
      console.error('Failed to share useful link:', err);
      await navigator.clipboard.writeText(originalUrl);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } finally {
      setSharingLinkId(null);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const postData = await postService.getById(id!);
        setPost(postData);
      } catch {
        setError('Error fetching post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    try {
      await postService.delete(id!);
      navigate('/');
    } catch {
      setError('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="pt-20 max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="skeleton h-80 w-full rounded-2xl" />
        <div className="bg-white rounded-3xl shadow-card p-8 space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-4 w-full rounded" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl mb-4 text-sm">{error}</div>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
      </div>
    );
  }

  if (!post) return null;

  const postUserId = post.userId ?? post.user_id;
  const isAuthor = user && String(user.id) === String(postUserId);

  return (
    <div className="pt-20 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Stories
      </Link>

      {/* Title section */}
      <div className="mb-8">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <MapPin className="h-3.5 w-3.5" />
            {post.country_name}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full">
            <Calendar className="h-3.5 w-3.5" />
            {post.date_of_visit && !isNaN(Date.parse(post.date_of_visit))
              ? format(new Date(post.date_of_visit), 'MMMM d, yyyy')
              : 'N/A'}
          </span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-6">
          {post.title}
        </h1>

        {/* Author row */}
        <div className="flex items-center justify-between">
          <Link to={`/profile/${post.author}`} className="flex items-center gap-3 group">
            <img
              src={post.profile_picture || `https://ui-avatars.com/api/?name=${post.author}&background=0d9488&color=fff`}
              alt={post.author}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                {post.author}
              </p>
              <p className="text-xs text-slate-400">Travel Writer</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} disabled={sharing}>
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" /> Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" /> Share
                </>
              )}
            </Button>

            {isAuthor && (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate(`/edit-post/${post.post_id}`)}>
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero image */}
      {post.image && (
        <div className="mb-8 rounded-3xl overflow-hidden shadow-card">
          <img src={post.image} alt={post.title} className="w-full h-80 object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-card p-8 mb-6">
        <p className="whitespace-pre-line text-slate-700 leading-relaxed text-base">
          {post.content}
        </p>
      </div>

      {/* Post Links (useful URLs) */}
      {post.post_links && post.post_links.length > 0 && (
        <div className="bg-white rounded-3xl shadow-card p-8 mb-6">
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-teal-500" />
            Useful Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {post.post_links.map((link: PostLink) => {
              const cfg = LINK_CONFIG[link.linkType] || LINK_CONFIG.other;
              const Icon = cfg.icon;
              return (
                <div
                  key={link.id}
                  className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border text-sm font-medium ${cfg.colorClass}`}
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center gap-3 hover:opacity-80 transition-opacity min-w-0"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{link.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  </a>
                  <button
                    onClick={(e) => handleShareUsefulLink(e, link.id, link.url, link.linkType)}
                    disabled={sharingLinkId === link.id}
                    className="p-1.5 rounded-lg hover:bg-black/5 text-slate-600 hover:text-teal-700 transition-colors shrink-0 flex items-center justify-center"
                    title={`Copy short link for ${link.title}`}
                  >
                    {copiedLinkId === link.id ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactions */}
      <div className="bg-white rounded-3xl shadow-card p-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
          <LikeDislikeButton
            postId={post.post_id.toString()}
            initialLikes={post.like_count}
            initialDislikes={post.dislike_count}
          />
          <span className="text-xs text-slate-400">
            Visited {post.date_of_visit && !isNaN(Date.parse(post.date_of_visit))
              ? format(new Date(post.date_of_visit), 'MMMM yyyy')
              : 'N/A'}
          </span>
        </div>
        <CommentSection postId={post.post_id.toString()} comments={post.comments} />
      </div>

      {/* Delete modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 text-center mb-2">Delete Post</h3>
            <p className="text-slate-500 text-sm text-center mb-7">
              Are you sure you want to delete this story? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" fullWidth onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
