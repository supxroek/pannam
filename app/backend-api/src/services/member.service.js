import { prisma } from "../lib/prisma.js";

/**
 * Service สำหรับจัดการการสมัครสมาชิก
 */
export async function registerMember(data) {
  try {
    // เตรียมข้อมูลที่จะใช้ในการสมัครสมาชิก
    // รวมเป็น Object เดียว
    const member = {
      line: data.line,
      personal: data.personal,
      address: data.address,
    };

    // ใช้ transaction เพื่อสร้างข้อมูลสมาชิกใหม่
    await prisma.$transaction(async (tx) => {
      // เช็กก่อนว่ามีข้อมูล lineUserId นี้ในระบบหรือยัง เพื่อป้องกันการสมัครซ้ำ
      const existingMember = await tx.user.findUnique({
        where: { lineUserId: data.line.userId },
      });
      if (existingMember) {
        throw new Error("Member already exists");
      }

      // บันทึกข้อมูลสมาชิกใหม่
      // ข้อมูล users
      await tx.user.create({
        data: {
          lineUserId: data.line.userId,
          lineProfileUrl: data.line.pictureUrl,
          fullName: data.personal.fullName,
          birthdate: data.personal.birthdate,
          nationalId: data.personal.idCard,
          phoneNumber: data.personal.phone,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      // ข้อมูล address
      await tx.property.create({
        data: {
          villageId: data.address.village,
          houseNumber: data.address.houseNumber,
          zone: data.address.zone,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });

    return member;
    // บันทึกข้อมูลสมาชิกใหม่
  } catch (error) {
    console.error(error);
    throw error;
  }
}
