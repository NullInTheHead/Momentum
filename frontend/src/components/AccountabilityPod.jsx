import { useState, useEffect } from "react";
import { getAccountabilityPod } from "../utils/api";
import { Users, CheckCircle2, Circle, Send } from "lucide-react";

export default function AccountabilityPod() {
  const [podData, setPodData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPodData();
  }, []);

  const loadPodData = async () => {
    try {
      const data = await getAccountabilityPod();
      setPodData(data);
    } catch (error) {
      console.error("Error loading pod data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
        <div className="text-white/70">Loading pod...</div>
      </div>
    );
  }

  if (!podData || (!podData.podMembers?.length && !podData.userProgress?.totalHabits)) {
    return (
      <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-6 w-6 text-brand-blue" />
          <h3 className="text-xl font-semibold">Accountability Pod</h3>
        </div>
        <p className="text-white/70 text-sm">
          Add friends and share habits to build your accountability pod!
        </p>
      </div>
    );
  }

  const { podMembers, userProgress } = podData;
  const totalPodHabits = podMembers.reduce((sum, member) => sum + member.totalHabits, 0) + (userProgress?.totalHabits || 0);
  const totalPodCompleted = podMembers.reduce((sum, member) => sum + member.completedHabits, 0) + (userProgress?.completedHabits || 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-6 w-6 text-brand-blue" />
        <h3 className="text-xl font-semibold">Accountability Pod</h3>
      </div>

      {/* Pod Summary */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 border border-brand-blue/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Pod Progress</span>
          <span className="text-sm font-semibold text-brand-blue">
            {totalPodCompleted}/{totalPodHabits}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-brand-blue to-brand-purple h-2 rounded-full transition-all"
            style={{ width: `${totalPodHabits > 0 ? (totalPodCompleted / totalPodHabits) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* User Progress */}
      {userProgress && userProgress.totalHabits > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-black/20 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">You</span>
            <span className="text-xs text-brand-blue">
              {userProgress.completedHabits}/{userProgress.totalHabits} habits
            </span>
          </div>
          <div className="space-y-1">
            {userProgress.sharedHabits.map((habit) => (
              <div key={habit.habit_id} className="flex items-center gap-2 text-xs">
                {habit.completed ? (
                  <CheckCircle2 className="h-3 w-3 text-brand-blue" />
                ) : (
                  <Circle className="h-3 w-3 text-white/30" />
                )}
                <span className={habit.completed ? "text-white" : "text-white/60"}>
                  {habit.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pod Members */}
      {podMembers.length > 0 && (
        <div className="space-y-3">
          {podMembers.map((member) => (
            <div key={member.user_id} className="p-3 rounded-xl bg-black/20 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {member.profile_picture_url && (
                    <img
                      src={member.profile_picture_url}
                      alt={member.username}
                      className="w-6 h-6 rounded-full border border-white/20"
                    />
                  )}
                  <span className="text-sm font-medium">{member.username}</span>
                </div>
                <span className="text-xs text-brand-blue">
                  {member.completedHabits}/{member.totalHabits} habits
                </span>
              </div>
              {member.sharedHabits.length > 0 ? (
                <div className="space-y-1">
                  {member.sharedHabits.map((habit) => (
                    <div key={habit.habit_id} className="flex items-center gap-2 text-xs">
                      {habit.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-brand-blue" />
                      ) : (
                        <Circle className="h-3 w-3 text-white/30" />
                      )}
                      <span className={habit.completed ? "text-white" : "text-white/60"}>
                        {habit.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/50">No shared habits</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

