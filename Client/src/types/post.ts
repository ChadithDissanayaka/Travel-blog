export interface Comment {
  comment_id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  author: string;
  profile_picture: string;
}

export interface BlogPost {
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

export interface DetailPost extends BlogPost {
  userId?: number;
  user_id?: number;
  comments: Comment[];
}
