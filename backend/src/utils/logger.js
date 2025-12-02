const winston = require("winston");
const config = require("../config");
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
        ({ timestamp, level, message, ...meta }) => {
            let msg = `${timestamp} [${level}]: ${message}`;
            if (Object.keys(meta).length > 0) {
                msg += ` ${JSON.stringify(meta)}`;
            }
            return msg;
        }
    )
);
const transports = [];
transports.push(
    new winston.transports.Console({
        format: config.env === "development" ? consoleFormat : logFormat,
    })
);
if (config.env === "production") {
    transports.push(
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: logFormat,
        })
    );
    transports.push(
        new winston.transports.File({
            filename: "logs/combined.log",
            format: logFormat,
        })
    );
}
const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    transports,
    exitOnError: false,
});
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};
module.exports = logger;
