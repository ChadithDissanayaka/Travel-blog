// src/pages/UrlShortener.tsx
import { useState, useEffect } from 'react';
import { Link2, Trash2, Copy, Check, ExternalLink, BarChart2, Plus, X, Zap } from 'lucide-react';
import { shortLinkService, ShortLink } from '../services/shortLink.service';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const UrlShortener = () => {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const data = await shortLinkService.getMyLinks();
      setLinks(data);
    } catch {
      setError('Failed to load your links.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!originalUrl.trim()) { setError('Please enter a URL.'); return; }
    setCreating(true);
    try {
      const link = await shortLinkService.create({
        originalUrl: originalUrl.trim(),
        customSlug: customSlug.trim() || undefined,
      });
      setLinks(prev => [link, ...prev]);
      setOriginalUrl('');
      setCustomSlug('');
      setShowForm(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this short link? This cannot be undone.')) return;
    try {
      await shortLinkService.delete(id);
      setLinks(prev => prev.filter(l => l.id !== id));
    } catch {
      alert('Failed to delete the link.');
    }
  };

  const handleCopy = (id: number, slug: string) => {
    navigator.clipboard.writeText(`${BASE_URL}/s/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shortUrl = (slug: string) => `${BASE_URL}/s/${slug}`;

  const truncate = (url: string, max = 52) =>
    url.length > max ? url.slice(0, max) + '…' : url;

  return (
    <div className="pt-20 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-teal-600" />
          <span className="text-sm font-semibold text-teal-600 uppercase tracking-widest">URL Shortener</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-3">
          Short Links,
          <br />
          <span className="text-teal-600">Big Impact</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-xl">
          Shorten affiliate links, hotel bookings, and travel resources. Track every click.
        </p>
      </div>

      {/* Create button / Form */}
      <div className="mb-8">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Shorten a URL
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-slate-800">New Short Link</h2>
              <button
                onClick={() => { setShowForm(false); setError(''); setOriginalUrl(''); setCustomSlug(''); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Destination URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://booking.com/hotel/paris..."
                  value={originalUrl}
                  onChange={e => setOriginalUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-800 placeholder-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Custom slug <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
                  <span className="px-3 py-2.5 bg-slate-50 text-slate-400 text-sm border-r border-slate-200 shrink-0">
                    /s/
                  </span>
                  <input
                    type="text"
                    placeholder="paris-hotel"
                    value={customSlug}
                    onChange={e => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none bg-white"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">Leave blank for a random slug. Only lowercase letters, numbers, hyphens.</p>
              </div>
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <X className="h-4 w-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
                >
                  {creating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating…
                    </span>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4" />
                      Create Link
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(''); }}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Links list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
              <div className="skeleton h-4 w-48 mb-3" />
              <div className="skeleton h-3 w-full mb-2" />
              <div className="skeleton h-3 w-24" />
            </div>
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Link2 className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="font-display text-xl font-semibold text-slate-700 mb-2">No links yet</h3>
          <p className="text-slate-400 text-sm">Create your first short link above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map(link => (
            <div key={link.id} className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 hover:border-teal-100 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Short URL */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <a
                      href={shortUrl(link.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 font-semibold text-sm hover:text-teal-800 hover:underline transition-colors"
                    >
                      /s/{link.slug}
                    </a>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                  {/* Original URL */}
                  <p className="text-xs text-slate-400 truncate" title={link.originalUrl}>
                    {truncate(link.originalUrl)}
                  </p>
                  {/* Stats row */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <BarChart2 className="h-3.5 w-3.5 text-teal-500" />
                      {link.clicks.toLocaleString()} {link.clicks === 1 ? 'click' : 'clicks'}
                    </div>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400">
                      {new Date(link.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(link.id, link.slug)}
                    title="Copy short link"
                    className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                  >
                    {copiedId === link.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    title="Delete link"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary footer */}
      {links.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-4">
          <span>{links.length} {links.length === 1 ? 'link' : 'links'} total</span>
          <span>{links.reduce((s, l) => s + l.clicks, 0).toLocaleString()} total clicks</span>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;
