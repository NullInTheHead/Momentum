const jsonwebtoken = require("jsonwebtoken");
const config = require("../config");
const { UnauthorizedError, ForbiddenError } = require("../utils/errors");
const { ERROR_MESSAGES } = require("../config/constants");
const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt || (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

  if (!token) {
    throw new UnauthorizedError(ERROR_MESSAGES.ACCESS_TOKEN_REQUIRED);
  }
  try {
    const decoded = jsonwebtoken.verify(token, config.jwt.secret);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'USER' // Fallback for old tokens
    };
    req.userId = decoded.userId; // Keep for backward compatibility
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
