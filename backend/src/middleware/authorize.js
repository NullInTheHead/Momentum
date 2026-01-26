const { ForbiddenError } = require("../utils/errors");

const authorize = (roles = []) => {
    // roles param can be a single role string (e.g. 'ADMIN') or an array of roles (['ADMIN', 'USER'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            throw new ForbiddenError('You do not have permission to perform this action');
        }
        next();
    };
};

module.exports = authorize;
