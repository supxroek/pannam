import express from "express";
import { verifyLineToken } from "../middlewares/verify-line-token.js";
import {
  handleRegister,
  getProfile,
  updateProfile,
} from "../controllers/member.controller.js";

const router = express.Router();

/**
 * @route   POST /api/member/register
 * @desc    ลงทะเบียนสมาชิกใหม่ผ่าน LINE LIFF
 * @access  Protected (LINE ID Token)
 */
router.post("/register", verifyLineToken, handleRegister);

/**
 * @route   GET /api/member/profile
 * @desc    ดึงข้อมูลโปรไฟล์ผู้ใช้
 * @access  Protected (LINE ID Token)
 */
router.get("/profile", verifyLineToken, getProfile);

/**
 * @route   PUT /api/member/profile
 * @desc    แก้ไขข้อมูลส่วนตัว
 * @access  Protected (LINE ID Token)
 */
router.put("/profile", verifyLineToken, updateProfile);

export default router;
