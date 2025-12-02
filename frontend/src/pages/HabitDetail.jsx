import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHabitById, getLogs, createLog, deleteLog, updateHabit, deleteHabit, getFriends, shareHabit } from "../utils/api";
import { ArrowLeft, Calendar, Flame, Trash2, Edit2, Share2, Users, X } from "lucide-react";

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [friends, setFriends] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadHabit();
    loadLogs();
    loadFriends();
  }, [id, page]);

  const loadHabit = async () => {
    try {
      const data = await getHabitById(id);
      setHabit(data);
    } catch (error) {
      console.error("Error loading habit:", error);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await getLogs(id, page, 20);
      setLogs(data.logs || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const data = await getFriends();
      setFriends(data.friends || []);
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  };

  const handleShare = async (partnerId) => {
    try {
      await shareHabit(id, partnerId);
      alert("Habit shared successfully!");
      setShowShareModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleComplete = async () => {
    try {
      await createLog(id);
      await Promise.all([loadHabit(), loadLogs()]);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!confirm("Delete this log entry?")) return;
    try {
      await deleteLog(id, logId);
      await loadLogs();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteHabit = async () => {
    if (!confirm("Delete this habit? All logs will be deleted.")) return;
    try {
      await deleteHabit(id);
      navigate("/dashboard");
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

  if (!habit) {
    return (
      <div className="min-h-screen bg-[#03010D] flex items-center justify-center">
        <div className="text-red-400">Habit not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03010D] text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <div className="rounded-2xl border border-white/10 bg-card/70 p-8 backdrop-blur mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{habit.name}</h1>
              {habit.goal && <p className="text-white/70">{habit.goal}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition"
                title="Share with friend"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate(`/habits/${id}/edit`)}
                className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleDeleteHabit}
                className="p-2 rounded-xl border border-red-500/30 hover:bg-red-500/10 transition"
              >
                <Trash2 className="h-5 w-5 text-red-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-white/70 mb-2">
                <Flame className="h-5 w-5 text-brand-blue" />
                <span className="text-sm">Current Streak</span>
              </div>
              <p className="text-2xl font-bold text-brand-blue">{habit.current || 0}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-white/70 mb-2">
                <Flame className="h-5 w-5 text-brand-purple" />
                <span className="text-sm">Longest Streak</span>
              </div>
              <p className="text-2xl font-bold text-brand-purple">{habit.longest || 0}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-white/70 mb-2 text-sm">Frequency</div>
              <p className="text-lg font-semibold">{habit.frequency}</p>
            </div>
          </div>

          {!habit.todayCompleted && (
            <button
              onClick={handleComplete}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-black font-semibold hover:opacity-90 transition"
            >
              Mark as Completed Today
            </button>
          )}
          {habit.todayCompleted && (
            <div className="w-full py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-center text-green-400 font-semibold">
              Completed Today
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/70 p-8 backdrop-blur">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-brand-blue" />
            Completion History
          </h2>

          {logs.length === 0 ? (
            <p className="text-white/70 text-center py-8">No completion logs yet</p>
          ) : (
            <>
              <div className="space-y-2 mb-6">
                {logs.map((log) => (
                  <div
                    key={log.log_id}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/20"
                  >
                    <div>
                      <p className="font-semibold">
                        {new Date(log.log_date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-white/60">
                        Completed at {new Date(log.completed_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteLog(log.log_id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-white/70">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="rounded-2xl border border-white/10 bg-card/90 p-6 backdrop-blur max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Share2 className="h-6 w-6 text-brand-blue" />
                  Share Habit
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-white/70 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 mb-4">No friends yet</p>
                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      navigate("/friends");
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-blue text-black font-semibold hover:opacity-90 transition"
                  >
                    Add Friends
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => handleShare(friend.user_id)}
                      className="w-full p-3 rounded-xl border border-white/10 bg-black/20 hover:border-brand-blue/30 hover:bg-black/30 transition text-left"
                    >
                      <p className="font-medium">{friend.username}</p>
                      <p className="text-sm text-white/60">{friend.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

