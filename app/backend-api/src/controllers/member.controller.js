import createHttpError from "http-errors";
import dayjs from "../utils/dayjs.js";
import { registerMember } from "../services/member.service.js";
import lineProvider from "../providers/line.provider.js";
import welcomeFlex from "../templates/flex/welcome.flex.js";

const ZONES_LIST = ["A", "B", "C", "D", "E", "F"];

/**
 * Controller สำหรับจัดการการลงทะเบียนสมาชิกผ่าน LINE LIFF
 */
export async function handleRegister(req, res, next) {
  try {
    const lineUser = req.lineUser;
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
    } = req.body;

    // 1. ตรวจสอบข้อมูลบังคับเบื้องต้น
    if (!firstName?.trim() || !lastName?.trim()) {
      return next(createHttpError(400, "กรุณากรอกชื่อและนามสกุลให้ครบถ้วน"));
    }
    if (!idCard?.trim()) {
      return next(createHttpError(400, "กรุณากรอกเลขบัตรประชาชน"));
    }
    if (!phone?.trim()) {
      return next(createHttpError(400, "กรุณากรอกเบอร์โทรศัพท์"));
    }
    if (!village) {
      return next(createHttpError(400, "กรุณาเลือกหมู่บ้าน"));
    }
    if (!houseNumber?.trim()) {
      return next(createHttpError(400, "กรุณาระบุบ้านเลขที่"));
    }

    // 2. ทำความสะอาดและตรวจสอบข้อมูล (Data Sanitization & Validation)
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const cleanedIdCard = idCard.replace(/[^0-9]/g, "");
    if (cleanedIdCard.length !== 13) {
      return next(createHttpError(400, "เลขประจำตัวประชาชนต้องมี 13 หลัก"));
    }

    const cleanedPhone = phone.replace(/[^0-9]/g, "");
    if (cleanedPhone.length < 9 || cleanedPhone.length > 10) {
      return next(createHttpError(400, "เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องมี 9-10 หลัก)"));
    }

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

    // 4. ส่ง Flex Message ต้อนรับสมาชิกใหม่เข้า LINE Chat
    try {
      if (result.user?.lineUserId) {
        const welcomeMessage = welcomeFlex({
          name: result.user.fullName || result.user.displayName,
        });
        await lineProvider.push(result.user.lineUserId, welcomeMessage);
        console.log(`📤 ส่งข้อความต้อนรับไปยัง LINE User (${result.user.lineUserId}) สำเร็จ`);
      }
    } catch (lineError) {
      console.error(
        "❌ ไม่สามารถส่งข้อความ Flex ต้อนรับผ่าน LINE ได้:",
        lineError.message,
      );
    }

    // 5. แสดงผลสรุปใน console
    console.log("\n=======================================================");
    console.log("📝 [LIFF REGISTRATION] ลงทะเบียนสมาชิกสำเร็จ");
    console.log("=======================================================");
    console.log("👤 ผู้ใช้งาน (users):");
    console.log(`   - User ID:      ${result.user.id}`);
    console.log(`   - LINE User ID: ${result.user.lineUserId}`);
    console.log(`   - ชื่อ-นามสกุล:    ${result.user.fullName}`);
    console.log(`   - เลขบัตร ปชช:   ${result.user.nationalId}`);
    console.log(`   - เบอร์โทรศัพท์:   ${result.user.phoneNumber}`);
    console.log("🏡 ที่อยู่และสิทธิ์ (properties & user_villages):");
    console.log(`   - รหัสหมู่บ้าน:   ${result.village.id}`);
    console.log(`   - บ้านเลขที่:     ${result.property.houseNumber}`);
    console.log(`   - โซน:           ${result.property.zone || "-"}`);
    console.log(`   - สิทธิ์ (Role):  ${result.membership.role}`);
    console.log(`   - สถานะ:        ${result.membership.status}`);
    console.log("=======================================================\n");

    return res.status(201).json({
      success: true,
      message: "สมัครสมาชิกเรียบร้อยแล้ว",
      data: result,
    });
  } catch (error) {
    // จัดการข้อผิดพลาดจาก Prisma หรือ Conflict
    if (error.statusCode === 409 || error.code === "P2002") {
      const target = error.meta?.target;
      let message = error.message;
      if (target?.includes("line_user_id")) {
        message = "บัญชี LINE นี้ได้ทำการลงทะเบียนในระบบแล้ว";
      } else if (target?.includes("national_id")) {
        message = "เลขประจำตัวประชาชนนี้ถูกลงทะเบียนในระบบแล้ว";
      }
      return next(createHttpError(409, message));
    }

    next(error);
  }
}

export default {
  handleRegister,
};
