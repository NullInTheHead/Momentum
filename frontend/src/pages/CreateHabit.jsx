import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHabit } from "../utils/api";
import { ArrowLeft } from "lucide-react";

export default function CreateHabit() {
  const [formData, setFormData] = useState({
    name: "",
    frequency: "daily",
    daily_deadline: "",
    goal: "",
    is_shared: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createHabit(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03010D] text-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <div className="rounded-2xl border border-white/10 bg-card/70 p-8 backdrop-blur">
          <h1 className="text-3xl font-bold mb-6">Create New Habit</h1>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="name">
                Habit Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Morning Run"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="frequency">
                Frequency *
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              >
                <option value="daily">Daily</option>
                <option value="3x per week">3x per week</option>
                <option value="5x per week">5x per week</option>
                <option value="weekdays">Weekdays only</option>
                <option value="weekends">Weekends only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="daily_deadline">
                Daily Deadline (Optional)
              </label>
              <input
                type="time"
                id="daily_deadline"
                name="daily_deadline"
                value={formData.daily_deadline}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
              <p className="text-xs text-white/60 mt-1">
                Set a deadline to make this habit appear in Priority section
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="goal">
                Goal (Optional)
              </label>
              <input
                type="text"
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                placeholder="e.g., Run 5km"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_shared"
                name="is_shared"
                checked={formData.is_shared}
                onChange={handleChange}
                className="h-5 w-5 rounded border-white/20 bg-black/20 text-brand-blue focus:ring-brand-blue"
              />
              <label htmlFor="is_shared" className="text-sm">
                Make this habit shareable with accountability partners
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-black font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Habit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

