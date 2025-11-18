import { useState } from "react";
import AuthForm from "./components/AuthForm.jsx";

const features = [
  {
    title: "Build Your Streak",
    description: "Earn rewards by showing up every day.",
  },
  {
    title: "Track Progress",
    description: "Visualize habits with rich analytics.",
  },
];

const stats = [
  { label: "Habit builders", value: "32k+" },
  { label: "Accountability groups", value: "4.8k" },
  { label: "Avg. streak", value: "24 days" },
];

function App() {
  const [mode, setMode] = useState("signin");

  const isSignIn = mode === "signin";

  return (
    <div className="min-h-screen bg-[#03010D] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-12 lg:flex-row lg:items-center lg:gap-16">
        <section className="relative flex-1 overflow-hidden rounded-3xl bg-gradient-to-br from-[#150734] via-[#09031A] to-[#020109] p-10 shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(112,35,255,0.5),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(0,194,255,0.35),_transparent_60%)]" />

          <div className="relative flex flex-col gap-10">
            <div>
              <div className="mb-6 flex items-center gap-3 text-lg font-semibold uppercase tracking-[0.3em] text-brand-blue">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-2xl">
                  🔥
                </span>
                Momentum
              </div>
              <div className="space-y-6">
                <p className="text-4xl font-bold leading-tight text-white md:text-5xl">
                  Build Better Habits.{" "}
                  <span className="text-brand-blue">Stay Consistent.</span>{" "}
                  Track Your Momentum.
                </p>
                <p className="max-w-xl text-lg text-white/70">
                  Momentum turns daily routines into a rewarding experience. Gamify progress,
                  unlock achievements, and build lasting habits with accountability partners.
                </p>
              </div>
            </div>

            <div className="grid gap-6 text-white/80 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <p className="text-sm tracking-wider text-brand-blue">FEATURE</p>
                  <h3 className="mt-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 rounded-2xl border border-white/5 bg-black/20 p-6 backdrop-blur sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-brand-blue">{stat.value}</p>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
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

            <AuthForm mode={mode} />
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
