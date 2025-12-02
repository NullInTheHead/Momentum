import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login, signup } from "../utils/api";
import { Sparkles } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState("signin");
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const { login: setAuthToken } = useAuth();
  const navigate = useNavigate();
  const isSignIn = mode === "signin";

  const handleChange = (e) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!isSignIn && formValues.password !== formValues.confirmPassword) {
      setMessage("Passwords do not match");
      setIsError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      let data;
      if (isSignIn) {
        data = await login(formValues.email, formValues.password);
      } else {
        data = await signup(formValues.email, formValues.password, formValues.username);
      }

      if (data.token) {
        setAuthToken(data.token);
        navigate("/dashboard");
      } else {
        setMessage(isSignIn ? "Signed in successfully!" : "Account created! Please sign in.");
        if (!isSignIn) {
          setTimeout(() => setMode("signin"), 2000);
        }
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03010D] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-12 lg:flex-row lg:items-center lg:gap-16">
        <section className="relative flex-1 overflow-hidden rounded-3xl bg-gradient-to-br from-[#150734] via-[#09031A] to-[#020109] p-10 shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(112,35,255,0.5),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(0,194,255,0.35),_transparent_60%)]" />

          <div className="relative flex flex-col gap-10">
            <div>
              <div className="mb-6 flex items-center gap-3 text-lg font-semibold uppercase tracking-[0.3em] text-brand-blue">
                <Sparkles className="h-9 w-9 text-brand-blue" />
                Momentum
              </div>
              <div className="space-y-6">
                <p className="text-4xl font-bold leading-tight text-white md:text-5xl">
                  Build Better Habits.{" "}
                  <span className="text-brand-blue">Stay Consistent.</span>{" "}
                  Track Your Momentum.
                </p>
                <p className="max-w-xl text-lg text-white/70">
                  Momentum transforms your daily routines into a rewarding experience. Gamify your progress,
                  unlock achievements, and build lasting habits with accountability partners.
                </p>
              </div>
            </div>

            <div className="grid gap-6 text-white/80 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm tracking-wider text-brand-blue">FEATURE</p>
                <h3 className="mt-2 text-xl font-semibold">Build Your Streak</h3>
                <p className="mt-2 text-sm text-white/70">Earn rewards by showing up every day.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm tracking-wider text-brand-blue">FEATURE</p>
                <h3 className="mt-2 text-xl font-semibold">Track Progress</h3>
                <p className="mt-2 text-sm text-white/70">Visualize habits with rich analytics.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-md">
          <div className="rounded-[32px] border border-white/10 bg-card/70 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.55)] backdrop-blur">
            <div className="mb-8 flex gap-2 rounded-full bg-white/5 p-1">
              <button
                type="button"
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-all ${
                  isSignIn ? "bg-white text-black shadow" : "text-white/70"
                }`}
                onClick={() => setMode("signin")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-all ${
                  !isSignIn ? "bg-white text-black shadow" : "text-white/70"
                }`}
                onClick={() => setMode("signup")}
              >
                Sign Up
              </button>
            </div>

            <div className="mb-6 space-y-1">
              <p className="text-2xl font-semibold">
                {isSignIn ? "Welcome Back" : "Join the Momentum"}
              </p>
              <p className="text-sm text-white/70">
                {isSignIn
                  ? "Continue your habit-building journey"
                  : "Start tracking your progress today"}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isSignIn && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90" htmlFor="username">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter your full name"
                    value={formValues.username}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formValues.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formValues.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                  required
                />
              </div>

              {!isSignIn && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    required
                  />
                </div>
              )}

              {message && (
                <p className={`text-sm ${isError ? "text-red-400" : "text-brand-blue"}`}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple py-3 text-lg font-semibold text-black shadow-lg shadow-brand-blue/40 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Please wait..." : isSignIn ? "Sign In" : "Create Account"}
              </button>

              <p className="text-center text-xs text-white/40">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

