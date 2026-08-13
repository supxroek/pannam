// src/utils/events.handler.js

import lineProvider from "../providers/line.provider.js";
import intentMatcher from "./intent-matcher.js";

// ============================================================
// ลงทะเบียน Intents
// ============================================================

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
    ];
    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
    await lineProvider.replyOrPush(event, {
      type: "text",
      text: randomResponse,
    });
  },
});

intentMatcher.register("WATER_BILL_CHECK", {
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
      text: "คุณต้องการตรวจสอบค่าน้ำของบัญชีไหนครับ/ค่ะ? กรุณาระบุหมายเลขผู้ใช้น้ำค่ะ",
    });
  },
});

intentMatcher.register("HELP", {
  description: "ขอความช่วยเหลือ",
  keywords: ["ช่วยเหลือ", "ช่วย", "help", "สอน", "วิธี", "ใช้ยังไง", "ทำยังไง"],
  optionalKeywords: ["ด้วย", "หน่อย", "ที", "ได้ไหม", "ยังไง", "คู่มือ"],
  patterns: ["ช่วย.*ด้วย", "สอน.*หน่อย", "ใช้งาน.*ยังไง"],
  weight: 1.0,
  execute: async (event) => {
    await lineProvider.replyOrPush(event, {
      type: "text",
      text: `คุณสามารถใช้งาน PANNAM ได้ดังนี้:
1. พิมพ์ "เช็คค่าน้ำ" เพื่อตรวจสอบยอดค่าน้ำ
2. พิมพ์ "ประวัติ" เพื่อดูประวัติการใช้น้ำ
3. พิมพ์ "ติดต่อ" เพื่อติดต่อเจ้าหน้าที่
4. พิมพ์ "วิธีใช้" เพื่อดูคู่มือการใช้งาน`,
    });
  },
});

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
      text: `"${text}" ขออภัยครับ/ค่ะ ฉันไม่แน่ใจว่าคุณหมายถึงอะไร\n\nลองพิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่งที่ใช้งานได้ หรือถามได้โดยตรงเลยค่ะ`,
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
    const { source } = event;
    try {
      await lineProvider.replyOrPush(event, welcomeNewUserFlex());
    } catch (error) {
      console.error("Failed to send flex message:", error.message);
      await lineProvider.replyOrPush(event, {
        type: "text",
        text: `สวัสดี คุณ ${source.userId}!\nนี่คือบัญชีทางการของ PANNAM (ปันน้ำ)\n\nคุณสามารถใช้งานเพื่อตรวจสอบค่าน้ำและบริการอื่นๆ ของ PANNAM (ปันน้ำ)ได้แล้ว!\nเราจะแจ้งเตือนข่าวสารหรือมีการเปลี่ยนแปลงอื่นๆ ให้ทราบเมื่อมีการอัพเดท\nขอบคุณที่ใช้บริการ PANNAM (ปันน้ำ)`,
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
