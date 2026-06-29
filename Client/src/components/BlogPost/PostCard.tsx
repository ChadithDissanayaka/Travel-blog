import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ThumbsUp, ThumbsDown, MessageCircle, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { BlogPost } from '../../types/post';

export type PostCardProps = BlogPost;

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

  const truncatedContent = content.length > 120
    ? `${content.substring(0, 120)}…`
    : content;

  const handleLike = () => {
    if (!user) return;
    if (liked) { setLikeCount(likeCount - 1); setLiked(false); }
    else {
      setLikeCount(likeCount + 1); setLiked(true);
      if (disliked) { setDislikeCount(dislikeCount - 1); setDisliked(false); }
    }
  };

  const handleDislike = () => {
    if (!user) return;
    if (disliked) { setDislikeCount(dislikeCount - 1); setDisliked(false); }
    else {
      setDislikeCount(dislikeCount + 1); setDisliked(true);
      if (liked) { setLikeCount(likeCount - 1); setLiked(false); }
    }
  };

  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      {/* Image */}
      <Link to={`/post/${post_id}`} className="block relative overflow-hidden" style={{ paddingBottom: '60%' }}>
        {image ? (
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
            <MapPin className="h-10 w-10 text-white/50" />
          </div>
        )}
        {/* Country badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            <MapPin className="h-3 w-3" />
            {country_name}
          </span>
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-grow p-5">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-3">
          <Link to={`/profile/${author}`} className="flex items-center gap-2 group/author">
            <img
              src={profile_picture || `https://ui-avatars.com/api/?name=${author}&background=0d9488&color=fff`}
              alt={author}
              className="h-7 w-7 rounded-full object-cover ring-2 ring-white"
            />
            <span className="text-sm font-medium text-slate-700 group-hover/author:text-teal-600 transition-colors">
              {author}
            </span>
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <div className="flex items-center text-xs text-slate-400 gap-1">
            <Calendar className="h-3 w-3" />
            {date_of_visit && !isNaN(Date.parse(date_of_visit))
              ? format(new Date(date_of_visit), 'MMM d, yyyy')
              : 'N/A'}
          </div>
        </div>

        {/* Title */}
        <h2 className="font-display text-lg font-semibold text-slate-800 leading-snug mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
          <Link to={`/post/${post_id}`}>{title}</Link>
        </h2>

        {/* Excerpt */}
        <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-grow line-clamp-3">
          {truncatedContent}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-teal-600 font-medium' : 'text-slate-400 hover:text-teal-600'}`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={handleDislike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${disliked ? 'text-rose-500 font-medium' : 'text-slate-400 hover:text-rose-500'}`}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{dislikeCount}</span>
            </button>
            <Link to={`/post/${post_id}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-500 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span>{comment_count}</span>
            </Link>
          </div>
          <Link
            to={`/post/${post_id}`}
            className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors"
          >
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
