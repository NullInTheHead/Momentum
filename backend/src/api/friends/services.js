const { getPrismaClient } = require("../../config/database");
const { NotFoundError, ConflictError, BadRequestError } = require("../../utils/errors");
const {
  ERROR_MESSAGES,
  FRIENDSHIP_STATUS,
  HABIT_STATUS,
} = require("../../config/constants");
const prisma = getPrismaClient();
async function searchUsers(username) {
  const users = await prisma.users.findMany({
    where: {
      username: {
        contains: username,
      },
    },
    select: {
      user_id: true,
      username: true,
      name: true,
      profile_picture_url: true,
    },
  });
  return users;
}
async function sendFriendRequest(userId, friendUsername) {
  const friend = await prisma.users.findUnique({
    where: { username: friendUsername },
  });
  if (!friend) {
    throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  }
  if (friend.user_id === userId) {
    throw new BadRequestError(ERROR_MESSAGES.SELF_FRIEND_REQUEST);
  }
  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { user_id: userId, friend_id: friend.user_id },
        { user_id: friend.user_id, friend_id: userId },
      ],
    },
  });
  if (existingFriendship) {
    throw new ConflictError(ERROR_MESSAGES.FRIEND_REQUEST_EXISTS);
  }
  const friendship = await prisma.friendship.create({
    data: {
      user_id: userId,
      friend_id: friend.user_id,
      status: FRIENDSHIP_STATUS.PENDING,
    },
  });
  return friendship;
}
async function getPendingRequests(userId) {
  const requests = await prisma.friendship.findMany({
    where: {
      friend_id: userId,
      status: FRIENDSHIP_STATUS.PENDING,
    },
    include: {
      user: {
        select: {
          user_id: true,
          username: true,
          name: true,
          profile_picture_url: true,
        },
      },
    },
  });
  return requests.map((req) => ({
    friendship_id: req.id,
    user: req.user,
    created_at: req.created_at,
  }));
}
async function acceptFriendRequest(userId, friendshipId) {
  const friendship = await prisma.friendship.findUnique({
    where: { id: parseInt(friendshipId) },
  });
  if (!friendship) {
    throw new NotFoundError(ERROR_MESSAGES.FRIEND_REQUEST_NOT_FOUND);
  }
  if (friendship.friend_id !== userId) {
    throw new NotFoundError(ERROR_MESSAGES.FRIEND_REQUEST_NOT_FOUND);
  }
  await prisma.friendship.update({
    where: { id: parseInt(friendshipId) },
    data: { status: FRIENDSHIP_STATUS.ACCEPTED },
  });
}
async function rejectFriendRequest(userId, friendshipId) {
  const friendship = await prisma.friendship.findUnique({
    where: { id: parseInt(friendshipId) },
  });
  if (!friendship) {
    throw new NotFoundError(ERROR_MESSAGES.FRIEND_REQUEST_NOT_FOUND);
  }
  if (friendship.friend_id !== userId) {
    throw new NotFoundError(ERROR_MESSAGES.FRIEND_REQUEST_NOT_FOUND);
  }
  await prisma.friendship.delete({
    where: { id: parseInt(friendshipId) },
  });
}
async function unfriend(userId, friendId) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { user_id: userId, friend_id: parseInt(friendId) },
        { user_id: parseInt(friendId), friend_id: userId },
      ],
      status: FRIENDSHIP_STATUS.ACCEPTED,
    },
  });
  if (!friendship) {
    throw new NotFoundError(ERROR_MESSAGES.FRIENDSHIP_NOT_FOUND);
  }
  await prisma.friendship.delete({
    where: { id: friendship.id },
  });
}
async function getFriends(userId) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ user_id: userId }, { friend_id: userId }],
      status: FRIENDSHIP_STATUS.ACCEPTED,
    },
    include: {
      user: {
        select: {
          user_id: true,
          username: true,
          name: true,
          profile_picture_url: true,
        },
      },
      friend: {
        select: {
          user_id: true,
          username: true,
          name: true,
          profile_picture_url: true,
        },
      },
    },
  });
  return friendships.map((f) => {
    const friendData =
      f.user_id === userId
        ? f.friend
        : f.user;
    return {
      ...friendData,
      friendship_id: f.id,
    };
  });
}
async function getOverlappingHabits(userId, friendId) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { user_id: userId, friend_id: parseInt(friendId) },
        { user_id: parseInt(friendId), friend_id: userId },
      ],
      status: FRIENDSHIP_STATUS.ACCEPTED,
    },
  });
  if (!friendship) {
    throw new NotFoundError(ERROR_MESSAGES.FRIENDSHIP_NOT_FOUND);
  }
  const myHabits = await prisma.habit.findMany({
    where: {
      user_id: userId,
      status: HABIT_STATUS.ACTIVE,
    },
    select: { 
      habit_id: true,
      name: true 
    },
  });
  const friendHabits = await prisma.habit.findMany({
    where: {
      user_id: parseInt(friendId),
      status: HABIT_STATUS.ACTIVE,
    },
    select: { 
      habit_id: true,
      name: true 
    },
  });
  const myHabitsMap = new Map(
    myHabits.map((h) => [h.name.toLowerCase(), h])
  );
  const overlapping = friendHabits
    .filter((friendHabit) => myHabitsMap.has(friendHabit.name.toLowerCase()))
    .map((friendHabit) => {
      const userHabit = myHabitsMap.get(friendHabit.name.toLowerCase());
      return {
        name: friendHabit.name,
        user_habit_id: userHabit.habit_id,
        friend_habit_id: friendHabit.habit_id,
      };
    });
  return overlapping;
}
module.exports = {
  searchUsers,
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  getFriends,
  getOverlappingHabits,
};
