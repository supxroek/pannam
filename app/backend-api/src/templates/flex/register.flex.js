import {
  LINE_DEFAULT_LIFF_URL,
  LINE_LIFF_ID_REGISTERED,
} from "../../config/line.config.js";
import { flex, bubble, box, text, button } from "./common.flex.js";

// Flex Register - สำหรับแจ้งเตือนให้ผู้ใช้ลงทะเบียนสมาชิกก่อนเข้าใช้งาน
export default function registerFlex() {
  return flex(
    "กรุณาลงทะเบียนก่อนใช้งานระบบปันน้ำ 💧",
    bubble({
      size: "kilo",
      body: box({
        layout: "vertical",
        paddingAll: "xl",
        spacing: "md",
        contents: [
          // 1. Badge หัวข้อด้านบน
          box({
            layout: "horizontal",
            contents: [
              text({
                text: "💧 ระบบน้ำประปาปันน้ำ (PANNAM)",
                size: "xxs",
                weight: "bold",
                color: "#2563eb",
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

          // 2. หัวข้อแจ้งเตือน & คำอธิบายกระชับ
          box({
            layout: "vertical",
            spacing: "xs",
            margin: "sm",
            contents: [
              text({
                text: "กรุณาลงทะเบียนก่อนใช้งาน ✍️",
                size: "lg",
                weight: "bold",
                color: "#1e293b",
                wrap: true,
              }),
              text({
                text: "ค้นหาไม่พบบัญชีของคุณในระบบ ลงทะเบียนตอนนี้เลย! เพื่อเริ่มเช็กค่าน้ำและใช้งานบริการต่างๆ ได้ทันทีค่ะ",
                size: "xs",
                color: "#64748b",
                wrap: true,
                margin: "xs",
              }),
            ],
          }),

          // 3. Highlight Box: สิทธิประโยชน์/ฟีเจอร์ที่ได้รับ
          box({
            layout: "vertical",
            backgroundColor: "#f8fafc",
            cornerRadius: "md",
            paddingAll: "md",
            margin: "md",
            spacing: "xs",
            contents: [
              box({
                layout: "horizontal",
                spacing: "sm",
                alignItems: "center",
                contents: [
                  text({ text: "💧", size: "xs", flex: 0 }),
                  text({
                    text: "เช็กค่าน้ำประจำเดือนสะดวกรวดเร็ว",
                    size: "xs",
                    color: "#334155",
                    flex: 1,
                    wrap: true,
                  }),
                ],
              }),
              box({
                layout: "horizontal",
                spacing: "sm",
                alignItems: "center",
                contents: [
                  text({ text: "📊", size: "xs", flex: 0 }),
                  text({
                    text: "ดูประวัติการใช้น้ำย้อนหลังได้ทุกเมื่อ",
                    size: "xs",
                    color: "#334155",
                    flex: 1,
                    wrap: true,
                  }),
                ],
              }),
              box({
                layout: "horizontal",
                spacing: "sm",
                alignItems: "center",
                contents: [
                  text({ text: "🔔", size: "xs", flex: 0 }),
                  text({
                    text: "รับการแจ้งเตือนบิลค่าน้ำผ่าน LINE",
                    size: "xs",
                    color: "#334155",
                    flex: 1,
                    wrap: true,
                  }),
                ],
              }),
            ],
          }),

          // 4. ปุ่ม Action สำหรับลงทะเบียน
          button({
            action: {
              type: "uri",
              label: "ลงทะเบียนสมาชิกเลย 🚀",
              uri: `${LINE_DEFAULT_LIFF_URL}${LINE_LIFF_ID_REGISTERED}`,
            },
            style: "primary",
            color: "#2563eb",
            margin: "md",
            height: "sm",
          }),

          // 5. หมายเหตุด้านล่าง
          text({
            text: "ใช้เวลาลงทะเบียนเพียง 1-2 นาทีเท่านั้นค่ะ ✨",
            size: "xxs",
            color: "#94a3b8",
            align: "center",
            margin: "xs",
          }),
        ],
      }),
    }),
  );
}
