// src/hooks/useLiffAuth.js
import { useState, useEffect, useRef } from 'react';
import liff from '@line/liff';
import { initLiff, getLiffUserProfile, forceReLogin } from '../lib/liff';

// ระยะเวลาตรวจสอบ token (ทุก 5 นาที)
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000;

/**
 * Custom Hook สำหรับจัดการ Auth ของ LIFF
 *
 * Flow:
 * 1. ยังไม่เคย login (ไม่มี session ใน localStorage)
 *    → loading: true → แสดง LiffLoadingScreen → redirect ไป LINE Login → กลับมา → ดึงโปรไฟล์ → loading: false
 *
 * 2. เคย login แล้ว (มี session ใน localStorage) → refresh หน้า
 *    → loading: false ตั้งแต่แรก → ไม่แสดง LiffLoadingScreen → init เงียบๆ ใน background → ดึงโปรไฟล์
 *
 * 3. Token หมดอายุ
 *    → ตรวจพบ isLoggedIn() === false → redirect ไป LINE Login อัตโนมัติ
 *
 * 4. Token เสียหาย (corrupt)
 *    → ล้าง session → redirect ไป LINE Login ใหม่อัตโนมัติ
 *
 * @param {string} liffId - LIFF ID ประจำหน้านั้นๆ
 */
export function useLiffAuth(liffId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tokenCheckRef = useRef(null);

  useEffect(() => {
    async function setupLiff() {
      try {
        setError(null);

        // init LIFF (พร้อม Auto Login + withLoginOnExternalBrowser)
        await initLiff(liffId);

        // ถ้ายังไม่ได้เข้าสู่ระบบ (ระบบกำลัง redirect ไปยัง LINE Login)
        // คงสถานะ loading ไว้ (ถ้า loading เป็น true อยู่แล้ว)
        // เพื่อแสดงหน้า LoadingScreen จนกว่าจะเปลี่ยนหน้าเสร็จ
        if (!liff.isLoggedIn()) {
          setLoading(true);
          return;
        }

        // เข้าสู่ระบบเรียบร้อย → ดึงข้อมูลโปรไฟล์
        // (ใช้ getDecodedIDToken ก่อน → fallback getProfile)
        const profile = await getLiffUserProfile();
        setUser(profile);
        setLoading(false);
      } catch (err) {
        console.error('useLiffAuth error:', err);

        // Error boundary: token เสียหาย → ล้าง session + login ใหม่อัตโนมัติ
        if (err?.message === 'CORRUPT_TOKEN') {
          console.warn('Corrupt LIFF token detected. Clearing session and redirecting to login...');
          forceReLogin();
          return; // ไม่ต้อง setError เพราะกำลัง redirect อยู่
        }

        setError(err);
        setLoading(false);
      }
    }

    if (liffId) {
      setupLiff();
    }

    return () => {
      // ล้าง interval เมื่อ unmount
      if (tokenCheckRef.current) {
        clearInterval(tokenCheckRef.current);
      }
    };
  }, [liffId]);

  // ตรวจสอบ token เป็นระยะ — ถ้าหมดอายุให้ redirect ไป login ใหม่
  useEffect(() => {
    if (!user) return;

    tokenCheckRef.current = setInterval(() => {
      try {
        if (!liff.isLoggedIn() || !liff.getAccessToken()) {
          console.warn('LIFF token expired, redirecting to login...');
          clearInterval(tokenCheckRef.current);
          liff.login({ redirectUri: window.location.href });
        }
      } catch {
        // ignore — ยังไม่ได้ init
      }
    }, TOKEN_CHECK_INTERVAL);

    return () => {
      if (tokenCheckRef.current) {
        clearInterval(tokenCheckRef.current);
      }
    };
  }, [user]);

  return { user, loading, error };
}