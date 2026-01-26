import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getHabits, createLog, getUserSummary, getPendingRequests, deleteAccount, getProfile } from "../utils/api";
import { Plus, Clock, Target, TrendingUp, LogOut, Calendar, Flame, BarChart3, Sparkles, Users, Settings } from "lucide-react";
import AccountabilityPod from "../components/AccountabilityPod";

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const interval = setInterval(updateTimeLeft, 1000);
    updateTimeLeft();

    // Poll for pending requests every 30 seconds
    const pollInterval = setInterval(loadPendingRequests, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(pollInterval);
    };
  }, []);

  const updateTimeLeft = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    setTimeLeft(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
  };

  const loadData = async () => {
    try {
      const [habitsData, summaryData, profileData] = await Promise.all([
        getHabits({ status: "active", sortBy: "created_at", sortOrder: "desc" }),
        getUserSummary(),
        getProfile(),
      ]);
      setHabits(habitsData.habits || []);
      setSummary(summaryData);
      setProfile(profileData.profile);

      // Load pending requests count
      await loadPendingRequests();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const data = await getPendingRequests();
      setPendingRequestsCount(data.requests?.length || 0);
    } catch (error) {
      console.error("Error loading pending requests:", error);
    }
  };

  const { addToast } = useToast();

  const handleComplete = async (habitId) => {
    try {
      await createLog(habitId);
      await loadData();
      addToast("Habit marked as done!", "success");
    } catch (error) {
      console.error("Error completing habit:", error);
      addToast(error.message || "Failed to complete habit", "error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    addToast("Logged out successfully", "info");
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      // Clear local storage and redirect to login
      logout();
      navigate("/login");
      addToast("Account deleted successfully", "info");
    } catch (error) {
      console.error("Error deleting account:", error);
      addToast(error.message || "Failed to delete account", "error");
    }
  };

  const getPriorityHabits = () => {
    const now = new Date();
    return habits
      .filter((habit) => {
        if (!habit.daily_deadline) return false;
        const [hours, minutes] = habit.daily_deadline.split(":").map(Number);
        const deadline = new Date();
        deadline.setHours(hours, minutes, 0, 0);
        return deadline > now && !habit.todayCompleted;
      })
      .sort((a, b) => {
        const [aHours, aMins] = a.daily_deadline.split(":").map(Number);
        const [bHours, bMins] = b.daily_deadline.split(":").map(Number);
        const aDeadline = new Date();
        aDeadline.setHours(aHours, aMins, 0, 0);
        const bDeadline = new Date();
        bDeadline.setHours(bHours, bMins, 0, 0);
        return aDeadline - bDeadline;
      });
  };

  const getTimeUntilDeadline = (deadline) => {
    const now = new Date();
    const [hours, minutes] = deadline.split(":").map(Number);
    const deadlineTime = new Date();
    deadlineTime.setHours(hours, minutes, 0, 0);
    const diff = deadlineTime - now;
    if (diff <= 0) return "Overdue";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03010D] flex items-center justify-center">
        <div className="text-brand-blue text-xl">Loading...</div>
      </div>
    );
  }

  const priorityHabits = getPriorityHabits();
  const todayHabits = habits.filter((h) => !h.todayCompleted);

  return (
    <div className="min-h-screen bg-[#03010D] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-white/70">Track your momentum today</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Profile Picture */}
            {profile?.profile_picture_url && (
              <button
                onClick={() => navigate("/profile")}
                className="relative group"
                title="Go to Profile"
              >
                <img
                  src={profile.profile_picture_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-brand-blue/30 object-cover group-hover:border-brand-blue/60 transition"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </button>
            )}
            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition"
            >
              <BarChart3 className="h-5 w-5" />
              History
            </button>
            <button
              onClick={() => navigate("/stats")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition"
            >
              <Sparkles className="h-5 w-5" />
              Stats
            </button>
            <button
              onClick={() => navigate("/friends")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition relative"
            >
              <Users className="h-5 w-5" />
              Friends
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full bg-brand-blue text-black font-bold min-w-[20px] text-center">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition"
              title="Profile Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate("/habits/create")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-black font-semibold hover:opacity-90 transition"
            >
              <Plus className="h-5 w-5" />
              New Habit
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 rounded-xl border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-red-400" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
              <div className="flex items-center gap-2 text-white/70 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm">Momentum Score</span>
              </div>
              <p className="text-3xl font-bold text-brand-blue">{summary.score || 0}</p>
              <p className="text-sm text-white/60 mt-1">Level {summary.level || 1}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
              <div className="flex items-center gap-2 text-white/70 mb-2">
                <Flame className="h-5 w-5" />
                <span className="text-sm">Longest Streak</span>
              </div>
              <p className="text-3xl font-bold text-brand-blue">{summary.longestStreak || 0}</p>
              <p className="text-sm text-white/60 mt-1">days</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
              <div className="flex items-center gap-2 text-white/70 mb-2">
                <Target className="h-5 w-5" />
                <span className="text-sm">Today's Progress</span>
              </div>
              <p className="text-3xl font-bold text-brand-blue">{summary.todayCompletion || 0}%</p>
              <p className="text-sm text-white/60 mt-1">
                {summary.todayCompletedCount || 0}/{summary.activeHabitsCount || 0} habits
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
              <div className="flex items-center gap-2 text-white/70 mb-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Time Left Today</span>
              </div>
              <p className="text-3xl font-bold text-brand-blue font-mono">{timeLeft}</p>
              <p className="text-sm text-white/60 mt-1">until reset</p>
            </div>
          </div>
        )}

        {/* Accountability Pod Widget */}
        <div className="mb-8">
          <AccountabilityPod />
        </div>

        {/* Priority Habits */}
        {priorityHabits.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-brand-blue" />
              Priority Habits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priorityHabits.map((habit) => (
                <div
                  key={habit.habit_id}
                  className="rounded-2xl border border-brand-blue/30 bg-gradient-to-br from-brand-blue/10 to-transparent p-6 backdrop-blur cursor-pointer hover:border-brand-blue/50 transition"
                  onClick={() => navigate(`/habit/${habit.habit_id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold">{habit.name}</h3>
                    <span className="text-xs text-brand-blue font-mono">
                      {getTimeUntilDeadline(habit.daily_deadline)}
                    </span>
                  </div>
                  {habit.goal && (
                    <p className="text-sm text-white/70 mb-3">{habit.goal}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Flame className="h-4 w-4 text-brand-blue" />
                      <span>Streak: {habit.current || 0}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete(habit.habit_id);
                      }}
                      className="px-4 py-2 rounded-xl bg-brand-blue text-black font-semibold hover:opacity-90 transition text-sm"
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Habits */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-brand-blue" />
            Today's Habits
          </h2>
          {todayHabits.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card/70 p-12 text-center backdrop-blur">
              {habits.length > 0 ? (
                <>
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-xl font-semibold text-brand-blue mb-2">Amazing work!</p>
                  <p className="text-white/70 mb-4">All {habits.length} habits completed for today!</p>
                  <p className="text-sm text-white/50">Come back tomorrow to continue your streak</p>
                </>
              ) : (
                <>
                  <p className="text-white/70 mb-4">No habits yet. Let's get started!</p>
                  <button
                    onClick={() => navigate("/habits/create")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-black font-semibold hover:opacity-90 transition"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Habit
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayHabits.map((habit) => (
                <div
                  key={habit.habit_id}
                  className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur hover:border-brand-blue/30 transition cursor-pointer"
                  onClick={() => navigate(`/habit/${habit.habit_id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold">{habit.name}</h3>
                    <div className="flex items-center gap-1 text-brand-blue">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-semibold">{habit.current || 0}</span>
                    </div>
                  </div>
                  {habit.goal && (
                    <p className="text-sm text-white/70 mb-4">{habit.goal}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">
                      {habit.frequency}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete(habit.habit_id);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-black font-semibold hover:opacity-90 transition text-sm"
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="rounded-2xl border border-white/10 bg-card/90 p-6 backdrop-blur max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                  <LogOut className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Account Options</h3>
                  <p className="text-sm text-white/70">Choose an action</p>
                </div>
              </div>
              <p className="text-white/60 text-sm mb-6">
                You can logout temporarily or permanently delete your account.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition font-semibold"
                >
                  Logout
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-red-700 hover:bg-red-800 transition font-semibold"
                >
                  Delete Account
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="rounded-2xl border border-red-500/30 bg-card/90 p-6 backdrop-blur max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                  <LogOut className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-red-400">Delete Account</h3>
                  <p className="text-sm text-white/70">This action cannot be undone</p>
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <p className="text-white/90 text-sm font-medium mb-2">⚠️ Warning: Permanent Deletion</p>
                <p className="text-white/70 text-sm">
                  Deleting your account will permanently remove:
                </p>
                <ul className="text-white/70 text-sm mt-2 space-y-1 list-disc list-inside">
                  <li>All your habits and progress</li>
                  <li>Your habit logs and streaks</li>
                  <li>All friendships and shared habits</li>
                  <li>Your profile and account data</li>
                </ul>
                <p className="text-red-400 text-sm font-semibold mt-3">
                  This action cannot be reversed!
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-700 hover:bg-red-800 transition font-semibold"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

