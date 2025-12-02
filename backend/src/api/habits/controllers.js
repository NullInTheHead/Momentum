const {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  archiveHabit,
  deleteHabit,
} = require("./services");
const { HTTP_STATUS, DEFAULT_SORT } = require("../../config/constants");
async function create(req, res) {
  const { name, frequency, daily_deadline, goal, is_shared } = req.body;
  const userId = req.userId;
  const habit = await createHabit({
    userId,
    name,
    frequency,
    daily_deadline,
    goal,
    is_shared,
  });
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Habit created successfully",
    habit,
  });
}
async function getAll(req, res) {
  const userId = req.userId;
  const {
    page = "1",
    limit = "10",
    status,
    search,
    sortBy = DEFAULT_SORT.HABITS,
    sortOrder = "desc",
  } = req.query;
  const result = await getHabits({
    userId,
    page,
    limit,
    status,
    search,
    sortBy,
    sortOrder,
  });
  res.json({
    success: true,
    ...result,
  });
}
async function getById(req, res) {
  const { id } = req.params;
  const userId = req.userId;
  const habit = await getHabitById({ habitId: id, userId });
  res.json({
    success: true,
    habit,
  });
}
async function update(req, res) {
  const { id } = req.params;
  const userId = req.userId;
  const { name, frequency, daily_deadline, goal, is_shared } = req.body;
  const habit = await updateHabit({
    habitId: id,
    userId,
    name,
    frequency,
    daily_deadline,
    goal,
    is_shared,
  });
  res.json({
    success: true,
    message: "Habit updated successfully",
    habit,
  });
}
async function archive(req, res) {
  const { id } = req.params;
  const userId = req.userId;
  const { status } = req.body;
  const habit = await archiveHabit({ habitId: id, userId, status });
  res.json({
    success: true,
    message: "Habit status updated",
    habit,
  });
}
async function remove(req, res) {
  const { id } = req.params;
  const userId = req.userId;
  await deleteHabit({ habitId: id, userId });
  res.json({
    success: true,
    message: "Habit deleted successfully",
  });
}
module.exports = { create, getAll, getById, update, archive, remove };
