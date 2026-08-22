import {
  LINE_DEFAULT_LIFF_URL,
  LINE_LIFF_ID_REGISTERED,
} from "../../../config/line.config.js";
import {
  flex,
  bubble,
  box,
  text,
  title,
  subtitle,
  button,
  bullet,
} from "./common.flex.js";

// Flex Followme - สำหรับตอบกลับผู้ใช้เมื่อติดตามใหม่
export default function followmeFlex() {
  return flex(
    "ยินดีต้อนรับสู่ปันน้ำ (PANNAM)",
    bubble({
      size: "kilo",
      body: box({
        layout: "vertical",
        spacing: "md",
        contents: [
          title("ยินดีต้อนรับสู่ปันน้ำ 💧"),
          subtitle("ระบบน้ำประปาเพื่อชุมชน", { color: "#666666" }),
          text({
            text: "ขอบคุณที่เพิ่มเพื่อนกับเรา🙏ระบบนี้จะช่วยให้ท่านเช็กค่าน้ำและประวัติการใช้น้ำได้สะดวกรวดเร็วผ่าน LINE ⚡",
            size: "sm",
            color: "#2f353d",
            margin: "lg",
          }),
          text({
            text: "Features:",
            size: "sm",
            weight: "bold",
            color: "#2f353d",
            margin: "lg",
          }),
          bullet("ดูค่าน้ำเดือนนี้ 💧"),
          bullet("ประวัติการใช้น้ำ 📜"),
          bullet("แจ้งปัญหา/ติดต่อ 📞"),
          button({
            action: {
              type: "uri",
              label: "เริ่มต้นใช้งาน",
              uri: `${LINE_DEFAULT_LIFF_URL}${LINE_LIFF_ID_REGISTERED}`,
            },
            style: "primary",
            color: "#0288D1",
            margin: "lg",
          }),
        ],
      }),
    }),
  );
}
