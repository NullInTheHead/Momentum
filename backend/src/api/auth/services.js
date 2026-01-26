const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPrismaClient } = require("../../config/database");
const { formatUsername, formatName } = require("../../utils/formatters");
const { ConflictError, UnauthorizedError } = require("../../utils/errors");
const { ERROR_MESSAGES, JWT } = require("../../config/constants");
const config = require("../../config");
const prisma = getPrismaClient();
async function createUser({ email, password, username, name }) {
  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) {
    throw new ConflictError(ERROR_MESSAGES.USER_EXISTS);
  }
  const formattedUsername = formatUsername(username);
  const userWithUsername = await prisma.users.findUnique({
    where: { username: formattedUsername },
  });
  if (userWithUsername) {
    throw new ConflictError(ERROR_MESSAGES.USERNAME_TAKEN);
  }
  const formattedName = name ? formatName(name) : formatName(username);
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.users.create({
    data: {
      email,
      username: formattedUsername,
      name: formattedName,
      password: hashedPassword,
    },
  });
}
async function loginUser({ email, password }) {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }
  const token = jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: JWT.EXPIRES_IN }
  );
  return { token, user: { id: user.user_id, email: user.email, name: user.name, username: user.username, role: user.role } };
}
module.exports = { createUser, loginUser };
