// src/utils/events.handler.js

// Import providers
import lineProvider from "../providers/line.provider.js";

// Import flex message templates

// ============================================================
// Intents Configuration
// ============================================================
const INTENT_HANDLERS = {
  GREETING: {
    keywords: ["hello", "hi", "hey", "สวัสดี", "หวัดดี", "ดีจ้า", "ดีครับ"],
    execute: async (event) =>
      lineProvider.replyOrPush(event, {
        type: "text",
        text: "Testing message!",
      }),
  },
};

// ============================================================
// EventsHandler Class
// ============================================================
class EventsHandler {
  /**
   * Main entry point for message events
   * @param {Object} event
   */
  // ===========================================================
  // ฟังก์ชันสำหรับจัดการข้อความประเภทข้อความ
  async handleMessage(event) {
    const { message, source } = event;

    // การเตรียมข้อมูลล่วงหน้า: แสดงการโหลดและตรวจสอบสถานะสมาชิก
    if (source?.userId) {
      await lineProvider.showLoadingAnimation(source.userId);
      // await lineProvider.checkMemberStatus(source);
    }

    // ตัวจัดการตามประเภทข้อความ
    switch (message.type) {
      case "text":
        // จัดการข้อความประเภทข้อความ
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

  /**
   * Handle Follow event (Block/Unblock)
   * @param {Object} event
   */
  // ===========================================================
  // ฟังก์ชันสำหรับจัดการเหตุการณ์ติดตาม (Follow)
  async handleFollow(event) {
    const { source } = event;
    try {
      // ส่งข้อความต้อนรับผู้ใช้ใหม่
      await lineProvider.replyOrPush(event, welcomeNewUserFlex());
    } catch (error) {
      console.error("Failed to send flex message:", error.message);
      await lineProvider.replyOrPush(event, {
        type: "text",
        text: `สวัสดี คุณ ${source.userId}!
        นี่คือบัญชีทางการของ PANNAM (ปันน้ำ)

        คุณสามารถใช้งานเพ่ื่อตรวจสอบค่าน้ำและบริการอื่นๆ ของ PANNAM (ปันน้ำ)ได้แล้ว!
        เราจะแจ้งเตือนข่าวสารหรือมีการเปลี่ยนแปลงอื่นๆ ให้ทราบเมื่อมีการอัพเดท
        ขอบคุณที่ใช้บริการ PANNAM (ปันน้ำ)`,
      });
    }
  }

  // ----------------------------------------------------------------
  // Private Helper Methods
  // ----------------------------------------------------------------

  // ฟังก์ชันสำหรับจัดการข้อความประเภทข้อความ
  async _handleTextMessage(event) {
    const text = event.message.text;
    const handler = this._matchIntent(text);

    if (handler) {
      await handler.execute(event);
    } else {
      // กรณีไม่พบเจตนา (intent) ที่ตรงกัน
      await lineProvider.replyOrPush(event, {
        type: "text",
        text: `"${text}" ขออภัย! ไม่สามารถเข้าใจคำสั่งของคุณได้`,
      });
    }
  }

  // ฟังก์ชันสำหรับจับคู่ข้อความกับเจตนา (intent) ที่กำหนดไว้
  _matchIntent(text) {
    const lowerText = text.toLowerCase();
    // วนลูปผ่านเจตนา (intent) ทั้งหมดเพื่อหาคำที่ตรงกัน
    for (const key in INTENT_HANDLERS) {
      const intent = INTENT_HANDLERS[key];
      if (intent.keywords.some((keyword) => lowerText.includes(keyword))) {
        return intent;
      }
    }
    return null;
  }
}

export default new EventsHandler();
