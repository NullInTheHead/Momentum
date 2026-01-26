import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, AtSign, Image, Save, Loader } from "lucide-react";
import ProfilePictureUpload from "../components/ProfilePictureUpload";

import { getProfile, updateProfile } from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    profile_picture_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setFormData({
        name: data.name || "",
        username: data.username || "",
        email: data.email || "",
        profile_picture_url: data.profile_picture_url || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");

    // Track if email has been changed
    if (name === "email" && profile && value !== profile.email) {
      setEmailChanged(true);
    } else if (name === "email" && profile && value === profile.email) {
      setEmailChanged(false);
    }
  };

  const handleUploadSuccess = (newPictureUrl) => {
    setProfile((prev) => ({ ...prev, profile_picture_url: newPictureUrl }));
    setFormData((prev) => ({ ...prev, profile_picture_url: newPictureUrl }));
    setMessage("Profile picture uploaded successfully!");
    setIsError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setMessage("Please enter a valid email address");
      setIsError(true);
      return;
    }

    // Show confirmation if email is being changed
    if (emailChanged) {
      const confirmed = window.confirm(
        "Are you sure you want to change your email address? This will affect how you log in."
      );
      if (!confirmed) {
        return;
      }
    }

    setSaving(true);
    setMessage("");
    setIsError(false);

    try {
      const data = await updateProfile(formData);
      setProfile(data.user);
      setFormData({
        name: data.user.name || "",
        username: data.user.username || "",
        email: data.user.email || "",
        profile_picture_url: data.user.profile_picture_url || "",
      });
      setEmailChanged(false);
      setMessage("Profile updated successfully!");
      setIsError(false);
    } catch (error) {
      setMessage(error.message || "Error updating profile");
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03010D] flex items-center justify-center">
        <div className="text-brand-blue text-xl">Loading...</div>
      </div>
    );
  }

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
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 border border-brand-blue/30">
              <User className="h-8 w-8 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-white/70">Customize your account</p>
            </div>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-xl ${isError
                ? "bg-red-500/20 border border-red-500/30 text-red-400"
                : "bg-green-500/20 border border-green-500/30 text-green-400"
                }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-medium mb-3">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Profile Picture
                </div>
              </label>
              <ProfilePictureUpload
                currentPictureUrl={profile?.profile_picture_url}
                onUploadSuccess={handleUploadSuccess}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="name">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Display Name
                </div>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your display name"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
              <p className="text-xs text-white/60 mt-1">This can be anything you want</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="username">
                <div className="flex items-center gap-2">
                  <AtSign className="h-4 w-4" />
                  Username
                </div>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="unique_username"
                required
                pattern="[a-zA-Z0-9_]+"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
              <p className="text-xs text-white/60 mt-1">
                Must be unique (letters, numbers, and underscores only)
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
              <p className="text-xs text-white/60 mt-1">
                {emailChanged ? (
                  <span className="text-yellow-400">⚠️ Changing your email will affect how you log in</span>
                ) : (
                  "Used for login and notifications"
                )}
              </p>
            </div>

            {/* Account Info */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-white/60">
                Member since:{" "}
                <span className="text-white">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                    : "N/A"}
                </span>
              </p>
            </div>

            {/* Submit Button */}
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
                disabled={saving}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-black font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
