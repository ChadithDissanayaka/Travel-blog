import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3, ImagePlus, X, FolderOpen, Plus, Trash2, Link2, Zap } from 'lucide-react';
import Button from '../components/Common/Button';
import { postService } from '../services/post.service';
import { PostLink } from '../services/postLink.service';
import { albumService, Album } from '../services/album.service';
import { shortLinkService } from '../services/shortLink.service';
import { BlogPost } from '../types/post';
import { useAuth } from '../hooks/useAuth';

const LINK_TYPES = [
  { value: 'hotel',      label: '🏨 Hotel' },
  { value: 'map',        label: '📍 Map' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'attraction', label: '🎟️ Attraction' },
  { value: 'other',      label: '🔗 Other' },
];

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [countryName, setCountryName] = useState('');
  const [dateOfVisit, setDateOfVisit] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Album selector
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');

  // Post links
  const [existingLinks, setExistingLinks] = useState<PostLink[]>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '', linkType: 'other' });
  const [showLinkForm, setShowLinkForm] = useState(false);

  // URL Shortener / Custom Slug state
  const [customSlug, setCustomSlug] = useState('');
  const [existingShortLink, setExistingShortLink] = useState<any>(null);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const postData = await postService.getById(id!);
        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setCountryName(postData.country_name);
        setDateOfVisit(postData.date_of_visit ? postData.date_of_visit.slice(0, 10) : '');
        if (postData.image) setPreviewUrl(postData.image);
        if (postData.album_id) setSelectedAlbumId(String(postData.album_id));
        if (postData.post_links) setExistingLinks(postData.post_links);

        // Fetch existing short link
        try {
          const myLinks = await shortLinkService.getMyLinks();
          const found = myLinks.find((l: any) => l.originalUrl === `${window.location.origin}/post/${id}`);
          if (found) {
            setExistingShortLink(found);
            setCustomSlug(found.slug);
          }
        } catch (err) {
          console.error('Error fetching short link:', err);
        }
      } catch (error) {
        console.error('Error fetching post data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPostData();
  }, [id]);

  useEffect(() => {
    if (!user) return;
    albumService.getUserAlbums(Number(user.id)).then(setAlbums).catch(() => {});
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImage(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim() || !id) return;
    const tempId = Date.now();
    setExistingLinks(prev => [
      ...prev,
      {
        id: tempId,
        title: newLink.title,
        url: newLink.url,
        linkType: newLink.linkType as any,
        postId: Number(id),
        createdAt: '',
      },
    ]);
    setNewLink({ title: '', url: '', linkType: 'other' });
    setShowLinkForm(false);
  };

  const handleDeleteLink = (linkId: number) => {
    setExistingLinks(prev => prev.filter(l => l.id !== linkId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Auto-append any link currently typed in the draft inputs but not added yet
    const finalLinks = [...existingLinks];
    if (newLink.title.trim() && newLink.url.trim()) {
      finalLinks.push({
        id: Date.now(),
        title: newLink.title,
        url: newLink.url,
        linkType: newLink.linkType as any,
        postId: Number(id),
        createdAt: '',
      });
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('countryName', countryName);
    formData.append('dateOfVisit', dateOfVisit);
    formData.append('albumId', selectedAlbumId || '');
    if (image) formData.append('image', image);
    formData.append('postLinks', JSON.stringify(finalLinks.map(l => ({
      title: l.title,
      url: l.url,
      linkType: l.linkType
    }))));

    try {
      await postService.update(id!, formData);

      // Handle shortened URL update/creation
      const originalUrl = `${window.location.origin}/post/${id}`;
      const trimmedSlug = customSlug.trim().toLowerCase();

      if (existingShortLink) {
        if (existingShortLink.slug !== trimmedSlug) {
          // Slug changed, delete the old one
          await shortLinkService.delete(existingShortLink.id).catch(() => {});
          if (trimmedSlug) {
            // Create new one with the new slug
            await shortLinkService.create({ originalUrl, customSlug: trimmedSlug }).catch(() => {});
          } else {
            // If they cleared it, create a random short link instead
            await shortLinkService.create({ originalUrl }).catch(() => {});
          }
        }
      } else {
        // No existing link, create new one
        await shortLinkService.create({
          originalUrl,
          customSlug: trimmedSlug || undefined
        }).catch(() => {});
      }

      navigate(`/post/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-10 w-48 rounded-xl" />
        <div className="bg-white rounded-3xl shadow-card p-8 space-y-5">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!post) return <div className="pt-20 text-center text-slate-500">Post not found</div>;

  return (
    <div className="pt-20 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
          <Edit3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Edit Story</h1>
          <p className="text-slate-500 text-sm">Update your travel experience</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
              placeholder="Your story title…"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
              <input
                type="text"
                value={countryName}
                onChange={(e) => setCountryName(e.target.value)}
                required
                placeholder="Where did you visit? (e.g. Kyoto, Japan)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Visit</label>
              <input
                type="date"
                value={dateOfVisit}
                onChange={(e) => setDateOfVisit(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Album selector */}
          {albums.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5 text-slate-400" /> Trip Album <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <select
                value={selectedAlbumId}
                onChange={e => setSelectedAlbumId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
              >
                <option value="">— No album (standalone post) —</option>
                {albums.map(a => (
                  <option key={a.id} value={a.id}>{a.title} ({a.countryName})</option>
                ))}
              </select>
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ImagePlus className="h-3.5 w-3.5 text-slate-400" /> Cover Image
            </label>
            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden h-48">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setPreviewUrl(null); setImage(null); }}
                  className="absolute top-3 right-3 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 cursor-pointer transition-all">
                <ImagePlus className="h-8 w-8 text-slate-300 mb-2" />
                <span className="text-sm text-slate-400">Click to upload an image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Story Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Custom Slug (Optional URL Shortener) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-teal-500" /> Custom Short Link Slug <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                setCustomSlug(val);
              }}
              placeholder="e.g. my-custom-slug"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
            />
            <p className="mt-1.5 text-xs text-slate-400 font-medium text-slate-400">Specify an optional custom path to share this post easily (e.g. my-slug)</p>
          </div>

          {/* Post Links */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-slate-400" /> Useful Links
            </label>

            {existingLinks.length > 0 && (
              <div className="space-y-2 mb-3">
                {existingLinks.map(link => (
                  <div key={link.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 text-sm">
                    <span className="flex-1 truncate text-slate-700 font-medium">{link.title}</span>
                    <span className="text-slate-400 text-xs truncate max-w-[140px]">{link.url}</span>
                    <button type="button" onClick={() => handleDeleteLink(link.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showLinkForm ? (
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={e => setNewLink(p => ({ ...p, title: e.target.value }))}
                    placeholder="Link title"
                    className="col-span-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
                    placeholder="https://..."
                    className="col-span-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <select
                    value={newLink.linkType}
                    onChange={e => setNewLink(p => ({ ...p, linkType: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {LINK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleAddLink} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors">
                      Add
                    </button>
                    <button type="button" onClick={() => setShowLinkForm(false)} className="px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-100 rounded-xl">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setShowLinkForm(true)} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium py-2">
                <Plus className="h-4 w-4" /> Add a link
              </button>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate(`/post/${id}`)}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>
              <Edit3 className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
