import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios'; // Import axios for API calls

interface LikeDislikeButtonProps {
  postId: string;
  initialLikes: number;
  initialDislikes: number;
  className?: string;
}

const LikeDislikeButton = ({
  postId,
  initialLikes,
  initialDislikes,
  className = '',
}: LikeDislikeButtonProps) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [dislikeCount, setDislikeCount] = useState(initialDislikes);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleLike = async () => {
    if (!user) {
      // Redirect to login or show login prompt
      alert('Please log in to like posts');
      return;
    }

    try {
      if (liked) {
        // User is unliking
        setLikeCount(likeCount - 1);
        setLiked(false);
        
        // Decrease like count via API
        await axios.post(`http://localhost:3000/api/likes/dislike/${postId}`, {}, {
          withCredentials: true, // Ensure cookies are sent
        });
      } else {
        // User is liking
        setLikeCount(likeCount + 1);
        setLiked(true);

        // If user previously disliked, remove dislike
        if (disliked) {
          setDislikeCount(dislikeCount - 1);
          setDisliked(false);
          
          // Decrease dislike count via API
          await axios.post(`http://localhost:3000/api/likes/like/${postId}`, {}, {
            withCredentials: true, // Ensure cookies are sent
          });
        }
        
        // Increase like count via API
        await axios.post(`http://localhost:3000/api/likes/like/${postId}`, {}, {
          withCredentials: true, // Ensure cookies are sent
        });
      }
    } catch (error) {
      console.error('Error handling like action:', error);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      // Redirect to login or show login prompt
      alert('Please log in to dislike posts');
      return;
    }

    try {
      if (disliked) {
        // User is removing dislike
        setDislikeCount(dislikeCount - 1);
        setDisliked(false);
        
        // Decrease dislike count via API
        await axios.post(`http://localhost:3000/api/likes/like/${postId}`, {}, {
          withCredentials: true, // Ensure cookies are sent
        });
      } else {
        // User is disliking
        setDislikeCount(dislikeCount + 1);
        setDisliked(true);

        // If user previously liked, remove like
        if (liked) {
          setLikeCount(likeCount - 1);
          setLiked(false);
          
          // Decrease like count via API
          await axios.post(`http://localhost:3000/api/likes/dislike/${postId}`, {}, {
            withCredentials: true, // Ensure cookies are sent
          });
        }

        // Increase dislike count via API
        await axios.post(`http://localhost:3000/api/likes/dislike/${postId}`, {}, {
          withCredentials: true, // Ensure cookies are sent
        });
      }
    } catch (error) {
      console.error('Error handling dislike action:', error);
    }
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <button
        onClick={handleLike}
        className={`
          flex items-center space-x-1 transition-colors
          ${liked ? 'text-teal-600' : 'text-gray-500 hover:text-teal-600'}
        `}
        aria-label="Like post"
      >
        <ThumbsUp className="h-5 w-5" />
        <span>{likeCount}</span>
      </button>
      
      <button
        onClick={handleDislike}
        className={`
          flex items-center space-x-1 transition-colors
          ${disliked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}
        `}
        aria-label="Dislike post"
      >
        <ThumbsDown className="h-5 w-5" />
        <span>{dislikeCount}</span>
      </button>
    </div>
  );
};

export default LikeDislikeButton;
