import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button';
import { format } from 'date-fns';
import { useState } from 'react';
import axios from 'axios';

const ProfileHeader = ({}) => {
  const { user } = useAuth(); // Get the logged-in user from useAuth

  // If no user is found, you can return null or a loading spinner, etc.
  if (!user) {
    return <div>Loading...</div>;
  }

  const { username, profile_picture, description, address, created_at, followers, following , } = user;

  // State to handle popup visibility and followers/following/unfollowing data
  const [isFollowersPopupOpen, setIsFollowersPopupOpen] = useState(false);
  const [isFollowingPopupOpen, setIsFollowingPopupOpen] = useState(false);
  const [isUnfollowingPopupOpen, setIsUnfollowingPopupOpen] = useState(false);
  const [followerList, setFollowerList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [unfollowingList, setUnfollowingList] = useState([]);

  // Fetch followers list
  const fetchFollowers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/follow/followers', {
        withCredentials: true, // Include cookies with the request
      });
      setFollowerList(response.data);
      setIsFollowersPopupOpen(true);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  // Fetch following list
  const fetchFollowing = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/follow/following', {
        withCredentials: true, // Include cookies with the request
      });
      setFollowingList(response.data);
      setIsFollowingPopupOpen(true);
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  // Fetch unfollowing users list
  const fetchUnfollowing = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/follow/unfollowing-users', {
        withCredentials: true, // Include cookies with the request
      });
      setUnfollowingList(response.data);
      setIsUnfollowingPopupOpen(true);
    } catch (error) {
      console.error("Error fetching unfollowing users:", error);
    }
  };

  // Unfollow user
  const unfollowUser = async (userId) => {
    try {
      await axios.post(`http://localhost:3000/api/follow/unfollow/${userId}`, {}, {
        withCredentials: true, // Include cookies with the request
      });
      setIsFollowingPopupOpen(false);
      
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  // Follow user (same as unfollow but calling the API to follow the user)
  const followUser = async (userId) => {
    try {
      await axios.post(`http://localhost:3000/api/follow/follow/${userId}`, {}, {
        withCredentials: true, // Include cookies with the request
      });
      setIsUnfollowingPopupOpen(false);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="h-32 bg-gradient-to-r from-blue-500 to-teal-500"></div>

      <div className="px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
          <img
            src={profile_picture}
            alt={username}
            className="h-32 w-32 rounded-full border-4 border-white object-cover"
          />

          <div className="mt-4 md:mt-0 md:ml-6 flex-grow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-bold">{username}</h1>

              <div className="mt-2 md:mt-0">
                <Link to="/edit-user">
                  <Button className="bg-light-blue-500 hover:bg-light-blue-600">
                    Edit User
                  </Button>
                </Link>
              </div>
            </div>

            {address && (
              <div className="flex items-center mt-1 text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{address}</span>
              </div>
            )}

            <div className="flex items-center mt-1 text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Joined {format(new Date(created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>

        {description && (
          <p className="text-gray-700 mb-4">{description}</p>
        )}

        <div className="flex items-center space-x-6">
          <button
            onClick={fetchFollowers} // Fetch followers when the button is clicked
            className="flex items-center hover:text-teal-600 transition-colors"
          >
            <Users className="h-4 w-4 mr-1" />
            {/* <span className="font-semibold">{followers}</span> */}
            <span className="ml-1 text-gray-600">Followers</span>
          </button>

          <button
            onClick={fetchFollowing} // Fetch following when the button is clicked
            className="flex items-center hover:text-teal-600 transition-colors"
          >
            <Users className="h-4 w-4 mr-1" />
            {/* <span className="font-semibold">{following}</span> */}
            <span className="ml-1 text-gray-600">Following</span>
          </button>

          <button
            onClick={fetchUnfollowing} // Fetch unfollowing when the button is clicked
            className="flex items-center hover:text-teal-600 transition-colors"
          >
            <Users className="h-4 w-4 mr-1" />
            <span className="ml-1 text-gray-600">Unfollowing</span>
          </button>
        </div>
      </div>

      {/* Popup for Followers List */}
      {isFollowersPopupOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-80">
            <h3 className="text-xl font-semibold mb-4">Followers</h3>
            <div className="space-y-4">
              {followerList.map(follower => (
                <div key={follower.follower_id} className="flex items-center">
                  <span className="ml-3 font-medium">{follower.username}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setIsFollowersPopupOpen(false)}
              className="bg-light-blue-500 hover:bg-light-blue-600 mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Popup for Following List */}
      {isFollowingPopupOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-80">
            <h3 className="text-xl font-semibold mb-4">Following</h3>
            <div className="space-y-4">
              {followingList.map(following => (
                <div key={following.following_id} className="flex items-center justify-between">
                  <span className="ml-3 font-medium">{following.username}</span>
                  <button
                    onClick={() => unfollowUser(following.following_id)} // Unfollow when button is clicked
                    className="px-4 py-1 rounded-full text-sm font-medium bg-teal-600 text-white hover:bg-teal-700"
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setIsFollowingPopupOpen(false)}
              className="bg-light-blue-500 hover:bg-light-blue-600 mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Popup for Unfollowing List */}
      {isUnfollowingPopupOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-80">
            <h3 className="text-xl font-semibold mb-4">Unfollowing</h3>
            <div className="space-y-4">
              {unfollowingList.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <span className="ml-3 font-medium">{user.username}</span>
                  <button
                    onClick={() => followUser(user.id)} // Follow when button is clicked
                    className="px-4 py-1 rounded-full text-sm font-medium bg-teal-600 text-white hover:bg-teal-700"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setIsUnfollowingPopupOpen(false)}
              className="bg-light-blue-500 hover:bg-light-blue-600 mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
