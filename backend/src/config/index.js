require("dotenv").config();
function validateEnv() {
    const required = ["PORT", "DATABASE_URL", "JWT_SECRET"];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`
        );
    }
}


validateEnv();
//tester
const config = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: "1h",
    },
    cors: {
        origins: [
            "http://localhost:5173/",
            "https://momentum-pearl.vercel.app/",
            'https://momentum-5jip.onrender.com/'
        ],
        credentials: true,
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, 
        max: process.env.NODE_ENV === "production" ? 1000 : 1000, 
    },
    rateLimitAuth: {
        windowMs: 15 * 60 * 1000,
        max: 5, 
    },
    logging: {
        level: process.env.LOG_LEVEL || "info",
        format: process.env.LOG_FORMAT || "json",
    },
};
Object.freeze(config);
module.exports = config;
