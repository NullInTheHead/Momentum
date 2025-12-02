const rateLimit = require("express-rate-limit");
const config = require("../config");
const generalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});
const authLimiter = rateLimit({
    windowMs: config.rateLimitAuth.windowMs,
    max: config.rateLimitAuth.max,
    message: {
        success: false,
        message: "Too many authentication attempts, please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, 
});
function createRateLimiter(options) {
    return rateLimit({
        message: {
            success: false,
            message: "Too many requests, please try again later.",
        },
        standardHeaders: true,
        legacyHeaders: false,
        ...options,
    });
}
module.exports = {
    generalLimiter,
    authLimiter,
    createRateLimiter,
};
