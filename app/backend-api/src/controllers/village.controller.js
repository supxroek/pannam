import { prisma } from "../lib/prisma.js";
import AppError from "../utils/app-error.js";

/**
 * Controller สำหรับจัดการข้อมูลหมู่บ้านและบ้านเลขที่
 */

/**
 * @desc    ดึงรายชื่อหมู่บ้านที่เปิดใช้งานทั้งหมด
 * @route   GET /api/villages
 * @access  Protected (LINE ID Token)
 */
export async function getVillages(req, res, next) {
  try {
    const villages = await prisma.village.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        address: true,
        subDistrict: true,
        district: true,
        province: true,
        postalCode: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const formatted = villages.map((v) => ({
      id: v.id,
      name: v.address || `หมู่บ้านที่ ${v.id}`,
      address: v.address,
      subDistrict: v.subDistrict,
      district: v.district,
      province: v.province,
      postalCode: v.postalCode,
    }));

    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลหมู่บ้านสำเร็จ",
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    ดึงรายการบ้านเลขที่ที่มีอยู่ในหมู่บ้านที่ระบุ
 * @route   GET /api/villages/:villageId/properties
 * @access  Protected (LINE ID Token)
 */
export async function getVillageProperties(req, res, next) {
  try {
    const villageId = parseInt(req.params.villageId, 10);
    if (isNaN(villageId)) {
      return next(AppError.badRequest("รหัสหมู่บ้านต้องเป็นตัวเลขจำนวนเต็ม"));
    }

    // ตรวจสอบว่ามีหมู่บ้านนี้ในระบบหรือไม่
    const village = await prisma.village.findUnique({
      where: { id: villageId },
      select: { id: true, address: true, isActive: true },
    });

    if (!village || !village.isActive) {
      return next(AppError.notFound(`ไม่พบหมู่บ้านรหัส ${villageId} ในระบบ`));
    }

    // ดึงบ้านเลขที่เฉพาะที่ active
    const properties = await prisma.property.findMany({
      where: {
        villageId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        houseNumber: true,
        zone: true,
      },
      orderBy: {
        houseNumber: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      message: `ดึงข้อมูลบ้านเลขที่ของหมู่บ้าน ${village.address || villageId} สำเร็จ`,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getVillages,
  getVillageProperties,
};
