function validateShareHabit(req, res, next) {
  const { habitId, partnerId } = req.body;
  if (!habitId || !partnerId) {
    return res.status(400).json({ error: "Habit ID and Partner ID are required" });
  }
  next();
}
function validateCreateBuddy(req, res, next) {
  const { userHabitId, friendHabitId, friendId } = req.body;
  if (!userHabitId || !friendHabitId || !friendId) {
    return res.status(400).json({ error: "User habit ID, friend habit ID, and friend ID are required" });
  }
  next();
}
module.exports = { validateShareHabit, validateCreateBuddy };
