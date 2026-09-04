import {
  flex,
  bubble,
  box,
  text,
  button,
} from "./common.flex.js";

/**
 * Flex Message ต้อนรับผู้ใช้หลังจากสมัครสมาชิกสำเร็จ
 * พร้อมแนะนำวิธีการใช้งานเบื้องต้น
 *
 * @param {Object} options
 * @param {string} [options.name] ชื่อผู้ใช้หรือชื่อสมาชิก
 */
export default function welcomeFlex({ name } = {}) {
  const displayName = name ? `คุณ${name}` : "คุณสมาชิก";

  return flex(
    "ยินดีต้อนรับสู่ระบบปันน้ำ (PANNAM) 💧",
    bubble({
      size: "kilo",
      body: box({
        layout: "vertical",
        paddingAll: "xl",
        spacing: "md",
        contents: [
          // 1. Badge ด้านบน
          box({
            layout: "horizontal",
            contents: [
              text({
                text: "🎉 สมัครสมาชิกสำเร็จ",
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

          // 2. หัวข้อต้อนรับ & คำอธิบายกระชับ
          box({
            layout: "vertical",
            spacing: "xs",
            margin: "sm",
            contents: [
              text({
                text: "ยินดีต้อนรับสู่ปันน้ำ 💧",
                size: "lg",
                weight: "bold",
                color: "#1e293b",
                wrap: true,
              }),
              text({
                text: `สวัสดีค่ะ ${displayName} บัญชีของคุณพร้อมใช้งานแล้ว สามารถตรวจสอบค่าน้ำและใช้งานบริการต่างๆ ได้ทันทีค่ะ`,
                size: "xs",
                color: "#64748b",
                wrap: true,
                margin: "xs",
              }),
            ],
          }),

          // 3. Highlight Box: วิธีการใช้งานและคำสั่งแนะนำ
          box({
            layout: "vertical",
            backgroundColor: "#f8fafc",
            cornerRadius: "md",
            paddingAll: "md",
            margin: "md",
            spacing: "xs",
            contents: [
              text({
                text: "วิธีใช้งานและคำสั่งแนะนำ 💡",
                size: "xs",
                weight: "bold",
                color: "#1e293b",
                margin: "none",
              }),
              box({
                layout: "horizontal",
                spacing: "sm",
                alignItems: "center",
                margin: "xs",
                contents: [
                  text({ text: "💧", size: "xs", flex: 0 }),
                  text({
                    text: 'พิมพ์ "เช็คค่าน้ำ" เพื่อดูยอดประจำเดือน',
                    size: "xs",
                    color: "#334155",
                    weight: "bold",
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
                    text: 'พิมพ์ "ประวัติ" เพื่อดูสถิติย้อนหลัง',
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
                  text({ text: "🛠️", size: "xs", flex: 0 }),
                  text({
                    text: 'พิมพ์ "แจ้งปัญหา" เมื่อน้ำไม่ไหลหรือท่อแตก',
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
                  text({ text: "❓", size: "xs", flex: 0 }),
                  text({
                    text: 'พิมพ์ "วิธีใช้" เพื่อดูบริการทั้งหมด',
                    size: "xs",
                    color: "#334155",
                    flex: 1,
                    wrap: true,
                  }),
                ],
              }),
            ],
          }),

          // 4. ปุ่ม Action เริ่มต้นใช้งาน
          button({
            action: {
              type: "message",
              label: "เริ่มต้นเช็กค่าน้ำเลย 💧",
              text: "เช็คค่าน้ำ",
            },
            style: "primary",
            color: "#2563eb",
            margin: "md",
            height: "sm",
          }),

          // 5. หมายเหตุด้านล่าง
          text({
            text: "เลือกใช้งานผ่านเมนูด้านล่างได้ตลอด 24 ชม. ✨",
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
