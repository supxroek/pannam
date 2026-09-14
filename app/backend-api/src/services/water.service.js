// src/services/water.service.js

import { prisma } from "../lib/prisma.js";
import dayjs from "../utils/dayjs.js";

/**
 * Service สำหรับจัดการข้อมูลค่าน้ำ / ประวัติการใช้น้ำ / ช่องทางชำระเงิน
 *
 * ใช้ร่วมกันระหว่างลูกบ้าน (RESIDENT) และผู้จดน้ำ (METER_READER)
 */

/**
 * ดึงบ้านทั้งหมดของผู้ใช้ พร้อมบิลล่าสุดแต่ละหลัง
 *
 * @param {string} lineUserId — LINE User ID
 * @returns {Promise<Array>} รายการบ้านพร้อมบิลล่าสุด
 */
export async function getUserPropertiesWithBills(lineUserId) {
  const user = await prisma.user.findUnique({
    where: { lineUserId },
    select: {
      id: true,
      fullName: true,
      userProperties: {
        select: {
          property: {
            select: {
              id: true,
              houseNumber: true,
              zone: true,
              villageId: true,
              status: true,
              meterReadings: {
                orderBy: { readingDate: "desc" },
                take: 1,
                select: {
                  id: true,
                  previousReading: true,
                  currentReading: true,
                  consumption: true,
                  readingDate: true,
                  invoice: {
                    select: {
                      id: true,
                      waterAmount: true,
                      serviceFee: true,
                      fineAmount: true,
                      totalAmount: true,
                      paymentStatus: true,
                      dueDate: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  // จัดรูปข้อมูลให้อ่านง่าย
  return user.userProperties.map((up) => {
    const property = up.property;
    const latestReading = property.meterReadings[0] || null;
    const invoice = latestReading?.invoice || null;

    return {
      propertyId: property.id,
      houseNumber: property.houseNumber,
      zone: property.zone,
      villageId: property.villageId,
      status: property.status,
      reading: latestReading
        ? {
            consumption: Number(latestReading.consumption),
            readingDate: latestReading.readingDate,
            readingMonth: dayjs(latestReading.readingDate)
              .locale("th")
              .format("MMM BB"),
          }
        : null,
      invoice: invoice
        ? {
            invoiceId: invoice.id,
            waterAmount: Number(invoice.waterAmount),
            serviceFee: Number(invoice.serviceFee),
            fineAmount: Number(invoice.fineAmount),
            totalAmount: Number(invoice.totalAmount),
            paymentStatus: invoice.paymentStatus,
            dueDate: invoice.dueDate,
            dueDateFormatted: dayjs(invoice.dueDate)
              .locale("th")
              .format("D MMM BB"),
          }
        : null,
    };
  });
}

/**
 * ดึงบ้านทั้งหมดของผู้ใช้ พร้อมประวัติการใช้น้ำ N เดือนย้อนหลัง
 *
 * @param {string} lineUserId — LINE User ID
 * @param {number} months — จำนวนเดือนย้อนหลัง (default: 3)
 * @returns {Promise<Array>} รายการบ้านพร้อมประวัติ
 */
export async function getUserPropertiesWithHistory(lineUserId, months = 3) {
  const user = await prisma.user.findUnique({
    where: { lineUserId },
    select: {
      id: true,
      fullName: true,
      userProperties: {
        select: {
          property: {
            select: {
              id: true,
              houseNumber: true,
              zone: true,
              villageId: true,
              meterReadings: {
                orderBy: { readingDate: "desc" },
                take: months,
                select: {
                  consumption: true,
                  readingDate: true,
                  invoice: {
                    select: {
                      totalAmount: true,
                      paymentStatus: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  return user.userProperties.map((up) => {
    const property = up.property;

    return {
      propertyId: property.id,
      houseNumber: property.houseNumber,
      zone: property.zone,
      villageId: property.villageId,
      history: property.meterReadings.map((reading) => ({
        month: dayjs(reading.readingDate).locale("th").format("MMM BB"),
        consumption: Number(reading.consumption),
        totalAmount: reading.invoice
          ? Number(reading.invoice.totalAmount)
          : null,
        paymentStatus: reading.invoice?.paymentStatus || null,
      })),
    };
  });
}

/**
 * ดึงข้อมูลช่องทางชำระเงินของหมู่บ้าน
 *
 * @param {number} villageId — รหัสหมู่บ้าน
 * @returns {Promise<Object>} ข้อมูลช่องทางชำระเงิน
 */
export async function getVillagePaymentInfo(villageId) {
  const village = await prisma.village.findUnique({
    where: { id: villageId },
    select: {
      id: true,
      address: true,
      paymentMethod: true,
      bankProvider: true,
      bankNumber: true,
      bankPayeeName: true,
      promptpayNo: true,
      promptpayName: true,
      promptpayImage: true,
      enablePromptpay: true,
    },
  });

  return village;
}

/**
 * ============================================================
 * ฟังก์ชันสำหรับผู้จดน้ำ (Meter Reader) & ระบบจัดการค่าน้ำ
 * ============================================================
 */

/**
 * ดึงสรุปความคืบหน้าการจดน้ำของหมู่บ้านในรอบเดือนปัจจุบัน
 *
 * @param {number} villageId - รหัสหมู่บ้าน
 * @returns {Promise<Object>} สรุปภาพรวมและรายโซน
 */
export async function getReadingProgress(villageId) {
  const startOfMonth = dayjs().startOf("month").toDate();
  const endOfMonth = dayjs().endOf("month").toDate();
  const monthName = dayjs().locale("th").format("MMMM BBBB");

  // 1. ดึงบ้านทั้งหมดที่ ACTIVE
  const properties = await prisma.property.findMany({
    where: {
      villageId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      houseNumber: true,
      zone: true,
      meterReadings: {
        where: {
          readingDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        take: 1,
        select: { id: true },
      },
    },
  });

  const totalProperties = properties.length;
  let readProperties = 0;
  const zoneMap = {};

  for (const prop of properties) {
    const isRead = prop.meterReadings.length > 0;
    if (isRead) readProperties++;

    const zoneKey = prop.zone || "ทั่วไป";
    if (!zoneMap[zoneKey]) {
      zoneMap[zoneKey] = { zone: prop.zone, total: 0, read: 0 };
    }
    zoneMap[zoneKey].total++;
    if (isRead) zoneMap[zoneKey].read++;
  }

  const unreadProperties = Math.max(0, totalProperties - readProperties);
  const percent = totalProperties > 0 ? Math.round((readProperties / totalProperties) * 100) : 0;
  const zones = Object.values(zoneMap);

  return {
    monthName,
    totalProperties,
    readProperties,
    unreadProperties,
    percent,
    zones,
  };
}

/**
 * ดึงข้อมูลสรุปบ้านค้างชำระของหมู่บ้าน
 *
 * @param {number} villageId - รหัสหมู่บ้าน
 * @returns {Promise<Object>} ยอดรวมและรายการบ้านที่ค้าง
 */
export async function getOverdueSummary(villageId) {
  const unpaidInvoices = await prisma.invoice.findMany({
    where: {
      meterReading: {
        villageId,
      },
      paymentStatus: {
        in: ["PENDING", "OVERDUE", "VERIFYING"],
      },
    },
    include: {
      meterReading: {
        include: {
          property: true,
        },
      },
    },
    orderBy: {
      totalAmount: "desc",
    },
  });

  let totalUnpaidAmount = 0;
  const houseSet = new Set();
  const topHouses = [];

  for (const inv of unpaidInvoices) {
    const amt = Number(inv.totalAmount || 0);
    totalUnpaidAmount += amt;
    const prop = inv.meterReading?.property;
    if (prop) {
      houseSet.add(prop.id);
      if (topHouses.length < 5) {
        topHouses.push({
          invoiceId: inv.id,
          houseNumber: prop.houseNumber,
          zone: prop.zone,
          totalAmount: amt,
          status: inv.paymentStatus,
          dueDate: inv.dueDate ? dayjs(inv.dueDate).locale("th").format("D MMM BB") : "-",
        });
      }
    }
  }

  return {
    totalUnpaidAmount,
    totalUnpaidHouses: houseSet.size,
    topHouses,
  };
}

/**
 * คำนวณค่าน้ำตามตาราง water_rates
 *
 * @param {number} villageId - รหัสหมู่บ้าน
 * @param {number} consumption - จำนวนหน่วยน้ำที่ใช้
 * @returns {Promise<{waterAmount: number, serviceFee: number, fineAmount: number, totalAmount: number}>}
 */
export async function calculateWaterBill(villageId, consumption) {
  const units = Math.max(0, Number(consumption) || 0);

  // ดึงอัตราค่าน้ำของหมู่บ้าน
  const rates = await prisma.waterRate.findMany({
    where: { villageId },
    orderBy: { minUnit: "asc" },
  });

  let waterAmount = 0;

  if (rates.length === 0) {
    // Fallback: อัตราคงที่ 10 บาท/หน่วย หากยังไม่มีการตั้งค่า
    waterAmount = units * 10;
  } else {
    // คำนวณตามขั้นบันได
    let remainingUnits = units;

    for (const rate of rates) {
      const min = Number(rate.minUnit);
      const max = rate.maxUnit !== null ? Number(rate.maxUnit) : Infinity;
      const price = Number(rate.pricePerUnit);

      if (units > min) {
        const taxableUnitsInThisTier = Math.min(units, max) - min;
        if (taxableUnitsInThisTier > 0) {
          waterAmount += taxableUnitsInThisTier * price;
        }
      }
    }

    // หากคำนวณขั้นบันไดแล้วได้ 0 แต่มี units (กรณีไม่ได้ match tier) ให้ใช้อัตราแรก
    if (waterAmount === 0 && units > 0 && rates[0]) {
      waterAmount = units * Number(rates[0].pricePerUnit);
    }
  }

  const serviceFee = 0;
  const fineAmount = 0;
  const totalAmount = waterAmount + serviceFee + fineAmount;

  return {
    waterAmount: Math.round(waterAmount * 100) / 100,
    serviceFee,
    fineAmount,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

/**
 * ดึงรายชื่อบ้านทั้งหมดในหมู่บ้านสำหรับหน้าบันทึกจดน้ำ
 *
 * @param {number} villageId - รหัสหมู่บ้าน
 * @returns {Promise<Array>} รายการบ้านพร้อมสถานะว่าจดแล้วหรือยัง
 */
export async function getPropertiesForReading(villageId) {
  const startOfMonth = dayjs().startOf("month").toDate();
  const endOfMonth = dayjs().endOf("month").toDate();

  const properties = await prisma.property.findMany({
    where: { villageId, status: "ACTIVE" },
    include: {
      meterReadings: {
        orderBy: { readingDate: "desc" },
        take: 2,
        include: {
          invoice: true,
        },
      },
    },
    orderBy: [
      { zone: "asc" },
      { houseNumber: "asc" },
    ],
  });

  return properties.map((prop) => {
    // หาการจดล่าสุด
    const latestReading = prop.meterReadings[0] || null;

    // ตรวจสอบว่าในเดือนนี้จดไปแล้วหรือยัง
    const isReadThisMonth = latestReading
      ? dayjs(latestReading.readingDate).isAfter(startOfMonth) &&
        dayjs(latestReading.readingDate).isBefore(endOfMonth)
      : false;

    // เลขก่อนหน้า: ถ้าเดือนนี้จดแล้ว เลขก่อนหน้าคือ reading ตัวก่อนหน้า (index 1) หรือ previousReading ของตัวล่าสุด
    const previousReading = isReadThisMonth
      ? (prop.meterReadings[1]?.currentReading ?? latestReading?.previousReading ?? 0)
      : (latestReading?.currentReading ?? 0);

    return {
      id: prop.id,
      houseNumber: prop.houseNumber,
      zone: prop.zone,
      meterCode: prop.meterCode,
      isReadThisMonth,
      previousReading: Number(previousReading),
      latestReading: isReadThisMonth && latestReading
        ? {
            id: latestReading.id,
            currentReading: Number(latestReading.currentReading),
            consumption: Number(latestReading.consumption),
            readingDate: latestReading.readingDate,
            imageUrl: latestReading.imageUrl,
            invoice: latestReading.invoice
              ? {
                  id: latestReading.invoice.id,
                  totalAmount: Number(latestReading.invoice.totalAmount),
                  paymentStatus: latestReading.invoice.paymentStatus,
                }
              : null,
          }
        : null,
    };
  });
}

/**
 * บันทึกการอ่านมิเตอร์น้ำและออกบิล (Invoice)
 *
 * @param {number} readerUserId - รหัสผู้จดน้ำ
 * @param {Object} param1
 * @param {number} param1.villageId
 * @param {number} param1.propertyId
 * @param {number} param1.currentReading
 * @param {string} [param1.imageUrl]
 * @returns {Promise<Object>} ผลลัพธ์การบันทึก
 */
export async function recordMeterReading(readerUserId, { villageId, propertyId, currentReading, imageUrl }) {
  const currentVal = Number(currentReading);
  if (isNaN(currentVal) || currentVal < 0) {
    throw new Error("เลขมิเตอร์ต้องเป็นตัวเลขที่ถูกต้องและมากกว่าหรือเท่ากับ 0");
  }

  // ดึงเลขมิเตอร์ครั้งก่อนหน้า
  const lastReading = await prisma.meterReading.findFirst({
    where: { propertyId: Number(propertyId) },
    orderBy: { readingDate: "desc" },
  });

  const previousReading = lastReading ? Number(lastReading.currentReading) : 0;
  if (currentVal < previousReading) {
    throw new Error(`เลขมิเตอร์ปัจจุบัน (${currentVal}) ต้องไม่น้อยกว่าเลขครั้งก่อนหน้า (${previousReading})`);
  }

  const consumption = currentVal - previousReading;
  const billCalc = await calculateWaterBill(Number(villageId), consumption);

  const readingDate = new Date();
  const dueDate = dayjs(readingDate).add(15, "day").toDate();

  // สร้าง transaction บันทึกมิเตอร์และออกบิล
  const result = await prisma.$transaction(async (tx) => {
    const reading = await tx.meterReading.create({
      data: {
        villageId: Number(villageId),
        propertyId: Number(propertyId),
        readerId: Number(readerUserId) || null,
        previousReading,
        currentReading: currentVal,
        consumption,
        imageUrl: imageUrl || null,
        readingDate,
      },
    });

    const invoice = await tx.invoice.create({
      data: {
        meterReadingId: reading.id,
        waterAmount: billCalc.waterAmount,
        serviceFee: billCalc.serviceFee,
        fineAmount: billCalc.fineAmount,
        totalAmount: billCalc.totalAmount,
        paymentStatus: "PENDING",
        dueDate,
      },
    });

    return { reading, invoice };
  });

  return {
    readingId: result.reading.id,
    invoiceId: result.invoice.id,
    previousReading,
    currentReading: currentVal,
    consumption,
    totalAmount: billCalc.totalAmount,
    dueDate,
  };
}

/**
 * ดึงรายการบิลค้างชำระทั้งหมดในหมู่บ้าน (สำหรับผู้จดน้ำเปิดหน้าบันทึกการจ่าย)
 *
 * @param {number} villageId - รหัสหมู่บ้าน
 * @returns {Promise<Array>}
 */
export async function getUnpaidInvoices(villageId) {
  const invoices = await prisma.invoice.findMany({
    where: {
      meterReading: { villageId: Number(villageId) },
      paymentStatus: { in: ["PENDING", "OVERDUE", "VERIFYING"] },
    },
    include: {
      meterReading: {
        include: {
          property: true,
        },
      },
    },
    orderBy: [
      { meterReading: { property: { zone: "asc" } } },
      { meterReading: { property: { houseNumber: "asc" } } },
    ],
  });

  return invoices.map((inv) => ({
    invoiceId: inv.id,
    propertyId: inv.meterReading.property.id,
    houseNumber: inv.meterReading.property.houseNumber,
    zone: inv.meterReading.property.zone,
    meterCode: inv.meterReading.property.meterCode,
    consumption: Number(inv.meterReading.consumption),
    readingDate: inv.meterReading.readingDate,
    readingMonth: dayjs(inv.meterReading.readingDate).locale("th").format("MMM BB"),
    totalAmount: Number(inv.totalAmount),
    paymentStatus: inv.paymentStatus,
    dueDate: inv.dueDate,
    dueDateFormatted: dayjs(inv.dueDate).locale("th").format("D MMM BB"),
  }));
}

/**
 * บันทึกการรับชำระเงินสดโดยผู้จดน้ำ
 *
 * @param {number} readerUserId - รหัสผู้จดน้ำ
 * @param {number} invoiceId - รหัสใบแจ้งหนี้
 * @returns {Promise<Object>}
 */
export async function recordCashPayment(readerUserId, invoiceId) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(invoiceId) },
  });

  if (!invoice) {
    throw new Error("ไม่พบใบแจ้งหนี้ที่ระบุ");
  }

  if (invoice.paymentStatus === "PAID_CASH" || invoice.paymentStatus === "PAID_ONLINE") {
    throw new Error("ใบแจ้งหนี้นี้ได้รับการชำระเงินเรียบร้อยแล้ว");
  }

  return await prisma.$transaction(async (tx) => {
    const updatedInvoice = await tx.invoice.update({
      where: { id: invoice.id },
      data: { paymentStatus: "PAID_CASH" },
    });

    const payment = await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        amountPaid: invoice.totalAmount,
        slipUrl: "",
        verifiedByUserId: Number(readerUserId) || null,
        paymentStatus: "APPROVED",
        verifiedAt: new Date(),
      },
    });

    return {
      invoice: updatedInvoice,
      payment,
    };
  });
}

/**
 * ส่งสลิปโอนเงิน (สำหรับลูกบ้าน)
 *
 * @param {number} userId - รหัสผู้ใช้
 * @param {number} invoiceId - รหัสใบแจ้งหนี้
 * @param {string} slipUrl - รูปสลิป (Base64 หรือ URL)
 * @returns {Promise<Object>}
 */
export async function submitPaymentSlip(userId, invoiceId, slipUrl) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(invoiceId) },
  });

  if (!invoice) {
    throw new Error("ไม่พบใบแจ้งหนี้ที่ระบุ");
  }

  return await prisma.$transaction(async (tx) => {
    const updatedInvoice = await tx.invoice.update({
      where: { id: invoice.id },
      data: { paymentStatus: "VERIFYING" },
    });

    const payment = await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        paidByUserId: Number(userId) || null,
        amountPaid: invoice.totalAmount,
        slipUrl: slipUrl || "",
        paymentStatus: "SUBMITTED",
      },
    });

    return {
      invoice: updatedInvoice,
      payment,
    };
  });
}

/**
 * ดึงข้อมูลบิลปัจจุบันและประวัติเต็มของบ้านที่ระบุ (สำหรับหน้า LIFF ลูกบ้าน)
 *
 * @param {number} propertyId - รหัสบ้าน
 * @returns {Promise<Object>}
 */
export async function getPropertyBillDetail(propertyId) {
  const property = await prisma.property.findUnique({
    where: { id: Number(propertyId) },
    include: {
      village: true,
      meterReadings: {
        orderBy: { readingDate: "desc" },
        take: 1,
        include: {
          invoice: {
            include: {
              payments: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!property) return null;

  const latestReading = property.meterReadings[0] || null;
  const invoice = latestReading?.invoice || null;
  const latestPayment = invoice?.payments?.[0] || null;

  return {
    property: {
      id: property.id,
      houseNumber: property.houseNumber,
      zone: property.zone,
      villageId: property.villageId,
      villageName: property.village.address,
    },
    paymentInfo: {
      paymentMethod: property.village.paymentMethod,
      bankProvider: property.village.bankProvider,
      bankNumber: property.village.bankNumber,
      bankPayeeName: property.village.bankPayeeName,
      enablePromptpay: property.village.enablePromptpay,
      promptpayNo: property.village.promptpayNo,
      promptpayName: property.village.promptpayName,
      promptpayImage: property.village.promptpayImage,
    },
    reading: latestReading
      ? {
          id: latestReading.id,
          previousReading: Number(latestReading.previousReading),
          currentReading: Number(latestReading.currentReading),
          consumption: Number(latestReading.consumption),
          readingDate: latestReading.readingDate,
          readingMonth: dayjs(latestReading.readingDate).locale("th").format("MMMM BBBB"),
          imageUrl: latestReading.imageUrl,
        }
      : null,
    invoice: invoice
      ? {
          id: invoice.id,
          waterAmount: Number(invoice.waterAmount),
          serviceFee: Number(invoice.serviceFee),
          fineAmount: Number(invoice.fineAmount),
          totalAmount: Number(invoice.totalAmount),
          paymentStatus: invoice.paymentStatus,
          dueDate: invoice.dueDate,
          dueDateFormatted: dayjs(invoice.dueDate).locale("th").format("D MMMM BBBB"),
          payment: latestPayment
            ? {
                id: latestPayment.id,
                status: latestPayment.paymentStatus,
                slipUrl: latestPayment.slipUrl,
                amountPaid: Number(latestPayment.amountPaid),
              }
            : null,
        }
      : null,
  };
}

/**
 * ดึงประวัติการใช้น้ำเต็มรูปแบบสำหรับกราฟและตาราง (สำหรับหน้า LIFF ประวัติการใช้น้ำ)
 *
 * @param {number} propertyId - รหัสบ้าน
 * @returns {Promise<Array>}
 */
export async function getFullUsageHistory(propertyId) {
  const readings = await prisma.meterReading.findMany({
    where: { propertyId: Number(propertyId) },
    include: {
      invoice: true,
    },
    orderBy: { readingDate: "asc" },
  });

  return readings.map((r) => ({
    readingId: r.id,
    readingDate: r.readingDate,
    monthLabel: dayjs(r.readingDate).locale("th").format("MMM BB"),
    fullMonthLabel: dayjs(r.readingDate).locale("th").format("MMMM BBBB"),
    previousReading: Number(r.previousReading),
    currentReading: Number(r.currentReading),
    consumption: Number(r.consumption),
    totalAmount: r.invoice ? Number(r.invoice.totalAmount) : 0,
    paymentStatus: r.invoice?.paymentStatus || "PENDING",
  }));
}

