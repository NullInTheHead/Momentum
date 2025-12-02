import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getHabits, getMonthlyStats, getHabitPerformance } from "../utils/api";
import { ArrowLeft, BarChart3, Sparkles, Flame } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const COLORS = ["#00C2FF", "#6A4BFF", "#0CE6FF"];

export default function Stats() {
  const [habits, setHabits] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [habitPerformance, setHabitPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [constellationPositions, setConstellationPositions] = useState({});
  const [dragging, setDragging] = useState(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (habits.length > 0 && canvasRef.current) {
      drawConstellation();
    }
  }, [habits, constellationPositions]);

  const loadData = async () => {
    try {
      const [habitsData, monthlyData, performanceData] = await Promise.all([
        getHabits({ status: "active" }),
        getMonthlyStats(),
        getHabitPerformance(),
      ]);
      setHabits(habitsData.habits || []);
      setMonthlyStats(monthlyData);
      setHabitPerformance(performanceData.performance || []);
      
      // Initialize constellation positions if not set
      if (Object.keys(constellationPositions).length === 0 && habitsData.habits?.length > 0) {
        const initialPositions = {};
        habitsData.habits.forEach((habit, idx) => {
          const angle = (idx / habitsData.habits.length) * Math.PI * 2;
          const radius = 150;
          initialPositions[habit.habit_id] = {
            x: 300 + Math.cos(angle) * radius,
            y: 300 + Math.sin(angle) * radius,
          };
        });
        setConstellationPositions(initialPositions);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const drawConstellation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections between habits
    ctx.strokeStyle = "rgba(0, 194, 255, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i < habits.length; i++) {
      for (let j = i + 1; j < habits.length; j++) {
        const pos1 = constellationPositions[habits[i].habit_id] || { x: 0, y: 0 };
        const pos2 = constellationPositions[habits[j].habit_id] || { x: 0, y: 0 };
        ctx.beginPath();
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.stroke();
      }
    }

    // Draw habit nodes
    habits.forEach((habit) => {
      const pos = constellationPositions[habit.habit_id] || { x: 300, y: 300 };
      const streak = habit.current || 0;
      const size = Math.max(8, Math.min(20, 8 + streak * 0.5));
      const intensity = Math.min(1, streak / 30);
      
      // Outer glow
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 2);
      gradient.addColorStop(0, `rgba(0, 194, 255, ${intensity * 0.8})`);
      gradient.addColorStop(0.5, `rgba(0, 194, 255, ${intensity * 0.3})`);
      gradient.addColorStop(1, "rgba(0, 194, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Main star
      if (streak >= 30) {
        ctx.fillStyle = "#facc15"; // Gold for milestones
      } else {
        ctx.fillStyle = `rgba(0, 194, 255, ${0.5 + intensity * 0.5})`;
      }
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(habit.name.substring(0, 10), pos.x, pos.y + size + 15);
    });
  };

  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is near a habit node
    for (const habit of habits) {
      const pos = constellationPositions[habit.habit_id] || { x: 0, y: 0 };
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (distance < 30) {
        setDragging(habit.habit_id);
        
        const handleMouseMove = (moveEvent) => {
          const newX = moveEvent.clientX - rect.left;
          const newY = moveEvent.clientY - rect.top;
          
          setConstellationPositions((prev) => ({
            ...prev,
            [habit.habit_id]: {
              x: newX,
              y: newY,
            },
          }));
        };

        const handleMouseUp = () => {
          setDragging(null);
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return;
      }
    }
  };

  const handleCanvasClick = (e) => {
    if (dragging) return; // Don't navigate if we were dragging
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is near a habit node
    for (const habit of habits) {
      const pos = constellationPositions[habit.habit_id] || { x: 0, y: 0 };
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (distance < 30) {
        navigate(`/habit/${habit.habit_id}`);
        return;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03010D] flex items-center justify-center">
        <div className="text-brand-blue text-xl">Loading...</div>
      </div>
    );
  }

  const pieData = monthlyStats
    ? [
        { name: "Completed", value: monthlyStats.completed },
        { name: "Missed", value: monthlyStats.missed },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#03010D] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold mb-8 flex items-center gap-2">
          <BarChart3 className="h-10 w-10 text-brand-blue" />
          Statistics & Analytics
        </h1>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Completion Doughnut Chart */}
          <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold mb-4">Last 30 Days</h2>
            {monthlyStats ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-3xl font-bold text-brand-blue">
                    {monthlyStats.completed}%
                  </p>
                  <p className="text-sm text-white/70">
                    {monthlyStats.totalCompleted} of {monthlyStats.totalPossible} completions
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-white/70 text-center py-12">No data available</p>
            )}
          </div>

          {/* Habit Performance Bar Chart */}
          <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold mb-4">Habit Performance</h2>
            {habitPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={habitPerformance.slice(0, 5)}>
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "rgba(255, 255, 255, 0.7)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 16, 40, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="completionRate" fill="#00C2FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-white/70 text-center py-12">No data available</p>
            )}
          </div>
        </div>

        {/* Momentum Constellation */}
        <div className="rounded-2xl border border-white/10 bg-card/70 p-6 backdrop-blur">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-brand-blue" />
            <h2 className="text-2xl font-semibold">Momentum Constellation</h2>
          </div>
          <p className="text-white/70 mb-6">
            Your habits as stars in a constellation. Click and drag to organize. Click a star to view details.
          </p>
          
          {habits.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <p>Create habits to build your constellation!</p>
            </div>
          ) : (
            <div className="relative">
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={600}
                  className="border border-white/10 rounded-xl cursor-pointer max-w-full"
                  style={{ maxHeight: "600px" }}
                  onClick={handleCanvasClick}
                  onMouseDown={handleCanvasMouseDown}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-blue/50" />
                  <span>Active habit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#facc15]" />
                  <span>30+ day streak (Gold)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-brand-blue" />
                  <span>Size = Streak length</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

