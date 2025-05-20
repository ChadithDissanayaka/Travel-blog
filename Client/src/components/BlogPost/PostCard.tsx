import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ThumbsUp, ThumbsDown, MessageCircle, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface PostCardProps {
  post_id: number;
  title: string;
  content: string;
  image?: string;
  country_name: string;
  date_of_visit: string;
  author: string;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  profile_picture?: string;
}

const PostCard = ({
  post_id,
  title,
  content,
  image,
  country_name,
  date_of_visit,
  author,
  like_count,
  dislike_count,
  comment_count,
  profile_picture
}: PostCardProps) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(like_count);
  const [dislikeCount, setDislikeCount] = useState(dislike_count);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  // Truncate content for preview
  const truncatedContent = content.length > 150 
    ? `${content.substring(0, 150)}...` 
    : content;

  const handleLike = () => {
    if (!user) return;
    
    if (liked) {
      setLikeCount(likeCount - 1);
      setLiked(false);
    } else {
      setLikeCount(likeCount + 1);
      setLiked(true);
      
      if (disliked) {
        setDislikeCount(dislikeCount - 1);
        setDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (!user) return;
    
    if (disliked) {
      setDislikeCount(dislikeCount - 1);
      setDisliked(false);
    } else {
      setDislikeCount(dislikeCount + 1);
      setDisliked(true);
      
      if (liked) {
        setLikeCount(likeCount - 1);
        setLiked(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 bg-teal-600 text-white px-3 py-1 rounded-tr-md flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {country_name}
          </div>
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-center mb-3">
          <Link to={`/profile/${author}`} className="flex items-center">
            <img 
              src={profile_picture} 
              alt={author}
              className="h-8 w-8 rounded-full mr-2 object-cover"
            />
            <span className="text-sm font-medium text-gray-700">{author}</span>
          </Link>
          <span className="mx-2 text-gray-300">•</span>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {format(new Date(date_of_visit), 'MMM d, yyyy')}
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-2 hover:text-teal-600 transition-colors">
          <Link to={`/post/${post_id}`}>
            {title}
          </Link>
        </h2>
        
        <p className="text-gray-600 mb-4">{truncatedContent}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex space-x-4">
            <button 
              onClick={handleLike}
              disabled // Disable like button
              className={`flex items-center ${liked ? 'text-teal-600' : 'text-gray-500'} hover:text-teal-600 transition-colors cursor-not-allowed`}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{likeCount}</span>
            </button>
            <button 
              onClick={handleDislike}
              disabled // Disable dislike button
              className={`flex items-center ${disliked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors cursor-not-allowed`}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              <span>{dislikeCount}</span>
            </button>
            <Link 
              to={`/post/${post_id}`}
              className="flex items-center text-gray-500 hover:text-blue-500 transition-colors cursor-not-allowed"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{comment_count}</span>
            </Link>
          </div>
          
          <Link 
            to={`/post/${post_id}`} // Linking to the detailed post page
            className="text-teal-600 hover:text-teal-700 font-medium transition-colors cursor-not-allowed"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
