import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { commentService } from '../../services/comment.service';
import { Comment } from '../../types/post';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

const CommentSection = ({ postId, comments: initialComments }: CommentSectionProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await commentService.getByPost(postId);
        setComments(data);
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
      await commentService.add(postId, newComment);
      const updated = await commentService.getByPost(postId);
      setComments(updated);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5 text-slate-500" />
        <h3 className="text-lg font-semibold text-slate-800">
          Comments <span className="text-slate-400 font-normal text-base">({comments.length})</span>
        </h3>
      </div>

      {/* Comment input */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-3">
            <img
              src={user.profilePicture || user.profile_picture || `https://ui-avatars.com/api/?name=${user.username}&background=0d9488&color=fff`}
              alt={user.username}
              className="h-9 w-9 rounded-full object-cover shrink-0 mt-1"
            />
            <div className="flex-grow">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts…"
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    !newComment.trim() || submitting
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  {submitting ? 'Posting…' : 'Post comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center mb-8">
          <p className="text-sm text-slate-500">
            <a href="/login" className="text-teal-600 font-semibold hover:text-teal-800">Sign in</a>{' '}
            to join the conversation
          </p>
        </div>
      )}

      {/* Comment list */}
      <div className="space-y-5">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.comment_id} className="flex gap-3">
              <img
                src={comment.profile_picture || `https://ui-avatars.com/api/?name=${comment.author}&background=0d9488&color=fff`}
                alt={comment.author}
                className="h-9 w-9 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="flex-grow">
                <div className="bg-slate-50 rounded-2xl px-4 py-3">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-slate-800">{comment.author}</span>
                    <span className="text-xs text-slate-400">
                      {format(new Date(comment.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{comment.comment_text}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No comments yet — be the first to respond!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
