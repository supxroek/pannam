import {
  flex,
  bubble,
  box,
  text,
  button,
  separator,
} from "./common.flex.js";

/**
 * ฟังก์ชัน Masking เลขบัตรประชาชน (เช่น 1-2345-XXXXX-12-3)
 */
function maskNationalId(id = "") {
  const clean = String(id).replace(/[^0-9]/g, "");
  if (clean.length === 13) {
    return `${clean.slice(0, 1)}-${clean.slice(1, 5)}-XXXXX-${clean.slice(10, 12)}-${clean.slice(12)}`;
  }
  if (clean.length >= 8) {
    return `${clean.slice(0, 4)}XXXXX${clean.slice(-2)}`;
  }
  return id || "-";
}

/**
 * ฟังก์ชัน Masking เบอร์โทรศัพท์ (เช่น 081-XXX-5678)
 */
function maskPhone(phone = "") {
  const clean = String(phone).replace(/[^0-9]/g, "");
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-XXX-${clean.slice(6)}`;
  }
  if (clean.length === 9) {
    return `${clean.slice(0, 2)}-XXX-${clean.slice(5)}`;
  }
  return phone || "-";
}

/**
 * ฟังก์ชันสร้างแถวข้อมูล Key-Value
 */
function createInfoRow(label, value) {
  return box({
    layout: "horizontal",
    contents: [
      text({
        text: label,
        size: "xs",
        color: "#64748b",
        flex: 3,
      }),
      text({
        text: String(value || "-"),
        size: "xs",
        color: "#1e293b",
        weight: "bold",
        flex: 5,
        wrap: true,
        align: "end",
      }),
    ],
  });
}

/**
 * Flex Message ยืนยันข้อมูลการลงทะเบียนสมาชิก
 *
 * @param {Object} options
 * @param {string} options.fullName ชื่อ-นามสกุล
 * @param {string} options.nationalId เลขประจำตัวประชาชน
 * @param {string} options.phone เบอร์โทรศัพท์
 * @param {string} options.villageName ชื่อหมู่บ้าน
 * @param {string} options.houseNumber บ้านเลขที่
 * @param {string} options.zone โซน
 * @param {string} [options.liffUrl] URL สำหรับเปิด LIFF เพื่อแก้ไขข้อมูล
 */
export default function confirmRegisterFlex({
  fullName = "",
  nationalId = "",
  phone = "",
  villageName = "",
  houseNumber = "",
  zone = "",
  liffUrl = "https://liff.line.me/2011170175-8NcxrC2N",
} = {}) {
  const maskedId = maskNationalId(nationalId);
  const maskedPhone = maskPhone(phone);
  const formattedZone = zone ? (String(zone).startsWith("โซน") ? zone : `โซน ${zone}`) : "-";

  return flex(
    "โปรดยืนยันข้อมูลการลงทะเบียนสมาชิก - ปันน้ำ 💧",
    bubble({
      size: "kilo",
      body: box({
        layout: "vertical",
        paddingAll: "xl",
        spacing: "md",
        contents: [
          // 1. Badge หัวข้อ
          box({
            layout: "horizontal",
            contents: [
              text({
                text: "📋 ยืนยันข้อมูลการสมัคร",
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

          // 2. ชื่อเรื่อง & คำอธิบาย
          box({
            layout: "vertical",
            spacing: "xs",
            margin: "sm",
            contents: [
              text({
                text: "ยืนยันข้อมูลของคุณ 💧",
                size: "lg",
                weight: "bold",
                color: "#1e293b",
                wrap: true,
              }),
              text({
                text: "กรุณาตรวจสอบความถูกต้องของข้อมูลด้านล่าง หากถูกต้องให้กดยืนยัน หรือกดแก้ไขเพื่อเปลี่ยนแปลงข้อมูลค่ะ",
                size: "xs",
                color: "#64748b",
                wrap: true,
                margin: "xs",
              }),
            ],
          }),

          separator("md"),

          // 3. ข้อมูลสรุป
          box({
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            backgroundColor: "#f8fafc",
            paddingAll: "md",
            cornerRadius: "md",
            contents: [
              createInfoRow("ชื่อ-นามสกุล", fullName),
              createInfoRow("เลขบัตร ปชช.", maskedId),
              createInfoRow("เบอร์โทรศัพท์", maskedPhone),
              createInfoRow("หมู่บ้าน", villageName),
              createInfoRow("บ้านเลขที่", houseNumber),
              createInfoRow("โซน", formattedZone),
            ],
          }),

          // 4. ปุ่ม Action 2 ปุ่ม: ยืนยัน & แก้ไข
          box({
            layout: "vertical",
            spacing: "sm",
            margin: "md",
            contents: [
              button({
                action: {
                  type: "message",
                  label: "ยืนยันข้อมูลถูกต้อง ✅",
                  text: "ยืนยันข้อมูลถูกต้อง",
                },
                style: "primary",
                color: "#16a34a",
                height: "sm",
              }),
              button({
                action: {
                  type: "uri",
                  label: "แก้ไขข้อมูล ✏️",
                  uri: liffUrl,
                },
                style: "secondary",
                height: "sm",
              }),
            ],
          }),

          // 5. หมายเหตุด้านล่าง
          text({
            text: "ระบบจะเปิดใช้งานบัญชีและส่งการ์ดต้อนรับเมื่อคุณกดยืนยันค่ะ ✨",
            size: "xxs",
            color: "#94a3b8",
            align: "center",
            margin: "xs",
            wrap: true,
          }),
        ],
      }),
    }),
  );
}
