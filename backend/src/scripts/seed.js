const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
async function main() {
  console.log("🌱 Starting seed...");
  console.log("Clearing existing data...");
  await prisma.habitLog.deleteMany();
  await prisma.sharedHabit.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.userScore.deleteMany();
  await prisma.users.deleteMany();
  console.log("Creating main user...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  const mainUser = await prisma.users.create({
    data: {
      email: "you@momentum.com",
      username: "Alex",
      password: hashedPassword,
      profile_picture_url: "https:
    },
  });
  console.log("Creating friends...");
  const friend1Password = await bcrypt.hash("password123", 10);
  const friend1 = await prisma.users.create({
    data: {
      email: "sarah@momentum.com",
      username: "Sarah",
      password: friend1Password,
      profile_picture_url: "https:
    },
  });
  const friend2Password = await bcrypt.hash("password123", 10);
  const friend2 = await prisma.users.create({
    data: {
      email: "mike@momentum.com",
      username: "Mike",
      password: friend2Password,
      profile_picture_url: "https:
    },
  });
  console.log("Creating friendships...");
  await prisma.friendship.create({
    data: {
      user_id: mainUser.user_id,
      friend_id: friend1.user_id,
      status: "ACCEPTED",
    },
  });
  await prisma.friendship.create({
    data: {
      user_id: mainUser.user_id,
      friend_id: friend2.user_id,
      status: "ACCEPTED",
    },
  });
  console.log("Creating habits...");
  const habits = [
    {
      name: "Morning Run",
      frequency: "daily",
      daily_deadline: "08:00",
      goal: "Run 5km",
      is_shared: true,
    },
    {
      name: "Read for 20 mins",
      frequency: "daily",
      daily_deadline: "22:00",
      goal: "Read at least 20 minutes",
      is_shared: true,
    },
    {
      name: "Meditation",
      frequency: "daily",
      daily_deadline: "07:00",
      goal: "10 minutes of meditation",
      is_shared: false,
    },
    {
      name: "Gym Workout",
      frequency: "3x per week",
      daily_deadline: "18:00",
      goal: "Full body workout",
      is_shared: true,
    },
    {
      name: "Journal Writing",
      frequency: "daily",
      daily_deadline: "21:00",
      goal: "Write 3 things I'm grateful for",
      is_shared: false,
    },
    {
      name: "Water Intake",
      frequency: "daily",
      goal: "Drink 8 glasses of water",
      is_shared: false,
    },
  ];
  const createdHabits = [];
  for (const habitData of habits) {
    const habit = await prisma.habit.create({
      data: {
        ...habitData,
        user_id: mainUser.user_id,
        status: "active",
      },
    });
    createdHabits.push(habit);
  }
  console.log("Sharing habits...");
  await prisma.sharedHabit.create({
    data: {
      habit_id: createdHabits[0].habit_id, 
      owner_id: mainUser.user_id,
      partner_id: friend1.user_id,
    },
  });
  await prisma.sharedHabit.create({
    data: {
      habit_id: createdHabits[1].habit_id, 
      owner_id: mainUser.user_id,
      partner_id: friend1.user_id,
    },
  });
  await prisma.sharedHabit.create({
    data: {
      habit_id: createdHabits[3].habit_id, 
      owner_id: mainUser.user_id,
      partner_id: friend2.user_id,
    },
  });
  console.log("Creating habit logs (this may take a while)...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let totalScore = 0;
  let longestStreak = 0;
  let currentStreak = 0;
  for (const habit of createdHabits) {
    let habitStreak = 0;
    let habitLongestStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < 365; i++) {
      const logDate = new Date(today);
      logDate.setDate(logDate.getDate() - i);
      logDate.setHours(0, 0, 0, 0);
      if (logDate > today) continue;
      const hasDeadline = habit.daily_deadline !== null;
      const baseCompletionRate = hasDeadline ? 0.75 : 0.65;
      const daysAgo = i;
      const recentBonus = daysAgo < 90 ? 0.15 : 0;
      const shouldComplete = Math.random() < (baseCompletionRate + recentBonus);
      const continueStreak = tempStreak > 0 && Math.random() < 0.8;
      if (shouldComplete || continueStreak) {
        await prisma.habitLog.create({
          data: {
            habit_id: habit.habit_id,
            user_id: mainUser.user_id,
            log_date: logDate,
            completed_at: new Date(logDate.getTime() + Math.random() * 86400000),
            points_awarded: 10,
          },
        });
        totalScore += 10;
        tempStreak++;
        habitStreak = Math.max(habitStreak, tempStreak);
      } else {
        habitLongestStreak = Math.max(habitLongestStreak, tempStreak);
        tempStreak = 0;
      }
      if (i % 7 === 0 && Math.random() < 0.3) {
        totalScore += 50;
      }
    }
    habitLongestStreak = Math.max(habitLongestStreak, tempStreak);
    longestStreak = Math.max(longestStreak, habitLongestStreak);
    let checkDate = new Date(today);
    let currentHabitStreak = 0;
    for (let i = 0; i < 30; i++) {
      const checkLog = await prisma.habitLog.findFirst({
        where: {
          habit_id: habit.habit_id,
          user_id: mainUser.user_id,
          log_date: {
            gte: checkDate,
            lt: new Date(checkDate.getTime() + 86400000),
          },
        },
      });
      if (checkLog) {
        currentHabitStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    currentStreak = Math.max(currentStreak, currentHabitStreak);
  }
  console.log("Creating user score...");
  const level = Math.floor(totalScore / 1000) + 1;
  await prisma.userScore.create({
    data: {
      user_id: mainUser.user_id,
      total_score: totalScore,
      current_level: level,
      current_streak: currentStreak,
      longest_streak: longestStreak,
    },
  });
  console.log("Creating friend logs...");
  const friend1SharedHabits = await prisma.sharedHabit.findMany({
    where: {
      partner_id: friend1.user_id,
    },
  });
  for (const shared of friend1SharedHabits) {
    for (let i = 0; i < 30; i++) {
      if (Math.random() < 0.7) {
        const logDate = new Date(today);
        logDate.setDate(logDate.getDate() - i);
        logDate.setHours(0, 0, 0, 0);
        await prisma.habitLog.create({
          data: {
            habit_id: shared.habit_id,
            user_id: friend1.user_id,
            log_date: logDate,
            completed_at: new Date(logDate.getTime() + Math.random() * 86400000),
            points_awarded: 10,
          },
        });
      }
    }
  }
  const friend2SharedHabits = await prisma.sharedHabit.findMany({
    where: {
      partner_id: friend2.user_id,
    },
  });
  for (const shared of friend2SharedHabits) {
    for (let i = 0; i < 30; i++) {
      if (Math.random() < 0.65) {
        const logDate = new Date(today);
        logDate.setDate(logDate.getDate() - i);
        logDate.setHours(0, 0, 0, 0);
        await prisma.habitLog.create({
          data: {
            habit_id: shared.habit_id,
            user_id: friend2.user_id,
            log_date: logDate,
            completed_at: new Date(logDate.getTime() + Math.random() * 86400000),
            points_awarded: 10,
          },
        });
      }
    }
  }
  console.log("✅ Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- Main user: ${mainUser.email} (${mainUser.username})`);
  console.log(`- Friends: ${friend1.username}, ${friend2.username}`);
  console.log(`- Habits created: ${createdHabits.length}`);
  console.log(`- Total score: ${totalScore}`);
  console.log(`- Level: ${level}`);
  console.log(`- Longest streak: ${longestStreak} days`);
  console.log(`- Current streak: ${currentStreak} days`);
  console.log("\n🔑 Login credentials:");
  console.log(`Main user: you@momentum.com / password123`);
  console.log(`Friend 1: sarah@momentum.com / password123`);
  console.log(`Friend 2: mike@momentum.com / password123`);
}
main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
