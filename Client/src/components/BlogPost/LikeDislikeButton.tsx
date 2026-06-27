import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { likeService } from '../../services/like.service';

interface LikeDislikeButtonProps {
  postId: string;
  initialLikes: number;
  initialDislikes: number;
  className?: string;
}

const LikeDislikeButton = ({ postId, initialLikes, initialDislikes, className = '' }: LikeDislikeButtonProps) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [dislikeCount, setDislikeCount] = useState(initialDislikes);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleLike = async () => {
    if (!user) { alert('Please log in to like posts'); return; }
    try {
      if (liked) {
        setLikeCount(likeCount - 1); setLiked(false);
        await likeService.dislike(postId);
      } else {
        setLikeCount(likeCount + 1); setLiked(true);
        if (disliked) { setDislikeCount(dislikeCount - 1); setDisliked(false); }
        await likeService.like(postId);
      }
    } catch (error) { console.error(error); }
  };

  const handleDislike = async () => {
    if (!user) { alert('Please log in to dislike posts'); return; }
    try {
      if (disliked) {
        setDislikeCount(dislikeCount - 1); setDisliked(false);
        await likeService.like(postId);
      } else {
        setDislikeCount(dislikeCount + 1); setDisliked(true);
        if (liked) { setLikeCount(likeCount - 1); setLiked(false); }
        await likeService.dislike(postId);
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
          liked
            ? 'bg-teal-600 text-white shadow-sm'
            : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600'
        }`}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{likeCount}</span>
      </button>

      <button
        onClick={handleDislike}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
          disliked
            ? 'bg-rose-500 text-white shadow-sm'
            : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-500'
        }`}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{dislikeCount}</span>
      </button>
    </div>
  );
};

export default LikeDislikeButton;
