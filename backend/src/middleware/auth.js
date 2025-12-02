const jsonwebtoken = require("jsonwebtoken");
const config = require("../config");
const { UnauthorizedError, ForbiddenError } = require("../utils/errors");
const { ERROR_MESSAGES } = require("../config/constants");
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 
  if (!token) {
    throw new UnauthorizedError(ERROR_MESSAGES.ACCESS_TOKEN_REQUIRED);
  }
  try {
    const decoded = jsonwebtoken.verify(token, config.jwt.secret);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ForbiddenError("Token has expired");
    }
    throw new ForbiddenError(ERROR_MESSAGES.INVALID_TOKEN);
  }
};
module.exports = { authenticateToken };
