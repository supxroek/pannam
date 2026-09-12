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

/**
 * ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน
 */
export async function getProfile(req, res, next) {
  try {
    const lineUserId = req.lineUser.userId;
    const user = await prisma.user.findUnique({
      where: { lineUserId },
      include: {
        userVillages: {
          where: { status: "ACTIVE" },
          include: { village: true },
        },
        userProperties: {
          include: { property: true },
        },
      },
    });

    if (!user) {
      return next(AppError.notFound("ไม่พบข้อมูลผู้ใช้ในระบบ"));
    }

    const cleanId = String(user.nationalId || "").replace(/[^0-9]/g, "");
    const maskedId =
      cleanId.length === 13
        ? `${cleanId.slice(0, 1)}-${cleanId.slice(1, 5)}-XXXXX-${cleanId.slice(10, 12)}-${cleanId.slice(12)}`
        : cleanId || "-";

    const cleanPhone = String(user.phoneNumber || "").replace(/[^0-9]/g, "");
    const formattedPhone =
      cleanPhone.length === 10
        ? `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`
        : user.phoneNumber || "-";

    const role = user.userVillages[0]?.role || "RESIDENT";
    const village = user.userVillages[0]?.village || null;
    const properties = user.userProperties.map((up) => ({
      id: up.property.id,
      houseNumber: up.property.houseNumber,
      zone: up.property.zone,
      meterCode: up.property.meterCode,
      status: up.property.status,
    }));

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        lineUserId: user.lineUserId,
        fullName: user.fullName,
        nationalId: user.nationalId,
        maskedNationalId: maskedId,
        phoneNumber: user.phoneNumber,
        formattedPhone,
        birthdate: user.birthdate,
        birthdateFormatted: user.birthdate ? dayjs(user.birthdate).locale("th").format("D MMMM BBBB") : "-",
        role,
        village,
        properties,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * อัปเดตข้อมูลโปรไฟล์ผู้ใช้ (เช่น เบอร์โทรศัพท์)
 */
export async function updateProfile(req, res, next) {
  try {
    const lineUserId = req.lineUser.userId;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return next(AppError.badRequest("กรุณาระบุเบอร์โทรศัพท์"));
    }

    const cleanedPhone = String(phoneNumber).replace(/[^0-9]/g, "");
    if (cleanedPhone.length < 9 || cleanedPhone.length > 10) {
      return next(AppError.badRequest("เบอร์โทรศัพท์ต้องมีความยาว 9-10 หลัก"));
    }

    const updated = await prisma.user.update({
      where: { lineUserId },
      data: {
        phoneNumber: cleanedPhone,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว",
      data: {
        phoneNumber: updated.phoneNumber,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  handleRegister,
  getProfile,
  updateProfile,
};
