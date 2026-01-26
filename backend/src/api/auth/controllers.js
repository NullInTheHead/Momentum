const { createUser, loginUser } = require("./services");
const { HTTP_STATUS } = require("../../config/constants");
async function signup(req, res) {
  const { email, password, username, name } = req.body;
  await createUser({ email, password, username, name });
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "User created successfully",
  });
}
async function login(req, res) {
  const { email, password } = req.body;
  const { token, user } = await loginUser({ email, password });

  // Set HttpOnly cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    user,
  });
}
async function verifySession(req, res) {
  // If the request reached here, the authenticateToken middleware passed,
  // so req.user is populated.
  res.status(HTTP_STATUS.OK).json({
    success: true,
    user: req.user,
    isAuthenticated: true
  });
}

async function logout(req, res) {
  res.clearCookie("jwt");
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logged out successfully"
  });
}

module.exports = { signup, login, verifySession, logout };
