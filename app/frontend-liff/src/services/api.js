import liff from "@line/liff";
import { villages, zones } from "../constants/registerData.js";

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
    // เช็คว่าแอปถูกเปิดในระบบแอปพลิเคชัน LINE (Chat room) และรองรับ sendMessages หรือไม่
    const contextType = liff.getContext()?.type;
    if (contextType && contextType !== "none" && contextType !== "external") {
      // แปลงชื่อหมู่บ้าน และโซน
      const villageObj = villages.find((v) => v.id === Number(formData.village));
      const villageName = villageObj?.name || formData.village || "-";
      const zoneIdx = Number(formData.zone);
      const zoneName = !isNaN(zoneIdx) && zones[zoneIdx] ? zones[zoneIdx] : (formData.zone || "-");

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

      const fullName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();
      const zoneDisplay =
        zoneName && zoneName !== "-"
          ? String(zoneName).startsWith("โซน")
            ? zoneName
            : `โซน ${zoneName}`
          : "";
      const addressDisplay = [
        formData.houseNumber ? `บ้านเลขที่ ${formData.houseNumber}` : "",
        zoneDisplay,
      ]
        .filter(Boolean)
        .join(" ");

      // ข้อความสรุปข้อมูลลงทะเบียนจัดรูปแบบสวยงาม
      const summaryText = [
        "🎉 ลงทะเบียนสมาชิกสำเร็จ",
        "━━━━━━━━━━━━━━━━━━",
        `👤 ชื่อ-นามสกุล: คุณ${fullName || "สมาชิก"}`,
        `🪪 เลขบัตร ปชช.: ${maskedId}`,
        `📱 เบอร์โทรศัพท์: ${maskedPhone}`,
        `📍 หมู่บ้าน: ${villageName}`,
        addressDisplay ? `🏡 ที่อยู่: ${addressDisplay}` : "",
        "━━━━━━━━━━━━━━━━━━",
        "💧 บัญชีของคุณพร้อมใช้งานแล้วค่ะ",
        "แตะเลือกทำรายการผ่านปุ่มเมนูด้านล่างได้เลยนะคะ ✨",
      ]
        .filter(Boolean)
        .join("\n");

      // Quick Reply ปุ่มลัดสำหรับเลือกทำรายการ
      const quickReply = {
        items: [
          {
            type: "action",
            action: {
              type: "message",
              label: "เช็คค่าน้ำ 💧",
              text: "เช็คค่าน้ำ",
            },
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "ประวัติการใช้น้ำ 📊",
              text: "ประวัติ",
            },
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "แจ้งปัญหา 🛠️",
              text: "แจ้งปัญหา",
            },
          },
        ],
      };

      await liff.sendMessages([
        {
          type: "text",
          text: summaryText,
          quickReply,
        },
      ]);

      console.log("🎉 [LIFF] ส่งสรุปข้อมูลลงทะเบียนพร้อม Quick Reply ไปยังห้องแชทแล้ว");
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
  registerMember,
};
