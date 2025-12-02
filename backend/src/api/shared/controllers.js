const {
  shareHabit,
  unshareHabit,
  getSharedHabits,
  createBuddy,
  getBuddyProgress,
  removeBuddy,
} = require("./services");
async function share(req, res) {
  const userId = req.userId;
  const { habitId, partnerId } = req.body;
  const sharedHabit = await shareHabit(userId, habitId, partnerId);
  res.status(201).json({ 
    success: true,
    message: "Habit shared successfully", 
    sharedHabit 
  });
}
async function unshare(req, res) {
  const userId = req.userId;
  const { habitId, partnerId } = req.params;
  await unshareHabit(userId, habitId, partnerId);
  res.json({ 
    success: true,
    message: "Habit unshared successfully" 
  });
}
async function getAll(req, res) {
  const userId = req.userId;
  const sharedHabits = await getSharedHabits(userId);
  res.json({ 
    success: true,
    sharedHabits 
  });
}
async function create(req, res) {
  const userId = req.userId;
  const { userHabitId, friendHabitId, friendId } = req.body;
  const sharedHabits = await createBuddy(userId, userHabitId, friendHabitId, friendId);
  res.status(201).json({ 
    success: true,
    message: "Accountability buddy relationship created",
    sharedHabits
  });
}
async function getProgress(req, res) {
  const userId = req.userId;
  const { habitId } = req.params;
  const progress = await getBuddyProgress(userId, habitId);
  res.json({
    success: true,
    ...progress
  });
}
async function remove(req, res) {
  const userId = req.userId;
  const { sharedHabitId } = req.params;
  await removeBuddy(userId, sharedHabitId);
  res.json({ 
    success: true,
    message: "Accountability buddy removed successfully" 
  });
}
module.exports = {
  share,
  unshare,
  getAll,
  create,
  getProgress,
  remove,
};
