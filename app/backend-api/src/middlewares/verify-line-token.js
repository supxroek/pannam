import axios from "axios";
import createHttpError from "http-errors";
import { LINE_LIFF_CHANNEL_ID } from "../config/line.config.js";

/**
 * Middleware สำหรับตรวจสอบความถูกต้องของ LINE LIFF ID Token
 * ดึง token จาก Authorization: Bearer <token> หรือ req.body.idToken
 * ส่งไป verify กับ LINE API (https://api.line.me/oauth2/v2.1/verify)
 */
export async function verifyLineToken(req, res, next) {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.body?.idToken) {
      token = req.body.idToken;
    } else if (req.headers["x-line-id-token"]) {
      token = req.headers["x-line-id-token"];
    }

    if (!token) {
      return next(
        createHttpError(
          401,
          "ไม่พบ LINE ID Token กรุณาเข้าสู่ระบบผ่าน LINE LIFF ก่อนทำรายการ",
        ),
      );
    }

    // ตรวจสอบ Token กับ LINE OAuth endpoint
    const params = new URLSearchParams();
    params.append("id_token", token);
    params.append("client_id", LINE_LIFF_CHANNEL_ID);

    const response = await axios.post(
      "https://api.line.me/oauth2/v2.1/verify",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 5000,
      },
    );

    // แนบข้อมูลผู้ใช้จาก LINE ไปกับ request object
    req.lineUser = {
      userId: response.data.sub,
      displayName: response.data.name,
      pictureUrl: response.data.picture,
      email: response.data.email,
      ...response.data,
    };

    next();
  } catch (error) {
    if (error.response) {
      const errorDesc =
        error.response.data?.error_description ||
        error.response.data?.error ||
        "Token verification failed";
      return next(
        createHttpError(401, `การยืนยันตัวตนกับ LINE ล้มเหลว: ${errorDesc}`),
      );
    }

    return next(
      createHttpError(500, `ระบบยืนยันตัวตนขัดข้อง: ${error.message}`),
    );
  }
}

export default verifyLineToken;
