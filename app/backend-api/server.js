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
  PORT = 3000, // กำหนดค่าเริ่มต้นเป็น 5000 เผื่อกรณีใน Env ไม่ได้ใส่ไว้
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
// กำหนดค่า CORS ปล่อยผ่านทุก Origin หากเป็น "*" หรือตัดแบ่งกรณีใส่หลาย URL
const corsOptions = {
  // origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",").map(s => s.trim()),
  origin: (origin, callback) => {
    // ปล่อยผ่านทุก Origin ที่ยิงเข้ามา เพื่อแก้ปัญหา HTTPS ยิงหา Local HTTP บล็อก
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

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
  .use(cors(corsOptions))
  .use(express.json({ limit: config.bodyLimit }))
  .use(express.urlencoded({ extended: true, limit: config.bodyLimit }))
  .use((req, _, next) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  })
  .use((req, _, next) => {
    // ปรับปรุง URL ในกรณีรันบน Serverless Proxy (เช่น Vercel rewrite เป็น /server.js)
    if (req.url.startsWith("/server.js")) {
      const original =
        req.headers["x-forwarded-uri"] ||
        req.headers["x-matched-path"] ||
        req.headers["x-original-url"] ||
        req.headers["x-rewrite-url"] ||
        "";
      if (original) {
        req.url = original;
      } else {
        req.url = req.url.replace(/^\/server\.js/, "") || "/";
      }
    }
    next();
  })
  .use(limiter);

// =================================================================================
// เรียกใช้ routes ทั้งหมดจาก src/app.js
import routes from "./src/app.js";
import { prisma } from "./src/lib/prisma.js";

// Root endpoint สำหรับตรวจสอบสถานะ API
app.get("/", (_, res) => {
  res.status(200).json({
    name: "PANNAM API",
    status: "online",
    message: "ยินดีต้อนรับสู่ระบบปันน้ำ API 💧",
    endpoints: {
      health: "/health",
      cowSay: "/cow-say",
      register: "POST /api/member/register",
      webhooks: "POST /api/webhooks",
    },
  });
});

app.use(routes);

// Health check endpoint
app.get("/health", async (req, res) => {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "ok",
      database: "connected",
      uptime: process.uptime(),
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Database health check failed", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });

    return res.status(503).json({
      status: "error",
      database: "disconnected",
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  }
});

// ทดสอบ API ด้วย cow say
app.get("/cow-say", (_, res) => {
  const cowMessage = say.say({
    text: "Hello from PANNAM (ปันน้ำ)!",
    e: "oO",
    T: "U ",
  });
  res.type("text").send(cowMessage);
});

// Use error middleware
app.use(errorMiddleware);

// จัดการเส้นทางที่ไม่พบด้วยการส่ง 404
app.use((req, res) => {
  res.status(404).json({
    message: "ไม่พบเส้นทางที่ร้องขอ",
    method: req.method,
    path: req.url,
  });
});

// =================================================================================
// เริ่มต้นเซิร์ฟเวอร์ (ทำงานเฉพาะเมื่อรันในเครื่องตนเอง หรือไม่ใช่ระบบ Serverless Production ของ Vercel)
if (import.meta.main || !isProduction) {
  const server = app.listen(config.port);

  // กำหนด base URL
  const baseUrl = isProduction
    // For production: https://pannam-api.vercel.app
    // For development: https://fitting-allegedly-chicken.ngrok-free.app
    ? `https://pannam-api.vercel.app`
    : `http://localhost:${config.port}`;

  // แสดงข้อความเมื่อเซิร์ฟเวอร์เริ่มทำงาน
  server.on("listening", () => {
    console.log(`🚀 Server running in ${NODE_ENV || "development"} mode`);
    console.log(`🌐 Local: ${baseUrl}`);
    console.log(`🛠️  Health Check: ${baseUrl}/health`);
    console.log(`🔧 Press Ctrl+C to stop the server`);
  });

  // จัดการข้อผิดพลาดของเซิร์ฟเวอร์
  server.on("error", (err) => {
    if (err?.code === "EADDRINUSE") {
      console.error(`❌ Port ${config.port} is already in use`);
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

// ✨ สิ่งสำคัญที่สุด: ทำการ Export ตัวแปรแอปพลิเคชันออกไปเพื่อให้ Vercel นำไปรันเป็น Serverless Function ได้อย่างสมบูรณ์
export default app;
