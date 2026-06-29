import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PenLine, ImagePlus, Calendar, MapPin, X, FolderOpen, Plus, Trash2, Link2 } from 'lucide-react';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import { postService } from '../services/post.service';
import { albumService, Album } from '../services/album.service';
import { shortLinkService } from '../services/shortLink.service';
import { useAuth } from '../hooks/useAuth';

interface CreatePostFormData {
  title: string;
  content: string;
  visitDate: string;
  image: FileList | null;
  customSlug?: string;
}

interface LinkDraft {
  title: string;
  url: string;
  linkType: string;
}

const LINK_TYPES = [
  { value: 'hotel',      label: '🏨 Hotel' },
  { value: 'map',        label: '📍 Map' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'attraction', label: '🎟️ Attraction' },
  { value: 'other',      label: '🔗 Other' },
];

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Album selector
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');

  // Post links
  const [links, setLinks] = useState<LinkDraft[]>([]);
  const [newLink, setNewLink] = useState<LinkDraft>({ title: '', url: '', linkType: 'other' });
  const [showLinkForm, setShowLinkForm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreatePostFormData>();
  const { onChange: rhfOnChange, ...imageRegisterProps } = register('image');

  useEffect(() => {
    if (!user) return;
    albumService.getUserAlbums(Number(user.id)).then(setAlbums).catch(() => {});
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    rhfOnChange(e);
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const addLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    setLinks(prev => [...prev, { ...newLink }]);
    setNewLink({ title: '', url: '', linkType: 'other' });
    setShowLinkForm(false);
  };

  const removeLink = (idx: number) => setLinks(prev => prev.filter((_, i) => i !== idx));

  const onSubmit = async (data: CreatePostFormData) => {
    if (!country) { setError('Please select a country'); return; }
    try {
      setIsLoading(true);
      setError(null);

      // Auto-append any link that is currently typed in the draft inputs but not added yet
      const finalLinks = [...links];
      if (newLink.title.trim() && newLink.url.trim()) {
        finalLinks.push({ ...newLink });
      }

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('countryName', country);
      formData.append('dateOfVisit', data.visitDate);
      if (selectedAlbumId) formData.append('albumId', selectedAlbumId);
      if (data.image && data.image.length > 0) formData.append('image', data.image[0]);
      if (finalLinks.length > 0) formData.append('postLinks', JSON.stringify(finalLinks));

      const created = await postService.create(formData);

      // Generate a short link for this post
      if (created.post_id) {
        const originalUrl = `${window.location.origin}/post/${created.post_id}`;
        await shortLinkService.create({
          originalUrl,
          customSlug: data.customSlug?.trim() || undefined,
        }).catch((err) => console.error('Failed to create shortened link:', err));
      }

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
          <PenLine className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Write a Story</h1>
          <p className="text-slate-500 text-sm">Share your travel experience with the world</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-card p-8">
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            <span className="mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-5">
          <Input
            label="Story Title"
            placeholder="Give your travel story a captivating title…"
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 5, message: 'At least 5 characters required' },
              maxLength: { value: 100, message: 'Title must be under 100 characters' }
            })}
            error={errors.title?.message}
          />

          {/* Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> Location Visited
              </label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="Where did you visit? (e.g. Kyoto, Japan)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Date of Visit
              </label>
              <input
                type="date"
                {...register('visitDate', { required: 'Visit date is required' })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
              />
              {errors.visitDate && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.visitDate.message}</p>}
            </div>
          </div>

          {/* Album selector */}
          {albums.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5 text-slate-400" /> Add to Trip Album <span className="text-slate-400 font-normal">(optional)</span>
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

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ImagePlus className="h-3.5 w-3.5 text-slate-400" /> Cover Image <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden h-48 mb-2">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-3 right-3 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 cursor-pointer transition-all">
                <ImagePlus className="h-8 w-8 text-slate-300 mb-2" />
                <span className="text-sm text-slate-400">Click to upload an image</span>
                <input type="file" accept="image/*" {...imageRegisterProps} onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Story</label>
            <textarea
              {...register('content', {
                required: 'Content is required',
                minLength: { value: 50, message: 'At least 50 characters required' }
              })}
              rows={10}
              placeholder="Describe your travel experience — what you saw, felt, tasted, and discovered…"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm text-slate-700 placeholder-slate-400 leading-relaxed
                focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none
                ${errors.content ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500 focus:bg-white'}`}
            />
            {errors.content && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.content.message}</p>}
          </div>

          {/* Custom Slug (Optional URL Shortener) */}
          <Input
            label="Custom Short Link Slug (optional)"
            placeholder="e.g. my-custom-slug"
            {...register('customSlug', {
              pattern: {
                value: /^[a-z0-9-]*$/,
                message: 'Only lowercase letters, numbers, and hyphens allowed'
              },
              minLength: { value: 3, message: 'Must be at least 3 characters' },
              maxLength: { value: 50, message: 'Must be under 50 characters' }
            })}
            error={errors.customSlug?.message}
          />

          {/* Post Links */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-slate-400" /> Useful Links <span className="text-slate-400 font-normal">(hotel, map, restaurant…)</span>
            </label>

            {links.length > 0 && (
              <div className="space-y-2 mb-3">
                {links.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 text-sm">
                    <span className="flex-1 truncate text-slate-700 font-medium">{link.title}</span>
                    <span className="text-slate-400 text-xs truncate max-w-[140px]">{link.url}</span>
                    <button type="button" onClick={() => removeLink(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
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
                    placeholder="Link title (e.g. Hotel booking)"
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
                    <button type="button" onClick={addLink} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors">
                      Add
                    </button>
                    <button type="button" onClick={() => setShowLinkForm(false)} className="px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-100 rounded-xl">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLinkForm(true)}
                className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium py-2"
              >
                <Plus className="h-4 w-4" /> Add a link
              </button>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate('/')}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>
              <PenLine className="h-4 w-4" />
              Publish Story
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
