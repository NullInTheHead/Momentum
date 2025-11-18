import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://momentum-5jip.onrender.com";

const initialFormState = {
  email: "",
  password: "",
  username: "",
  confirmPassword: "",
};

export default function AuthForm({ mode }) {
  const [formValues, setFormValues] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const isSignIn = mode === "signin";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const resetFeedback = () => {
    setMessage("");
    setIsError(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();

    if (!isSignIn && formValues.password !== formValues.confirmPassword) {
      setMessage("Passwords do not match");
      setIsError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isSignIn ? "/auth/login" : "/auth/signup";
      const payload = isSignIn
        ? {
            email: formValues.email.trim(),
            password: formValues.password,
          }
        : {
            email: formValues.email.trim(),
            username: formValues.username.trim(),
            password: formValues.password,
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.msg ?? data?.message ?? "Something went wrong");
      }

      setMessage(
        isSignIn
          ? "Signed in successfully. Welcome back!"
          : "Account created! You can sign in now."
      );
      setFormValues(initialFormState);
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
        <p className={`text-sm ${isError ? "text-red-400" : "text-brand-blue"}`}>{message}</p>
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
  );
}

