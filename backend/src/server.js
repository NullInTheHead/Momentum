const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const config = require("./config");
const logger = require("./utils/logger");
const { connectDatabase, setupGracefulShutdown } = require("./config/database");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { generalLimiter, authLimiter } = require("./middleware/rateLimiter");
const { authenticateToken } = require("./middleware/auth");
const authRouter = require("./api/auth/routes");
const habitsRouter = require("./api/habits/routes");
const logsRouter = require("./api/logs/routes");
const userRouter = require("./api/user/routes");
const friendsRouter = require("./api/friends/routes");
const sharedRouter = require("./api/shared/routes");

const app = express();
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(
  cors({
    origin: config.cors.origins,
    credentials: config.cors.credentials,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.env === "development") {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
}

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

app.use("/auth", authLimiter, authRouter);

app.use("/api/habits", generalLimiter, authenticateToken, habitsRouter);
app.use("/api/habits", generalLimiter, authenticateToken, logsRouter);
app.use("/api/user", generalLimiter, authenticateToken, userRouter);
app.use("/api/friends", generalLimiter, authenticateToken, friendsRouter);
app.use("/api/shared", generalLimiter, authenticateToken, sharedRouter);

app.use(notFoundHandler);

app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📝 Environment: ${config.env}`);
      logger.info(`🔒 CORS Origins: ${config.cors.origins.join(", ")}`);
    });

    setupGracefulShutdown();
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;