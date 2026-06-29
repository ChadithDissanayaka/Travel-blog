// src/pages/Albums.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, Images, X } from 'lucide-react';
import AlbumCard from '../components/Album/AlbumCard';
import { albumService, Album } from '../services/album.service';
import { userService } from '../services/user.service';
import { useAuth } from '../hooks/useAuth';
import CountryDropdown, { Country } from '../components/Common/CountryDropdown';

const Albums = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  // Tabs and edit states
  const [activeTab, setActiveTab] = useState<'my' | 'recent' | 'following'>('my');
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  
  const [recentAlbums, setRecentAlbums] = useState<Album[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  
  const [followingAlbums, setFollowingAlbums] = useState<Album[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [countryName, setCountryName] = useState('');
  const [selectedCountryData, setSelectedCountryData] = useState<Country | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');

  const isOwner = currentUser?.username === username;

  useEffect(() => {
    const load = async () => {
      if (!username) return;
      setLoading(true);
      try {
        const profile = await userService.getProfileByUsername(username);
        if (!profile) { navigate('/'); return; }
        const data = await albumService.getUserAlbums(profile.id);
        setAlbums(data);
      } catch {
        // handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username, navigate]);

  // Load feed data when tabs change
  useEffect(() => {
    if (!currentUser) return;
    if (activeTab === 'recent') {
      setLoadingRecent(true);
      albumService.getRecentAlbums(6)
        .then(setRecentAlbums)
        .catch(() => {})
        .finally(() => setLoadingRecent(false));
    } else if (activeTab === 'following') {
      setLoadingFollowing(true);
      albumService.getFollowingAlbums()
        .then(setFollowingAlbums)
        .catch(() => {})
        .finally(() => setLoadingFollowing(false));
    }
  }, [activeTab, currentUser]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const startCreate = () => {
    setEditingAlbum(null);
    setTitle('');
    setDescription('');
    setCountryName('');
    setSelectedCountryData(null);
    setCoverFile(null);
    setCoverPreview('');
    setFormError('');
    setShowForm(v => !v);
  };

  const startEdit = (album: Album) => {
    setEditingAlbum(album);
    setTitle(album.title);
    setDescription(album.description || '');
    setCountryName(album.countryName);
    setCoverPreview(album.coverImage || '');
    setCoverFile(null);
    setFormError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim() || !countryName.trim()) { setFormError('Title and country are required.'); return; }
    setCreating(true);

    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', description.trim());
      fd.append('countryName', countryName.trim());
      if (coverFile) fd.append('image', coverFile);

      if (editingAlbum) {
        // Edit existing album
        const updated = await albumService.updateAlbum(editingAlbum.id, fd);
        setAlbums(prev => prev.map(a => a.id === editingAlbum.id ? updated : a));
      } else {
        // Create new album
        const album = await albumService.createAlbum(fd);
        setAlbums(prev => [album, ...prev]);
      }

      setShowForm(false);
      setTitle('');
      setDescription('');
      setCountryName('');
      setSelectedCountryData(null);
      setCoverFile(null);
      setCoverPreview('');
      setEditingAlbum(null);
    } catch (err: any) {
      setFormError(err?.response?.data?.error || 'Failed to submit form.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await albumService.deleteAlbum(id);
      setAlbums(prev => prev.filter(a => a.id !== id));
    } catch {
      alert('Failed to delete album.');
    }
  };

  return (
    <div className="pt-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {isOwner ? 'My Trip Albums' : `${username}'s Albums`}
          </h1>
          <p className="text-slate-500 text-sm">
            {activeTab === 'my' && `${albums.length} ${albums.length === 1 ? 'album' : 'albums'} · photos from the road`}
            {activeTab === 'recent' && 'Explore recent trip collections from all travelers'}
            {activeTab === 'following' && 'Browse albums from travelers you follow'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/profile/${username}`}
            className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors"
          >
            ← Profile
          </Link>
          {isOwner && (
            <button
              onClick={startCreate}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Album
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {isOwner && (
        <div className="flex border-b border-slate-100 mb-8 gap-6">
          <button
            onClick={() => setActiveTab('my')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'my' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            My Albums
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'recent' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Explore Recent
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'following' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Following
          </button>
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold text-slate-800">
              {editingAlbum ? 'Edit Album' : 'New Album'}
            </h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Album title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Two weeks in Japan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  required
                />
              </div>
              <div>
                <CountryDropdown
                  selectedCountry={countryName}
                  onSelect={(val, data) => {
                    setCountryName(val);
                    setSelectedCountryData(data || null);
                  }}
                  label="Country *"
                />
              </div>
            </div>

            {selectedCountryData && (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 transition-all animate-fadeIn">
                <img
                  src={selectedCountryData.flag}
                  alt={`${selectedCountryData.name} flag`}
                  className="w-12 h-8 rounded-lg shadow-sm object-cover"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destination Details</div>
                  <div className="text-sm font-bold text-slate-800">{selectedCountryData.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-600">Currency:</span> {selectedCountryData.currency}
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="A brief description of this trip..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cover photo</label>
              <input type="file" accept="image/*" onChange={handleCoverChange} className="text-sm text-slate-600" />
              {coverPreview && (
                <img src={coverPreview} alt="Cover preview" className="mt-2 h-28 w-48 object-cover rounded-xl border border-slate-200" />
              )}
            </div>
            {formError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">{formError}</div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                {creating ? 'Saving…' : <><Images className="h-4 w-4" /> {editingAlbum ? 'Save Changes' : 'Create Album'}</>}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid rendering by active tab */}
      {activeTab === 'my' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
                  <div className="h-44 w-full bg-slate-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : albums.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl shadow-card">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Images className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-slate-700 mb-2">No albums yet</h3>
              <p className="text-slate-400 text-sm mb-5">Create your first trip album to display photos from your travels.</p>
              {isOwner && (
                <button
                  onClick={startCreate}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
                >
                  <Plus className="h-4 w-4" /> Create Album
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map(album => (
                <AlbumCard
                  key={album.id}
                  {...album}
                  showOwnerControls={isOwner}
                  onDelete={handleDelete}
                  onEdit={startEdit}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'recent' && (
        <>
          {loadingRecent ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
                  <div className="h-44 w-full bg-slate-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentAlbums.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No recent albums available.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentAlbums.map(album => (
                <AlbumCard
                  key={album.id}
                  {...album}
                  showOwnerControls={false}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'following' && (
        <>
          {loadingFollowing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
                  <div className="h-44 w-full bg-slate-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : followingAlbums.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-card">
              <Images className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No albums from followed users yet. Start following travelers to see their albums here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {followingAlbums.map(album => (
                <AlbumCard
                  key={album.id}
                  {...album}
                  showOwnerControls={false}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Albums;
