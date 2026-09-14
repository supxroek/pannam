// src/templates/flex/reader.flex.js

import { flex, bubble, box, text, button, separator } from "./common.flex.js";
import {
  LINE_DEFAULT_LIFF_URL,
  LINE_LIFF_ID_RECORD_WATER,
  LINE_LIFF_ID_RECORD_PAYMENT,
} from "../../config/line.config.js";

// Mock Data สำหรับทดสอบข้อมูลโซน
const mockZones = [
  { zone: "1", read: 17, total: 20 },
  { zone: "2", read: 5, total: 10 },
  { zone: "3", read: 1, total: 5 },
  { zone: "4", read: 2, total: 3 },
  { zone: "5", read: 4, total: 4 },
];

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
  const clampedPercent = Math.min(100, Math.max(0, percent));

  // Progress Bar Color: ถ้าเสร็จครบ 100% ให้เป็นสีเขียว ถ้ายังไม่เสร็จให้เป็นสีน้ำเงินพรีเมียม
  const barColor = clampedPercent === 100 ? "#16a34a" : "#2563eb";

  let zonesData = data?.zones;
  // สำหรับทดสอบโซน
  zonesData = mockZones;

  // สรุปรายโซน (ถ้ามี)
  const zoneRows = [];
  if (Array.isArray(zonesData) && zonesData.length > 0) {
    zoneRows.push(
      text({
        text: "📍 ความคืบหน้าแยกตามโซน",
        size: "sm",
        color: "#475569",
        weight: "bold",
      }),
    );

    for (const z of zonesData) {
      const zPercent = z.total > 0 ? Math.round((z.read / z.total) * 100) : 0;
      const zClamped = Math.min(100, Math.max(0, zPercent));
      const zBarColor = z.read === z.total ? "#16a34a" : "#3b82f6";

      zoneRows.push(
        box({
          layout: "vertical",
          spacing: "sm",
          margin: "lg",
          contents: [
            box({
              layout: "horizontal",
              contents: [
                text({
                  text: z.zone ? `โซน ${z.zone}` : "ทั่วไป",
                  size: "sm",
                  color: "#64748b",
                  weight: "bold",
                  flex: 4,
                }),
                text({
                  text: `${z.read}/${z.total} หลัง`,
                  size: "sm",
                  color: z.read === z.total ? "#16a34a" : "#2563eb",
                  weight: "bold",
                  align: "end",
                  flex: 5,
                }),
              ],
            }),
            // Mini progress bar สำหรับแต่ละโซน
            box({
              layout: "vertical",
              backgroundColor: "#f1f5f9",
              height: "4px",
              cornerRadius: "xxl",
              contents: zClamped > 0 ? [
                box({
                  layout: "vertical",
                  width: `${zClamped}%`,
                  height: "4px",
                  backgroundColor: zBarColor,
                  cornerRadius: "xxl",
                  contents: [],
                })
              ] : [],
            }),
          ],
        })
      );
    }
  }

  return flex(
    "สรุปความคืบหน้าการจดน้ำ 📝",
    bubble({
      size: "kilo",
      body: box({
        layout: "vertical",
        paddingAll: "xl",
        spacing: "lg",
        contents: [
          // 1. Badge & Header
          box({
            layout: "vertical",
            spacing: "xs",
            contents: [
              box({
                layout: "horizontal",
                contents: [
                  text({
                    text: "📊 สรุปความคืบหน้าการจดน้ำ",
                    size: "xs",
                    color: "#2563eb",
                    // weight: "bold",
                  }),
                ],
                backgroundColor: "#eff6ff",
                cornerRadius: "xxl",
                paddingTop: "xs",
                paddingBottom: "xs",
                paddingStart: "md",
                paddingEnd: "md",
                alignItems: "center",
              }),
              box({
                layout: "vertical",
                spacing: "xs",
                margin: "md",
                contents: [
                  text({
                    text: "รอบเดือน",
                    size: "sm",
                    color: "#64748b",
                  }),
                  text({
                    text: monthName,
                    size: "xl",
                    weight: "bold",
                    color: "#0f172a",
                  }),
                ],
              }),
            ],
          }),

          // 2. Linear Progress Bar Section
          box({
            layout: "vertical",
            spacing: "xs",
            backgroundColor: "#f8fafc",
            cornerRadius: "lg",
            paddingAll: "md",
            contents: [
              box({
                layout: "horizontal",
                contents: [
                  text({
                    text: "ความคืบหน้ารวม",
                    size: "sm",
                    color: "#64748b",
                    flex: 5,
                    gravity: "center",
                  }),
                  text({
                    text: `${clampedPercent}%`,
                    size: "md",
                    weight: "bold",
                    color: barColor,
                    align: "end",
                    flex: 4,
                  }),
                ],
              }),
              // แถบเส้นความคืบหน้า (Linear Progress Bar)
              box({
                layout: "vertical",
                backgroundColor: "#e2e8f0",
                height: "8px",
                cornerRadius: "xxl",
                margin: "xs",
                contents: clampedPercent > 0 ? [
                  box({
                    layout: "vertical",
                    width: `${clampedPercent}%`,
                    height: "8px",
                    backgroundColor: barColor,
                    cornerRadius: "xxl",
                    contents: [],
                  })
                ] : [],
              }),
            ],
          }),

          // 3. จัดกลุ่มสถิติ (KPI Blocks)
          box({
            layout: "horizontal",
            spacing: "sm",
            contents: [
              // บล็อก: จดแล้ว
              box({
                layout: "vertical",
                flex: 1,
                backgroundColor: "#f0fdf4",
                cornerRadius: "md",
                paddingAll: "sm",
                alignItems: "center",
                spacing: "xs",
                contents: [
                  text({
                    text: "จดแล้ว",
                    size: "sm",
                    color: "#166534",
                    weight: "bold",
                    align: "center",
                  }),
                  text({
                    text: `${read}`,
                    size: "xl",
                    weight: "bold",
                    color: "#16a34a",
                    align: "center",
                  }),
                  text({
                    text: "หลัง",
                    size: "xs",
                    color: "#166534",
                    align: "center",
                  }),
                ],
              }),

              // บล็อก: คงเหลือ
              box({
                layout: "vertical",
                flex: 1,
                backgroundColor: unread > 0 ? "#fff7ed" : "#f8fafc",
                cornerRadius: "md",
                paddingAll: "sm",
                alignItems: "center",
                spacing: "xs",
                contents: [
                  text({
                    text: "คงเหลือ",
                    size: "sm",
                    color: unread > 0 ? "#9a3412" : "#64748b",
                    weight: "bold",
                    align: "center",
                  }),
                  text({
                    text: `${unread}`,
                    size: "xl",
                    weight: "bold",
                    color: unread > 0 ? "#ea580c" : "#94a3b8",
                    align: "center",
                  }),
                  text({
                    text: "หลัง",
                    size: "xs",
                    color: unread > 0 ? "#9a3412" : "#94a3b8",
                    align: "center",
                  }),
                ],
              }),

              // บล็อก: ทั้งหมด
              box({
                layout: "vertical",
                flex: 1,
                backgroundColor: "#f8fafc",
                cornerRadius: "md",
                paddingAll: "sm",
                alignItems: "center",
                spacing: "xs",
                contents: [
                  text({
                    text: "ทั้งหมด",
                    size: "sm",
                    color: "#475569",
                    weight: "bold",
                    align: "center",
                  }),
                  text({
                    text: `${total}`,
                    size: "xl",
                    weight: "bold",
                    color: "#1e293b",
                    align: "center",
                  }),
                  text({
                    text: "หลัง",
                    size: "xs",
                    color: "#94a3b8",
                    align: "center",
                  }),
                ],
              }),
            ],
          }),

          // 4. สรุปรายโซน (ถ้ามี)
          ...(zoneRows.length > 0 ? [
            box({
              layout: "vertical",
              spacing: "xs",
              backgroundColor: "#f8fafc",
              cornerRadius: "lg",
              paddingAll: "md",
              contents: zoneRows,
            })
          ] : []),

          // 5. ปุ่ม Action
          button({
            action: {
              type: "uri",
              label: "📝 เปิดหน้าจดมิเตอร์",
              uri: `${LINE_DEFAULT_LIFF_URL}${LINE_LIFF_ID_RECORD_WATER}`,
            },
            style: "primary",
            color: "#2563eb",
            height: "sm",
            margin: "xl",
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
