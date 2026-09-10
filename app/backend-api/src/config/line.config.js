import "dotenv/config";

export const config = {
  channelAccessToken: process.env.LINE_MESSAGING_ACCESS_TOKEN,
  channelSecret: process.env.LINE_MESSAGING_SECRET,
  channelId: process.env.LINE_MESSAGING_ID,
};

export const LINE_DEFAULT_LIFF_URL = "https://liff.line.me/2011170175-";
export const LINE_DEFAULT_LIFF_ID = "2011170175";

export const LINE_LIFF_ID_REGISTERED = "8NcxrC2N";
export const LINE_LIFF_ID_RECORDED_WATER = "GqFt7abM";

export const LINE_RICH_MENU_ID_DEFAULT = process.env.LINE_RICH_MENU_ID_DEFAULT;
export const LINE_RICH_MENU_ID_MEMBER = process.env.LINE_RICH_MENU_ID_MEMBER;
export const LINE_RICH_MENU_ID_ADMIN = process.env.LINE_RICH_MENU_ID_ADMIN;
