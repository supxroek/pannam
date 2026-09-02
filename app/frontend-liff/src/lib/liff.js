// src/lib/liff.js
import liff from "@line/liff";

/**
 * ฟังก์ชันสำหรับ Initial LIFF โดยรับ liffId เข้ามาเป็นพารามิเตอร์
 * @param {string} liffId - LIFF ID ของหน้าเว็บนั้นๆ
 */
export const initLiff = async (liffId) => {
  if (!liffId) {
    throw new Error("LIFF ID is required for initialization.");
  }

  try {
    // ป้องกันการ init ซ้ำซ้อนถ้าเคย init ไปแล้ว
    if (!liff.isInClient() && liff.id) {
      return liff;
    }

    await liff.init({ liffId });

    if (!liff.isLoggedIn()) {
      // ถ้ายังไม่ล็อกอิน ให้เรียก liff.login() อัตโนมัติ
      liff.login();
    }
    return liff;
  } catch (error) {
    console.error("LIFF Initialization failed:", error);
    throw error;
  }
};

/**
 * ฟังก์ชันตรวจสอบสถานะและดึงข้อมูลโปรไฟล์
 */
export const getLiffUserProfile = async () => {
  if (!liff.isLoggedIn()) return null;

  try {
    const profile = await liff.getProfile();
    const idToken = liff.getIDToken();

    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
      idToken: idToken,
    };
  } catch (error) {
    console.error("Failed to get LIFF user profile:", error);
    return null;
  }
};

/**
 * ฟังก์ชันสำหรับ Logout
 */
export const liffLogout = () => {
  if (liff.isLoggedIn()) {
    liff.logout();
    window.location.reload();
  }
};
