import api from "../api/axios";

// Helper to handle response data
const handleResponse = async (request) => {
  const { data } = await request;
  return data;
};

// Auth endpoints
export const login = async (email, password) => {
  return handleResponse(api.post("/auth/login", { email, password }));
};

export const signup = async (email, password, username) => {
  return handleResponse(api.post("/auth/signup", { email, password, username }));
};

export const logout = async () => {
  return handleResponse(api.post("/auth/logout"));
};

// Habit endpoints
export const getHabits = async (params = {}) => {
  return handleResponse(api.get("/api/habits", { params }));
};

export const getHabitById = async (id) => {
  return handleResponse(api.get(`/api/habits/${id}`));
};

export const createHabit = async (habitData) => {
  return handleResponse(api.post("/api/habits", habitData));
};

export const updateHabit = async (id, habitData) => {
  return handleResponse(api.put(`/api/habits/${id}`, habitData));
};

export const archiveHabit = async (id, status) => {
  return handleResponse(api.patch(`/api/habits/${id}/archive`, { status }));
};

export const deleteHabit = async (id) => {
  return handleResponse(api.delete(`/api/habits/${id}`));
};

// Log endpoints
export const createLog = async (habitId, logDate = null) => {
  return handleResponse(api.post(`/api/habits/${habitId}/logs`, logDate ? { log_date: logDate } : {}));
};

export const getLogs = async (habitId, page = 1, limit = 20) => {
  return handleResponse(api.get(`/api/habits/${habitId}/logs`, { params: { page, limit } }));
};

export const deleteLog = async (habitId, logId) => {
  return handleResponse(api.delete(`/api/habits/${habitId}/logs/${logId}`));
};

// User endpoints
export const getUserSummary = async () => {
  return handleResponse(api.get("/api/user/summary"));
};

export const getProfile = async () => {
  return handleResponse(api.get("/api/user/profile"));
};

export const updateProfile = async (profileData) => {
  return handleResponse(api.put("/api/user/profile", profileData));
};

export const uploadProfilePicture = async (formData) => {
  return handleResponse(api.post("/api/user/profile/upload-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }));
};

export const deleteAccount = async () => {
  return handleResponse(api.delete("/api/user/account"));
};

export const getDailyHistory = async (months = 12) => {
  return handleResponse(api.get("/api/user/history/daily", { params: { months } }));
};

export const getMonthlyStats = async () => {
  return handleResponse(api.get("/api/user/stats/monthly"));
};

export const getHabitPerformance = async () => {
  return handleResponse(api.get("/api/user/stats/habit-performance"));
};

// Friends endpoints
export const searchUsers = async (username) => {
  return handleResponse(api.post("/api/friends/search", { username }));
};

export const sendFriendRequest = async (friendUsername) => {
  return handleResponse(api.post("/api/friends/request", { friendUsername }));
};

export const getPendingRequests = async () => {
  return handleResponse(api.get("/api/friends/requests"));
};

export const acceptFriendRequest = async (friendshipId) => {
  return handleResponse(api.post(`/api/friends/accept/${friendshipId}`));
};

export const rejectFriendRequest = async (friendshipId) => {
  return handleResponse(api.delete(`/api/friends/reject/${friendshipId}`));
};

export const getFriends = async () => {
  return handleResponse(api.get("/api/friends"));
};

export const unfriend = async (friendId) => {
  return handleResponse(api.delete(`/api/friends/${friendId}`));
};

export const getAccountabilityPod = async () => {
  return handleResponse(api.get("/api/friends/pod"));
};

// Shared habits endpoints
export const shareHabit = async (habitId, partnerId) => {
  return handleResponse(api.post("/api/shared", { habitId, partnerId }));
};

export const unshareHabit = async (habitId, partnerId) => {
  return handleResponse(api.delete(`/api/shared/${habitId}/${partnerId}`));
};

export const getSharedHabits = async () => {
  return handleResponse(api.get("/api/shared"));
};

// Accountability buddy endpoints
export const getOverlappingHabits = async (friendId) => {
  return handleResponse(api.get(`/api/friends/${friendId}/overlapping-habits`));
};

export const createBuddy = async (userHabitId, friendHabitId, friendId) => {
  return handleResponse(api.post("/api/shared/create-buddy", { userHabitId, friendHabitId, friendId }));
};

export const getBuddyProgress = async (habitId) => {
  return handleResponse(api.get(`/api/shared/buddy-progress/${habitId}`));
};

export const removeBuddy = async (sharedHabitId) => {
  return handleResponse(api.delete(`/api/shared/remove-buddy/${sharedHabitId}`));
};
