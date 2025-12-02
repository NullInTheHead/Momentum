const logger = require("../utils/logger");
const { AppError } = require("../utils/errors");
const config = require("../config");
function errorHandler(err, req, res, next) {
    let error = err;
    if (!(error instanceof AppError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal server error";
        error = new AppError(message, statusCode, false);
    }
    const logLevel = error.statusCode >= 500 ? "error" : "warn";
    logger[logLevel]({
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userId: req.userId,
    });
    const response = {
        success: false,
        message: error.message,
        statusCode: error.statusCode,
    };
    if (config.env === "development" && error.stack) {
        response.stack = error.stack;
    }
    res.status(error.statusCode).json(response);
}
function notFoundHandler(req, res, next) {
    const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
    next(error);
}
module.exports = {
    errorHandler,
    notFoundHandler,
};
