import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Rss, Plus } from 'lucide-react';
import PostCard from '../components/BlogPost/PostCard';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/user.service';
import { postService } from '../services/post.service';
import ProfileHeader from '../components/User/ProfileHeader';
import { ProfileUser } from '../types/user';
import { BlogPost } from '../types/post';

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [followedPosts, setFollowedPosts] = useState<BlogPost[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'feed'>('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoggedInUser = currentUser?.username === username;

  const fetchProfileAndPosts = useCallback(async () => {
    if (!username) return;
    try {
      setLoading(true);
      setError(null);
      const profileData = await userService.getProfileByUsername(username);
      if (!profileData) { setError('User not found'); return; }
      setProfileUser(profileData);
      const userPosts = await postService.getByUserId(profileData.id);
      setPosts(userPosts);
      if (currentUser?.username === username) {
        const feedPosts = await postService.getFollowingPosts();
        setFollowedPosts(feedPosts);
      }
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [username, currentUser]);

  useEffect(() => { fetchProfileAndPosts(); }, [fetchProfileAndPosts]);

  if (loading) {
    return (
      <div className="pt-20">
        <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-8">
          <div className="skeleton h-36 w-full rounded-none" />
          <div className="px-6 pb-7 pt-4 space-y-3">
            <div className="skeleton h-8 w-40 rounded-xl" />
            <div className="skeleton h-4 w-60 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card">
              <div className="skeleton h-48 w-full rounded-none" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-6 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="pt-20 max-w-3xl mx-auto py-12">
        <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl text-center text-sm">
          {error || 'User not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <ProfileHeader
        profileUser={profileUser}
        isLoggedInUser={isLoggedInUser}
        isFollowing={profileUser.isFollowing}
        onRefresh={fetchProfileAndPosts}
      />

      {/* Tabs */}
      {isLoggedInUser && (
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-card mb-8 w-fit">
          {[
            { key: 'posts' as const, label: 'My Posts', icon: BookOpen, count: posts.length },
            { key: 'feed' as const, label: 'Following Feed', icon: Rss, count: followedPosts.length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-white/20' : 'bg-slate-100'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {activeTab === 'posts' ? (
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800 mb-5">
            {isLoggedInUser ? 'My Publications' : `${username}'s Stories`}
          </h2>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => <PostCard key={post.post_id} {...post} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-card text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm mb-5">No stories published yet.</p>
              {isLoggedInUser && (
                <Link
                  to="/create-post"
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Write Your First Story
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800 mb-5">Posts from People I Follow</h2>
          {followedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedPosts.map(post => <PostCard key={post.post_id} {...post} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-card text-center">
              <Rss className="h-10 w-10 text-slate-300 mb-4" />
              <p className="text-slate-500 text-sm">Follow some travelers to see their stories here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
