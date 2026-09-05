// src/utils/events.js

import lineProvider from "../providers/line.provider.js";
import intentMatcher from "./intent-matcher.js";
import registerFlex from "../templates/flex/register.flex.js";
import welcomeFlex from "../templates/flex/welcome.flex.js";
import { prisma } from "../lib/prisma.js";

// ============================================================
// ลงทะเบียน Intents
// ============================================================

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

// ตรวจสอบค่าน้ำ
intentMatcher.register("WATER_CHECK", {
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
    await lineProvider.replyOrPush(event, {
      type: "text",
      text: "คุณต้องการตรวจสอบค่าน้ำของบัญชีไหนครับ/ค่ะ? กรุณาระบุหมายเลขผู้ใช้น้ำค่ะ", // แก้ไขเป็น flex เพื่อแสดงผลการใช้น้ำเดือนนั้นๆ
    });
  },
});

// ประวัติการใช้น้ำ
intentMatcher.register("HISTORY", {
  description: "ประวัติการใช้น้ำ 6 เดือนย้อนหลัง",
  keywords: ["ประวัติ", "การใช้น้ำ", "history", "ประวัติการใช้น้ำ"],
  optionalKeywords: ["ตรวจสอบ", "เช็ค", "ดู", "ย้อนหลัง", "สอบถาม"],
  patterns: [
    "ตรวจสอบ.*ประวัติ",
    "เช็ค.*ประวัติ",
    "ดู.*ประวัติ",
    "ประวัติ.*ย้อนหลัง",
    "สอบถาม.*ประวัติ",
    "ประวัติ.*การใช้น้ำ",
    "ยอด.*การใช้น้ำ",
  ],
  weight: 1.0,
  execute: async (event) => {
    await lineProvider.replyOrPush(event, {
      type: "text",
      text: "ประวัติการใช้น้ำ 6 เดือนย้อนหลัง", // เปลี่ยนเป็น flex เพื่อแสดงผลการใช้น้ำ 6 เดือนย้อนหลัง
    });
  },
});

// จดค่าน้ำ
intentMatcher.register("RECORD_WATER", {
  description: "จดค่าน้ำ",
  keywords: ["จดค่าน้ำ", "บันทึก", "บันทึกการใช้น้ำ", "จดน้ำ"],
  optionalKeywords: ["บันทึก", "จด", "เพิ่ม", "เขียน"],
  patterns: [
    "บันทึก.*การใช้น้ำ",
    "จด.*การใช้น้ำ",
    "เพิ่ม.*การใช้น้ำ",
    "เขียน.*การใช้น้ำ",
    "จด.*น้ำ",
    "บันทึก.*น้ำ",
    "เพิ่ม.*น้ำ",
    "เขียน.*น้ำ",
  ],
  weight: 1.0,
  execute: async (event) => {
    await lineProvider.replyOrPush(event, {
      type: "text",
      text: "บันทึกการใช้น้ำสำเร็จ",
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
      text: "ขออภัยในความไม่สะดวกครับ/ค่ะ กรุณาอธิบายปัญหาที่พบเพื่อให้เจ้าหน้าที่ติดต่อกลับค่ะ",
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
    const userId = event.source?.userId;
    let displayName = "สมาชิก";

    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { lineUserId: userId },
        });
        if (user?.fullName) {
          displayName = user.fullName;
        }
      } catch (err) {
        console.warn(
          "Could not fetch user name for welcome flex:",
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
            text: "ประวัติ",
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

    const flexMessage = welcomeFlex({ name: displayName });
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

      // ตรวจสอบว่าเป็นข้อความแจ้งเตือนการลงทะเบียนสำเร็จ หรือ ยืนยันข้อมูลถูกต้อง หรือไม่
      const text = message?.type === "text" ? message.text.trim() : "";
      const isRegisterMessage = [
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
      ].some((k) => text.includes(k));

      // ตรวจสอบสมาชิก -> หากไม่ใช่สมาชิก ให้ส่งข้อความแจ้งเตือนเสมอ
      if (!isRegisterMessage) {
        const isMember = await lineProvider.isMember(source.userId);
        if (!isMember) {
          await lineProvider.replyOrPush(event, registerFlex());
          return; // จบการทำงาน
        }
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
          text: "ขออภัยครับ/ค่ะ ตอนนี้ฉันสามารถจัดการข้อความประเภทข้อความเท่านั้น",
        });
    }
  }

  async handleFollow(event) {
    try {
      // ส่ง flex message เมื่อผู้ใช้ทำการ follow หลังจากสติกเกอร์
      // await lineProvider.replyOrPush(event, followmeFlex()); //ยังไม่ส่งในตอนนี้
    } catch (error) {
      console.error("Failed to send flex message:", error.message);
      await lineProvider.replyOrPush(event, {
        type: "sticker",
        packageId: "789",
        stickerId: "10876",
      });
    }
  }

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
}

export default new EventsHandler();
