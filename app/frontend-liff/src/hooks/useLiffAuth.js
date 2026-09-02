// src/hooks/useLiffAuth.js
import { useState, useEffect } from 'react';
import { initLiff, getLiffUserProfile } from '../lib/liff';

/**
 * Custom Hook สำหรับจัดการ Auth ของ LIFF
 * @param {string} liffId - LIFF ID ประจำหน้านั้นๆ
 */
export function useLiffAuth(liffId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function setupLiff() {
      try {
        // ส่ง liffId ที่รับเข้ามาเข้าไปที่ฟังก์ชัน init
        await initLiff(liffId);
        const profile = await getLiffUserProfile();
        setUser(profile);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    if (liffId) {
      setupLiff();
    }
  }, [liffId]);

  return { user, loading, error };
}