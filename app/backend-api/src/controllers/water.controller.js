// src/controllers/water.controller.js

import { prisma } from "../lib/prisma.js";
import AppError from "../utils/app-error.js";
import * as waterService from "../services/water.service.js";

/**
 * ดึง User ในระบบจาก lineUserId
 */
async function getDbUser(lineUserId) {
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
    throw AppError.notFound("ไม่พบข้อมูลผู้ใช้ในระบบ กรุณาลงทะเบียนก่อนใช้งาน");
  }

  return user;
}

/**
 * ตรวจสอบสิทธิ์ผู้จดน้ำ / แอดมิน
 */
function checkReaderRole(user) {
  const roles = user.userVillages.map((uv) => uv.role);
  if (!roles.includes("METER_READER") && !roles.includes("VILLAGE_ADMIN") && !user.isGlobalAdmin) {
    throw AppError.forbidden("ขออภัย คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ (เฉพาะผู้จดมิเตอร์หรือผู้ดูแลหมู่บ้าน)");
  }
}

/**
 * 1. ดึงสรุปความคืบหน้าการจดน้ำ (สำหรับผู้จดน้ำ)
 */
export async function getReadingProgress(req, res, next) {
  try {
    const user = await getDbUser(req.lineUser.userId);
    checkReaderRole(user);

    const villageId = user.userVillages[0]?.villageId;
    if (!villageId) {
      throw AppError.badRequest("ผู้ใช้ไม่ได้สังกัดหมู่บ้านใดๆ");
    }

    const progress = await waterService.getReadingProgress(villageId);
    return res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. ดึงรายชื่อบ้านทั้งหมดสำหรับจดน้ำ (สำหรับผู้จดน้ำ)
 */
export async function getPropertiesForReading(req, res, next) {
  try {
    const user = await getDbUser(req.lineUser.userId);
    checkReaderRole(user);

    const villageId = user.userVillages[0]?.villageId;
    if (!villageId) {
      throw AppError.badRequest("ผู้ใช้ไม่ได้สังกัดหมู่บ้านใดๆ");
    }

    const properties = await waterService.getPropertiesForReading(villageId);
    return res.status(200).json({ success: true, data: properties });
  } catch (error) {
    next(error);
  }
}

/**
 * 3. บันทึกการอ่านมิเตอร์น้ำ (สำหรับผู้จดน้ำ)
 */
export async function recordMeterReading(req, res, next) {
  try {
    const user = await getDbUser(req.lineUser.userId);
    checkReaderRole(user);

    const { villageId, propertyId, currentReading, imageUrl } = req.body;
    if (!propertyId || currentReading === undefined) {
      throw AppError.badRequest("กรุณาระบุรหัสบ้านและเลขมิเตอร์ปัจจุบัน");
    }

    const effectiveVillageId = villageId || user.userVillages[0]?.villageId;
    const result = await waterService.recordMeterReading(user.id, {
      villageId: effectiveVillageId,
      propertyId,
      currentReading,
      imageUrl,
    });

    return res.status(201).json({
      success: true,
      message: "บันทึกข้อมูลมิเตอร์น้ำและออกบิลสำเร็จ",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 4. ดึงรายการบิลที่ค้างชำระ (สำหรับผู้จดน้ำ)
 */
export async function getUnpaidBills(req, res, next) {
  try {
    const user = await getDbUser(req.lineUser.userId);
    checkReaderRole(user);

    const villageId = user.userVillages[0]?.villageId;
    if (!villageId) {
      throw AppError.badRequest("ผู้ใช้ไม่ได้สังกัดหมู่บ้านใดๆ");
    }

    const unpaidBills = await waterService.getUnpaidInvoices(villageId);
    return res.status(200).json({ success: true, data: unpaidBills });
  } catch (error) {
    next(error);
  }
}

/**
 * 5. บันทึกรับเงินสด (สำหรับผู้จดน้ำ)
 */
export async function recordCashPayment(req, res, next) {
  try {
    const user = await getDbUser(req.lineUser.userId);
    checkReaderRole(user);

    const { invoiceId } = req.body;
    if (!invoiceId) {
      throw AppError.badRequest("กรุณาระบุรหัสใบแจ้งหนี้");
    }

    const result = await waterService.recordCashPayment(user.id, invoiceId);
    return res.status(200).json({
      success: true,
      message: "บันทึกการรับชำระเงินสดสำเร็จ",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 6. ดึงรายชื่อบ้านของผู้ใช้งาน (สำหรับ Dropdown สลับบ้านของลูกบ้าน)
 */
export async function getMyProperties(req, res, next) {
  try {
    const user = await getDbUser(req.lineUser.userId);
    const properties = user.userProperties.map((up) => ({
      id: up.property.id,
      houseNumber: up.property.houseNumber,
      zone: up.property.zone,
      villageId: up.property.villageId,
      status: up.property.status,
    }));

    return res.status(200).json({ success: true, data: properties });
  } catch (error) {
    next(error);
  }
}

/**
 * 7. ดึงบิลปัจจุบัน & ช่องทางชำระเงิน (สำหรับลูกบ้าน)
 */
export async function getCurrentBill(req, res, next) {
  try {
    const user = await getDbUser(req.lineUser.userId);
    let propertyId = req.query.propertyId ? Number(req.query.propertyId) : null;

    // ถ้าไม่ระบุ propertyId ให้ใช้บ้านหลังแรกของผู้ใช้
    if (!propertyId && user.userProperties.length > 0) {
      propertyId = user.userProperties[0].property.id;
    }

    if (!propertyId) {
      throw AppError.notFound("ไม่พบข้อมูลบ้านที่ผูกกับบัญชีของคุณ");
    }

    const billDetail = await waterService.getPropertyBillDetail(propertyId);
    return res.status(200).json({ success: true, data: billDetail });
  } catch (error) {
    next(error);
  }
}

/**
 * 8. แนบสลิปโอนเงิน (สำหรับลูกบ้าน)
 */
export async function submitPaymentSlip(req, res, next) {
  try {
    const user = await getDbUser(req.lineUser.userId);
    const { invoiceId, slipUrl } = req.body;

    if (!invoiceId || !slipUrl) {
      throw AppError.badRequest("กรุณาระบุรหัสใบแจ้งหนี้และรูปภาพสลิป");
    }

    const result = await waterService.submitPaymentSlip(user.id, invoiceId, slipUrl);
    return res.status(200).json({
      success: true,
      message: "แนบสลิปโอนเงินเรียบร้อยแล้ว รอเจ้าหน้าที่ตรวจสอบ",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 9. ดึงประวัติการใช้น้ำเต็มรูปแบบสำหรับกราฟ (สำหรับลูกบ้าน)
 */
export async function getUsageHistory(req, res, next) {
  try {
    const user = await getDbUser(req.lineUser.userId);
    let propertyId = req.query.propertyId ? Number(req.query.propertyId) : null;

    if (!propertyId && user.userProperties.length > 0) {
      propertyId = user.userProperties[0].property.id;
    }

    if (!propertyId) {
      throw AppError.notFound("ไม่พบข้อมูลบ้านที่ผูกกับบัญชีของคุณ");
    }

    const history = await waterService.getFullUsageHistory(propertyId);
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
}

export default {
  getReadingProgress,
  getPropertiesForReading,
  recordMeterReading,
  getUnpaidBills,
  recordCashPayment,
  getMyProperties,
  getCurrentBill,
  submitPaymentSlip,
  getUsageHistory,
};
