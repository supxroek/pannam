import "dotenv/config";

export const config = {
  channelAccessToken: process.env.LINE_MESSAGING_ACCESS_TOKEN,
  channelSecret: process.env.LINE_MESSAGING_SECRET,
  channelId: process.env.LINE_MESSAGING_ID,
};

export const LINE_DEFAULT_LIFF_URL = "https://liff.line.me/2011170175-";
export const LINE_DEFAULT_LIFF_ID = "2011170175";

export const LINE_LIFF_ID_REGISTERED = "8NcxrC2N"; // แก้แล้ว
export const LINE_LIFF_ID_RECORD_WATER = "8hIgssMe"; // แก้แล้ว
export const LINE_LIFF_ID_RECORD_PAYMENT = "WDrTcFW6"; // แก้แล้ว
export const LINE_LIFF_ID_WATER_USAGE = "tUaEkr3F"; // แก้แล้ว
export const LINE_LIFF_ID_WATER_HISTORY = "1wjoJvNp"; // แก้แล้ว
export const LINE_LIFF_ID_PAYMENT = "PLACEHOLDER_PAYMENT"; // ยังไม่แก้ ***สำหรับแนบสลิปของผู้ใช้
export const LINE_LIFF_ID_PROFILE = "Dqcv4zk2"; // แก้แล้ว

export const LINE_RICH_MENU_ID_DEFAULT = process.env.LINE_RICH_MENU_ID_DEFAULT;
export const LINE_RICH_MENU_ID_MEMBER = process.env.LINE_RICH_MENU_ID_MEMBER;
export const LINE_RICH_MENU_ID_ADMIN = process.env.LINE_RICH_MENU_ID_ADMIN;
