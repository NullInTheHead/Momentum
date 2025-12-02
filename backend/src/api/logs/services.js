const { getPrismaClient } = require("../../config/database");
const { NotFoundError, BadRequestError } = require("../../utils/errors");
const {
  ERROR_MESSAGES,
  POINTS,
  USER_SCORE,
  HABIT_STATUS,
  DATE_CONSTANTS,
  PAGINATION,
} = require("../../config/constants");
const prisma = getPrismaClient();
async function updateUserScore(userId, points) {
  let userScore = await prisma.userScore.findUnique({
    where: { user_id: userId },
  });
  if (!userScore) {
    userScore = await prisma.userScore.create({
      data: {
        user_id: userId,
        total_score: points,
        level: USER_SCORE.INITIAL_LEVEL,
      },
    });
  } else {
    const newScore = userScore.total_score + points;
    const newLevel = Math.floor(newScore / USER_SCORE.POINTS_PER_LEVEL) + 1;
    userScore = await prisma.userScore.update({
      where: { user_id: userId },
      data: {
        total_score: newScore,
        level: newLevel,
      },
    });
  }
  return userScore;
}
async function createLog({ habitId, userId, log_date }) {
  const habit = await prisma.habit.findFirst({
    where: {
      habit_id: parseInt(habitId),
      user_id: userId,
    },
  });
  if (!habit) {
    throw new NotFoundError(ERROR_MESSAGES.HABIT_NOT_FOUND);
  }
  const targetDate = log_date ? new Date(log_date) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const existingLog = await prisma.habitLog.findFirst({
    where: {
      habit_id: parseInt(habitId),
      user_id: userId,
      log_date: {
        gte: targetDate,
        lt: new Date(targetDate.getTime() + DATE_CONSTANTS.MS_PER_DAY),
      },
    },
  });
  if (existingLog) {
    throw new BadRequestError(ERROR_MESSAGES.LOG_EXISTS);
  }
  const log = await prisma.habitLog.create({
    data: {
      habit_id: parseInt(habitId),
      user_id: userId,
      log_date: targetDate,
      completed_at: new Date(),
      points_awarded: POINTS.HABIT_COMPLETION,
    },
  });
  await updateUserScore(userId, POINTS.HABIT_COMPLETION);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allHabits = await prisma.habit.findMany({
    where: {
      user_id: userId,
      status: HABIT_STATUS.ACTIVE,
    },
  });
  const todayLogs = await prisma.habitLog.findMany({
    where: {
      user_id: userId,
      log_date: {
        gte: today,
        lt: new Date(today.getTime() + DATE_CONSTANTS.MS_PER_DAY),
      },
    },
  });
  if (allHabits.length > 0 && todayLogs.length === allHabits.length) {
    await updateUserScore(userId, POINTS.ALL_HABITS_BONUS);
  }
  return log;
}
async function getLogs({ habitId, userId, page, limit }) {
  const habit = await prisma.habit.findFirst({
    where: {
      habit_id: parseInt(habitId),
      user_id: userId,
    },
  });
  if (!habit) {
    throw new NotFoundError(ERROR_MESSAGES.HABIT_NOT_FOUND);
  }
  const pageNum = parseInt(page) || PAGINATION.DEFAULT_PAGE;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;
  const [logs, total] = await Promise.all([
    prisma.habitLog.findMany({
      where: {
        habit_id: parseInt(habitId),
        user_id: userId,
      },
      skip,
      take: limitNum,
      orderBy: {
        log_date: "desc",
      },
    }),
    prisma.habitLog.count({
      where: {
        habit_id: parseInt(habitId),
        user_id: userId,
      },
    }),
  ]);
  return {
    logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}
async function deleteLog({ habitId, logId, userId }) {
  const habit = await prisma.habit.findFirst({
    where: {
      habit_id: parseInt(habitId),
      user_id: userId,
    },
  });
  if (!habit) {
    throw new NotFoundError(ERROR_MESSAGES.HABIT_NOT_FOUND);
  }
  const log = await prisma.habitLog.findFirst({
    where: {
      log_id: parseInt(logId),
      habit_id: parseInt(habitId),
      user_id: userId,
    },
  });
  if (!log) {
    throw new NotFoundError(ERROR_MESSAGES.LOG_NOT_FOUND);
  }
  await prisma.habitLog.delete({
    where: { log_id: parseInt(logId) },
  });
}
module.exports = { createLog, getLogs, deleteLog };
