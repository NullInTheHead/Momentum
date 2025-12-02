const {
  getUserSummary,
  getDailyHistory,
  getMonthlyStats,
  getHabitPerformance,
  deleteUserAccount,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
} = require("./services");
const { HTTP_STATUS } = require("../../config/constants");
async function getSummary(req, res) {
  const userId = req.userId;
  const summary = await getUserSummary(userId);
  res.json({
    success: true,
    ...summary,
  });
}
async function getHistory(req, res) {
  const userId = req.userId;
  const { months = "12" } = req.query;
  const history = await getDailyHistory(userId, months);
  res.json({
    success: true,
    ...history,
  });
}
async function getStats(req, res) {
  const userId = req.userId;
  const stats = await getMonthlyStats(userId);
  res.json({
    success: true,
    ...stats,
  });
}
async function getPerformance(req, res) {
  const userId = req.userId;
  const performance = await getHabitPerformance(userId);
  res.json({
    success: true,
    ...performance,
  });
}
async function deleteAccount(req, res) {
  const userId = req.userId;
  await deleteUserAccount(userId);
  res.json({
    success: true,
    message: "Account deleted successfully",
  });
}
async function getProfile(req, res) {
  const userId = req.userId;
  const profile = await getUserProfile(userId);
  res.json({
    success: true,
    profile,
  });
}
async function updateProfile(req, res) {
  const userId = req.userId;
  const { name, username, email, profile_picture_url } = req.body;
  const updatedUser = await updateUserProfile(userId, {
    name,
    username,
    email,
    profile_picture_url,
  });
  res.json({
    success: true,
    message: "Profile updated successfully",
    user: updatedUser,
  });
}
async function uploadPicture(req, res) {
  const userId = req.userId;
  const profile_picture_url = await uploadProfilePicture(userId, req.file);
  res.json({
    success: true,
    message: "Profile picture uploaded successfully",
    profile_picture_url,
  });
}
module.exports = {
  getSummary,
  getHistory,
  getStats,
  getPerformance,
  deleteAccount,
  getProfile,
  updateProfile,
  uploadPicture,
};
