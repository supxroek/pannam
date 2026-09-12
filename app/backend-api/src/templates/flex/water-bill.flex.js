// src/templates/flex/water-bill.flex.js

import { flex, bubble, box, text, button, separator } from "./common.flex.js";
import {
  LINE_DEFAULT_LIFF_URL,
  LINE_LIFF_ID_WATER_USAGE,
} from "../../config/line.config.js";

/**
 * สถานะการชำระเงิน → Emoji + Label + สี
 */
const STATUS_MAP = {
  PENDING: { emoji: "🟡", label: "รอชำระ", color: "#d97706" },
  VERIFYING: { emoji: "🟡", label: "รอตรวจสอบ", color: "#d97706" },
  PAID_CASH: { emoji: "🟢", label: "ชำระแล้ว (เงินสด)", color: "#16a34a" },
  PAID_ONLINE: {
    emoji: "🟢",
    label: "ชำระแล้ว (ออนไลน์)",
    color: "#16a34a",
  },
  OVERDUE: { emoji: "🔴", label: "ค้างชำระ", color: "#dc2626" },
};

/**
 * สร้าง Flex bubble สำหรับค่าน้ำ 1 หลัง
 */
function waterBillBubble(data) {
  const status = STATUS_MAP[data.invoice?.paymentStatus] || STATUS_MAP.PENDING;

  const houseLabel =
    [
      data.houseNumber ? `บ้านเลขที่ ${data.houseNumber}` : "",
      data.zone ? `โซน ${data.zone}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "-";

  const hasInvoice = !!data.invoice;

  // ข้อมูลในกล่อง
  const infoRows = [];

  if (hasInvoice) {
    infoRows.push(
      // หน่วยที่ใช้
      box({
        layout: "horizontal",
        spacing: "sm",
        contents: [
          text({
            text: "หน่วยที่ใช้",
            size: "xs",
            color: "#64748b",
            flex: 3,
          }),
          text({
            text: `${data.reading?.consumption ?? "-"} หน่วย`,
            size: "xs",
            color: "#1e293b",
            weight: "bold",
            align: "end",
            flex: 4,
          }),
        ],
      }),
      // ยอดรวม
      box({
        layout: "horizontal",
        spacing: "sm",
        contents: [
          text({
            text: "ยอดรวม",
            size: "xs",
            color: "#64748b",
            flex: 3,
          }),
          text({
            text: `฿${data.invoice.totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
            size: "sm",
            color: "#1e293b",
            weight: "bold",
            align: "end",
            flex: 4,
          }),
        ],
      }),
      // สถานะ
      box({
        layout: "horizontal",
        spacing: "sm",
        contents: [
          text({
            text: "สถานะ",
            size: "xs",
            color: "#64748b",
            flex: 3,
          }),
          text({
            text: `${status.emoji} ${status.label}`,
            size: "xs",
            color: status.color,
            weight: "bold",
            align: "end",
            flex: 4,
          }),
        ],
      }),
      // กำหนดชำระ
      box({
        layout: "horizontal",
        spacing: "sm",
        contents: [
          text({
            text: "กำหนดชำระ",
            size: "xs",
            color: "#64748b",
            flex: 3,
          }),
          text({
            text: data.invoice.dueDateFormatted || "-",
            size: "xs",
            color: "#1e293b",
            align: "end",
            flex: 4,
          }),
        ],
      }),
    );
  } else {
    infoRows.push(
      text({
        text: "ยังไม่มีข้อมูลบิลค่าน้ำ",
        size: "xs",
        color: "#94a3b8",
        align: "center",
      }),
    );
  }

  // LIFF URL สำหรับดูรายละเอียด
  const liffUrl = `${LINE_DEFAULT_LIFF_URL}${LINE_LIFF_ID_WATER_USAGE}?propertyId=${data.propertyId}`;

  return bubble({
    size: "kilo",
    body: box({
      layout: "vertical",
      paddingAll: "xl",
      spacing: "md",
      contents: [
        // Badge header
        box({
          layout: "horizontal",
          contents: [
            text({
              text: "💧 ค่าน้ำประจำเดือน",
              size: "xxs",
              color: "#2563eb",
            }),
          ],
          backgroundColor: "#eff6ff",
          cornerRadius: "xxl",
          paddingTop: "xs",
          paddingBottom: "xs",
          paddingStart: "md",
          paddingEnd: "md",
        }),

        // ชื่อบ้าน + เดือน
        box({
          layout: "vertical",
          spacing: "xs",
          contents: [
            text({
              text: `🏡 ${houseLabel}`,
              size: "md",
              weight: "bold",
              color: "#1e293b",
              wrap: true,
            }),
            text({
              text: hasInvoice
                ? `ประจำเดือน ${data.reading?.readingMonth || "-"}`
                : "ยังไม่มีข้อมูล",
              size: "xs",
              color: "#64748b",
            }),
          ],
        }),

        // กล่องข้อมูล
        box({
          layout: "vertical",
          backgroundColor: "#f8fafc",
          cornerRadius: "md",
          paddingAll: "md",
          spacing: "sm",
          contents: infoRows,
        }),

        // ปุ่มดูรายละเอียดเพิ่มเติม
        button({
          action: {
            type: "uri",
            label: "💧 ดูรายละเอียดเพิ่มเติม",
            uri: liffUrl,
          },
          style: "primary",
          color: "#2563eb",
          height: "sm",
          margin: "sm",
        }),
      ],
    }),
  });
}

/**
 * สร้าง Flex Message เช็คค่าน้ำแบบย่อ
 *
 * - บ้าน 1 หลัง → Bubble เดียว
 * - หลายหลัง → Carousel
 *
 * @param {Array} properties — ข้อมูลบ้านพร้อมบิลล่าสุด (จาก waterService)
 * @returns {Object} Flex message object
 */
export default function waterBillFlex(properties = []) {
  if (properties.length === 0) {
    // ไม่มีบ้านในระบบ
    return flex(
      "เช็คค่าน้ำ 💧",
      bubble({
        size: "kilo",
        body: box({
          layout: "vertical",
          paddingAll: "xl",
          spacing: "md",
          contents: [
            text({
              text: "💧 เช็คค่าน้ำ",
              size: "md",
              weight: "bold",
              color: "#1e293b",
              align: "center",
            }),
            text({
              text: "ไม่พบข้อมูลบ้านที่ผูกกับบัญชีของคุณ กรุณาติดต่อเจ้าหน้าที่ค่ะ",
              size: "xs",
              color: "#64748b",
              align: "center",
              wrap: true,
            }),
          ],
        }),
      }),
    );
  }

  const bubbles = properties.map((prop) => waterBillBubble(prop));

  // บ้าน 1 หลัง → ส่ง bubble ตรง, หลายหลัง → carousel
  if (bubbles.length === 1) {
    return flex("เช็คค่าน้ำ 💧", bubbles[0]);
  }

  return flex("เช็คค่าน้ำ 💧", {
    type: "carousel",
    contents: bubbles,
  });
}
