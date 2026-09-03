import {
  LINE_DEFAULT_LIFF_URL,
  LINE_LIFF_ID_REGISTERED,
} from "../../config/line.config.js";
import {
  flex,
  bubble,
  box,
  text,
  title,
  subtitle,
  button,
  bullet,
  separator,
} from "./common.flex.js";

// Flex Followme - สำหรับตอบกลับผู้ใช้เมื่อติดตามใหม่
export default function followmeFlex() {
  return flex(
    "สมัครสมาชิก",
    bubble({
      size: "kilo",
      body: box({
        layout: "vertical",
        spacing: "md",
        contents: [
          text({
            text: "📂 ข้อมูลที่ต้องเตรียม",
            size: "md",
            weight: "bold",
            color: "#2f353d",
            margin: "lg",
          }),
          bullet("👤 ข้อมูลส่วนตัว"),
          bullet("🪪 ข้อมูลบัตรประชาชน"),
          bullet("📞 เบอร์โทรศัพท์"),
          bullet("🏠 ข้อมูลที่อยู่"),
          separator({ margin: "lg" }),
          button({
            action: {
              type: "uri",
              label: "เริ่มต้นใช้งาน",
              uri: `${LINE_DEFAULT_LIFF_URL}${LINE_LIFF_ID_REGISTERED}`,
            },
            style: "primary",
            color: "#6B85FF",
            margin: "lg",
          }),
        ],
      }),
    }),
  );
}
