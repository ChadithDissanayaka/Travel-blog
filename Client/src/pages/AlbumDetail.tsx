// src/pages/AlbumDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, BookOpen, Calendar, Link2, Hotel, MapIcon, UtensilsCrossed, Ticket, Share2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { albumService, Album } from '../services/album.service';
import { shortLinkService } from '../services/shortLink.service';
import { useAuth } from '../hooks/useAuth';
import { PostLink } from '../services/postLink.service';

const LINK_TYPE_CONFIG: Record<string, { icon: typeof Hotel; color: string; label: string }> = {
  hotel:      { icon: Hotel,           color: 'text-blue-600 bg-blue-50',    label: 'Hotel'      },
  map:        { icon: MapIcon,          color: 'text-teal-600 bg-teal-50',    label: 'Map'        },
  restaurant: { icon: UtensilsCrossed, color: 'text-orange-600 bg-orange-50', label: 'Restaurant' },
  attraction: { icon: Ticket,          color: 'text-purple-600 bg-purple-50', label: 'Attraction' },
  other:      { icon: Link2,           color: 'text-slate-600 bg-slate-100',  label: 'Link'       },
};

const AlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwner = album?.userId === currentUser?.id || album?.user?.username === currentUser?.username;

  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!album) return;
    setSharing(true);
    try {
      if (currentUser) {
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
      console.error('Failed to share album:', err);
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setSharing(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await albumService.getAlbum(Number(id));
        if (!data) { navigate('/'); return; }
        setAlbum(data);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="pt-20">
        <div className="skeleton h-8 w-48 mb-6 rounded-xl" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card p-6">
              <div className="skeleton h-5 w-3/4 mb-3 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-2/3 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!album) return null;

  const posts = album.posts || [];

  return (
    <div className="pt-20 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        to={`/profile/${album.user?.username}/albums`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to albums
      </Link>

      {/* Album header */}
      <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-8">
        {album.coverImage && (
          <div className="h-56 overflow-hidden">
            <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-2">{album.title}</h1>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
                <MapPin className="h-4 w-4 text-teal-500" />
                {album.countryName}
              </div>
              {album.description && (
                <p className="text-sm text-slate-600 leading-relaxed max-w-prose mb-4">{album.description}</p>
              )}

              <button
                onClick={handleShare}
                disabled={sharing}
                className="inline-flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 hover:text-teal-800 text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" /> Share Album
                  </>
                )}
              </button>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold text-slate-800">{posts.length}</p>
              <p className="text-xs text-slate-400">{posts.length === 1 ? 'story' : 'stories'}</p>
            </div>
          </div>

          {/* Author */}
          {album.user && (
            <div className="flex items-center gap-2 mt-5 pt-5 border-t border-slate-100">
              <img
                src={album.user.profilePicture || `https://ui-avatars.com/api/?name=${album.user.username}&background=0d9488&color=fff`}
                alt={album.user.username}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="text-sm text-slate-600">
                by{' '}
                <Link to={`/profile/${album.user.username}`} className="font-semibold text-slate-800 hover:text-teal-600 transition-colors">
                  {album.user.username}
                </Link>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-card text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="font-display text-xl font-semibold text-slate-700 mb-2">No stories yet</h3>
          <p className="text-slate-400 text-sm mb-5">
            {isOwner ? 'Create a post and assign it to this album.' : 'This album has no stories yet.'}
          </p>
          {isOwner && (
            <Link
              to="/create-post"
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Write a Story
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post, idx) => {
            const postLinks = (post as any).postLinks || (post as any).post_links || [];
            const cfg = LINK_TYPE_CONFIG;
            return (
              <div key={(post as any).postId || (post as any).post_id || idx} className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex gap-0">
                  {/* Post image */}
                  {post.image && (
                    <div className="hidden sm:block w-40 shrink-0">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Post content */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <MapPin className="h-3 w-3" /> {post.country_name}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                        <Calendar className="h-3 w-3" />
                        {post.date_of_visit && !isNaN(Date.parse(post.date_of_visit))
                          ? format(new Date(post.date_of_visit), 'MMM d, yyyy')
                          : 'N/A'}
                      </span>
                    </div>

                    <Link
                      to={`/post/${(post as any).postId || (post as any).post_id}`}
                      className="block font-display text-lg font-bold text-slate-900 hover:text-teal-600 transition-colors mb-2 leading-tight"
                    >
                      {post.title}
                    </Link>

                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
                      {post.content}
                    </p>

                    {/* Post links */}
                    {postLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {postLinks.map((link: PostLink) => {
                          const type = cfg[link.linkType] || cfg.other;
                          const Icon = type.icon;
                          return (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:opacity-80 transition-opacity ${type.color}`}
                            >
                              <Icon className="h-3 w-3" />
                              {link.title}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add post CTA for owner */}
      {isOwner && posts.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            to="/create-post"
            className="inline-flex items-center gap-2 border-2 border-dashed border-slate-200 hover:border-teal-400 hover:text-teal-600 text-slate-400 px-6 py-3 rounded-2xl text-sm font-medium transition-all"
          >
            + Add another story to this album
          </Link>
        </div>
      )}
    </div>
  );
};

export default AlbumDetail;
