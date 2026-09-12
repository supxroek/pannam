// src/templates/flex/reader.flex.js

import { flex, bubble, box, text, button, separator } from "./common.flex.js";
import {
  LINE_DEFAULT_LIFF_URL,
  LINE_LIFF_ID_RECORD_WATER,
  LINE_LIFF_ID_RECORD_PAYMENT,
} from "../../config/line.config.js";

/**
 * Flex Message: สรุปความคืบหน้าการจดน้ำ (สำหรับผู้จดน้ำ)
 *
 * @param {Object} data ข้อมูลความคืบหน้า
 * @param {string} data.monthName ชื่อรอบเดือน เช่น "กันยายน 2569"
 * @param {number} data.totalProperties จำนวนบ้านทั้งหมด
 * @param {number} data.readProperties จดแล้ว (หลัง)
 * @param {number} data.unreadProperties ยังไม่จด (หลัง)
 * @param {number} data.percent เปอร์เซ็นต์ความคืบหน้า (%)
 * @param {Array<{zone: string, read: number, total: number}>} data.zones รายละเอียดตามโซน
 */
export function readerProgressFlex(data = {}) {
  const monthName = data.monthName || "เดือนปัจจุบัน";
  const total = data.totalProperties || 0;
  const read = data.readProperties || 0;
  const unread = data.unreadProperties || 0;
  const percent = data.percent !== undefined ? data.percent : (total > 0 ? Math.round((read / total) * 100) : 0);

  // สรุปรายโซน (ถ้ามี)
  const zoneRows = [];
  if (Array.isArray(data.zones) && data.zones.length > 0) {
    zoneRows.push(separator("sm"));
    zoneRows.push(
      text({
        text: "📍 ความคืบหน้าแยกตามโซน",
        size: "xxs",
        color: "#64748b",
        weight: "bold",
        margin: "xs",
      })
    );

    for (const z of data.zones) {
      const zPercent = z.total > 0 ? Math.round((z.read / z.total) * 100) : 0;
      zoneRows.push(
        box({
          layout: "horizontal",
          spacing: "sm",
          contents: [
            text({
              text: z.zone ? `โซน ${z.zone}` : "ทั่วไป",
              size: "xs",
              color: "#334155",
              flex: 4,
            }),
            text({
              text: `${z.read}/${z.total} หลัง (${zPercent}%)`,
              size: "xs",
              color: z.read === z.total ? "#16a34a" : "#2563eb",
              weight: "bold",
              align: "end",
              flex: 5,
            }),
          ],
        })
      );
    }
  }

  const liffUrl = `${LINE_DEFAULT_LIFF_URL}${LINE_LIFF_ID_RECORD_WATER || "record-water"}`;

  return flex(
    "สรุปความคืบหน้าการจดน้ำ 📝",
    bubble({
      size: "kilo",
      body: box({
        layout: "vertical",
        paddingAll: "xl",
        spacing: "md",
        contents: [
          // Badge
          box({
            layout: "horizontal",
            contents: [
              text({
                text: "📊 สรุปความคืบหน้าการจดน้ำ",
                size: "xxs",
                color: "#2563eb",
                weight: "bold",
              }),
            ],
            backgroundColor: "#eff6ff",
            cornerRadius: "xxl",
            paddingTop: "xs",
            paddingBottom: "xs",
            paddingStart: "md",
            paddingEnd: "md",
          }),

          // Header
          box({
            layout: "vertical",
            spacing: "xxs",
            contents: [
              text({
                text: "รอบบันทึกข้อมูล",
                size: "xs",
                color: "#64748b",
              }),
              text({
                text: monthName,
                size: "md",
                weight: "bold",
                color: "#1e293b",
              }),
            ],
          }),

          // Card ภาพรวม
          box({
            layout: "vertical",
            backgroundColor: "#f8fafc",
            cornerRadius: "md",
            paddingAll: "md",
            spacing: "sm",
            contents: [
              box({
                layout: "horizontal",
                contents: [
                  text({ text: "ความคืบหน้าทั้งหมด", size: "xs", color: "#64748b", flex: 5 }),
                  text({
                    text: `${percent}%`,
                    size: "sm",
                    color: percent === 100 ? "#16a34a" : "#2563eb",
                    weight: "bold",
                    align: "end",
                    flex: 4,
                  }),
                ],
              }),
              box({
                layout: "horizontal",
                contents: [
                  text({ text: "จดแล้ว", size: "xs", color: "#64748b", flex: 5 }),
                  text({ text: `✅ ${read} หลัง`, size: "xs", color: "#16a34a", weight: "bold", align: "end", flex: 4 }),
                ],
              }),
              box({
                layout: "horizontal",
                contents: [
                  text({ text: "คงเหลือยังไม่จด", size: "xs", color: "#64748b", flex: 5 }),
                  text({ text: `⏳ ${unread} หลัง`, size: "xs", color: unread > 0 ? "#ea580c" : "#64748b", weight: "bold", align: "end", flex: 4 }),
                ],
              }),
              box({
                layout: "horizontal",
                contents: [
                  text({ text: "บ้านทั้งหมด", size: "xs", color: "#64748b", flex: 5 }),
                  text({ text: `${total} หลัง`, size: "xs", color: "#1e293b", align: "end", flex: 4 }),
                ],
              }),
              ...zoneRows,
            ],
          }),

          // ปุ่ม Action
          button({
            action: {
              type: "uri",
              label: "📝 เปิดหน้าบันทึกจดน้ำ",
              uri: liffUrl,
            },
            style: "primary",
            color: "#2563eb",
            height: "sm",
            margin: "xs",
          }),
        ],
      }),
    })
  );
}

/**
 * Flex Message: ตรวจสอบบ้านค้างชำระ (สำหรับผู้จดน้ำ)
 *
 * @param {Object} data ข้อมูลค้างชำระ
 * @param {number} data.totalUnpaidAmount ยอดเงินค้างรวม (บาท)
 * @param {number} data.totalUnpaidHouses จำนวนบ้านที่ค้าง (หลัง)
 * @param {Array<{houseNumber: string, zone?: string, totalAmount: number, month?: string}>} data.topHouses รายการบ้านที่ค้างชำระ
 */
export function readerOverdueFlex(data = {}) {
  const totalAmount = data.totalUnpaidAmount || 0;
  const totalHouses = data.totalUnpaidHouses || 0;
  const topHouses = Array.isArray(data.topHouses) ? data.topHouses : [];

  const houseRows = [];
  if (topHouses.length > 0) {
    houseRows.push(separator("sm"));
    houseRows.push(
      text({
        text: "📋 รายการบ้านค้างชำระล่าสุด",
        size: "xxs",
        color: "#64748b",
        weight: "bold",
        margin: "xs",
      })
    );

    for (const h of topHouses) {
      const label = [
        h.houseNumber ? `บ้าน ${h.houseNumber}` : "",
        h.zone ? `(โซน ${h.zone})` : "",
      ]
        .filter(Boolean)
        .join(" ");

      houseRows.push(
        box({
          layout: "horizontal",
          spacing: "sm",
          contents: [
            text({
              text: `🏠 ${label}`,
              size: "xs",
              color: "#334155",
              flex: 5,
              wrap: true,
            }),
            text({
              text: `฿${Number(h.totalAmount || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
              size: "xs",
              color: "#dc2626",
              weight: "bold",
              align: "end",
              flex: 4,
            }),
          ],
        })
      );
    }
  } else {
    houseRows.push(
      text({
        text: "🎉 ไม่มีบ้านค้างชำระในขณะนี้",
        size: "xs",
        color: "#16a34a",
        align: "center",
        margin: "xs",
      })
    );
  }

  const liffUrl = `${LINE_DEFAULT_LIFF_URL}${LINE_LIFF_ID_RECORD_PAYMENT || "record-payment"}`;

  return flex(
    "ตรวจสอบบ้านค้างชำระ 💵",
    bubble({
      size: "kilo",
      body: box({
        layout: "vertical",
        paddingAll: "xl",
        spacing: "md",
        contents: [
          // Badge
          box({
            layout: "horizontal",
            contents: [
              text({
                text: "💵 รายการค้างชำระ / รอเก็บเงิน",
                size: "xxs",
                color: "#dc2626",
                weight: "bold",
              }),
            ],
            backgroundColor: "#fef2f2",
            cornerRadius: "xxl",
            paddingTop: "xs",
            paddingBottom: "xs",
            paddingStart: "md",
            paddingEnd: "md",
          }),

          // ยอดเงินรวมกล่องใหญ่
          box({
            layout: "vertical",
            spacing: "xs",
            contents: [
              text({
                text: "ยอดเงินค้างชำระรวม",
                size: "xs",
                color: "#64748b",
              }),
              text({
                text: `฿${Number(totalAmount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
                size: "xl",
                weight: "bold",
                color: "#dc2626",
              }),
              text({
                text: `จำนวนทั้งหมด ${totalHouses} หลังคาเรือน`,
                size: "xs",
                color: "#64748b",
              }),
            ],
          }),

          // กล่องรายการบ้าน
          box({
            layout: "vertical",
            backgroundColor: "#f8fafc",
            cornerRadius: "md",
            paddingAll: "md",
            spacing: "sm",
            contents: houseRows,
          }),

          // ปุ่ม Action
          button({
            action: {
              type: "uri",
              label: "💵 เปิดหน้าบันทึกการจ่าย",
              uri: liffUrl,
            },
            style: "primary",
            color: "#2563eb",
            height: "sm",
            margin: "xs",
          }),
        ],
      }),
    })
  );
}

export default {
  readerProgressFlex,
  readerOverdueFlex,
};
