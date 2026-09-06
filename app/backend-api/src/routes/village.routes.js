import express from "express";
import { verifyLineToken } from "../middlewares/verify-line-token.js";
import {
  getVillages,
  getVillageProperties,
} from "../controllers/village.controller.js";

const router = express.Router();

/**
 * ทุก route ในโมดูลนี้ต้องส่ง LINE ID Token เพื่อความปลอดภัย
 */
router.use(verifyLineToken);

/**
 * @route   GET /api/villages
 * @desc    ดึงรายชื่อหมู่บ้านที่เปิดใช้งานทั้งหมด
 * @access  Protected (LINE ID Token)
 */
router.get("/", getVillages);

/**
 * @route   GET /api/villages/:villageId/properties
 * @desc    ดึงรายการบ้านเลขที่ในหมู่บ้านที่ระบุ
 * @access  Protected (LINE ID Token)
 */
router.get("/:villageId/properties", getVillageProperties);

export default router;
