import createHttpError from "http-errors";

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
      return next(createHttpError(400, "กรุณากรอกเลขบัตรประชาชนและเบอร์โทรศัพท์"));
    }

    const registrationData = {
      line: {
        userId: lineUser.userId,
        displayName: lineUser.displayName,
        pictureUrl: lineUser.pictureUrl,
      },
      personal: {
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: `${birthDay}/${Number(birthMonth) + 1}/${birthYear}`,
        idCard: idCard.trim(),
        phone: phone.trim(),
      },
      address: {
        village,
        houseNumber: houseNumber?.trim(),
        zone,
      },
      receivedAt: new Date().toISOString(),
    };

    // แสดงข้อมูลใน console ตามโจทย์ของผู้ใช้ (ยังไม่บันทึกจริง)
    console.log("\n=======================================================");
    console.log("📝 [LIFF REGISTRATION] ได้รับข้อมูลการสมัครสมาชิกใหม่");
    console.log("=======================================================");
    console.log("👤 LINE User:");
    console.log(`   - User ID:      ${lineUser.userId}`);
    console.log(`   - Display Name: ${lineUser.displayName}`);
    console.log(`   - Picture URL:  ${lineUser.pictureUrl || "-"}`);
    console.log("📄 ข้อมูลผู้สมัคร:");
    console.log(`   - ชื่อ-นามสกุล:    ${registrationData.personal.fullName}`);
    console.log(`   - วันเกิด:        ${registrationData.personal.birthDate}`);
    console.log(`   - เลขบัตร ปชช:   ${registrationData.personal.idCard}`);
    console.log(`   - เบอร์โทรศัพท์:   ${registrationData.personal.phone}`);
    console.log("🏠 ข้อมูลที่อยู่:");
    console.log(`   - บ้านเลขที่:     ${registrationData.address.houseNumber}`);
    console.log(`   - หมู่บ้าน:       ${registrationData.address.village}`);
    console.log(`   - โซน:           ${registrationData.address.zone}`);
    console.log(`⏰ ได้รับเมื่อ:      ${registrationData.receivedAt}`);
    console.log("=======================================================\n");

    return res.status(200).json({
      success: true,
      message: "รับข้อมูลการสมัครสมาชิกเรียบร้อยแล้ว (จำลองระบบ)",
      data: registrationData,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  handleRegister,
};
