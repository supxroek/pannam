import * as line from "@line/bot-sdk";
import axios from "axios";
import { config } from "../config/line.config.js";
import { prisma } from "../lib/prisma.js";

// const { LINE_RICH_MENU_ID } = process.env;

class LineProvider {
  constructor() {
    this.client = new line.messagingApi.MessagingApiClient(config);
  }

  // Show animetion loading
  async showLoadingAnimation(chatId, loadingSeconds = 5) {
    try {
      await axios.post(
        "https://api.line.me/v2/bot/chat/loading/start",
        {
          chatId: chatId,
          loadingSeconds: loadingSeconds,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.channelAccessToken}`,
          },
        },
      );
    } catch (error) {
      console.error(
        "Error showing loading animation:",
        error.response?.data || error.message,
      );
    }
  }

  // Response "reply"
  async reply(replyToken, messages) {
    const payload = {
      replyToken,
      messages: Array.isArray(messages) ? messages : [messages],
    };

    console.log("Reply payload:");
    console.dir(payload, { depth: null });

    return await this.client.replyMessage(payload);
  }

  // Response "push"
  async push(to, messages) {
    const payload = {
      to,
      messages: Array.isArray(messages) ? messages : [messages],
    };

    console.log("Push payload:");
    console.dir(payload, { depth: null });

    return this.client.pushMessage(payload);
  }

  // Response with "reply" or "push"
  async replyOrPush(event, messages) {
    const { replyToken, source } = event;
    console.log("DEBUG: replyOrPush called");
    console.log("DEBUG: replyToken:", replyToken);
    console.log("DEBUG: source:", JSON.stringify(source));

    try {
      const messageList = Array.isArray(messages) ? messages : [messages];
      // ตรวจสอบว่า replyToken ถูกต้องหรือไม่
      if (replyToken && replyToken !== "00000000000000000000000000000000") {
        await this.reply(replyToken, messageList);
      } else if (source?.userId) {
        // เพิ่ม fallback เป็นการส่งข้อความแบบ push หาก replyToken ไม่ถูกต้อง
        console.log("ReplyToken ไม่ถูกต้อง, กำลังส่งข้อความแบบ push แทน...");
        await this.push(source.userId, messageList);
      } else {
        console.warn(
          "Cannot send message: Missing both replyToken and userId.",
        );
      }
    } catch (error) {
      console.error("Error in replyOrPush:", error.message);
    }
  }

  // Check if the user is a member
  async isMember(userId) {
    const member = await prisma.user.findUnique({
      where: { lineUserId: userId },
    });
    return !!member; // ลบ Hard code "userId" ออก เมื่อใช้งานจริง
  }

  // async checkMemberStatus(source) {
  //   if (!source?.userId) return;
  //   const member = await employeeModelV2.findActiveByLineUserId({
  //     where: { userId: source.userId },
  //   });
  //   if (member) {
  //     // หากเป็นสมาชิกที่ยังใช้งานอยู่ ให้ Link Rich Menu สำหรับสมาชิก
  //     try {
  //       await this.linkRichMenu(source.userId, LINE_RICH_MENU_ID);
  //       console.log(
  //         `เชื่อมต่อ Rich Menu สำหรับสมาชิกกับผู้ใช้ ${source.userId} เรียบร้อยแล้ว`,
  //       );
  //     } catch (error) {
  //       console.error(
  //         `ไม่สามารถเชื่อมต่อ Rich Menu กับผู้ใช้ ${source.userId} ได้:`,
  //         error,
  //       );
  //     }
  //   } else {
  //     // หากไม่ใช่สมาชิกที่ยังใช้งานอยู่ ให้ Unlink Rich Menu สำหรับสมาชิก
  //     try {
  //       await this.unlinkRichMenu(source.userId);
  //       console.log(
  //         `ยกเลิกการเชื่อมต่อ Rich Menu สำหรับสมาชิกกับผู้ใช้ ${source.userId} เรียบร้อยแล้ว`,
  //       );
  //     } catch (error) {
  //       console.error(
  //         `ไม่สามารถยกเลิกการเชื่อมต่อ Rich Menu กับผู้ใช้ ${source.userId} ได้:`,
  //         error,
  //       );
  //     }
  //   }
  // }

  async linkRichMenu(userId, richMenuId) {
    return await this.client.linkRichMenuIdToUser(userId, richMenuId);
  }

  async unlinkRichMenu(userId) {
    return await this.client.unlinkRichMenuIdFromUser(userId);
  }
}

export default new LineProvider();
