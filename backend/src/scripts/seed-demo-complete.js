const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { formatUsername, formatName } = require("../utils/formatters");
const prisma = new PrismaClient();
async function main() {
  const demoEmail = "demo@momentum.com";
  const buddyEmail = "gym_buddy@momentum.com";
  let demoUser = await prisma.users.findUnique({ where: { email: demoEmail } });
  if (demoUser) {
    await prisma.habitLog.deleteMany({ where: { user_id: demoUser.user_id } });
    await prisma.sharedHabit.deleteMany({ where: { OR: [{ owner_id: demoUser.user_id }, { partner_id: demoUser.user_id }] } });
    await prisma.friendship.deleteMany({ where: { OR: [{ user_id: demoUser.user_id }, { friend_id: demoUser.user_id }] } });
    await prisma.habit.deleteMany({ where: { user_id: demoUser.user_id } });
    await prisma.userScore.deleteMany({ where: { user_id: demoUser.user_id } });
    await prisma.users.delete({ where: { user_id: demoUser.user_id } });
  }
  let gymBuddy = await prisma.users.findUnique({ where: { email: buddyEmail } });
  if (gymBuddy) {
    await prisma.habitLog.deleteMany({ where: { user_id: gymBuddy.user_id } });
    await prisma.sharedHabit.deleteMany({ where: { OR: [{ owner_id: gymBuddy.user_id }, { partner_id: gymBuddy.user_id }] } });
    await prisma.friendship.deleteMany({ where: { OR: [{ user_id: gymBuddy.user_id }, { friend_id: gymBuddy.user_id }] } });
    await prisma.habit.deleteMany({ where: { user_id: gymBuddy.user_id } });
    await prisma.userScore.deleteMany({ where: { user_id: gymBuddy.user_id } });
    await prisma.users.delete({ where: { user_id: gymBuddy.user_id } });
  }
  const demoPassword = await bcrypt.hash("demo123", 10);
  demoUser = await prisma.users.create({
    data: {
      email: demoEmail,
      username: formatUsername("demo"),
      name: formatName("Demo User"),
      password: demoPassword,
      profile_picture_url: "https:
    },
  });
  const buddyPassword = await bcrypt.hash("gymbuddy123", 10);
  gymBuddy = await prisma.users.create({
    data: {
      email: buddyEmail,
      username: formatUsername("gym_buddy"),
      name: formatName("Gym Buddy"),
      password: buddyPassword,
      profile_picture_url: "https:
    },
  });
  await prisma.friendship.create({
    data: { user_id: demoUser.user_id, friend_id: gymBuddy.user_id, status: "ACCEPTED" },
  });
  await prisma.friendship.create({
    data: { user_id: gymBuddy.user_id, friend_id: demoUser.user_id, status: "ACCEPTED" },
  });
  const now = new Date();
  const habits = [
    { name: "Morning Meditation", frequency: "daily", daily_deadline: "08:00", goal: "10 minutes of mindfulness", is_shared: false },
    { name: "Read for 30 mins", frequency: "daily", daily_deadline: "22:00", goal: "Read before bed", is_shared: false },
    { name: "Drink 8 Glasses of Water", frequency: "daily", goal: "Stay hydrated", is_shared: false },
  ];
  const createdHabits = [];
  for (const habitData of habits) {
    const habit = await prisma.habit.create({
      data: { ...habitData, user_id: demoUser.user_id, status: "active", updated_at: now },
    });
    createdHabits.push(habit);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const DAYS = 35;
  let totalPoints = 0;
  for (let dayOffset = DAYS - 1; dayOffset >= 0; dayOffset--) {
    const logDate = new Date(today);
    logDate.setDate(logDate.getDate() - dayOffset);
    logDate.setHours(0, 0, 0, 0);
    for (const habit of createdHabits) {
      const isRecent = dayOffset < 7;
      const rate = isRecent ? 0.95 : 0.85;
      if (Math.random() < rate) {
        const hour = habit.daily_deadline ? parseInt(habit.daily_deadline.split(':')[0]) : 12;
        const completedAt = new Date(logDate);
        completedAt.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
        await prisma.habitLog.create({
          data: {
            habit_id: habit.habit_id,
            user_id: demoUser.user_id,
            log_date: logDate,
            completed_at: completedAt,
            points_awarded: 10,
          },
        });
        totalPoints += 10;
      }
    }
  }
  const demoGymHabit = await prisma.habit.create({
    data: {
      user_id: demoUser.user_id,
      name: "gym",
      frequency: "daily",
      daily_deadline: "18:00",
      goal: "Complete 1 hour workout",
      is_shared: true,
      status: "active",
      updated_at: now,
    },
  });
  const buddyGymHabit = await prisma.habit.create({
    data: {
      user_id: gymBuddy.user_id,
      name: "gym",
      frequency: "daily",
      daily_deadline: "18:00",
      goal: "Complete 1 hour workout",
      is_shared: true,
      status: "active",
      updated_at: now,
    },
  });
  await prisma.sharedHabit.create({
    data: { habit_id: demoGymHabit.habit_id, owner_id: demoUser.user_id, partner_id: gymBuddy.user_id },
  });
  for (let dayOffset = DAYS - 1; dayOffset >= 0; dayOffset--) {
    const logDate = new Date(today);
    logDate.setDate(logDate.getDate() - dayOffset);
    logDate.setHours(0, 0, 0, 0);
    if (Math.random() < 0.90) {
      const hour = 16 + Math.floor(Math.random() * 4);
      const completedAt = new Date(logDate);
      completedAt.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      await prisma.habitLog.create({
        data: {
          habit_id: demoGymHabit.habit_id,
          user_id: demoUser.user_id,
          log_date: logDate,
          completed_at: completedAt,
          points_awarded: 10,
        },
      });
      totalPoints += 10;
    }
    if (Math.random() < 0.85) {
      const hour = 16 + Math.floor(Math.random() * 4);
      const completedAt = new Date(logDate);
      completedAt.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      await prisma.habitLog.create({
        data: {
          habit_id: buddyGymHabit.habit_id,
          user_id: gymBuddy.user_id,
          log_date: logDate,
          completed_at: completedAt,
          points_awarded: 10,
        },
      });
    }
  }
  const calculateStreak = async (userId) => {
    let streak = 0;
    let checkDate = new Date(today);
    for (let i = 0; i < 100; i++) {
      const nextDay = new Date(checkDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const logs = await prisma.habitLog.findMany({
        where: { user_id: userId, log_date: { gte: checkDate, lt: nextDay } },
      });
      if (logs.length > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };
  const calculateLongestStreak = async (userId) => {
    const logs = await prisma.habitLog.findMany({
      where: { user_id: userId },
      orderBy: { log_date: 'asc' },
    });
    if (logs.length === 0) return 0;
    const uniqueDates = new Set();
    logs.forEach(log => uniqueDates.add(log.log_date.toISOString().split('T')[0]));
    const sortedDates = Array.from(uniqueDates).sort();
    let longest = 1;
    let current = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }
    return longest;
  };
  const demoCurrentStreak = await calculateStreak(demoUser.user_id);
  const demoLongestStreak = await calculateLongestStreak(demoUser.user_id);
  const demoLevel = Math.floor(totalPoints / 1000) + 1;
  await prisma.userScore.create({
    data: {
      user_id: demoUser.user_id,
      total_score: totalPoints,
      level: demoLevel,
      current_streak: demoCurrentStreak,
      longest_streak: demoLongestStreak,
    },
  });
  const buddyLogs = await prisma.habitLog.findMany({ where: { user_id: gymBuddy.user_id } });
  const buddyPoints = buddyLogs.reduce((sum, log) => sum + log.points_awarded, 0);
  const buddyCurrentStreak = await calculateStreak(gymBuddy.user_id);
  const buddyLongestStreak = await calculateLongestStreak(gymBuddy.user_id);
  const buddyLevel = Math.floor(buddyPoints / 1000) + 1;
  await prisma.userScore.create({
    data: {
      user_id: gymBuddy.user_id,
      total_score: buddyPoints,
      level: buddyLevel,
      current_streak: buddyCurrentStreak,
      longest_streak: buddyLongestStreak,
    },
  });
}
main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
