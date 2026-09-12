import { flex, bubble, box, text, button } from "./common.flex.js";

/**
 * Flex Message ต้อนรับผู้ใช้กลับเข้าสู่ระบบ (ยินดีต้อนรับกลับ)
 * พร้อมแสดงข้อมูลสมาชิกที่ผ่านการทำ Masking ปิดบังข้อมูลสำคัญ
 *
 * @param {Object} data ข้อมูลผู้ใช้จากระบบฐานข้อมูล
 */
export default function welcomeBackFlex(data = {}) {
  // 1. ดึงและป้องกันข้อมูลพื้นฐาน
  const fullName = data.name ? `คุณ${data.name}` : "คุณสมาชิก";
  const displayVillage = data.village || "-";

  // 2. ทำ Masking เลขบัตรประชาชน (2-xxxx-XXXXX-xx-x)
  const cleanId = String(data.idCard || "").replace(/[^0-9]/g, "");
  const maskedId =
    cleanId.length === 13
      ? `${cleanId.slice(0, 1)}-${cleanId.slice(1, 5)}-XXXXX-${cleanId.slice(10, 12)}-${cleanId.slice(12)}`
      : cleanId
        ? `${cleanId.slice(0, 4)}XXXXX${cleanId.slice(-2)}`
        : "-";

  // 3. ทำ Masking เบอร์โทรศัพท์ (0xx-XXX-xxxx)
  const cleanPhone = String(data.number || "").replace(/[^0-9]/g, "");
  const maskedPhone =
    cleanPhone.length === 10
      ? `${cleanPhone.slice(0, 3)}-XXX-${cleanPhone.slice(6)}`
      : cleanPhone.length === 9
        ? `${cleanPhone.slice(0, 2)}-XXX-${cleanPhone.slice(5)}`
        : data.number || "-";

  // 4. จัดรูปแบบแสดงโซนและที่อยู่บ้านเลขที่
  const zoneDisplay =
    data.zone && data.zone !== "-" ? `โซน ${data.zone}` : "";
  const addressDisplay =
    [
      data.property && data.property !== "-"
        ? `บ้านเลขที่ ${data.property}`
        : "",
      zoneDisplay,
    ]
      .filter(Boolean)
      .join(" ") || "-";

  // 5. ส่งออกโครงสร้าง Flex Object ที่ถูกต้องตามโครงสร้าง LINE API
  return flex(
    "ยินดีต้อนรับกลับสู่ระบบปันน้ำ (PANNAM) 💧", // สตริงพารามิเตอร์แรกสำหรับ altText 🌟 (ป้องกันการเกิด 400 Bad Request)
    bubble({
      size: "kilo",
      body: box({
        layout: "vertical",
        paddingAll: "xl",
        spacing: "md",
        contents: [
          // ส่วนที่ 1: Badge ต้อนรับกลับ
          box({
            layout: "horizontal",
            contents: [
              text({
                text: "✨ ยินดีต้อนรับกลับมา",
                size: "xxs",
                // weight: "bold",
                color: "#16a34a",
              }),
            ],
            backgroundColor: "#f0fdf4",
            cornerRadius: "xxl",
            paddingTop: "xs",
            paddingBottom: "xs",
            paddingStart: "md",
            paddingEnd: "md",
            alignItems: "center",
          }),

          // ส่วนที่ 2: ข้อความทักทาย
          box({
            layout: "vertical",
            spacing: "xs",
            margin: "sm",
            contents: [
              text({
                text: "ข้อมูลสมาชิกเก่าของท่าน",
                size: "lg",
                weight: "bold",
                color: "#1e293b",
                wrap: true,
              }),
              text({
                text: `สวัสดีค่ะ ${fullName} บัญชีของคุณผูกกับข้อมูลในระบบเรียบร้อยแล้ว รายละเอียดข้อมูลสมาชิกของคุณปัจจุบันมีดังนี้ค่ะ`,
                size: "xs",
                color: "#64748b",
                wrap: true,
                margin: "xs",
              }),
            ],
          }),

          // ส่วนที่ 3: กล่องข้อมูลสมาชิก (Profile Box) ทำ Masking ข้อมูลเรียบร้อย
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
                margin: "xs",
                contents: [
                  text({
                    text: "👤 ชื่อ-สกุล:",
                    size: "xs",
                    color: "#64748b",
                    weight: "bold",
                    flex: 0,
                  }),
                  text({
                    text: " " + data.name || "-",
                    size: "xs",
                    color: "#1e293b",
                    // weight: "bold",
                    flex: 1,
                    wrap: true,
                  }),
                ],
              }),
              box({
                layout: "horizontal",
                contents: [
                  text({
                    text: "🪪 เลขบัตร ปชช.:",
                    size: "xs",
                    color: "#64748b",
                    weight: "bold",
                    flex: 0,
                  }),
                  text({
                    text: " " + maskedId,
                    size: "xs",
                    color: "#1e293b",
                    // weight: "bold",
                    flex: 1,
                  }),
                ],
              }),
              box({
                layout: "horizontal",
                contents: [
                  text({
                    text: "📱 เบอร์โทรศัพท์:",
                    size: "xs",
                    color: "#64748b",
                    weight: "bold",
                    flex: 0,
                  }),
                  text({
                    text: " " + maskedPhone,
                    size: "xs",
                    color: "#1e293b",
                    // weight: "bold",
                    flex: 1,
                  }),
                ],
              }),
              box({
                layout: "horizontal",
                contents: [
                  text({
                    text: "📍 หมู่บ้าน:",
                    size: "xs",
                    color: "#64748b",
                    weight: "bold",
                    flex: 0,
                  }),
                  text({
                    text: " " + displayVillage,
                    size: "xs",
                    color: "#1e293b",
                    // weight: "bold",
                    flex: 1,
                    wrap: true,
                  }),
                ],
              }),
              box({
                layout: "horizontal",
                contents: [
                  text({
                    text: "🏡 เลขที่บ้าน:",
                    size: "xs",
                    color: "#64748b",
                    weight: "bold",
                    flex: 0,
                  }),
                  text({
                    text: " " + addressDisplay,
                    size: "xs",
                    color: "#1e293b",
                    // weight: "bold",
                    flex: 1,
                    wrap: true,
                  }),
                ],
              }),
            ],
          }),

          // ส่วนที่ 4: ปุ่มสำหรับการดึงดูดผู้ใช้งาน (Action Button)
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

          // ส่วนที่ 5: คำแนะนำเพิ่มเติมส่วนท้าย
          text({
            text: "แตะเลือกทำรายการผ่าน Rich Menu ด้านล่างได้เลยค่ะ ✨",
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
