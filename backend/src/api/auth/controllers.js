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
  const token = await loginUser({ email, password });
  res.status(HTTP_STATUS.OK).json({
    success: true,
    token,
  });
}
module.exports = { signup, login };
