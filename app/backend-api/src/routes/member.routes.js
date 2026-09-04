import express from "express";
import { verifyLineToken } from "../middlewares/verify-line-token.js";
import { handleRegister } from "../controllers/member.controller.js";

const router = express.Router();

/**
 * @route   POST /api/members/register
 * @desc    ลงทะเบียนสมาชิกใหม่ผ่าน LINE LIFF (ตรวจสอบ ID Token ก่อน)
 * @access  Protected (LINE ID Token)
 */
router.post("/register", verifyLineToken, handleRegister);

export default router;
