import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Common/Button';
import { userService } from '../services/user.service';
import { useNavigate } from 'react-router-dom';
import { UserCircle2, Camera, MapPin, FileText, Save } from 'lucide-react';

const EditUser = () => {
  const { user } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [username, setUsername] = useState(user?.username || '');
  const [address, setAddress] = useState(user?.address || '');
  const [description, setDescription] = useState(user?.description || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.append('username', username);
    formData.append('address', address);
    formData.append('description', description);
    if (image) formData.append('image', image);
    try {
      const updatedUser = await userService.updateProfile(formData);
      if (updatedUser) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          username: updatedUser.username,
          address: updatedUser.address,
          description: updatedUser.description,
          profile_picture: updatedUser.profilePicture,
        }));
        navigate(`/profile/${username}`);
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const currentAvatar = avatarPreview || user?.profilePicture || user?.profile_picture
    || `https://ui-avatars.com/api/?name=${username}&background=0d9488&color=fff&size=128`;

  return (
    <div className="pt-20 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
          <UserCircle2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-slate-500 text-sm">Update your personal details</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          <span>⚠ {error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-card p-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group mb-3">
            <img
              src={currentAvatar}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="h-6 w-6 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-slate-400">Hover to change photo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> Location
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Where are you based?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" /> Bio
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the world about yourself and your travels…"
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
