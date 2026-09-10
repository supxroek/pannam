import AppError from "../utils/app-error.js";
import dayjs from "../utils/dayjs.js";
import { registerMember } from "../services/member.service.js";
import { registerSchema } from "../validations/register.schema.js";
import lineProvider from "../providers/line.provider.js";

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
      return next(AppError.validation(fieldErrors, firstErrorMsg));
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
        houseNumber: (houseNumber || "").trim(),
        zone: zone ? String(zone).trim() : null,
      },
    };

    // 3. ส่งต่อให้ service จัดการบันทึกข้อมูลลงฐานข้อมูลผ่าน Transaction
    const result = await registerMember(registrationData);

    console.log("🎉 [MemberController] สมัครสมาชิกสำเร็จ", result);

    // ปรับเปลี่ยน Rich Menu ตาม Role ของผู้ใช้ทันที (เช่น ลูกบ้าน RESIDENT)
    if (lineUser?.userId) {
      try {
        await lineProvider.isMember(lineUser.userId);
      } catch (menuErr) {
        console.error("Failed to switch rich menu after registration:", menuErr.message);
      }
    }

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
      if (target?.includes("line_user_id") || error.code === "USER_ALREADY_EXISTS") {
        return next(AppError.userAlreadyExists());
      }
      if (target?.includes("national_id") || error.code === "IDCARD_ALREADY_EXISTS") {
        return next(AppError.idCardAlreadyExists());
      }
      return next(AppError.conflict(error.message));
    }

    next(error);
  }
}

export default {
  handleRegister,
};
