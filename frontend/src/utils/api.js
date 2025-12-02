const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://momentum-5jip.onrender.com";

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || data?.msg || "Request failed");
  }

  return data;
};

// Auth endpoints
export const login = async (email, password) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const signup = async (email, password, username) => {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, username }),
  });
};

// Habit endpoints
export const getHabits = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/api/habits?${queryString}`);
};

export const getHabitById = async (id) => {
  return apiRequest(`/api/habits/${id}`);
};

export const createHabit = async (habitData) => {
  return apiRequest("/api/habits", {
    method: "POST",
    body: JSON.stringify(habitData),
  });
};

export const updateHabit = async (id, habitData) => {
  return apiRequest(`/api/habits/${id}`, {
    method: "PUT",
    body: JSON.stringify(habitData),
  });
};

export const archiveHabit = async (id, status) => {
  return apiRequest(`/api/habits/${id}/archive`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const deleteHabit = async (id) => {
  return apiRequest(`/api/habits/${id}`, {
    method: "DELETE",
  });
};

// Log endpoints
export const createLog = async (habitId, logDate = null) => {
  return apiRequest(`/api/habits/${habitId}/logs`, {
    method: "POST",
    body: JSON.stringify(logDate ? { log_date: logDate } : {}),
  });
};

export const getLogs = async (habitId, page = 1, limit = 20) => {
  return apiRequest(`/api/habits/${habitId}/logs?page=${page}&limit=${limit}`);
};

export const deleteLog = async (habitId, logId) => {
  return apiRequest(`/api/habits/${habitId}/logs/${logId}`, {
    method: "DELETE",
  });
};

// User endpoints
export const getUserSummary = async () => {
  return apiRequest("/api/user/summary");
};

export const getDailyHistory = async (months = 12) => {
  return apiRequest(`/api/user/history/daily?months=${months}`);
};

export const getMonthlyStats = async () => {
  return apiRequest("/api/user/stats/monthly");
};

export const getHabitPerformance = async () => {
  return apiRequest("/api/user/stats/habit-performance");
};

// Friends endpoints
export const searchUsers = async (username) => {
  return apiRequest("/api/friends/search", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
};

export const sendFriendRequest = async (friendUsername) => {
  return apiRequest("/api/friends/request", {
    method: "POST",
    body: JSON.stringify({ friendUsername }),
  });
};

export const getPendingRequests = async () => {
  return apiRequest("/api/friends/requests");
};

export const acceptFriendRequest = async (friendshipId) => {
  return apiRequest(`/api/friends/accept/${friendshipId}`, {
    method: "POST",
  });
};

export const rejectFriendRequest = async (friendshipId) => {
  return apiRequest(`/api/friends/reject/${friendshipId}`, {
    method: "DELETE",
  });
};

export const getFriends = async () => {
  return apiRequest("/api/friends");
};

export const unfriend = async (friendId) => {
  return apiRequest(`/api/friends/${friendId}`, {
    method: "DELETE",
  });
};

export const getAccountabilityPod = async () => {
  return apiRequest("/api/friends/pod");
};

// Shared habits endpoints
export const shareHabit = async (habitId, partnerId) => {
  return apiRequest("/api/shared", {
    method: "POST",
    body: JSON.stringify({ habitId, partnerId }),
  });
};

export const unshareHabit = async (habitId, partnerId) => {
  return apiRequest(`/api/shared/${habitId}/${partnerId}`, {
    method: "DELETE",
  });
};

export const getSharedHabits = async () => {
  return apiRequest("/api/shared");
};

// Accountability buddy endpoints
export const getOverlappingHabits = async (friendId) => {
  return apiRequest(`/api/friends/${friendId}/overlapping-habits`);
};

export const createBuddy = async (userHabitId, friendHabitId, friendId) => {
  return apiRequest("/api/shared/create-buddy", {
    method: "POST",
    body: JSON.stringify({ userHabitId, friendHabitId, friendId }),
  });
};

export const getBuddyProgress = async (habitId) => {
  return apiRequest(`/api/shared/buddy-progress/${habitId}`);
};

export const removeBuddy = async (sharedHabitId) => {
  return apiRequest(`/api/shared/remove-buddy/${sharedHabitId}`, {
    method: "DELETE",
  });
};

