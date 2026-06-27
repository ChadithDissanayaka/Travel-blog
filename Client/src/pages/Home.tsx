import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal, Clock, ThumbsUp, MessageCircle, Compass, X } from 'lucide-react';
import PostCard from '../components/BlogPost/PostCard';
import { postService } from '../services/post.service';
import { BlogPost } from '../types/post';

type SortOption = 'newest' | 'most-liked' | 'most-commented';

const SORT_OPTIONS = [
  { key: 'newest' as SortOption, label: 'Latest', icon: Clock },
  { key: 'most-liked' as SortOption, label: 'Most Loved', icon: ThumbsUp },
  { key: 'most-commented' as SortOption, label: 'Most Discussed', icon: MessageCircle },
];

const Home = () => {
  const location = useLocation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    setSearchQuery(search || '');
  }, [location.search]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let data;
        if (sortOption === 'newest') data = await postService.getRecent();
        else if (sortOption === 'most-liked') data = await postService.getPopular();
        else data = await postService.getMostCommented();

        let filtered = data || [];
        if (searchQuery) {
          filtered = filtered.filter((p: BlogPost) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.country_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.author.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setPosts(filtered);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [sortOption, searchQuery]);

  return (
    <div className="pt-20">
      {/* Hero header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="h-5 w-5 text-teal-600" />
          <span className="text-sm font-semibold text-teal-600 uppercase tracking-widest">Travel Stories</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-3">
          Discover the World
          <br />
          <span className="text-teal-600">Through Travelers</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-xl">
          Real stories from real explorers — find your next adventure or share yours.
        </p>
      </div>

      {/* Search results banner */}
      {searchQuery && (
        <div className="flex items-center justify-between bg-teal-50 border border-teal-100 px-5 py-3.5 rounded-2xl mb-6">
          <p className="text-sm text-teal-800">
            Showing results for <span className="font-bold">"{searchQuery}"</span>
            <span className="ml-2 text-teal-500">({posts.length} found)</span>
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      )}

      {/* Sort filters */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Sort
        </div>
        {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSortOption(key)}
            className={`sort-chip ${sortOption === key ? 'sort-chip-active' : 'sort-chip-inactive'}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card">
              <div className="skeleton h-48 w-full rounded-none" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-6 w-full" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard key={post.post_id} {...post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Compass className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="font-display text-xl font-semibold text-slate-700 mb-2">No stories found</h3>
          <p className="text-slate-400 text-sm mb-5">Try a different search or explore all destinations.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn-primary text-sm"
            >
              View all stories
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
