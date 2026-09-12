// src/routes/water.routes.js

import express from "express";
import { verifyLineToken } from "../middlewares/verify-line-token.js";
import {
  getReadingProgress,
  getPropertiesForReading,
  recordMeterReading,
  getUnpaidBills,
  recordCashPayment,
  getMyProperties,
  getCurrentBill,
  submitPaymentSlip,
  getUsageHistory,
} from "../controllers/water.controller.js";

const router = express.Router();

// ทุก Route ใน water ต้องผ่านการตรวจสอบ LINE ID Token
router.use(verifyLineToken);

/**
 * Routes สำหรับผู้จดน้ำ (Meter Reader)
 */
router.get("/progress", getReadingProgress);
router.get("/properties-for-reading", getPropertiesForReading);
router.post("/record-reading", recordMeterReading);
router.get("/unpaid-bills", getUnpaidBills);
router.post("/record-cash", recordCashPayment);

/**
 * Routes สำหรับลูกบ้าน (Resident)
 */
router.get("/my-properties", getMyProperties);
router.get("/current-bill", getCurrentBill);
router.post("/submit-slip", submitPaymentSlip);
router.get("/history-chart", getUsageHistory);

export default router;
