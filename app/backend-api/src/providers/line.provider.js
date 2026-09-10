import * as line from "@line/bot-sdk";
import axios from "axios";
import { config, LINE_RICH_MENU_ID_ADMIN, LINE_RICH_MENU_ID_MEMBER } from "../config/line.config.js";
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

  // Check if the user is a member and link appropriate rich menu
  async isMember(userId) {
    try {
      const member = await prisma.user.findUnique({
        where: { lineUserId: userId },
        select: {
          userVillages: {
            where: { status: "ACTIVE" }, // ดึงเฉพาะหมู่บ้านที่สถานะยังใช้งานได้อยู่
            select: {
              role: true,
            },
          },
        },
      });

      // ถ้าไม่เจอ User ในระบบเลย
      if (!member) {
        await this.unlinkRichMenu(userId);
        return false;
      }

      // ดึงรายการ Role ทั้งหมดของผู้ใช้ออกมาเป็น Array ของ String เช่น ["RESIDENT"] หรือ ["METER_READER", "RESIDENT"]
      const roles = member.userVillages.map((uv) => uv.role);

      if (roles.includes("METER_READER") || roles.includes("VILLAGE_ADMIN")) {
        await this.linkRichMenu_Admin(userId);
        return true;
      } else if (roles.includes("RESIDENT")) {
        await this.linkRichMenu_Member(userId);
        return true;
      } else {
        // มีชื่อในระบบแต่ไม่มีบทบาทที่ใช้งานได้ หรือไม่มีหมู่บ้านที่ ACTIVE อยู่เลย
        await this.unlinkRichMenu(userId);
        return false;
      }
    } catch (error) {
      console.error(`[LineProvider] Error checking member status for ${userId}:`, error.message);
      return false;
    }
  }

  // Link rich menu to member
  async linkRichMenu_Member(userId) {
    try {
      console.log(`[LineProvider] Linking Member Rich Menu (${LINE_RICH_MENU_ID_MEMBER}) to user: ${userId}`);
      return await this.client.linkRichMenuIdToUser(userId, LINE_RICH_MENU_ID_MEMBER);
    } catch (error) {
      console.error(
        `[LineProvider] Failed to link Member rich menu to ${userId}:`,
        error.response?.data || error.message
      );
    }
  }

  // Link rich menu to admin
  async linkRichMenu_Admin(userId) {
    try {
      console.log(`[LineProvider] Linking Admin/MeterReader Rich Menu (${LINE_RICH_MENU_ID_ADMIN}) to user: ${userId}`);
      return await this.client.linkRichMenuIdToUser(userId, LINE_RICH_MENU_ID_ADMIN);
    } catch (error) {
      console.error(
        `[LineProvider] Failed to link Admin rich menu to ${userId}:`,
        error.response?.data || error.message
      );
    }
  }

  // Unlink rich menu (reverts user back to bot default rich menu)
  async unlinkRichMenu(userId) {
    try {
      console.log(`[LineProvider] Unlinking custom rich menu for user: ${userId} (reverts to default)`);
      return await this.client.unlinkRichMenuIdFromUser(userId);
    } catch (error) {
      // 404 is expected if the user has no individually linked rich menu (they were already on default)
      const status = error.status || error.statusCode || error.response?.status;
      if (status === 404) {
        return;
      }
      console.error(
        `[LineProvider] Failed to unlink rich menu for ${userId}:`,
        error.response?.data || error.message
      );
    }
  }
}

export default new LineProvider();
