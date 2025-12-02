import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getDailyHistory } from "../utils/api";
import { ArrowLeft, Calendar } from "lucide-react";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getDailyHistory(12);
      setHistory(data.dailyData || []);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getColorIntensity = (rate) => {
    if (rate === 0) return "bg-white/5 border border-white/10";
    if (rate < 25) return "bg-brand-blue/20 border border-brand-blue/30";
    if (rate < 50) return "bg-brand-blue/40 border border-brand-blue/50";
    if (rate < 75) return "bg-brand-blue/60 border border-brand-blue/70";
    return "bg-brand-blue border border-brand-blue";
  };

  // Organize data into weeks
  const organizedWeeks = useMemo(() => {
    if (!history.length) return [];

    const weeks = [];
    const firstDate = new Date(history[0].date);
    const startOfWeek = new Date(firstDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start from Sunday

    let currentWeek = [];
    let currentWeekStart = new Date(startOfWeek);
    let dayIndex = 0;

    // Add empty days at the start if needed
    const firstDayOfData = new Date(history[0].date);
    const daysToAdd = firstDayOfData.getDay();
    for (let i = 0; i < daysToAdd; i++) {
      currentWeek.push(null);
    }

    history.forEach((day) => {
      const dayDate = new Date(day.date);
      const dayOfWeek = dayDate.getDay();

      // If we've moved to a new week, save the current week and start a new one
      if (dayOfWeek === 0 && currentWeek.length > 0 && currentWeek.length < 7) {
        // Fill remaining days with null
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push({ startDate: new Date(currentWeekStart), days: currentWeek });
        currentWeek = [];
        currentWeekStart = new Date(dayDate);
        currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      }

      currentWeek.push(day);

      // If week is complete, save it
      if (currentWeek.length === 7) {
        weeks.push({ startDate: new Date(currentWeekStart), days: currentWeek });
        currentWeek = [];
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }
    });

    // Add the last incomplete week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push({ startDate: new Date(currentWeekStart), days: currentWeek });
    }

    return weeks;
  }, [history]);

  // Get month labels - show month when it changes
  const monthLabels = useMemo(() => {
    if (!organizedWeeks.length) return [];
    const labels = [];
    let lastMonth = -1;

    organizedWeeks.forEach((week, weekIndex) => {
      // Check all days in the week to find if a new month starts
      week.days.forEach((day, dayIndex) => {
        if (day) {
          const dayDate = new Date(day.date);
          const month = dayDate.getMonth();
          const dayOfMonth = dayDate.getDate();
          
          // Show month label if it's a new month and it's one of the first days
          if (month !== lastMonth && dayOfMonth <= 7) {
            labels.push({
              weekIndex,
              month: dayDate.toLocaleDateString("en-US", { month: "short" }),
            });
            lastMonth = month;
          }
        }
      });
    });

    return labels;
  }, [organizedWeeks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03010D] flex items-center justify-center">
        <div className="text-brand-blue text-xl">Loading...</div>
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

        <div className="rounded-2xl border border-white/10 bg-card/70 p-8 backdrop-blur">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-brand-blue" />
            Completion History
          </h1>
          <p className="text-white/70 mb-8">Your 12-month habit completion heatmap</p>

          {history.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <p>No completion data yet. Start building habits to see your progress!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {/* Day labels */}
                <div className="flex flex-col gap-1 mr-2">
                  <div className="h-4"></div>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="h-3.5 text-xs text-white/60 flex items-center justify-end w-12">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Weeks grid */}
                <div className="flex gap-1">
                  {organizedWeeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-1">
                      {/* Month label */}
                      {monthLabels.find((label) => label.weekIndex === weekIdx) && (
                        <div className="h-4 text-xs text-white/70 text-left pl-1">
                          {monthLabels.find((label) => label.weekIndex === weekIdx)?.month}
                        </div>
                      )}
                      {!monthLabels.find((label) => label.weekIndex === weekIdx) && (
                        <div className="h-4"></div>
                      )}

                      {/* Days in week */}
                      {week.days.map((day, dayIdx) => {
                        const getTooltipText = (day) => {
                          if (!day) return "";
                          const date = new Date(day.date);
                          const formattedDate = date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          });
                          
                          if (day.completedHabits === 0) {
                            return `${formattedDate}\nNo habits completed`;
                          }
                          
                          const habitText = day.completedHabits === 1 ? "habit" : "habits";
                          return `${formattedDate}\n${day.completedHabits} ${habitText} completed`;
                        };

                        return (
                          <div
                            key={dayIdx}
                            className={`w-3.5 h-3.5 rounded ${day ? getColorIntensity(day.completionRate) : "bg-transparent"} ${
                              day ? "hover:ring-2 hover:ring-brand-blue/50 hover:scale-125 transition-all cursor-pointer" : ""
                            }`}
                            title={getTooltipText(day)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-4 mt-6 text-sm text-white/70">
                <span className="text-white/50 mr-2">Less</span>
                <div className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded bg-white/5 border border-white/10" />
                  <div className="w-3.5 h-3.5 rounded bg-brand-blue/20 border border-brand-blue/30" />
                  <div className="w-3.5 h-3.5 rounded bg-brand-blue/40 border border-brand-blue/50" />
                  <div className="w-3.5 h-3.5 rounded bg-brand-blue/60 border border-brand-blue/70" />
                  <div className="w-3.5 h-3.5 rounded bg-brand-blue border border-brand-blue" />
                </div>
                <span className="text-white/50 ml-2">More</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

