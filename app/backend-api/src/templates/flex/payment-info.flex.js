// src/templates/flex/payment-info.flex.js

import {
  flex,
  bubble,
  box,
  text,
  image,
  button,
} from "./common.flex.js";
import {
  LINE_DEFAULT_LIFF_URL,
  LINE_LIFF_ID_PAYMENT,
} from "../../config/line.config.js";

/**
 * สร้าง Flex Bubble แสดงช่องทางชำระเงิน
 *
 * ดึงข้อมูลจาก village:
 * - ธนาคาร (bankProvider, bankNumber, bankPayeeName)
 * - พร้อมเพย์ (promptpayNo, promptpayName, promptpayImage)
 * - เปิด/ปิดพร้อมเพย์ (enablePromptpay)
 *
 * @param {Object} village — ข้อมูลหมู่บ้าน (จาก waterService.getVillagePaymentInfo)
 * @returns {Object} Flex message object
 */
export default function paymentInfoFlex(village) {
  if (!village) {
    return flex(
      "ช่องทางชำระเงิน 💳",
      bubble({
        size: "kilo",
        body: box({
          layout: "vertical",
          paddingAll: "xl",
          spacing: "md",
          contents: [
            text({
              text: "💳 ช่องทางชำระเงิน",
              size: "md",
              weight: "bold",
              color: "#1e293b",
              align: "center",
            }),
            text({
              text: "ไม่พบข้อมูลหมู่บ้านของคุณ กรุณาติดต่อเจ้าหน้าที่ค่ะ",
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

  const contentSections = [];

  // ───── ส่วน: โอนผ่านธนาคาร ─────
  if (village.bankProvider && village.bankNumber) {
    const bankRows = [
      text({
        text: "🏦 โอนผ่านธนาคาร",
        size: "sm",
        weight: "bold",
        color: "#1e293b",
      }),
      // ธนาคาร
      box({
        layout: "horizontal",
        spacing: "sm",
        margin: "sm",
        contents: [
          text({
            text: "ธนาคาร",
            size: "xs",
            color: "#64748b",
            flex: 3,
          }),
          text({
            text: village.bankProvider,
            size: "xs",
            color: "#1e293b",
            weight: "bold",
            align: "end",
            flex: 5,
            wrap: true,
          }),
        ],
      }),
      // เลขบัญชี
      box({
        layout: "horizontal",
        spacing: "sm",
        contents: [
          text({
            text: "เลขบัญชี",
            size: "xs",
            color: "#64748b",
            flex: 3,
          }),
          text({
            text: village.bankNumber,
            size: "xs",
            color: "#1e293b",
            weight: "bold",
            align: "end",
            flex: 5,
          }),
        ],
      }),
    ];

    // ชื่อบัญชี (ถ้ามี)
    if (village.bankPayeeName) {
      bankRows.push(
        box({
          layout: "horizontal",
          spacing: "sm",
          contents: [
            text({
              text: "ชื่อบัญชี",
              size: "xs",
              color: "#64748b",
              flex: 3,
            }),
            text({
              text: village.bankPayeeName,
              size: "xs",
              color: "#1e293b",
              weight: "bold",
              align: "end",
              flex: 5,
              wrap: true,
            }),
          ],
        }),
      );
    }

    contentSections.push(
      box({
        layout: "vertical",
        backgroundColor: "#f8fafc",
        cornerRadius: "md",
        paddingAll: "md",
        spacing: "xs",
        contents: bankRows,
      }),
    );
  }

  // ───── ส่วน: พร้อมเพย์ ─────
  if (village.enablePromptpay && village.promptpayNo) {
    const promptpayRows = [
      text({
        text: "📱 พร้อมเพย์ (PromptPay)",
        size: "sm",
        weight: "bold",
        color: "#1e293b",
      }),
      // เลขพร้อมเพย์
      box({
        layout: "horizontal",
        spacing: "sm",
        margin: "sm",
        contents: [
          text({
            text: "หมายเลข",
            size: "xs",
            color: "#64748b",
            flex: 3,
          }),
          text({
            text: village.promptpayNo,
            size: "xs",
            color: "#1e293b",
            weight: "bold",
            align: "end",
            flex: 5,
          }),
        ],
      }),
    ];

    // ชื่อพร้อมเพย์ (ถ้ามี)
    if (village.promptpayName) {
      promptpayRows.push(
        box({
          layout: "horizontal",
          spacing: "sm",
          contents: [
            text({
              text: "ชื่อบัญชี",
              size: "xs",
              color: "#64748b",
              flex: 3,
            }),
            text({
              text: village.promptpayName,
              size: "xs",
              color: "#1e293b",
              weight: "bold",
              align: "end",
              flex: 5,
              wrap: true,
            }),
          ],
        }),
      );
    }

    const promptpaySection = [
      box({
        layout: "vertical",
        backgroundColor: "#f0fdf4",
        cornerRadius: "md",
        paddingAll: "md",
        spacing: "xs",
        contents: promptpayRows,
      }),
    ];

    // QR Code (ถ้ามี)
    if (village.promptpayImage) {
      promptpaySection.push(
        box({
          layout: "vertical",
          alignItems: "center",
          margin: "sm",
          contents: [
            image({
              url: village.promptpayImage,
              size: "lg",
              aspectRatio: "1:1",
              aspectMode: "fit",
            }),
            text({
              text: "สแกน QR Code เพื่อชำระเงิน",
              size: "xxs",
              color: "#94a3b8",
              align: "center",
              margin: "xs",
            }),
          ],
        }),
      );
    }

    contentSections.push(...promptpaySection);
  }

  // หมายเหตุ
  contentSections.push(
    text({
      text: "หรือชำระเงินสดกับเจ้าหน้าที่จดน้ำโดยตรง",
      size: "xxs",
      color: "#94a3b8",
      align: "center",
      wrap: true,
      margin: "md",
    }),
  );

  // LIFF URL สำหรับแจ้งชำระ/อัปสลิป
  const liffUrl = `${LINE_DEFAULT_LIFF_URL}${LINE_LIFF_ID_PAYMENT}`;

  return flex(
    "ช่องทางชำระเงิน 💳",
    bubble({
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
                text: "💳 ช่องทางชำระเงิน",
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

          // ชื่อหมู่บ้าน
          text({
            text: village.address || "หมู่บ้าน",
            size: "md",
            weight: "bold",
            color: "#1e293b",
            wrap: true,
          }),

          // ข้อมูลช่องทางชำระ
          ...contentSections,

          // ปุ่มแจ้งชำระเงิน
          button({
            action: {
              type: "uri",
              label: "💳 แจ้งชำระเงิน",
              uri: liffUrl,
            },
            style: "primary",
            color: "#2563eb",
            height: "sm",
            margin: "sm",
          }),
        ],
      }),
    }),
  );
}
