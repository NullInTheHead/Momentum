import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  searchUsers,
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  unfriend,
  getOverlappingHabits,
  createBuddy,
} from "../utils/api";
import {
  ArrowLeft,
  UserPlus,
  Check,
  X,
  Users,
  Search,
  Flame,
  Target,
  UserMinus,
  Heart,
} from "lucide-react";

export default function Friends() {
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const [friendToUnfriend, setFriendToUnfriend] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [overlappingHabits, setOverlappingHabits] = useState([]);
  const [loadingOverlapping, setLoadingOverlapping] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getPendingRequests(),
      ]);
      setFriends(friendsData.friends || []);
      setPendingRequests(requestsData.requests || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFriend = async (friend) => {
    setSelectedFriend(friend);
    setLoadingOverlapping(true);
    try {
      const data = await getOverlappingHabits(friend.user_id);
      setOverlappingHabits(data.overlapping_habits || []);
    } catch (error) {
      console.error("Error loading overlapping habits:", error);
      alert(error.message);
    } finally {
      setLoadingOverlapping(false);
    }
  };

  const handleCreateBuddy = async (habit) => {
    try {
      await createBuddy(habit.user_habit_id, habit.friend_habit_id, selectedFriend.user_id);
      alert("Accountability buddy created!");
      // Reload overlapping habits
      const data = await getOverlappingHabits(selectedFriend.user_id);
      setOverlappingHabits(data.overlapping_habits || []);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const data = await searchUsers(searchQuery.trim());
      setSearchResults(data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
      alert(error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (username) => {
    try {
      await sendFriendRequest(username);
      alert("Friend request sent!");
      setSearchResults([]);
      setSearchQuery("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAcceptRequest = async (friendshipId) => {
    try {
      await acceptFriendRequest(friendshipId);
      await loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRejectRequest = async (friendshipId) => {
    try {
      await rejectFriendRequest(friendshipId);
      await loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUnfriendClick = (friend) => {
    setFriendToUnfriend(friend);
    setShowUnfriendModal(true);
  };

  const handleUnfriendConfirm = async () => {
    if (!friendToUnfriend) return;

    try {
      await unfriend(friendToUnfriend.user_id);
      setShowUnfriendModal(false);
      setFriendToUnfriend(null);
      if (selectedFriend?.user_id === friendToUnfriend.user_id) {
        setSelectedFriend(null);
      }
      await loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03010D] flex items-center justify-center">
        <div className="text-brand-blue text-xl">Loading...</div>
      </div>
    );
  }

  // Friend Detail View
  if (selectedFriend) {
    return (
      <div className="min-h-screen bg-[#03010D] text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <button
            onClick={() => setSelectedFriend(null)}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Friends
          </button>

          <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur mb-6">
            <div className="flex items-center gap-4 mb-6">
              {selectedFriend.profile_picture_url ? (
                <img
                  src={selectedFriend.profile_picture_url}
                  alt={selectedFriend.username}
                  className="w-20 h-20 rounded-full border-2 border-brand-blue/30 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-2 border-brand-blue/30 bg-brand-blue/10 flex items-center justify-center">
                  <Users className="h-10 w-10 text-brand-blue" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{selectedFriend.name || selectedFriend.username}</h1>
                <p className="text-white/60">@{selectedFriend.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-brand-blue" />
                <span className="text-white/70">{selectedFriend.current_streak || 0} day streak</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-blue" />
                <span className="text-white/70">{selectedFriend.active_habits_count || 0} active habits</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-brand-blue" />
              Overlapping Habits
            </h2>

            {loadingOverlapping ? (
              <div className="text-center py-8 text-white/60">Loading...</div>
            ) : overlappingHabits.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                No overlapping habits found. You need matching habit names to become accountability buddies!
              </div>
            ) : (
              <div className="space-y-3">
                {overlappingHabits.map((habit, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-white/10 bg-black/20 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-lg">{habit.habit_name}</p>
                      <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                        <span>Your streak: {habit.user_streak} days</span>
                        <span>Their streak: {habit.friend_streak} days</span>
                      </div>
                    </div>
                    {habit.is_shared ? (
                      <div className="px-4 py-2 rounded-xl bg-brand-blue/20 border border-brand-blue/30 text-brand-blue font-semibold text-sm">
                        Already Buddies
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCreateBuddy(habit)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-black font-semibold hover:opacity-90 transition"
                      >
                        <Heart className="h-4 w-4" />
                        Become Buddies
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03010D] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold mb-8 flex items-center gap-2">
          <Users className="h-10 w-10 text-brand-blue" />
          Friends & Accountability
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-6 py-3 font-semibold transition relative ${
              activeTab === "friends"
                ? "text-brand-blue"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Friends List
            {activeTab === "friends" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-3 font-semibold transition relative ${
              activeTab === "requests"
                ? "text-brand-blue"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-brand-blue text-black font-bold">
                {pendingRequests.length}
              </span>
            )}
            {activeTab === "requests" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`px-6 py-3 font-semibold transition relative ${
              activeTab === "search"
                ? "text-brand-blue"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Search
            {activeTab === "search" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Friends List Tab */}
          {activeTab === "friends" && (
            <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold mb-4">
                Friends ({friends.length})
              </h2>
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/70 mb-4">
                    No friends yet. Search for users to send friend requests!
                  </p>
                  <button
                    onClick={() => setActiveTab("search")}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-black font-semibold hover:opacity-90 transition"
                  >
                    Search for Friends
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.user_id}
                      className="p-5 rounded-xl border border-white/10 bg-black/20 hover:border-brand-blue/30 transition cursor-pointer"
                      onClick={() => handleViewFriend(friend)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {friend.profile_picture_url ? (
                            <img
                              src={friend.profile_picture_url}
                              alt={friend.username}
                              className="w-12 h-12 rounded-full border-2 border-brand-blue/30 object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full border-2 border-brand-blue/30 bg-brand-blue/10 flex items-center justify-center">
                              <Users className="h-6 w-6 text-brand-blue" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-lg">
                              {friend.name || friend.username}
                            </p>
                            <p className="text-sm text-white/60">
                              @{friend.username}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnfriendClick(friend);
                          }}
                          className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition"
                          title="Unfriend"
                        >
                          <UserMinus className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Flame className="h-4 w-4 text-brand-blue" />
                          <span className="text-white/70">
                            {friend.current_streak || 0} day streak
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Target className="h-4 w-4 text-brand-blue" />
                          <span className="text-white/70">
                            {friend.active_habits_count || 0} active habits
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pending Requests Tab */}
          {activeTab === "requests" && (
            <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold mb-4">
                Pending Requests ({pendingRequests.length})
              </h2>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/70">No pending friend requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.friendshipId}
                      className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/20"
                    >
                      <div className="flex items-center gap-3">
                        {request.profile_picture_url ? (
                          <img
                            src={request.profile_picture_url}
                            alt={request.username}
                            className="w-12 h-12 rounded-full border-2 border-brand-blue/30 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full border-2 border-brand-blue/30 bg-brand-blue/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-brand-blue" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">
                            {request.name || request.username}
                          </p>
                          <p className="text-sm text-white/60">
                            @{request.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleAcceptRequest(request.friendshipId)
                          }
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue text-black font-semibold hover:opacity-90 transition"
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleRejectRequest(request.friendshipId)
                          }
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Search className="h-6 w-6 text-brand-blue" />
                Search for Friends
              </h2>
              <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter username to search"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white placeholder:text-white/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-black font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/20"
                    >
                      <div className="flex items-center gap-3">
                        {user.profile_picture_url ? (
                          <img
                            src={user.profile_picture_url}
                            alt={user.username}
                            className="w-12 h-12 rounded-full border-2 border-brand-blue/30 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full border-2 border-brand-blue/30 bg-brand-blue/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-brand-blue" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">
                            {user.name || user.username}
                          </p>
                          <p className="text-sm text-white/60">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user.username)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-black font-semibold hover:opacity-90 transition"
                      >
                        <UserPlus className="h-4 w-4" />
                        Send Request
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !searching && (
                <div className="text-center py-8 text-white/60">
                  No users found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Unfriend Confirmation Modal */}
        {showUnfriendModal && friendToUnfriend && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="rounded-2xl border border-white/10 bg-card/90 p-6 backdrop-blur max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                  <UserMinus className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Unfriend</h3>
                  <p className="text-sm text-white/70">
                    Remove {friendToUnfriend.name || friendToUnfriend.username}?
                  </p>
                </div>
              </div>
              <p className="text-white/60 text-sm mb-6">
                This will remove your friendship and any shared accountability
                buddy relationships. You can send a new friend request later.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUnfriendModal(false);
                    setFriendToUnfriend(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnfriendConfirm}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition font-semibold"
                >
                  Unfriend
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
