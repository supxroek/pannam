import liff from "@line/liff";
import { ApiError } from "../utils/api-error.js";

/**
 * กำหนด Base URL ของ API Backend
 * สามารถตั้งค่าผ่าน .env ด้วย VITE_API_BASE_URL ได้
 * ค่าเริ่มต้น: หากอยู่บน Production ให้ใช้ https://pannam-api.vercel.app หาก Local ให้ใช้ http://localhost:3000
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://pannam-api.vercel.app"
    : "http://localhost:3000");

/**
 * ดึงรายชื่อหมู่บ้านทั้งหมดที่เปิดใช้งานจาก Backend
 * @param {string} idToken - LINE LIFF ID Token
 * @returns {Promise<Array>} รายการหมู่บ้าน
 */
export async function fetchVillages(idToken) {
  if (!idToken) {
    throw new ApiError("ไม่พบ LINE ID Token กรุณาเข้าสู่ระบบใหม่", "TOKEN_INVALID", 401);
  }

  const response = await fetch(`${API_BASE_URL}/api/villages`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data.message || `ไม่สามารถดึงข้อมูลหมู่บ้านได้ (รหัส: ${response.status})`;
    throw new ApiError(
      errorMsg,
      data.code || (response.status === 401 ? "TOKEN_INVALID" : "API_ERROR"),
      response.status,
      data.errors
    );
  }

  return data.data || [];
}

/**
 * ดึงรายการบ้านเลขที่ที่มีอยู่ในระบบของหมู่บ้านที่เลือก
 * @param {number|string} villageId - รหัสหมู่บ้าน
 * @param {string} idToken - LINE LIFF ID Token
 * @returns {Promise<Array>} รายการบ้านเลขที่
 */
export async function fetchVillageProperties(villageId, idToken) {
  if (!idToken) {
    throw new ApiError("ไม่พบ LINE ID Token กรุณาเข้าสู่ระบบใหม่", "TOKEN_INVALID", 401);
  }
  if (!villageId) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/api/villages/${villageId}/properties`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data.message || `ไม่สามารถดึงข้อมูลบ้านเลขที่ได้ (รหัส: ${response.status})`;
    throw new ApiError(
      errorMsg,
      data.code || (response.status === 401 ? "TOKEN_INVALID" : "API_ERROR"),
      response.status,
      data.errors
    );
  }

  return data.data || [];
}

/**
 * ส่งข้อมูลการลงทะเบียนสมาชิกไปยัง Backend พร้อม LINE ID Token
 * @param {Object} formData ข้อมูลจากแบบฟอร์มการสมัคร
 * @param {string} idToken LINE ID Token ที่ได้จาก LIFF
 * @param {Array} villageList รายชื่อหมู่บ้านสำหรับนำชื่อมาแสดงผล
 * @returns {Promise<Object>} ผลลัพธ์จาก API
 */
export async function registerMember(formData, idToken, villageList = []) {
  if (!idToken) {
    throw new ApiError("ไม่พบ LINE ID Token กรุณาเข้าสู่ระบบใหม่", "TOKEN_INVALID", 401);
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
    throw new ApiError(
      errorMessage,
      data.code || (response.status === 401 ? "TOKEN_INVALID" : "API_ERROR"),
      response.status,
      data.errors || null
    );
  }

  try {
    // เช็คว่าแอปถูกเปิดในระบบแอปพลิเคชัน LINE (Chat room) และรองรับ sendMessages หรือไม่
    const contextType = liff.getContext()?.type;
    if (contextType && contextType !== "none" && contextType !== "external") {
      // แปลงชื่อหมู่บ้าน และโซน
      const villageObj = villageList.find(
        (v) => v.id === Number(formData.village),
      );
      const villageName = villageObj?.name || villageObj?.address || formData.village || "-";

      // Masking ข้อมูลส่วนตัว
      const cleanId = String(formData.idCard || "").replace(/[^0-9]/g, "");
      const maskedId =
        cleanId.length === 13
          ? `${cleanId.slice(0, 1)}-${cleanId.slice(1, 5)}-XXXXX-${cleanId.slice(10, 12)}-${cleanId.slice(12)}`
          : cleanId
            ? `${cleanId.slice(0, 4)}XXXXX${cleanId.slice(-2)}`
            : "-";

      const cleanPhone = String(formData.phone || "").replace(/[^0-9]/g, "");
      const maskedPhone =
        cleanPhone.length === 10
          ? `${cleanPhone.slice(0, 3)}-XXX-${cleanPhone.slice(6)}`
          : cleanPhone.length === 9
            ? `${cleanPhone.slice(0, 2)}-XXX-${cleanPhone.slice(5)}`
            : formData.phone || "-";

      const fullName =
        `${formData.firstName || ""} ${formData.lastName || ""}`.trim();
      const zoneDisplay =
        formData.zone ? `โซน ${formData.zone}` : "";
      const addressDisplay = [
        formData.houseNumber ? `บ้านเลขที่ ${formData.houseNumber}` : "",
        zoneDisplay,
      ]
        .filter(Boolean)
        .join(" ");

      // ข้อความสรุปข้อมูลลงทะเบียนจัดรูปแบบสวยงาม
      const summaryText = [
        "🎉 ลงทะเบียนสมาชิกสำเร็จ\n",
        `👤 ชื่อ-นามสกุล: คุณ${fullName || "สมาชิก"}`,
        `🪪 เลขบัตร ปชช.: ${maskedId}`,
        `📱 เบอร์โทรศัพท์: ${maskedPhone}`,
        `📍 หมู่บ้าน: ${villageName}`,
        addressDisplay ? `🏡 ที่อยู่: ${addressDisplay}\n` : "",
        "💧 บัญชีของคุณพร้อมใช้งานแล้วค่ะ",
        "แตะเลือกทำรายการผ่านปุ่มเมนูด้านล่างได้เลยนะคะ ✨",
      ]
        .filter(Boolean)
        .join("\n");

      await liff.sendMessages([
        {
          type: "text",
          text: summaryText,
        },
      ]);

      console.log(
        "🎉 [LIFF] ส่งสรุปข้อมูลลงทะเบียนพร้อม Quick Reply ไปยังห้องแชทแล้ว",
      );
    } else {
      console.warn(
        "⚠️ ไม่สามารถส่งข้อความได้เนื่องจากไม่ได้เปิดใช้งานบน LINE Client หรือไม่รองรับ sendMessages (contextType:",
        contextType,
        ")",
      );
    }
  } catch (error) {
    console.error("💥 [LIFF SendMessage Error]:", error);
    // ไม่ throw error เพื่อให้หน้าเว็บเปลี่ยนไปแสดงผลหน้า SuccessScreen ได้ตามปกติ
  }

  return data;
}

export default {
  fetchVillages,
  fetchVillageProperties,
  registerMember,
};
