import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, PenLine } from 'lucide-react';
import PostCard from '../components/BlogPost/PostCard';
import Button from '../components/Common/Button';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/post.service';
import { BlogPost } from '../types/post';

const Blog = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const data = await postService.getByUserId(user.id);
        setPosts(data);
      } catch {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchUserPosts();
  }, [user]);

  return (
    <div className="pt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-teal-600" />
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-widest">My Stories</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-slate-900">My Blog</h1>
          <p className="text-slate-500 mt-1">Manage and share your travel experiences</p>
        </div>
        <Link to="/create-post">
          <Button size="md">
            <PenLine className="h-4 w-4" />
            Write a Story
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card">
              <div className="skeleton h-48 w-full rounded-none" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-6 w-full" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl text-sm">{error}</div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => <PostCard key={post.post_id} {...post} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-card text-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-5">
            <PenLine className="h-7 w-7 text-teal-500" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-800 mb-2">No stories yet</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-xs">
            Your adventures deserve to be shared. Write your first travel story today.
          </p>
          <Link to="/create-post">
            <Button>
              <Plus className="h-4 w-4" />
              Write Your First Story
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Blog;
