const { getPrismaClient } = require("../../config/database");
const { NotFoundError, ConflictError } = require("../../utils/errors");
const { ERROR_MESSAGES } = require("../../config/constants");
const prisma = getPrismaClient();
async function shareHabit(userId, habitId, friendId) {
  const habit = await prisma.habit.findFirst({
    where: {
      habit_id: parseInt(habitId),
      user_id: userId,
    },
  });
  if (!habit) {
    throw new NotFoundError(ERROR_MESSAGES.HABIT_NOT_FOUND);
  }
  const existingShare = await prisma.sharedHabit.findFirst({
    where: {
      habit_id: parseInt(habitId),
      partner_id: parseInt(friendId),
    },
  });
  if (existingShare) {
    throw new ConflictError(ERROR_MESSAGES.HABIT_ALREADY_SHARED);
  }
  const sharedHabit = await prisma.sharedHabit.create({
    data: {
      habit_id: parseInt(habitId),
      owner_id: userId,
      partner_id: parseInt(friendId),
    },
  });
  await prisma.habit.update({
    where: { habit_id: parseInt(habitId) },
    data: { is_shared: true },
  });
  return sharedHabit;
}
async function unshareHabit(userId, sharedHabitId) {
  const sharedHabit = await prisma.sharedHabit.findFirst({
    where: {
      id: parseInt(sharedHabitId),
      owner_id: userId,
    },
  });
  if (!sharedHabit) {
    throw new NotFoundError(ERROR_MESSAGES.SHARED_HABIT_NOT_FOUND);
  }
  await prisma.sharedHabit.delete({
    where: { id: parseInt(sharedHabitId) },
  });
  const remainingShares = await prisma.sharedHabit.count({
    where: { habit_id: sharedHabit.habit_id },
  });
  if (remainingShares === 0) {
    await prisma.habit.update({
      where: { habit_id: sharedHabit.habit_id },
      data: { is_shared: false },
    });
  }
}
async function getSharedHabits(userId) {
  const sharedHabits = await prisma.sharedHabit.findMany({
    where: {
      OR: [
        { owner_id: userId },
        { partner_id: userId },
      ],
    },
    include: {
      habit: true,
      owner: {
        select: {
          user_id: true,
          username: true,
          name: true,
          profile_picture_url: true,
        },
      },
      partner: {
        select: {
          user_id: true,
          username: true,
          name: true,
          profile_picture_url: true,
        },
      },
    },
  });
  return sharedHabits;
}
async function createBuddy(userId, userHabitId, friendHabitId, friendId) {
  const userHabitIdInt = parseInt(userHabitId);
  const friendIdInt = parseInt(friendId);
  const friendHabitIdInt = parseInt(friendHabitId);
  const existingBuddy = await prisma.sharedHabit.findFirst({
    where: {
      habit_id: userHabitIdInt,
      owner_id: userId,
      partner_id: friendIdInt,
    },
  });
  if (existingBuddy) {
    throw new ConflictError("Already accountability buddies for this habit");
  }
  const sharedHabit1 = await prisma.sharedHabit.create({
    data: {
      habit_id: userHabitIdInt,
      owner_id: userId,
      partner_id: friendIdInt,
    },
  });
  const sharedHabit2 = await prisma.sharedHabit.create({
    data: {
      habit_id: friendHabitIdInt,
      owner_id: friendIdInt,
      partner_id: userId,
    },
  });
  return [sharedHabit1, sharedHabit2];
}
async function getBuddyProgress(userId, habitId) {
  const habitIdInt = parseInt(habitId);
  const habit = await prisma.habit.findFirst({
    where: {
      habit_id: habitIdInt,
      user_id: userId,
    },
  });
  if (!habit) {
    throw new NotFoundError("Habit not found");
  }
  const sharedHabit = await prisma.sharedHabit.findFirst({
    where: {
      habit_id: habitIdInt,
      owner_id: userId,
    },
  });
  if (!sharedHabit) {
    throw new NotFoundError("No accountability buddy for this habit");
  }
  const partnerId = sharedHabit.partner_id;
  const partnerSharedHabit = await prisma.sharedHabit.findFirst({
    where: {
      owner_id: partnerId,
      partner_id: userId,
    },
  });
  if (!partnerSharedHabit) {
    throw new NotFoundError("Partner habit not found");
  }
  const partnerHabitId = partnerSharedHabit.habit_id;
  const partnerScore = await prisma.userScore.findUnique({
    where: { user_id: partnerId },
  });
  const lastLog = await prisma.habitLog.findFirst({
    where: {
      habit_id: partnerHabitId,
      user_id: partnerId,
    },
    orderBy: {
      log_date: 'desc',
    },
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayLog = await prisma.habitLog.findFirst({
    where: {
      habit_id: partnerHabitId,
      user_id: partnerId,
      log_date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });
  const partner = await prisma.users.findUnique({
    where: { user_id: partnerId },
    select: {
      user_id: true,
      username: true,
      name: true,
      profile_picture_url: true,
    },
  });
  return {
    partner,
    streak: partnerScore?.current_streak || 0,
    last_completion: lastLog?.log_date || null,
    completed_today: !!todayLog,
  };
}
async function removeBuddy(userId, sharedHabitId) {
  const sharedHabitIdInt = parseInt(sharedHabitId);
  const sharedHabit = await prisma.sharedHabit.findFirst({
    where: {
      id: sharedHabitIdInt,
      owner_id: userId,
    },
  });
  if (!sharedHabit) {
    throw new NotFoundError("Shared habit not found");
  }
  const partnerId = sharedHabit.partner_id;
  await prisma.sharedHabit.deleteMany({
    where: {
      OR: [
        { id: sharedHabitIdInt },
        { owner_id: partnerId, partner_id: userId },
      ],
    },
  });
}
module.exports = {
  shareHabit,
  unshareHabit,
  getSharedHabits,
  createBuddy,
  getBuddyProgress,
  removeBuddy,
};
