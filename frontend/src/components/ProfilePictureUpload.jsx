import { useState, useRef } from "react";
import { Upload, X, Loader, CheckCircle, AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://momentum-5jip.onrender.com";

export default function ProfilePictureUpload({ currentPictureUrl, onUploadSuccess }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Only JPEG, PNG, GIF, and WebP images are allowed";
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "File size must be less than 5MB";
    }

    return null;
  };

  const handleFileSelect = (file) => {
    setError("");
    setSuccess(false);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!preview) return;

    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      
      // Get the file from the input
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        setError("No file selected");
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch(`${API_BASE_URL}/api/user/profile/upload-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setPreview(null);
        if (onUploadSuccess) {
          onUploadSuccess(data.profile_picture_url);
        }
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(data.message || "Failed to upload image");
      }
    } catch (err) {
      setError("Error uploading image. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setError("");
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Profile Picture */}
      {currentPictureUrl && !preview && (
        <div className="flex items-center gap-4">
          <img
            src={currentPictureUrl}
            alt="Current profile"
            className="w-20 h-20 rounded-full border-2 border-brand-blue/30 object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="text-sm text-white/60">Current profile picture</div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition ${
          dragActive
            ? "border-brand-blue bg-brand-blue/10"
            : "border-white/20 hover:border-white/40"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
          id="profile-picture-input"
        />

        {!preview ? (
          <label
            htmlFor="profile-picture-input"
            className="flex flex-col items-center gap-3 cursor-pointer"
          >
            <div className="p-4 rounded-full bg-brand-blue/20 border border-brand-blue/30">
              <Upload className="h-8 w-8 text-brand-blue" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-white/60 mt-1">
                JPEG, PNG, GIF, or WebP (max 5MB)
              </p>
            </div>
          </label>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="flex items-center gap-4">
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 rounded-full border-2 border-brand-blue/50 object-cover"
              />
              <div className="flex-1">
                <p className="text-white font-medium">Ready to upload</p>
                <p className="text-sm text-white/60">Preview of your new profile picture</p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg hover:bg-white/10 transition"
                disabled={uploading}
              >
                <X className="h-5 w-5 text-white/70" />
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-black font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload Picture
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">Profile picture uploaded successfully!</p>
        </div>
      )}
    </div>
  );
}
