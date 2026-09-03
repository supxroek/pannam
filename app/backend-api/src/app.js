import express from "express";
const router = express.Router();

// Import routes
// const liffRoutes = require("./modules/api/liff.routes");
import webhookRoutes from "./routes/bot.routes.js";
import memberRoutes from "./routes/register.routes.js";

// Import middlewares
import lineSignature from "./middlewares/line-signature.js";

// API Version prefix
const API_VERSION = "/api";

router.use(
  `${API_VERSION}/webhooks`,
  express.raw({ type: "application/json" }),
  lineSignature,
  webhookRoutes.handleEvent.bind(webhookRoutes),
);

router.use(`${API_VERSION}/register`, memberRoutes);

export default router;
