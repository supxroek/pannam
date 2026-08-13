import crypto from "node:crypto";
import createHttpError from "http-errors";
import config from "../config/line.config.js";

const validateSignature = (body, signature) => {
  if (!config.channelSecret) {
    createHttpError(500, "LINE_CHANNEL_SECRET not configured");
  }
  const hash = crypto
    .createHmac("sha256", config.channelSecret)
    .update(body)
    .digest("base64");
  if (process.env.NODE_ENV === "development") {
    console.log("Expected signature:", hash);
    console.log("Received signature:", signature);
  }
  return hash === signature;
};

const lineSignature = (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.log("Validating LINE signature for webhook");
    console.log("Method:", req.method);
    console.log("Headers:", req.headers);
  }
  // Skip signature validation for non-POST requests (for debugging)
  if (req.method !== "POST") {
    return next();
  }
  const signature = req.headers["x-line-signature"];
  if (!signature) {
    createHttpError(400, "Missing signature");
  }

  const body = JSON.stringify(req.body);
  if (!validateSignature(body, signature)) {
    createHttpError(400, "Invalid signature");
  }

  next();
};

export default lineSignature;
