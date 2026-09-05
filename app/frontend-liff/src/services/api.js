// src/services/api.js

import liff from "@line/liff";
import welcomeFlex from "../templates/flex/welcome.flex";

/**
 * กำหนด Base URL ของ API Backend
 * สามารถตั้งค่าผ่าน .env ด้วย VITE_API_BASE_URL ได้
 * ค่าเริ่มต้น: หากอยู่บน Production ให้ใช้ https://pannam-api.vercel.app หาก Local ให้ใช้ http://localhost:3000
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://fitting-allegedly-chicken.ngrok-free.app" // Production: https://pannam-api.vercel.app
    : "http://localhost:3000");

/**
 * ส่งข้อมูลการลงทะเบียนสมาชิกไปยัง Backend พร้อม LINE ID Token
 * @param {Object} formData ข้อมูลจากแบบฟอร์มการสมัคร
 * @param {string} idToken LINE ID Token ที่ได้จาก LIFF
 * @returns {Promise<Object>} ผลลัพธ์จาก API
 */
export async function registerMember(formData, idToken) {
  if (!idToken) {
    throw new Error("ไม่พบ LINE ID Token กรุณาเข้าสู่ระบบใหม่");
  }

  const response = await fetch(`${API_BASE_URL}/api/member/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(formData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      data.message ||
      data.error?.message ||
      `เกิดข้อผิดพลาดในการลงทะเบียน (รหัส: ${response.status})`;
    throw new Error(errorMessage);
  }

  try {
    // ดึงชื่อของผู้ใช้จากข้อมูลที่ได้จาก API
    const { fullName } = data.user;

    // เช็คว่าแอปถูกเปิดในระบบแอปพลิเคชัน LINE (Chat room) หรือไม่
    if (liff.isInClient() && liff.isApiAvailable("sendMessages")) {
      await liff.sendMessages([
        {
          type: "text",
          text: "Hello, World!",
        },
      ]);
      await liff.sendMessages([welcomeFlex({ name: fullName })]);

      console.log("🎉 [LIFF] ส่ง Flex Message ต้อนรับผ่านห้องแชทสำเร็จ");
    } else {
      console.warn(
        "⚠️ ไม่สามารถส่งข้อความได้เนื่องจากไม่ได้เปิดใช้งานบน LINE Client",
      );
    }
  } catch (error) {
    console.error("💥 [LIFF SendMessage Error]:", error);
  }

  return data;
}

export default {
  registerMember,
};
