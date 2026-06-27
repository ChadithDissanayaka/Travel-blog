export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  profile_picture?: string;
  address?: string;
  description?: string;
}

export interface ProfileUser {
  id: number;
  username: string;
  email?: string;
  profilePicture?: string;
  description?: string;
  address?: string;
  createdAt: string;
  followers: number;
  following: number;
  isFollowing: boolean;
}
