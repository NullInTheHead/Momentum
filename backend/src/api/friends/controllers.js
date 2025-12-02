const {
  searchUsers,
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  getFriends,
  getOverlappingHabits,
} = require("./services");
const { HTTP_STATUS } = require("../../config/constants");
async function search(req, res) {
  const { username } = req.body;
  const users = await searchUsers(username);
  res.json({
    success: true,
    users,
  });
}
async function sendRequest(req, res) {
  const userId = req.userId;
  const { friendUsername } = req.body;
  const friendship = await sendFriendRequest(userId, friendUsername);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Friend request sent",
    friendship,
  });
}
async function getRequests(req, res) {
  const userId = req.userId;
  const requests = await getPendingRequests(userId);
  res.json({
    success: true,
    requests,
  });
}
async function acceptRequest(req, res) {
  const userId = req.userId;
  const { friendshipId } = req.params;
  await acceptFriendRequest(userId, friendshipId);
  res.json({
    success: true,
    message: "Friend request accepted",
  });
}
async function rejectRequest(req, res) {
  const userId = req.userId;
  const { friendshipId } = req.params;
  await rejectFriendRequest(userId, friendshipId);
  res.json({
    success: true,
    message: "Friend request rejected",
  });
}
async function removeFriend(req, res) {
  const userId = req.userId;
  const { friendId } = req.params;
  await unfriend(userId, friendId);
  res.json({
    success: true,
    message: "Friend removed successfully",
  });
}
async function getAll(req, res) {
  const userId = req.userId;
  const friends = await getFriends(userId);
  res.json({
    success: true,
    friends,
  });
}
async function getOverlapping(req, res) {
  const userId = req.userId;
  const { friendId } = req.params;
  const overlapping_habits = await getOverlappingHabits(userId, friendId);
  res.json({
    success: true,
    overlapping_habits,
  });
}
module.exports = {
  search,
  sendRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
  removeFriend,
  getAll,
  getOverlapping,
};
