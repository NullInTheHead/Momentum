const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
let prisma;
function getPrismaClient() {
    if (!prisma) {
        prisma = new PrismaClient({
            log: [
                { level: "warn", emit: "event" },
                { level: "error", emit: "event" },
            ],
        });
        prisma.$on("warn", (e) => {
            logger.warn("Prisma warning:", e);
        });
        prisma.$on("error", (e) => {
            logger.error("Prisma error:", e);
        });
        logger.info("Prisma Client initialized");
    }
    return prisma;
}
async function connectDatabase() {
    try {
        const client = getPrismaClient();
        await client.$connect();
        logger.info("Database connected successfully");
    } catch (error) {
        logger.error("Failed to connect to database:", error);
        throw error;
    }
}
async function disconnectDatabase() {
    try {
        if (prisma) {
            await prisma.$disconnect();
            logger.info("Database disconnected");
        }
    } catch (error) {
        logger.error("Error disconnecting from database:", error);
        throw error;
    }
}
function setupGracefulShutdown() {
    const shutdown = async (signal) => {
        logger.info(`${signal} received, closing database connection`);
        await disconnectDatabase();
        process.exit(0);
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}
module.exports = {
    getPrismaClient,
    connectDatabase,
    disconnectDatabase,
    setupGracefulShutdown,
};
