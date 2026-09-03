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
  logo,
} from "./common.flex.js";

// Flex Register - สำหรับตอบกลับให้ผู้ใช้สมัครสมาชิก
export default function registerFlex() {
  return flex(
    "สมัครสมาชิกเพื่อใช้งานปันน้ำ (PANNAM)",
    bubble({
      size: "kilo",
      body: box({
        layout: "vertical",
        spacing: "sm",
        contents: [
          logo({
            url: "https://profile.line-scdn.net/0h-n9lwDPCckEEFW5dL0INFjhQfCxzO3QJfHNpInZHfyIoJDdAaCY7dCdFK3d9JmIXayc6JiAcJXko",
            aspectRatio: "20:8",
          }),
          title("สมัครสมาชิก 👨‍💻"),
          subtitle("กรุณาสมัครสมาชิกก่อนใช้งาน", { color: "#666666" }),

          text({
            text: "ข้อมูลที่ต้องกรอก:",
            size: "sm",
            weight: "bold",
            color: "#2f353d",
            margin: "lg",
          }),
          bullet("ชื่อ-นามสกุล"),
          bullet("เบอร์โทรศัพท์"),
          bullet("บ้านเลขที่"),
          bullet("โซน"),
          bullet("หมู่บ้าน"),

          button({
            action: {
              type: "uri",
              label: "ลงทะเบียน",
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
