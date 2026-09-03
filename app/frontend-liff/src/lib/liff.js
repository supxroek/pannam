// src/lib/liff.js
import liff from "@line/liff";

/**
 * ฟังก์ชันสำหรับ Initial LIFF โดยรับ liffId เข้ามาเป็นพารามิเตอร์
 * รองรับ Auto Login บน external browser
 * @param {string} liffId - LIFF ID ของหน้าเว็บนั้นๆ
 */
export const initLiff = async (liffId) => {
  if (!liffId) {
    throw new Error("LIFF ID is required for initialization.");
  }

  try {
    // ป้องกันการ init ซ้ำซ้อนถ้าเคย init ไปแล้ว
    if (!liff.isInClient() && liff.id) {
      // หากยังไม่ logged in → redirect ไป login ใหม่
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: window.location.href });
      }
      return liff;
    }

    // เปิดใช้งาน Auto Login บน external browser ผ่าน withLoginOnExternalBrowser
    await liff.init({
      liffId,
      withLoginOnExternalBrowser: true,
    });

    return liff;
  } catch (error) {
    // จัดการ error "invalid authorization code"
    // เกิดจาก URL ยังมี code/state เก่าค้างอยู่ (เช่น refresh หลัง login)
    if (
      error?.message?.includes("invalid authorization code") ||
      error?.message?.includes("INIT_FAILED")
    ) {
      try {
        await liff.init({
          liffId,
          withLoginOnExternalBrowser: true,
        });

        if (liff.isLoggedIn()) {
          return liff;
        }
      } catch (retryError) {
        console.error("LIFF retry init failed:", retryError);
      }

      // session ไม่มีหรือ retry ล้มเหลว → redirect ไป login ใหม่
      liff.login({
        redirectUri: window.location.origin + window.location.pathname,
      });
      return liff;
    }

    console.error("LIFF Initialization failed:", error);
    throw error;
  }
};

/**
 * ดึงข้อมูลโปรไฟล์ผู้ใช้
 * ใช้ liff.getDecodedIDToken() ก่อน (ไม่ต้อง network call, instant)
 * ถ้าไม่สำเร็จจะ fallback ไปใช้ liff.getProfile() (network call)
 *
 * @throws {Error} CORRUPT_TOKEN — เมื่อ token เสียหายและไม่สามารถดึงข้อมูลได้
 */
export const getLiffUserProfile = async () => {
  if (!liff.isLoggedIn()) return null;

  const idToken = liff.getIDToken();

  // ลอง Decoded ID Token ก่อน (ไม่ต้องยิง API → เร็วกว่า)
  try {
    const decoded = liff.getDecodedIDToken();

    if (decoded && decoded.sub) {
      return {
        userId: decoded.sub,
        displayName: decoded.name,
        pictureUrl: decoded.picture,
        statusMessage: decoded.statusMessage,
        idToken: idToken,
      };
    }
  } catch (err) {
    console.warn("getDecodedIDToken failed, falling back to getProfile:", err);
  }

  // Fallback → liff.getProfile() (network call)
  try {
    const profile = await liff.getProfile();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
      idToken: idToken,
    };
  } catch (error) {
    console.error("Failed to get LIFF user profile:", error);
  }
};

/**
 * ล้าง LIFF session ที่เสียหายออกจาก localStorage
 * แล้วบังคับ login ใหม่
 */
export const clearCorruptSession = () => {
  try {
    // ลบ LIFF_STORE ทั้งหมดออกจาก localStorage
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.includes("LIFF_STORE")) {
        localStorage.removeItem(key);
      }
    }

    // logout ถ้ายังเรียกได้
    try {
      if (liff.isLoggedIn()) {
        liff.logout();
      }
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
};

/**
 * บังคับ login ใหม่ — ล้าง session เก่า แล้ว redirect ไปหน้า LINE Login
 */
export const forceReLogin = () => {
  clearCorruptSession();
  liff.login({
    redirectUri: window.location.origin + window.location.pathname,
  });
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
