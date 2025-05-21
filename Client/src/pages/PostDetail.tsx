import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, Edit, Trash2, ArrowLeft } from 'lucide-react';
import CommentSection from '../components/BlogPost/CommentSection';
import LikeDislikeButton from '../components/BlogPost/LikeDislikeButton';
import Button from '../components/Common/Button';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios'; // Directly use axios for API requests

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/blogposts/${id}`, {
          withCredentials: true, // Ensure cookies are sent
        });
        setPost(response.data);  // Save response data
      } catch (err) {
        setError('Error fetching post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]); // Dependency on id, rerun effect when id changes

  // Log the post data after it is fetched and the state is updated
  useEffect(() => {
    if (post) {
      if (!post) {
        navigate('/404');
      }
    }
  }, [post]);

  const handleDelete = async () => {
    try {
      // Make the DELETE request to delete the post
      const response = await axios.delete(`http://localhost:3000/api/blogposts/delete/${id}`, {
        withCredentials: true,
        headers: {
          'x-csrf-token': localStorage.getItem('csrfToken'),
        }  
      });

      if (response.status === 200) {
        navigate('/'); // Redirect to homepage after successful deletion
      }
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="pt-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 max-w-3xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Button>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const isAuthor = user && user.id === post.user_id;

  return (
    <div className="pt-16 max-w-3xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link to="/" className="text-teal-600 hover:text-teal-800 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Travel Stories
        </Link>
      </div>

      {/* Post header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center mb-2 sm:mb-0">
            <Link to={`/profile/${post.author}`} className="flex items-center">
              <img
                src={post.profile_picture}
                alt={post.author}
                className="h-10 w-10 rounded-full mr-2 object-cover"
              />
              <span className="font-medium">{post.author}</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center text-sm text-gray-600">
            <div className="flex items-center mr-4">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(new Date(post.date_of_visit), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{post.country_name}</span>
            </div>
          </div>
        </div>

        {/* Author actions */}
        {isAuthor && (
          <div className="flex mt-4 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/edit-post/${post.post_id}`)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Post
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Post image */}
      {post.image && (
        <div className="mb-6">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-80 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Post content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="prose max-w-none">
          <p className="whitespace-pre-line text-gray-700 leading-relaxed">
            {post.content}
          </p>
        </div>
      </div>

      {/* Interaction section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <LikeDislikeButton
            postId={post.post_id}
            initialLikes={post.like_count}
            initialDislikes={post.dislike_count}
          />

          <div className="text-gray-500">
            {format(new Date(post.date_of_visit), 'MMMM d, yyyy')}
          </div>
        </div>
        {/* Comments */}
        <CommentSection postId={post.post_id} comments={post.comments} />
      </div>

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Post</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
