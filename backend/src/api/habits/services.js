const { getPrismaClient } = require("../../config/database");
const { calculateStreak } = require("../../utils/streakCalculator");
const { NotFoundError } = require("../../utils/errors");
const {
  ERROR_MESSAGES,
  HABIT_STATUS,
  PAGINATION,
  DATE_CONSTANTS,
} = require("../../config/constants");
const prisma = getPrismaClient();
async function createHabit({
  userId,
  name,
  frequency,
  daily_deadline,
  goal,
  is_shared,
}) {
  const habit = await prisma.habit.create({
    data: {
      user_id: userId,
      name,
      frequency,
      daily_deadline: daily_deadline || null,
      goal: goal || null,
      is_shared: is_shared || false,
      status: HABIT_STATUS.ACTIVE,
    },
  });
  return habit;
}
async function getHabits({
  userId,
  page,
  limit,
  status,
  search,
  sortBy,
  sortOrder,
}) {
  const pageNum = parseInt(page) || PAGINATION.DEFAULT_PAGE;
  const limitNum = Math.min(
    parseInt(limit) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (pageNum - 1) * limitNum;
  const where = {
    user_id: userId,
    ...(status && { status }),
    ...(search && { name: { contains: search } }),
  };
  const [habits, total] = await Promise.all([
    prisma.habit.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.habit.count({ where }),
  ]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const habitIds = habits.map((h) => h.habit_id);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [allLogs, todayLogs] = await Promise.all([
    prisma.habitLog.findMany({
      where: {
        habit_id: { in: habitIds },
        user_id: userId,
        log_date: {
          gte: oneYearAgo,
        },
      },
      orderBy: { log_date: "desc" },
    }),
    prisma.habitLog.findMany({
      where: {
        habit_id: { in: habitIds },
        user_id: userId,
        log_date: {
          gte: today,
          lt: new Date(today.getTime() + DATE_CONSTANTS.MS_PER_DAY),
        },
      },
    }),
  ]);
  const logsByHabit = {};
  allLogs.forEach((log) => {
    if (!logsByHabit[log.habit_id]) {
      logsByHabit[log.habit_id] = [];
    }
    logsByHabit[log.habit_id].push(log);
  });
  const todayLogSet = new Set(todayLogs.map((log) => log.habit_id));
  const habitsWithStreaks = habits.map((habit) => {
    const logs = logsByHabit[habit.habit_id] || [];
    const streaks = calculateStreak(logs);
    return {
      ...habit,
      ...streaks,
      todayCompleted: todayLogSet.has(habit.habit_id),
    };
  });
  return {
    habits: habitsWithStreaks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}
async function getHabitById({ habitId, userId }) {
  const habit = await prisma.habit.findFirst({
    where: {
      habit_id: parseInt(habitId),
      user_id: userId,
    },
  });
  if (!habit) {
    throw new NotFoundError(ERROR_MESSAGES.HABIT_NOT_FOUND);
  }
  const logs = await prisma.habitLog.findMany({
    where: {
      habit_id: habit.habit_id,
      user_id: userId,
    },
    orderBy: { log_date: "desc" },
  });
  const streaks = calculateStreak(logs);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLog = await prisma.habitLog.findFirst({
    where: {
      habit_id: habit.habit_id,
      user_id: userId,
      log_date: {
        gte: today,
        lt: new Date(today.getTime() + DATE_CONSTANTS.MS_PER_DAY),
      },
    },
  });
  return { ...habit, ...streaks, todayCompleted: !!todayLog };
}
async function updateHabit({
  habitId,
  userId,
  name,
  frequency,
  daily_deadline,
  goal,
  is_shared,
}) {
  const habit = await prisma.habit.findFirst({
    where: {
      habit_id: parseInt(habitId),
      user_id: userId,
    },
  });
  if (!habit) {
    throw new NotFoundError(ERROR_MESSAGES.HABIT_NOT_FOUND);
  }
  const updated = await prisma.habit.update({
    where: { habit_id: parseInt(habitId) },
    data: {
      ...(name && { name }),
      ...(frequency && { frequency }),
      ...(daily_deadline !== undefined && {
        daily_deadline: daily_deadline || null,
      }),
      ...(goal !== undefined && { goal: goal || null }),
      ...(is_shared !== undefined && { is_shared }),
    },
  });
  return updated;
}
async function archiveHabit({ habitId, userId, status }) {
  const habit = await prisma.habit.findFirst({
    where: {
      habit_id: parseInt(habitId),
      user_id: userId,
    },
  });
  if (!habit) {
    throw new NotFoundError(ERROR_MESSAGES.HABIT_NOT_FOUND);
  }
  const newStatus =
    status ||
    (habit.status === HABIT_STATUS.ACTIVE
      ? HABIT_STATUS.ARCHIVED
      : HABIT_STATUS.ACTIVE);
  const updated = await prisma.habit.update({
    where: { habit_id: parseInt(habitId) },
    data: { status: newStatus },
  });
  return updated;
}
async function deleteHabit({ habitId, userId }) {
  const habit = await prisma.habit.findFirst({
    where: {
      habit_id: parseInt(habitId),
      user_id: userId,
    },
  });
  if (!habit) {
    throw new NotFoundError(ERROR_MESSAGES.HABIT_NOT_FOUND);
  }
  await prisma.$transaction([
    prisma.habitLog.deleteMany({
      where: { habit_id: parseInt(habitId) },
    }),
    prisma.habit.delete({
      where: { habit_id: parseInt(habitId) },
    }),
  ]);
}
module.exports = {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  archiveHabit,
  deleteHabit,
};
