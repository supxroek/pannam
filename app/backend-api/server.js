// โหลด environment variables
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import winston from "winston";
import rateLimit from "express-rate-limit";
import createHttpError from "http-errors";
import say from "cowsay";

// import error middleware
import errorMiddleware from "./src/middlewares/error.middleware.js";

// สร้าง app Express
const app = express();

// กำหนดพอร์ตจาก environment variable หรือใช้ค่าเริ่มต้น 5000
const {
  NODE_ENV,
  PORT,
  CORS_ORIGIN = "*",
  BODY_LIMIT = "10mb",
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX = 100,
  TRUST_PROXY = "true",
} = process.env;

// รวมการตั้งค่าสำหรับ Development และ Production ทั้งหมดไว้ตรงนี้
const isProduction = NODE_ENV === "production";
const config = {
  env: NODE_ENV,
  port: Number(PORT),
  isProduction,
  corsOrigin: CORS_ORIGIN,
  bodyLimit: BODY_LIMIT,
  trustProxy:
    (TRUST_PROXY && String(TRUST_PROXY).toLowerCase() === "true") ||
    isProduction
      ? 1
      : 0,
  rateLimit: {
    windowMs: Number(RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: Number(RATE_LIMIT_MAX),
    standardHeaders: true,
    legacyHeaders: false,
    message: "คำขอมากเกินไป โปรดลองใหม่ในภายหลัง",
  },
};

// Create winston logger
const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: [new winston.transports.Console()],
});

// ตั้งค่า trust proxy (ใช้เมื่อทำงานหลัง proxy หรือเมื่อรัน production)
if (config.trustProxy) {
  app.set("trust proxy", config.trustProxy);
}

// กำหนดค่า CORS (อ้างอิงค่าจาก config กลาง)
config.corsOrigin =
  config.corsOrigin === "*"
    ? { origin: true }
    : { origin: config.corsOrigin.split(",").map((s) => s.trim()) };

// ตั้งค่า rate limiting (จาก config กลาง)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: config.rateLimit.standardHeaders,
  legacyHeaders: config.rateLimit.legacyHeaders,
  message: config.rateLimit.message,
});

// ตั้งค่า middleware
app
  .use(helmet())
  .use(cors(config.corsOrigin))
  .use(express.json({ limit: config.bodyLimit }))
  .use(express.urlencoded({ extended: true, limit: config.bodyLimit }))
  .use((req, _, next) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  })
  .use(limiter);

// =================================================================================
// เรียกใช้ routes ทั้งหมดจาก src/app.js
import routes from "./src/app.js";
app.use(routes);

// Use error middleware
app.use(errorMiddleware);

// ทดสอบ API ด้วย cow say
app.get("/cow-say", (_, res) => {
  const cowMessage = say.say({
    text: "Hello from PANNAM (ปันน้ำ)!",
    e: "oO",
    T: "U ",
  });
  res.type("text").send(cowMessage);
});

// จัดการเส้นทางที่ไม่พบด้วยการส่ง 404
app.use((_, res) => {
  res.status(404).json({ message: "ไม่พบเส้นทางที่ร้องขอ" });
});

// =================================================================================
// เริ่มต้นเซิร์ฟเวอร์ (สำหรับการรัน Local หรือ Dev)
if (import.meta.main) {
  const server = app.listen(config.port);

  // กำหนด base URL
  const baseUrl = isProduction ? `https://fitting-allegedly-chicken.ngrok-free.app` : `http://localhost:${config.port}`;
  // แสดงข้อความเมื่อเซิร์ฟเวอร์เริ่มทำงาน
  server.on("listening", () => {
    console.log(`🚀 Server running in ${NODE_ENV} mode`);
    console.log(`🌐 Local: ${baseUrl}`);
    console.log(`🛠️  Health Check: ${baseUrl}/health`);
    console.log(`🔧 Press Ctrl+C to stop the server`);
  });

  // จัดการข้อผิดพลาดของเซิร์ฟเวอร์
  server.on("error", (err) => {
    if (err?.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use`);
      console.error(
        `→ To fix: stop the process using the port or run with a different PORT (e.g. PORT=3001)`,
      );
      process.exit(1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });

  // ตัวจัดการปิดเซิร์ฟเวอร์อย่างปลอดภัยเมื่อเกิดข้อผิดพลาดที่ไม่คาดคิด
  process.on("unhandledRejection", (reason) => {
    // If this is an operational createHttpError, log and continue (don't crash the process)
    if (reason && typeof reason === "object") {
      const isOperational =
        reason.isOperational === true || reason instanceof createHttpError;
      if (isOperational) {
        console.warn(
          "Non-fatal unhandled rejection (operational):",
          reason.message || reason,
        );
        return;
      }
    }

    console.error("Unhandled Rejection:", reason);
    if (server?.close) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    if (server?.close) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });
}
