import { prisma } from "../lib/prisma.js";

/**
 * Service สำหรับจัดการการสมัครสมาชิก
 * บันทึกข้อมูลสอดคล้องกับ DATABASE_STRUCTURE:
 * 1. ตาราง users (ข้อมูลผู้ใช้)
 * 2. ตาราง user_villages (ผูกสิทธิ์ผู้ใช้กับหมู่บ้าน Role = RESIDENT)
 * 3. ตาราง properties (บ้านเลขที่ - รองรับทั้งมีอยู่แล้วและเพิ่มใหม่)
 * 4. ตาราง user_properties (ผูกสิทธิ์ผู้ใช้เข้ากับบ้านเลขที่)
 * 5. ตาราง audit_logs (บันทึกประวัติการสมัครสมาชิก)
 */
export async function registerMember(data) {
  try {
    const { line, personal, address } = data;

    // ใช้ Prisma Transaction เพื่อให้การบันทึกทุกตารางเกิดขึ้นอย่างสมบูรณ์พร้อมกัน
    const result = await prisma.$transaction(async (tx) => {
      // 1. ตรวจสอบว่ามีบัญชี LINE นี้ในระบบแล้วหรือไม่
      const existingUserByLine = await tx.user.findUnique({
        where: { lineUserId: line.userId },
      });
      if (existingUserByLine) {
        const error = new Error("บัญชี LINE นี้ได้ทำการลงทะเบียนในระบบแล้ว");
        error.statusCode = 409;
        throw error;
      }

      // 2. ตรวจสอบว่าเลขบัตรประชาชนซ้ำกับผู้อื่นหรือไม่ (ถ้ามีการระบุ)
      if (personal.nationalId) {
        const existingUserByNationalId = await tx.user.findUnique({
          where: { nationalId: personal.nationalId },
        });
        if (existingUserByNationalId) {
          const error = new Error("เลขประจำตัวประชาชนนี้ถูกลงทะเบียนในระบบแล้ว");
          error.statusCode = 409;
          throw error;
        }
      }

      // 3. ตรวจสอบว่ามีข้อมูลหมู่บ้านในระบบหรือไม่ (หากยังไม่มี ให้สร้าง record หมู่บ้านเบื้องต้น)
      const villageId = parseInt(address.village, 10);
      let village = await tx.village.findUnique({
        where: { id: villageId },
      });
      // ถ้าไม่มี record หมู่บ้าน ให้แจ้งข้อผิดพลาด
      if (!village) {
        const error = new Error(`ไม่พบข้อมูลหมู่บ้านที่ระบุ [รหัส: ${villageId}]`);
        error.statusCode = 404;
        throw error;
      }

      // 4. บันทึกข้อมูลผู้ใช้ใหม่ลงในตาราง users
      const newUser = await tx.user.create({
        data: {
          lineUserId: line.userId,
          lineProfileUrl: line.pictureUrl || null,
          fullName: personal.fullName,
          birthdate: personal.birthdate || null,
          nationalId: personal.nationalId || null,
          phoneNumber: personal.phoneNumber || null,
          isGlobalAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 5. บันทึกสิทธิ์ผู้ใช้กับหมู่บ้านในตาราง user_villages (Role: RESIDENT, Status: ACTIVE)
      const userVillage = await tx.userVillage.create({
        data: {
          userId: newUser.id,
          villageId: village.id,
          role: "RESIDENT",
          status: "ACTIVE",
          createdAt: new Date(),
        },
      });

      // 6. จัดการข้อมูลบ้านเลขที่ในตาราง properties
      // เนื่องจากมี unique([village_id, house_number]) จึงใช้ upsert เพื่อรองรับทั้งบ้านที่มีอยู่เดิมและบ้านใหม่
      const property = await tx.property.upsert({
        where: {
          villageId_houseNumber: {
            villageId: village.id,
            houseNumber: address.houseNumber,
          },
        },
        update: {
          ...(address.zone ? { zone: address.zone } : {}),
          updatedAt: new Date(),
        },
        create: {
          villageId: village.id,
          houseNumber: address.houseNumber,
          zone: address.zone || null,
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 7. ผูกสิทธิ์คนเข้ากับบ้านเลขที่ในตาราง user_properties
      const userProperty = await tx.userProperty.upsert({
        where: {
          userId_propertyId: {
            userId: newUser.id,
            propertyId: property.id,
          },
        },
        update: {
          updatedAt: new Date(),
        },
        create: {
          userId: newUser.id,
          propertyId: property.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 8. บันทึกประวัติการสมัครสมาชิกลงในตาราง audit_logs (ถ้ามีตารางรองรับ)
      try {
        await tx.auditLog.create({
          data: {
            villageId: village.id,
            userId: newUser.id,
            action: "REGISTER",
            tableName: "users",
            recordId: newUser.id,
            newData: {
              userId: newUser.id,
              lineUserId: newUser.lineUserId,
              fullName: newUser.fullName,
              propertyId: property.id,
              houseNumber: property.houseNumber,
              zone: property.zone,
              role: userVillage.role,
            },
            createdAt: new Date(),
          },
        });
      } catch (logError) {
        // Audit log ล้มเหลวไม่ทำให้ transaction หลักเสีย
        console.warn("Audit log creation skipped:", logError.message);
      }

      return {
        user: {
          id: newUser.id,
          lineUserId: newUser.lineUserId,
          displayName: line.displayName,
          pictureUrl: newUser.lineProfileUrl,
          fullName: newUser.fullName,
          birthdate: newUser.birthdate,
          nationalId: newUser.nationalId,
          phoneNumber: newUser.phoneNumber,
        },
        village: {
          id: village.id,
          address: village.address,
        },
        property: {
          id: property.id,
          houseNumber: property.houseNumber,
          zone: property.zone,
          status: property.status,
        },
        membership: {
          role: userVillage.role,
          status: userVillage.status,
        },

        
        // // ใช้สำหรับทดสอบ
        // user: {
        //   lineUserId: line.userId,
        //   displayName: line.displayName,
        //   pictureUrl: line.pictureUrl || null,
        //   fullName: personal.fullName,
        //   birthdate: personal.birthdate || null,
        //   nationalId: personal.nationalId || null,
        //   phoneNumber: personal.phoneNumber || null,
        // },
        // village: {
        //   address: village.address,
        // },
        // property: {
        //   houseNumber: address.houseNumber,
        //   zone: address.zone,
        // },
      };
    });

    return result;
  } catch (error) {
    console.error("registerMember service error:", error);
    throw error;
  }
}
