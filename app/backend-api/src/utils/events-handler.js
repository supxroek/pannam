// src/utils/events.js

import lineProvider from "../providers/line.provider.js";
import intentMatcher from "./intent-matcher.js";
import registerFlex from "../templates/flex/register.flex.js";
import welcomeFlex from "../templates/flex/welcome.flex.js";
import welcomeBackFlex from "../templates/flex/welcome-back.flex.js";
import waterBillFlex from "../templates/flex/water-bill.flex.js";
import waterHistoryFlex from "../templates/flex/water-history.flex.js";
import paymentInfoFlex from "../templates/flex/payment-info.flex.js";
import { readerProgressFlex, readerOverdueFlex } from "../templates/flex/reader.flex.js";
import * as waterService from "../services/water.service.js";

// ============================================================
// ลงทะเบียน Intents
// ============================================================

/* ================ For Members ================ */
// ตรวจสอบค่าน้ำ
intentMatcher.register("WATER_USAGE", {
  description: "ตรวจสอบค่าน้ำ",
  keywords: ["ค่าน้ำ", "บิลน้ำ", "น้ำประปา", "water bill"],
  optionalKeywords: [
    "ตรวจสอบ",
    "เช็ค",
    "ดู",
    "ถาม",
    "เท่าไร",
    "ยอด",
    "ค้าง",
    "จ่าย",
    "ชำระ",
  ],
  patterns: ["เช็ค.*น้ำ", "ดู.*บิล", "ค่า.*น้ำ.*เท่าไร", "ยอด.*น้ำ.*ค้าง"],
  weight: 1.2,
  execute: async (event) => {
    const { source } = event;
    try {
      const properties = await waterService.getUserPropertiesWithBills(
        source?.userId,
      );

      if (!properties || properties.length === 0) {
        await lineProvider.replyOrPush(event, waterBillFlex([]));
        return;
      }

      await lineProvider.replyOrPush(event, waterBillFlex(properties));
    } catch (error) {
      console.error("[WATER_USAGE] Error:", error.message);
      await lineProvider.replyOrPush(event, {
        type: "text",
        text: "ขออภัยค่ะ ไม่สามารถดึงข้อมูลค่าน้ำได้ในขณะนี้ กรุณาลองใหม่อีกครั้งค่ะ 🙏",
      });
    }
  },
});

// ประวัติการใช้น้ำ
intentMatcher.register("WATER_HISTORY", {
  description: "ประวัติการใช้น้ำ 6 เดือนย้อนหลัง",
  keywords: [
    "ประวัติ",
    "การใช้น้ำ",
    "history",
    "ประวัติการใช้น้ำ",
    "เดือนที่แล้ว",
    "แล้วมา",
    "ก่อนหน้า",
  ],
  optionalKeywords: ["ตรวจสอบ", "เช็ค", "ดู", "ย้อนหลัง", "สอบถาม"],
  patterns: [
    "ตรวจสอบ.*ประวัติ",
    "เช็ค.*ประวัติ",
    "ดู.*ประวัติ",
    "ประวัติ.*ย้อนหลัง",
    "สอบถาม.*ประวัติ",
    "ประวัติ.*การใช้น้ำ",
    "ยอด.*การใช้น้ำ",
    "เดือน.*การใช้น้ำ",
    "เดือน.*ย้อนหลัง",
    "เดือน.*ก่อนหน้า",
    "เดือน.*ที่แล้ว",
  ],
  weight: 1.0,
  execute: async (event) => {
    const { source } = event;
    try {
      const properties = await waterService.getUserPropertiesWithHistory(
        source?.userId,
        3,
      );

      if (!properties || properties.length === 0) {
        await lineProvider.replyOrPush(event, waterHistoryFlex([]));
        return;
      }

      await lineProvider.replyOrPush(event, waterHistoryFlex(properties));
    } catch (error) {
      console.error("[HISTORY] Error:", error.message);
      await lineProvider.replyOrPush(event, {
        type: "text",
        text: "ขออภัยค่ะ ไม่สามารถดึงประวัติการใช้น้ำได้ในขณะนี้ กรุณาลองใหม่อีกครั้งค่ะ 🙏",
      });
    }
  },
});

// วิธีการชำระเงิน (PAYMENT_INFO)
intentMatcher.register("PAYMENT_INFO", {
  description: "วิธีการชำระเงิน",
  keywords: ["ชำระเงิน", "วิธี", "การชำระ", "payment"],
  optionalKeywords: ["วิธี", "การชำระ", "payment", "โอน", "บัญชี", "พร้อมเพย์", "ธนาคาร"],
  patterns: ["ชำระเงิน.*วิธี", "วิธี.*การชำระ", "payment.*วิธี", "โอน.*เงิน", "ช่องทาง.*ชำระ"],
  weight: 1.0,
  execute: async (event) => {
    const { source } = event;
    try {
      const villageId = await waterService.getUserVillageId(source?.userId);

      if (!villageId) {
        await lineProvider.replyOrPush(event, paymentInfoFlex(null));
        return;
      }

      const village = await waterService.getVillagePaymentInfo(villageId);
      await lineProvider.replyOrPush(event, paymentInfoFlex(village));
    } catch (error) {
      console.error("[PAYMENT_INFO] Error:", error.message);
      await lineProvider.replyOrPush(event, {
        type: "text",
        text: "ขออภัยค่ะ ไม่สามารถดึงข้อมูลช่องทางชำระเงินได้ในขณะนี้ กรุณาลองใหม่อีกครั้งค่ะ 🙏",
      });
    }
  },
});

// ร้องเรียนหรือแจ้งปัญหา
intentMatcher.register("COMPLAINT", {
  description: "ร้องเรียนหรือแจ้งปัญหา",
  keywords: [
    "ร้องเรียน",
    "แจ้งปัญหา",
    "เสีย",
    "พัง",
    "น้ำไม่ไหล",
    "น้ำรั่ว",
    "ท่อแตก",
  ],
  optionalKeywords: ["ครับ", "ค่ะ", "ที่บ้าน", "ในหมู่บ้าน", "ตรงนี้"],
  negativeKeywords: ["ไม่ร้องเรียน", "ไม่มีปัญหา"],
  weight: 1.1,
  execute: async (event) => {
    await lineProvider.replyOrPush(event, {
      type: "text",
      text: `🛠️ แจ้งปัญหา / ร้องเรียน\n\nกรุณาอธิบายปัญหาที่พบ เพื่อให้เจ้าหน้าที่ติดต่อกลับค่ะ\n\nหรือติดต่อโดยตรง:\n📞 081-xxxx-xxxx (คุณทดสอบ)\n📞 082-xxxx-xxxx (คุณแอดมิน)\n\nเวลาทำการ: จ.-ศ. 08:00-17:00 น.`,
    });
  },
});

/* ================ For Admins ================ */
// สรุปความคืบหน้า (SUMMARY)
intentMatcher.register("SUMMARY", {
  description: "สรุปความคืบหน้า",
  keywords: ["สรุป", "summary", "ความคืบหน้า", "คงเหลือ"],
  optionalKeywords: ["สรุป", "ยอด", "ความคืบหน้า", "ผล", "จดน้ำ", "มิเตอร์"],
  patterns: ["สรุป.*ความคืบหน้า", "สรุป.*คงเหลือ", "สรุป.*ยอด", "สรุป.*จด"],
  weight: 1.0,
  execute: async (event) => {
    const { source } = event;
    try {
      const { member } = await lineProvider.isMember(source?.userId);
      const userRole = member?.userVillages?.[0]?.role;
      if (userRole !== "METER_READER" && userRole !== "VILLAGE_ADMIN") {
        await lineProvider.replyOrPush(event, {
          type: "text",
          text: "ขออภัยค่ะ ฟังก์ชันนี้สำหรับผู้จดมิเตอร์หรือผู้ดูแลหมู่บ้านเท่านั้นนะคะ 🙏",
        });
        return;
      }

      const villageId = await waterService.getUserVillageId(source?.userId);
      if (!villageId) {
        await lineProvider.replyOrPush(event, {
          type: "text",
          text: "ไม่พบข้อมูลหมู่บ้านที่คุณสังกัด กรุณาติดต่อผู้ดูแลระบบค่ะ",
        });
        return;
      }

      const progressData = await waterService.getReadingProgress(villageId);
      await lineProvider.replyOrPush(event, readerProgressFlex(progressData));
    } catch (error) {
      console.error("[SUMMARY] Error:", error.message);
      await lineProvider.replyOrPush(event, {
        type: "text",
        text: "ขออภัยค่ะ ไม่สามารถดึงข้อมูลสรุปความคืบหน้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้งค่ะ 🙏",
      });
    }
  },
});

// ตรวจสอบบ้านค้างชำระ (UNPAID)
intentMatcher.register("UNPAID", {
  description: "ตรวจสอบบ้านค้างชำระ",
  keywords: ["บ้านค้าง", "ชำระ", "pending", "cash", "ค้างชำระ"],
  optionalKeywords: ["ตรวจ", "เช็ค", "ดู", "ยอดค้าง", "ค้างจ่าย", "เก็บเงิน"],
  patterns: ["เช็ค.*ค้าง", "ตรวจ.*ค้าง", "บ้าน.*ค้าง", "ยอด.*ค้าง"],
  weight: 1.0,
  execute: async (event) => {
    const { source } = event;
    try {
      const { member } = await lineProvider.isMember(source?.userId);
      const userRole = member?.userVillages?.[0]?.role;
      if (userRole !== "METER_READER" && userRole !== "VILLAGE_ADMIN") {
        await lineProvider.replyOrPush(event, {
          type: "text",
          text: "ขออภัยค่ะ ฟังก์ชันนี้สำหรับผู้จดมิเตอร์หรือผู้ดูแลหมู่บ้านเท่านั้นนะคะ 🙏",
        });
        return;
      }

      const villageId = await waterService.getUserVillageId(source?.userId);
      if (!villageId) {
        await lineProvider.replyOrPush(event, {
          type: "text",
          text: "ไม่พบข้อมูลหมู่บ้านที่คุณสังกัด กรุณาติดต่อผู้ดูแลระบบค่ะ",
        });
        return;
      }

      const overdueData = await waterService.getOverdueSummary(villageId);
      await lineProvider.replyOrPush(event, readerOverdueFlex(overdueData));
    } catch (error) {
      console.error("[PENDING_CASH] Error:", error.message);
      await lineProvider.replyOrPush(event, {
        type: "text",
        text: "ขออภัยค่ะ ไม่สามารถดึงข้อมูลบ้านค้างชำระได้ในขณะนี้ กรุณาลองใหม่อีกครั้งค่ะ 🙏",
      });
    }
  },
});

/* ================ For Others ================ */
// ทักทายผู้ใช้
intentMatcher.register("GREETING", {
  description: "ทักทายผู้ใช้",
  keywords: [
    "สวัสดี",
    "หวัดดี",
    "ดีจ้า",
    "ดีครับ",
    "ดีค่ะ",
    "hello",
    "hi",
    "hey",
  ],
  optionalKeywords: [
    "วันนี้",
    "ตอนเช้า",
    "ตอนบ่าย",
    "ตอนเย็น",
    "สบายดี",
    "เป็นไง",
    "ยังไง",
    "บ้าง",
  ],
  negativeKeywords: ["ไม่สวัสดี", "ไม่ดี"],
  weight: 1.0,
  execute: async (event) => {
    const responses = [
      "สวัสดีครับ/ค่ะ! ยินดีที่ได้รู้จักคุณ 😊",
      "สวัสดี! มีอะไรให้ PANNAM ช่วยเหลือไหมครับ/ค่ะ?",
      "หวัดดีครับ/ค่ะ! วันนี้เป็นยังไงบ้าง?",
      "สวัสดีครับ/ค่ะ! มีอะไรให้ช่วยเหลือไหมครับ/ค่ะ?",
    ];
    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
    await lineProvider.replyOrPush(event, {
      type: "text",
      text: randomResponse,
    });
  },
});

// ขอความช่วยเหลือ
intentMatcher.register("HELP", {
  description: "ขอความช่วยเหลือ",
  keywords: [
    "ช่วยเหลือ",
    "ช่วย",
    "help",
    "สอน",
    "วิธี",
    "ใช้ยังไง",
    "ทำยังไง",
    "ทำ",
  ],
  optionalKeywords: [
    "ด้วย",
    "หน่อย",
    "ที",
    "ได้ไหม",
    "ยังไง",
    "คู่มือ",
    "อะไร",
  ],
  patterns: ["ช่วย.*ด้วย", "สอน.*หน่อย", "ใช้งาน.*ยังไง", "ทำ.*อะไร"],
  weight: 1.0,
  execute: async (event) => {
    await lineProvider.replyOrPush(event, {
      type: "text",
      text: `คุณสามารถใช้งาน PANNAM ได้ดังนี้:
1. พิมพ์ "เช็คค่าน้ำ" เพื่อตรวจสอบค่าน้ำ
2. พิมพ์ "ประวัติ" เพื่อดูประวัติการใช้น้ำ
3. พิมพ์ "แจ้งปัญหา" เพื่อติดต่อเจ้าหน้าที่`,
    });
  },
});

// ขอบคุณ
intentMatcher.register("THANKS", {
  description: "ขอบคุณ",
  keywords: ["ขอบคุณ", "thank", "thanks", "ขอบใจ", "เก่งมาก", "ดีมาก"],
  optionalKeywords: ["มาก", "นะ", "ครับ", "ค่ะ", "จ้า"],
  weight: 0.8,
  execute: async (event) => {
    await lineProvider.replyOrPush(event, {
      type: "text",
      text: "ยินดีที่ได้ช่วยเหลือครับ/ค่ะ! หากมีข้อสงสัยเพิ่มเติมสามารถสอบถามได้ตลอดเวลานะคะ 🙏",
    });
  },
});

// ลาก่อน
intentMatcher.register("GOODBYE", {
  description: "ลาก่อน",
  keywords: ["ลาก่อน", "บาย", "bye", "goodbye", "ไปก่อน", "พักผ่อน"],
  optionalKeywords: ["นะ", "ครับ", "ค่ะ", "จ้า", "เจอกัน", "พรุ่งนี้"],
  weight: 0.8,
  execute: async (event) => {
    await lineProvider.replyOrPush(event, {
      type: "text",
      text: "ลาก่อนครับ/ค่ะ! ขอให้มีความสุขและสดชื่นตลอดวันนะคะ 👋",
    });
  },
});

// ต้อนรับสมาชิกใหม่เมื่อลงทะเบียนสำเร็จ
intentMatcher.register("REGISTER_SUCCESS", {
  description: "ต้อนรับสมาชิกใหม่เมื่อลงทะเบียนสำเร็จ",
  keywords: [
    "ลงทะเบียนสมาชิกสำเร็จ",
    "ยืนยันข้อมูลถูกต้อง",
    "ยืนยันข้อมูล",
    "ยืนยันการลงทะเบียน",
    "ยืนยันการสมัคร",
    "ข้อมูลถูกต้อง",
    "ลงทะเบียนเรียบร้อย",
    "สมัครสมาชิกสำเร็จ",
    "ลงทะเบียนสำเร็จ",
    "สมัครเรียบร้อย",
  ],
  optionalKeywords: ["แล้ว", "ค่ะ", "ครับ", "ถูกต้อง"],
  patterns: [
    "ลงทะเบียน.*(เรียบร้อย|สำเร็จ)",
    "สมัคร.*(เรียบร้อย|สำเร็จ)",
    "ยืนยัน.*(ข้อมูล|ลงทะเบียน|สมัคร|ถูกต้อง)",
  ],
  weight: 2.0,
  execute: async (event) => {
    const { source } = event;
    let members = null;

    if (source?.userId) {
      try {
        // อัปเดต Rich Menu ตาม Role ทันที (เช่น RESIDENT -> สำหรับลูกบ้าน)
        const { isMember, member } = await lineProvider.isMember(
          source?.userId,
        );
        if (isMember) {
          members = member;
        }
      } catch (err) {
        console.warn(
          "Could not fetch user name or sync rich menu for welcome flex:",
          err.message,
        );
      }
    }

    // Quick Reply ปุ่มลัดสำหรับเลือกทำรายการ
    const quickReply = {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "เช็คค่าน้ำ 💧",
            text: "เช็คค่าน้ำ",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "ประวัติการใช้น้ำ 📊",
            text: "ประวัติการใช้น้ำ",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "แจ้งปัญหา 🛠️",
            text: "แจ้งปัญหา",
          },
        },
      ],
    };

    const flexMessage = welcomeFlex({ name: members?.fullName || "สมาชิก" });
    const replyPayload = {
      ...flexMessage,
      quickReply,
    };

    await lineProvider.replyOrPush(event, replyPayload);
  },
});

// 🔧 Fallback intent (ต้อง register ท้ายสุด)
intentMatcher.register("UNKNOWN_FALLBACK", {
  description: "Fallback เมื่อไม่ match intent ใดเลย",
  keywords: [], // ไม่มี required keywords
  optionalKeywords: [],
  weight: 0.1,
  execute: async (event, matchResult) => {
    const text = event.message.text;
    await lineProvider.replyOrPush(event, {
      type: "text",
      text: `"${text}" ขออภัยครับ/ค่ะ ฉันไม่แน่ใจว่าคุณหมายถึงอะไร\n\nลองพิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่งที่ใช้งานได้ หรือถามได้โดยตรงเลยค่ะ🙏`,
    });
  },
});

// ============================================================
// EventsHandler Class
// ============================================================
class EventsHandler {
  async handleMessage(event) {
    const { message, source } = event;

    if (source?.userId) {
      await lineProvider.showLoadingAnimation(source.userId);

      // ตรวจสอบสมาชิกและอัปเดต Rich Menu ให้ตรงกับ Role ทันที
      const { isMember } = await lineProvider.isMember(source.userId);
      if (!isMember) {
        await lineProvider.replyOrPush(event, registerFlex());
        return; // จบการทำงาน
      }
    }

    switch (message.type) {
      case "text":
        console.log("message", message);
        await this._handleTextMessage(event);
        break;
      case "sticker":
        await lineProvider.replyOrPush(event, {
          type: "text",
          text: "ขอบคุณสำหรับสติกเกอร์นะครับ/ค่ะ! 😊",
        });
        break;
      default:
        await lineProvider.replyOrPush(event, {
          type: "text",
          text: "ขออภัยครับ/ค่ะ ฉันสามารถตอบกลับประเภทข้อความและสติ๊กเกอร์เท่านั้น",
        });
    }
  }

  async handleFollow(event) {
    const { source } = event;
    let members = null;

    try {
      if (source?.userId) {
        await lineProvider.showLoadingAnimation(source.userId);

        // อัปเดต Rich Menu ตาม Role ทันที (เช่น RESIDENT -> สำหรับลูกบ้าน)
        const { isMember, member } = await lineProvider.isMember(source.userId);
        console.log("isMember", isMember, "member", member);
        if (isMember) {
          members = member;
        }
      }

      // Quick Reply ปุ่มลัดสำหรับเลือกทำรายการ
      const quickReply = {
        items: [
          {
            type: "action",
            action: {
              type: "message",
              label: "เช็คค่าน้ำ 💧",
              text: "เช็คค่าน้ำ",
            },
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "ประวัติการใช้น้ำ 📊",
              text: "ประวัติการใช้น้ำ",
            },
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "แจ้งปัญหา 🛠️",
              text: "แจ้งปัญหา",
            },
          },
        ],
      };

      // เตรียมข้อมูลสำหรับ Flex (ตอนนี้จะเข้าถึง user ได้แล้ว ไม่ขึ้น undefined)
      const data = {
        name: members?.fullName || "สมาชิก",
        number: members?.phoneNumber || "",
        idCard: members?.nationalId || "",
        village: members?.userVillages?.[0]?.village?.address || "",
        property: members?.userProperties?.[0]?.property?.houseNumber || "",
        zone: members?.userProperties?.[0]?.property?.zone || "",
      };

      const flexMessage = welcomeBackFlex(data);
      const replyPayload = {
        ...flexMessage,
        quickReply,
      };

      // ส่ง Flex Message พร้อม Quick Reply
      await lineProvider.replyOrPush(event, replyPayload);
    } catch (error) {
      console.error(
        "Failed to send flex message or handle follow:",
        error.message,
      );
      await lineProvider.replyOrPush(event, {
        type: "sticker",
        packageId: "789",
        stickerId: "10876",
      });
    }
  }

  /* ============== Utils Function ============== */
  // 🔧 ฟังก์ชันหลัก: จัดการข้อความ (ปรับปรุงแล้ว)
  async _handleTextMessage(event) {
    const text = event.message.text;

    const matchResult = intentMatcher.match(text);

    console.log("Intent Match Result:", JSON.stringify(matchResult, null, 2));

    if (matchResult) {
      // มี match (รวมถึง fallback)
      await matchResult.intent.execute(event, matchResult);
    } else {
      // กรณีไม่มี fallback (ไม่ควรเกิดถ้า register ถูกต้อง)
      await lineProvider.replyOrPush(event, {
        type: "text",
        text: `"${text}" ขออภัย! ไม่สามารถเข้าใจคำสั่งของคุณได้`,
      });
    }
  }

  // 🔧 จัดการ Postback Events (รองรับ actions จาก Flex buttons ในอนาคต)
  async handlePostback(event) {
    const { source, postback } = event;

    if (source?.userId) {
      await lineProvider.showLoadingAnimation(source.userId);
    }

    console.log("[Postback] data:", postback?.data);

    // ตอนนี้ยังไม่มี postback action เฉพาะ — รองรับเพิ่มได้ในอนาคต
    // เช่น: data=action=view_detail&propertyId=123
    try {
      const params = new URLSearchParams(postback?.data || "");
      const action = params.get("action");

      switch (action) {
        // เพิ่ม cases ตรงนี้ในอนาคต
        default:
          console.log("[Postback] Unhandled action:", action);
          break;
      }
    } catch (error) {
      console.error("[Postback] Error:", error.message);
    }
  }
}

export default new EventsHandler();
