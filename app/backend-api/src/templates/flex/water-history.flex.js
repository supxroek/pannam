// src/templates/flex/water-history.flex.js

import { flex, bubble, box, text, button, separator } from "./common.flex.js";
import {
  LINE_DEFAULT_LIFF_URL,
  LINE_LIFF_ID_WATER_HISTORY,
} from "../../config/line.config.js";

/**
 * สถานะการชำระ → สี dot
 */
const STATUS_DOT = {
  PENDING: "🟡",
  VERIFYING: "🟡",
  PAID_CASH: "🟢",
  PAID_ONLINE: "🟢",
  OVERDUE: "🔴",
};

/**
 * สร้าง Flex bubble ประวัติการใช้น้ำ 1 หลัง
 */
function waterHistoryBubble(data) {
  const houseLabel =
    [
      data.houseNumber ? `บ้านเลขที่ ${data.houseNumber}` : "",
      data.zone ? `โซน ${data.zone}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "-";

  const hasHistory = data.history && data.history.length > 0;

  // สร้างแถวข้อมูลแต่ละเดือน
  const historyRows = [];

  if (hasHistory) {
    // Header row
    historyRows.push(
      box({
        layout: "horizontal",
        spacing: "sm",
        contents: [
          text({
            text: "เดือน",
            size: "xxs",
            color: "#94a3b8",
            weight: "bold",
            flex: 3,
          }),
          text({
            text: "หน่วย",
            size: "xxs",
            color: "#94a3b8",
            weight: "bold",
            align: "end",
            flex: 2,
          }),
          text({
            text: "ยอดเงิน",
            size: "xxs",
            color: "#94a3b8",
            weight: "bold",
            align: "end",
            flex: 3,
          }),
        ],
      }),
    );

    // Data rows
    for (const record of data.history) {
      const dot = STATUS_DOT[record.paymentStatus] || "⚪";

      historyRows.push(
        box({
          layout: "horizontal",
          spacing: "sm",
          margin: "sm",
          contents: [
            text({
              text: `${dot} ${record.month}`,
              size: "xs",
              color: "#1e293b",
              flex: 3,
            }),
            text({
              text: `${record.consumption}`,
              size: "xs",
              color: "#1e293b",
              align: "end",
              flex: 2,
            }),
            text({
              text:
                record.totalAmount !== null
                  ? `฿${record.totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`
                  : "-",
              size: "xs",
              color: "#1e293b",
              align: "end",
              flex: 3,
            }),
          ],
        }),
      );
    }
  } else {
    historyRows.push(
      text({
        text: "ยังไม่มีประวัติการใช้น้ำ",
        size: "xs",
        color: "#94a3b8",
        align: "center",
      }),
    );
  }

  // LIFF URL
  const liffUrl = `${LINE_DEFAULT_LIFF_URL}${LINE_LIFF_ID_WATER_HISTORY}?propertyId=${data.propertyId}`;

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
              text: "📊 ประวัติการใช้น้ำ",
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

        // ชื่อบ้าน
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
              text: hasHistory
                ? `${data.history.length} เดือนย้อนหลัง`
                : "ยังไม่มีข้อมูล",
              size: "xs",
              color: "#64748b",
            }),
          ],
        }),

        // ตารางประวัติ
        box({
          layout: "vertical",
          backgroundColor: "#f8fafc",
          cornerRadius: "md",
          paddingAll: "md",
          spacing: "xs",
          contents: historyRows,
        }),

        // คำอธิบายสถานะ
        ...(hasHistory
          ? [
              text({
                text: "🟢 ชำระแล้ว  🟡 รอชำระ  🔴 ค้างชำระ",
                size: "xxs",
                color: "#94a3b8",
                align: "center",
              }),
            ]
          : []),

        // ปุ่มดูประวัติทั้งหมด
        button({
          action: {
            type: "uri",
            label: "📋 ดูประวัติทั้งหมด / กราฟ",
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
 * สร้าง Flex Message ประวัติการใช้น้ำแบบย่อ
 *
 * - บ้าน 1 หลัง → Bubble เดียว
 * - หลายหลัง → Carousel
 *
 * @param {Array} properties — ข้อมูลบ้านพร้อมประวัติ (จาก waterService)
 * @returns {Object} Flex message object
 */
export default function waterHistoryFlex(properties = []) {
  if (properties.length === 0) {
    return flex(
      "ประวัติการใช้น้ำ 📊",
      bubble({
        size: "kilo",
        body: box({
          layout: "vertical",
          paddingAll: "xl",
          spacing: "md",
          contents: [
            text({
              text: "📊 ประวัติการใช้น้ำ",
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

  const bubbles = properties.map((prop) => waterHistoryBubble(prop));

  if (bubbles.length === 1) {
    return flex("ประวัติการใช้น้ำ 📊", bubbles[0]);
  }

  return flex("ประวัติการใช้น้ำ 📊", {
    type: "carousel",
    contents: bubbles,
  });
}
