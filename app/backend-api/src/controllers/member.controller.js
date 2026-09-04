import createHttpError from "http-errors";
import dayjs from "../utils/dayjs.js";
import { registerMember } from "../services/member.service.js";

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

    // ตรวจสอบข้อมูลบังคับเบื้องต้น
    if (!firstName?.trim() || !lastName?.trim()) {
      return next(createHttpError(400, "กรุณากรอกชื่อและนามสกุล"));
    }
    if (!idCard?.trim() || !phone?.trim()) {
      return next(
        createHttpError(400, "กรุณากรอกเลขบัตรประชาชนและเบอร์โทรศัพท์"),
      );
    }

    // ทำความสะอาดและตรวจสอบข้อมูล
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const formattedBirthdate = dayjs.formatDateToDatabase(
      birthDay,
      Number(birthMonth),
      birthYear,
    );
    const cleanedIdCard = idCard ? idCard.replace(/-/g, "") : null;
    const cleanedPhone = phone ? phone.replace(/-/g, "") : null;

    const registrationData = {
      line: {
        userId: lineUser.userId,
        displayName: lineUser.displayName,
        pictureUrl: lineUser.pictureUrl,
      },
      personal: {
        fullName: fullName, // รวมชื่อและนามสกุล
        birthDate: formattedBirthdate, // แปลงวัน/เดือน/ปีให้อยู่ในรูปแบบที่ Prisma ต้องการ
        idCard: cleanedIdCard, // แปลงเลขบัตรประชาชนให้ไม่มีเครื่องหมาย "-"
        phone: cleanedPhone, // แปลงเบอร์โทรให้ไม่มีเครื่องหมาย "-"
      },
      address: {
        village,
        houseNumber: houseNumber?.trim(),
        zone,
      },
    };

    // ส่งต่อให้ service จัดการบันทึกลงฐานข้อมูล
    const result = await registerMember(registrationData);

    // แสดงผลลัพธ์ใน console
    console.log(result);

    // แสดงข้อมูลใน console ตามโจทย์ของผู้ใช้ (ยังไม่บันทึกจริง)
    console.log("\n=======================================================");
    console.log("📝 [LIFF REGISTRATION] ได้รับข้อมูลการสมัครสมาชิกใหม่");
    console.log("=======================================================");
    console.log("👤 LINE User:");
    console.log(`   - User ID:      ${result.line.userId}`);
    console.log(`   - Display Name: ${result.line.displayName}`);
    console.log(`   - Picture URL:  ${result.line.pictureUrl || "-"}`);
    console.log("📄 ข้อมูลผู้สมัคร:");
    console.log(`   - ชื่อ-นามสกุล:    ${result.personal.fullName}`);
    console.log(`   - วันเกิด:        ${result.personal.birthDate}`);
    console.log(`   - เลขบัตร ปชช:   ${result.personal.idCard}`);
    console.log(`   - เบอร์โทรศัพท์:   ${result.personal.phone}`);
    console.log("🏠 ข้อมูลที่อยู่:");
    console.log(`   - บ้านเลขที่:     ${result.address.houseNumber}`);
    console.log(`   - หมู่บ้าน:      ${result.address.village}`);
    console.log(`   - โซน:        ${result.address.zone}`);
    console.log("=======================================================\n");

    return res.status(200).json({
      success: true,
      message: "สมัครสมาชิกเรียบร้อยแล้ว",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  handleRegister,
};
