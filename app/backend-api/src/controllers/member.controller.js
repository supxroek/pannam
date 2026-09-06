import createHttpError from "http-errors";
import dayjs from "../utils/dayjs.js";
import { registerMember } from "../services/member.service.js";
import { registerSchema } from "../validations/register.schema.js";

const ZONES_LIST = ["A", "B", "C", "D", "E", "F"];

/**
 * Controller สำหรับจัดการการลงทะเบียนสมาชิกผ่าน LINE LIFF
 */
export async function handleRegister(req, res, next) {
  try {
    const lineUser = req.lineUser;

    // 1. ตรวจสอบข้อมูลด้วย Zod Schema
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const fieldErrors = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });

      const firstErrorMsg = Object.values(fieldErrors)[0] || "ข้อมูลที่ส่งมาไม่ถูกต้อง";
      const validationError = createHttpError(400, firstErrorMsg);
      validationError.code = "VALIDATION_ERROR";
      validationError.errors = fieldErrors;
      return next(validationError);
    }

    const {
      firstName,
      lastName,
      birthDay,
      birthMonth,
      birthYear,
      idCard,
      phone,
      village,
      houseNumber,
      zone,
    } = parseResult.data;

    // 2. จัดรูปแบบข้อมูล (Data Sanitization & Formatting)
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const cleanedIdCard = idCard; // safeParse transformed to 13 digits
    const cleanedPhone = phone;   // safeParse transformed to 9-10 digits

    // แปลงวันเกิดเป็น JavaScript Date สำหรับบันทึกใน PostgreSQL/Prisma
    const formattedBirthdate = dayjs.formatDateToDatabase(
      birthDay,
      Number(birthMonth),
      birthYear,
    );

    // จัดการข้อมูลโซน (ถ้าส่งมาเป็น index ตัวเลข 0, 1 หรือ string "A")
    let formattedZone = null;
    if (zone !== undefined && zone !== null && zone !== "") {
      const zoneIdx = Number(zone);
      if (!isNaN(zoneIdx) && ZONES_LIST[zoneIdx]) {
        formattedZone = ZONES_LIST[zoneIdx];
      } else {
        formattedZone = String(zone).trim();
      }
    }

    // จัดรูปแบบข้อมูลสำหรับส่งให้ service
    const registrationData = {
      line: {
        userId: lineUser.userId,
        displayName: lineUser.displayName || fullName,
        pictureUrl: lineUser.pictureUrl || null,
      },
      personal: {
        fullName,
        birthdate: formattedBirthdate,
        nationalId: cleanedIdCard,
        phoneNumber: cleanedPhone,
      },
      address: {
        village: parseInt(village, 10),
        houseNumber: houseNumber.trim(),
        zone: formattedZone,
      },
    };

    // 3. ส่งต่อให้ service จัดการบันทึกข้อมูลลงฐานข้อมูลผ่าน Transaction
    const result = await registerMember(registrationData);

    console.log("🎉 [MemberController] สมัครสมาชิกสำเร็จ", result);

    return res.status(201).json({
      success: true,
      message: "สมัครสมาชิกเรียบร้อยแล้ว",
      data: result,
    });
  } catch (error) {
    // จัดการข้อผิดพลาดเมื่อข้อมูลซ้ำในระบบ (Conflict 409)
    if (
      error.statusCode === 409 ||
      error.code === "P2002" ||
      error.code === "USER_ALREADY_EXISTS" ||
      error.code === "IDCARD_ALREADY_EXISTS"
    ) {
      const target = error.meta?.target;
      let code = error.code || "CONFLICT";
      let message = error.message;

      if (target?.includes("line_user_id") || code === "USER_ALREADY_EXISTS") {
        code = "USER_ALREADY_EXISTS";
        message = "บัญชี LINE นี้ได้ทำการลงทะเบียนในระบบแล้ว";
      } else if (target?.includes("national_id") || code === "IDCARD_ALREADY_EXISTS") {
        code = "IDCARD_ALREADY_EXISTS";
        message = "เลขประจำตัวประชาชนนี้ถูกลงทะเบียนในระบบแล้ว";
      }

      const conflictError = createHttpError(409, message);
      conflictError.code = code;
      return next(conflictError);
    }

    next(error);
  }
}

export default {
  handleRegister,
};
