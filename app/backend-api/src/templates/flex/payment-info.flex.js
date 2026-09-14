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

// Mock Data สำหรับทดสอบช่องทางการชำระเงิน
const mockVillage = {
  address: "บ้านคลองไคร หมู่ที่ 10",
  bankProvider: "ธนาคารกรุงไทย",
  bankNumber: "1234567890",
  bankPayeeName: "นาย สมชาย แสง",
  promptpayNo: "0812345678",
  promptpayName: "สมชาย แสง",
  promptpayImage: "https://storage3.me-qr.com/qr/399754654.png?v=1789373728",
  enablePromptpay: true,
};

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
  // สำหรับทดสอบ
  village = mockVillage;
  
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
              size: "sm",
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
        size: "md",
        weight: "bold",
        color: "#1e293b",
      }),
      // ธนาคาร
      box({
        layout: "horizontal",
        spacing: "sm",
        margin: "lg",
        contents: [
          text({
            text: "ธนาคาร",
            size: "sm",
            color: "#64748b",
            flex: 3,
          }),
          text({
            text: village.bankProvider,
            size: "sm",
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
            size: "sm",
            color: "#64748b",
            flex: 3,
          }),
          text({
            text: village.bankNumber,
            size: "sm",
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
              size: "sm",
              color: "#64748b",
              flex: 3,
            }),
            text({
              text: village.bankPayeeName,
              size: "sm",
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
        spacing: "sm",
        margin: "lg",
        contents: bankRows,
      }),
    );
  }

  // ───── ส่วน: พร้อมเพย์ ─────
  if (village.enablePromptpay && village.promptpayNo) {
    const promptpayRows = [
      text({
        text: "📱 พร้อมเพย์",
        size: "md",
        weight: "bold",
        color: "#1e293b",
      }),
      // เลขพร้อมเพย์
      box({
        layout: "horizontal",
        spacing: "sm",
        margin: "lg",
        contents: [
          text({
            text: "หมายเลข",
            size: "sm",
            color: "#64748b",
            flex: 3,
          }),
          text({
            text: village.promptpayNo,
            size: "sm",
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
              size: "sm",
              color: "#64748b",
              flex: 3,
            }),
            text({
              text: village.promptpayName,
              size: "sm",
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
        backgroundColor: "#f8fafc",
        cornerRadius: "md",
        paddingAll: "md",
        spacing: "sm",
        contents: promptpayRows,
      }),
    ];

    // QR Code (ถ้ามี)
    if (village.promptpayImage) {
      promptpaySection.push(
        box({
          layout: "vertical",
          alignItems: "center",
          margin: "lg",
          contents: [
            image({
              url: village.promptpayImage,
              size: "lg",
              aspectRatio: "1:1",
              aspectMode: "fit",
            }),
            text({
              text: "สแกน QR Code เพื่อชำระเงิน",
              size: "xs",
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
      text: "***หรือชำระเงินสดกับเจ้าหน้าโดยตรง",
      size: "sm",
      color: "#94a3b8",
      align: "center",
      wrap: true,
      margin: "lg",
    }),
  );

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
                size: "xs",
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
            text: `🏡 ${village.address || "หมู่บ้าน"}`,
            size: "md",
            weight: "bold",
            color: "#1e293b",
            wrap: false,
          }),

          // ข้อมูลช่องทางชำระ
          ...contentSections,

          // ปุ่มแจ้งชำระเงิน
          // button({
          //   action: {
          //     type: "uri",
          //     label: "แจ้งชำระเงิน",
          //     uri: `${LINE_DEFAULT_LIFF_URL}${LINE_LIFF_ID_PAYMENT}`,
          //   },
          //   style: "primary",
          //   color: "#2563eb",
          //   height: "sm",
          //   margin: "lg",
          // }),
        ],
      }),
    }),
  );
}
