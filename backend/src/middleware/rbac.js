const { ForbiddenError } = require("../utils/errors");

/**
 * Middleware to check if user has one of the required roles
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ForbiddenError("User not authenticated"));
        }

        if (allowedRoles.length === 0) {
            return next();
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new ForbiddenError("You do not have permission to access this resource"));
        }

        next();
    };
};

module.exports = { authorize };
