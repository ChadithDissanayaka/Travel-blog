import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PostCard from '../components/BlogPost/PostCard';
import axios from 'axios'; // Import axios for API calls
import { useAuth } from '../hooks/useAuth';
import ProfileHeader from '../components/User/ProfileHeader';

const Profile = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Make the API call to fetch blog posts for the people the user follows
      const response = await axios.get('http://localhost:3000/api/blogposts/following/blogposts', {
        withCredentials: true,
        headers: {
          'x-csrf-token': localStorage.getItem('csrfToken'),
        }  // Ensure cookies are sent
      });

      // Set the fetched posts in the state
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  return (
    <div className="pt-16">
      <ProfileHeader fetchUserPosts={fetchUserPosts} />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Posts from People I Follow</h1>
          <p className="text-gray-600">Discover blog posts from your followed users</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center py-12">
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.post_id} {...post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">You haven't followed anyone yet or they haven't posted any blogs.</p>
          <Link
            to="/edit-user"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Edit Your Profile
          </Link>
        </div>
      )}
    </div>
  );
};

export default Profile;
