const { getPrismaClient } = require("../../config/database");
const { formatUsername, formatName } = require("../../utils/formatters");
const { calculateStreak, calculateCurrentStreak } = require("../../utils/streakCalculator");
const { NotFoundError, ConflictError, BadRequestError } = require("../../utils/errors");
const {
  ERROR_MESSAGES,
  USER_SCORE,
  HABIT_STATUS,
  DATE_CONSTANTS,
} = require("../../config/constants");
const prisma = getPrismaClient();
async function getUserSummary(userId) {
  let userScore = await prisma.userScore.findUnique({
    where: { user_id: userId },
  });
  if (!userScore) {
    userScore = await prisma.userScore.create({
      data: {
        user_id: userId,
        total_score: USER_SCORE.INITIAL_SCORE,
        level: USER_SCORE.INITIAL_LEVEL,
      },
    });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [activeHabits, todayLogs, allLogs] = await Promise.all([
    prisma.habit.findMany({
      where: {
        user_id: userId,
        status: HABIT_STATUS.ACTIVE,
      },
      select: {
        habit_id: true,
      },
    }),
    prisma.habitLog.findMany({
      where: {
        user_id: userId,
        log_date: {
          gte: today,
          lt: new Date(today.getTime() + DATE_CONSTANTS.MS_PER_DAY),
        },
      },
    }),
    prisma.habitLog.findMany({
      where: { user_id: userId },
      orderBy: { log_date: "desc" },
    }),
  ]);
  const todayCompletion =
    activeHabits.length > 0
      ? Math.round((todayLogs.length / activeHabits.length) * 100)
      : 0;
  const logsByHabit = {};
  allLogs.forEach((log) => {
    if (!logsByHabit[log.habit_id]) {
      logsByHabit[log.habit_id] = [];
    }
    logsByHabit[log.habit_id].push(log);
  });
  let longestStreak = 0;
  for (const habit of activeHabits) {
    const logs = logsByHabit[habit.habit_id] || [];
    const streak = calculateStreak(logs).longest;
    if (streak > longestStreak) longestStreak = streak;
  }
  return {
    score: userScore.total_score,
    level: userScore.level,
    longestStreak,
    todayCompletion,
    activeHabitsCount: activeHabits.length,
    todayCompletedCount: todayLogs.length,
  };
}
async function getDailyHistory(userId, months) {
  const monthsBack = parseInt(months) || 12;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);
  startDate.setHours(0, 0, 0, 0);
  const logs = await prisma.habitLog.findMany({
    where: {
      user_id: userId,
      log_date: {
        gte: startDate,
      },
    },
    orderBy: {
      log_date: "asc",
    },
  });
  const activeHabits = await prisma.habit.findMany({
    where: {
      user_id: userId,
      status: HABIT_STATUS.ACTIVE,
    },
  });
  const logsByDate = {};
  logs.forEach((log) => {
    const dateKey = new Date(log.log_date).toISOString().split("T")[0];
    if (!logsByDate[dateKey]) {
      logsByDate[dateKey] = [];
    }
    logsByDate[dateKey].push(log.habit_id);
  });
  const dailyData = [];
  const currentDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  while (currentDate <= today) {
    const dateKey = currentDate.toISOString().split("T")[0];
    const dayLogs = logsByDate[dateKey] || [];
    const uniqueHabits = new Set(dayLogs);
    const activeCount = activeHabits.length;
    const completionRate =
      activeCount > 0
        ? Math.round((uniqueHabits.size / activeCount) * 100)
        : 0;
    dailyData.push({
      date: dateKey,
      completionRate,
      completedHabits: uniqueHabits.size,
      totalHabits: activeCount,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return { dailyData };
}
async function getMonthlyStats(userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  const activeHabits = await prisma.habit.findMany({
    where: {
      user_id: userId,
      status: HABIT_STATUS.ACTIVE,
    },
  });
  const logs = await prisma.habitLog.findMany({
    where: {
      user_id: userId,
      log_date: {
        gte: thirtyDaysAgo,
      },
    },
  });
  const totalPossible = activeHabits.length * 30;
  const totalCompleted = logs.length;
  const completed =
    totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  const missed = 100 - completed;
  return {
    completed,
    missed,
    totalCompleted,
    totalPossible,
  };
}
async function getHabitPerformance(userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  const habits = await prisma.habit.findMany({
    where: {
      user_id: userId,
      status: HABIT_STATUS.ACTIVE,
    },
  });
  const logs = await prisma.habitLog.findMany({
    where: {
      user_id: userId,
      log_date: {
        gte: thirtyDaysAgo,
      },
    },
  });
  const habitCompletions = {};
  logs.forEach((log) => {
    habitCompletions[log.habit_id] = (habitCompletions[log.habit_id] || 0) + 1;
  });
  const performance = habits.map((habit) => {
    const completions = habitCompletions[habit.habit_id] || 0;
    const completionRate = Math.round((completions / 30) * 100);
    return {
      habit_id: habit.habit_id,
      name: habit.name,
      completions,
      completionRate,
    };
  });
  performance.sort((a, b) => b.completionRate - a.completionRate);
  return { performance };
}
async function deleteUserAccount(userId) {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
  });
  if (!user) {
    throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  }
  await prisma.$transaction(async (tx) => {
    await tx.userBadge.deleteMany({ where: { user_id: userId } });
    await tx.userScore.deleteMany({ where: { user_id: userId } });
    await tx.sharedHabit.deleteMany({
      where: {
        OR: [{ owner_id: userId }, { partner_id: userId }],
      },
    });
    await tx.friendship.deleteMany({
      where: {
        OR: [{ user_id: userId }, { friend_id: userId }],
      },
    });
    await tx.habitLog.deleteMany({ where: { user_id: userId } });
    await tx.habit.deleteMany({ where: { user_id: userId } });
    await tx.users.delete({ where: { user_id: userId } });
  });
}
async function getUserProfile(userId) {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      name: true,
      username: true,
      email: true,
      profile_picture_url: true,
      created_at: true,
    },
  });
  if (!user) {
    throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  }
  return user;
}
async function updateUserProfile(
  userId,
  { name, username, email, profile_picture_url }
) {
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_EMAIL);
    }
    const existingEmailUser = await prisma.users.findFirst({
      where: {
        email,
        user_id: { not: userId },
      },
    });
    if (existingEmailUser) {
      throw new ConflictError(ERROR_MESSAGES.EMAIL_IN_USE);
    }
  }
  const formattedUsername = username ? formatUsername(username) : undefined;
  if (formattedUsername) {
    const existingUser = await prisma.users.findFirst({
      where: {
        username: formattedUsername,
        user_id: { not: userId },
      },
    });
    if (existingUser) {
      throw new ConflictError(ERROR_MESSAGES.USERNAME_TAKEN);
    }
  }
  const formattedName = name ? formatName(name) : undefined;
  const updatedUser = await prisma.users.update({
    where: { user_id: userId },
    data: {
      ...(formattedName && { name: formattedName }),
      ...(formattedUsername && { username: formattedUsername }),
      ...(email && { email }),
      ...(profile_picture_url !== undefined && { profile_picture_url }),
    },
    select: {
      user_id: true,
      name: true,
      username: true,
      email: true,
      profile_picture_url: true,
      created_at: true,
    },
  });
  return updatedUser;
}
async function uploadProfilePicture(userId, file) {
  if (!file) {
    throw new BadRequestError(ERROR_MESSAGES.NO_FILE_UPLOADED);
  }
  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;
  const updatedUser = await prisma.users.update({
    where: { user_id: userId },
    data: {
      profile_picture_url: base64Image,
    },
    select: {
      user_id: true,
      name: true,
      username: true,
      email: true,
      profile_picture_url: true,
      created_at: true,
    },
  });
  return updatedUser.profile_picture_url;
}
module.exports = {
  getUserSummary,
  getDailyHistory,
  getMonthlyStats,
  getHabitPerformance,
  deleteUserAccount,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
};
