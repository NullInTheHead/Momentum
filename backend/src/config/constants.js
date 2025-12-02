const HABIT_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
};
const FRIENDSHIP_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
};
const POINTS = {
  HABIT_COMPLETION: 10,
  ALL_HABITS_BONUS: 50,
};
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
const SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
};
const DEFAULT_SORT = {
  HABITS: "created_at",
  LOGS: "log_date",
};
const JWT = {
  EXPIRES_IN: "1h",
};
const USER_SCORE = {
  POINTS_PER_LEVEL: 1000,
  INITIAL_LEVEL: 1,
  INITIAL_SCORE: 0,
};
const DATE_CONSTANTS = {
  MS_PER_DAY: 86400000, 
};
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
const ERROR_MESSAGES = {
  USER_EXISTS: "User already exists",
  USERNAME_TAKEN: "Username already taken",
  EMAIL_IN_USE: "Email already in use",
  INVALID_CREDENTIALS: "Invalid credentials",
  INVALID_EMAIL: "Invalid email format",
  USER_NOT_FOUND: "User not found",
  HABIT_NOT_FOUND: "Habit not found",
  LOG_NOT_FOUND: "Log not found",
  LOG_EXISTS: "Log already exists for this date",
  FRIENDSHIP_NOT_FOUND: "Friendship not found",
  FRIEND_REQUEST_EXISTS: "Friend request already exists",
  FRIEND_REQUEST_NOT_FOUND: "Friend request not found",
  CANNOT_BEFRIEND_SELF: "Cannot send friend request to yourself",
  SHARED_HABIT_NOT_FOUND: "Shared habit not found",
  HABIT_ALREADY_SHARED: "Habit already shared with this friend",
  ALREADY_BUDDIES: "Already accountability buddies for this habit",
  NO_BUDDY_FOR_HABIT: "No accountability buddy for this habit",
  PARTNER_HABIT_NOT_FOUND: "Partner habit not found",
  MUST_BE_FRIENDS: "Must be friends to become accountability buddies",
  FRIENDSHIP_NOT_ACCEPTED: "Friendship not found or not accepted",
  ACCESS_TOKEN_REQUIRED: "Access token required",
  INVALID_TOKEN: "Invalid or expired token",
  SERVER_ERROR: "Server error",
  NO_FILE_UPLOADED: "No file uploaded",
  ALL_FIELDS_REQUIRED: "All fields are required",
  EMAIL_PASSWORD_REQUIRED: "Email and password are required",
};
module.exports = {
  HABIT_STATUS,
  FRIENDSHIP_STATUS,
  POINTS,
  PAGINATION,
  SORT_ORDER,
  DEFAULT_SORT,
  JWT,
  USER_SCORE,
  DATE_CONSTANTS,
  HTTP_STATUS,
  ERROR_MESSAGES,
};
