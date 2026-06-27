import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, UserPlus, UserMinus, UserSearch, X, Edit2 } from 'lucide-react';
import Button from '../Common/Button';
import { format } from 'date-fns';
import { useState } from 'react';
import { followService } from '../../services/follow.service';
import { ProfileUser } from '../../types/user';

interface ProfileHeaderProps {
  profileUser: ProfileUser;
  isLoggedInUser: boolean;
  isFollowing: boolean;
  onRefresh: () => void;
}
interface FollowerItem { follower_id: number; username: string; }
interface FollowingItem { following_id: number; username: string; }
interface UnfollowingItem { id: number; username: string; }

const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
        <h3 className="font-display text-lg font-bold text-slate-800">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
          <X className="h-4 w-4 text-slate-500" />
        </button>
      </div>
      <div className="overflow-y-auto flex-grow px-6 py-4">{children}</div>
    </div>
  </div>
);

const ProfileHeader = ({ profileUser, isLoggedInUser, isFollowing, onRefresh }: ProfileHeaderProps) => {
  const [isFollowersPopupOpen, setIsFollowersPopupOpen] = useState(false);
  const [isFollowingPopupOpen, setIsFollowingPopupOpen] = useState(false);
  const [isUnfollowingPopupOpen, setIsUnfollowingPopupOpen] = useState(false);
  const [followerList, setFollowerList] = useState<FollowerItem[]>([]);
  const [followingList, setFollowingList] = useState<FollowingItem[]>([]);
  const [unfollowingList, setUnfollowingList] = useState<UnfollowingItem[]>([]);

  const fetchFollowers = async () => {
    try { const data = await followService.getFollowers(); setFollowerList(data); setIsFollowersPopupOpen(true); }
    catch (e) { console.error(e); }
  };
  const fetchFollowing = async () => {
    try { const data = await followService.getFollowing(); setFollowingList(data); setIsFollowingPopupOpen(true); }
    catch (e) { console.error(e); }
  };
  const fetchUnfollowing = async () => {
    try { const data = await followService.getUnfollowing(); setUnfollowingList(data); setIsUnfollowingPopupOpen(true); }
    catch (e) { console.error(e); }
  };
  const handleUnfollowUser = async (userId: number) => {
    try {
      await followService.unfollow(userId);
      const data = await followService.getFollowing(); setFollowingList(data);
      onRefresh();
    } catch (e) { console.error(e); }
  };
  const handleFollowUser = async (userId: number) => {
    try {
      await followService.follow(userId);
      const data = await followService.getUnfollowing(); setUnfollowingList(data);
      onRefresh();
    } catch (e) { console.error(e); }
  };
  const handleMainFollowToggle = async () => {
    try {
      if (isFollowing) await followService.unfollow(profileUser.id);
      else await followService.follow(profileUser.id);
      onRefresh();
    } catch (e) { console.error(e); }
  };

  const { username, description, address } = profileUser;
  const profile_picture = profileUser.profilePicture || `https://ui-avatars.com/api/?name=${username}&background=0d9488&color=fff&size=128`;
  const created_at = profileUser.createdAt;

  return (
    <>
      <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-8">
        {/* Banner */}
        <div className="h-36 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }} />
        </div>

        <div className="px-6 pb-7">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-5">
            <div className="relative shrink-0">
              <img
                src={profile_picture}
                alt={username}
                className="w-28 h-28 rounded-2xl border-4 border-white object-cover shadow-md"
              />
            </div>

            <div className="flex-grow pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-900">{username}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    {address && (
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5" /> {address}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-sm text-slate-400">
                      <Calendar className="h-3.5 w-3.5" /> Joined {format(new Date(created_at), 'MMM yyyy')}
                    </span>
                  </div>
                </div>
                {isLoggedInUser ? (
                  <Link to="/edit-user">
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    variant={isFollowing ? 'ghost' : 'primary'}
                    onClick={handleMainFollowToggle}
                  >
                    {isFollowing
                      ? <><UserMinus className="h-4 w-4" /> Unfollow</>
                      : <><UserPlus className="h-4 w-4" /> Follow</>
                    }
                  </Button>
                )}
              </div>
            </div>
          </div>

          {description && (
            <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-prose">{description}</p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-6">
            <button onClick={fetchFollowers} className="flex items-center gap-1.5 text-sm group">
              <span className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{profileUser.followers}</span>
              <span className="text-slate-400 group-hover:text-teal-500 transition-colors">Followers</span>
            </button>
            <button onClick={fetchFollowing} className="flex items-center gap-1.5 text-sm group">
              <span className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{profileUser.following}</span>
              <span className="text-slate-400 group-hover:text-teal-500 transition-colors">Following</span>
            </button>
            {isLoggedInUser && (
              <button onClick={fetchUnfollowing} className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 transition-colors font-medium">
                <UserSearch className="h-4 w-4" /> Find travelers
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      {isFollowersPopupOpen && (
        <Modal title={`Followers (${followerList.length})`} onClose={() => setIsFollowersPopupOpen(false)}>
          {followerList.length > 0 ? (
            <div className="space-y-3">
              {followerList.map(f => (
                <div key={f.follower_id} className="flex items-center gap-3 py-1">
                  <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                    {f.username[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium text-sm text-slate-700">{f.username}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 py-4 text-center">No followers yet.</p>}
        </Modal>
      )}

      {/* Following Modal */}
      {isFollowingPopupOpen && (
        <Modal title={`Following (${followingList.length})`} onClose={() => setIsFollowingPopupOpen(false)}>
          {followingList.length > 0 ? (
            <div className="space-y-3">
              {followingList.map(f => (
                <div key={f.following_id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                      {f.username[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-sm text-slate-700">{f.username}</span>
                  </div>
                  {isLoggedInUser && (
                    <button onClick={() => handleUnfollowUser(f.following_id)} className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50">
                      Unfollow
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 py-4 text-center">Not following anyone yet.</p>}
        </Modal>
      )}

      {/* Discover Modal */}
      {isUnfollowingPopupOpen && (
        <Modal title="Discover Travelers" onClose={() => setIsUnfollowingPopupOpen(false)}>
          {unfollowingList.length > 0 ? (
            <div className="space-y-3">
              {unfollowingList.map(u => (
                <div key={u.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm">
                      {u.username[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-sm text-slate-700">{u.username}</span>
                  </div>
                  <button onClick={() => handleFollowUser(u.id)} className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 py-4 text-center">You're following everyone!</p>}
        </Modal>
      )}
    </>
  );
};

export default ProfileHeader;
