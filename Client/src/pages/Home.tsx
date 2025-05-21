import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal, Clock, ThumbsUp, MessageCircle } from 'lucide-react';
import PostCard from '../components/BlogPost/PostCard';
import axios from 'axios'; // Directly use axios for API requests

type SortOption = 'newest' | 'most-liked' | 'most-commented';

const Home = () => {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Parse search query from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [location.search]);

  // Fetch posts based on the selected sorting option
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let response;
        if (sortOption === 'newest') {
          response = await axios.get('http://localhost:3000/api/blogposts/recent');
        } else if (sortOption === 'most-liked') {
          response = await axios.get('http://localhost:3000/api/blogposts/popular');
        } else if (sortOption === 'most-commented') {
          response = await axios.get('http://localhost:3000/api/blogposts/mostCommented');
        }

        // Apply search filter if query exists
        let filteredPosts = response?.data || [];
        if (searchQuery) {
          filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.country_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setPosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [sortOption, searchQuery]);

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  return (
    <div className="pt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Travel Stories</h1>
        <p className="text-gray-600">Explore travel experiences from around the world</p>
      </div>
      
      {/* Search results banner */}
      {searchQuery && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700">
            Showing results for: <span className="font-semibold">{searchQuery}</span>
          </p>
          <button 
            onClick={() => setSearchQuery('')}
            className="text-teal-600 hover:text-teal-800 text-sm mt-1"
          >
            Clear search
          </button>
        </div>
      )}
      
      {/* Sorting options */}
      <div className="flex items-center mb-6 overflow-x-auto pb-2">
        <div className="flex items-center mr-4 text-gray-600">
          <SlidersHorizontal className="h-4 w-4 mr-1" />
          <span>Sort by:</span>
        </div>
        
        <button
          onClick={() => handleSortChange('newest')}
          className={`
            flex items-center px-3 py-1 rounded-full mr-2 whitespace-nowrap
            ${sortOption === 'newest' 
              ? 'bg-teal-100 text-teal-700 border border-teal-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'}`}
        >
          <Clock className="h-4 w-4 mr-1" />
          Newest
        </button>
        
        <button
          onClick={() => handleSortChange('most-liked')}
          className={`
            flex items-center px-3 py-1 rounded-full mr-2 whitespace-nowrap
            ${sortOption === 'most-liked' 
              ? 'bg-teal-100 text-teal-700 border border-teal-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'}`}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          Most Liked
        </button>
        
        <button
          onClick={() => handleSortChange('most-commented')}
          className={` 
            flex items-center px-3 py-1 rounded-full mr-2 whitespace-nowrap
            ${sortOption === 'most-commented' 
              ? 'bg-teal-100 text-teal-700 border border-teal-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'}`}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          Most Commented
        </button>
      </div>
      
      {/* Posts grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Loading posts...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard key={post.post_id} {...post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No posts found matching your search.</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="text-teal-600 hover:text-teal-800"
          >
            View all posts
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
