import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios'; // Import axios for API calls

interface Comment {
  comment_id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  author: string;
  profile_picture: string;
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

const CommentSection = ({ postId, comments: initialComments }: CommentSectionProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments from API
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/comments/${postId}`, {
          withCredentials: true, // Ensure cookies are sent
        });
        setComments(response.data);;
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !newComment.trim()) return;

    setSubmitting(true);

    try {
      // Post the new comment to the API
      await axios.post(
        `http://localhost:3000/api/comments/add/${postId}`,
        { commentText: newComment },
        {
          withCredentials: true,
          headers: {
            'x-csrf-token': localStorage.getItem('csrfToken'),
          },
        } // Ensure cookies are sent
      );
      const getcomments = await axios.get(`http://localhost:3000/api/comments/${postId}`, {
        withCredentials: true,
        headers: {
          'x-csrf-token': localStorage.getItem('csrfToken'),
        }, // Ensure cookies are sent
      });
      setComments(getcomments.data);

    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments ({comments.length})</h3>

      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex items-start">
            <img
              src={user.profile_picture}
              alt={user.username}
              className="h-10 w-10 rounded-full mr-3 object-cover"
            />
            <div className="flex-grow">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className={`
                    flex items-center px-4 py-2 rounded-md text-white
                    ${!newComment.trim() || submitting
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700'}
                    transition-colors
                  `}
                >
                  <Send className="h-4 w-4 mr-1" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {!user && (
        <div className="bg-gray-50 p-4 rounded-md text-center mb-6">
          <p>Please <a href="/login" className="text-teal-600 hover:underline">log in</a> to leave a comment.</p>
        </div>
      )}

      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.comment_id} className="flex">
              <img
                src={comment.profile_picture}
                alt={comment.author}
                className="h-10 w-10 rounded-full mr-3 mt-1 object-cover"
              />
              <div className="flex-grow">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <span className="font-medium">{comment.author}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(comment.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.comment_text}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
