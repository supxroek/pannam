import { z } from "zod";

/**
 * Zod Schema สำหรับตรวจสอบข้อมูลการสมัครสมาชิกผ่าน LINE LIFF
 */
export const registerSchema = z.object({
  firstName: z
    .string({ required_error: "กรุณากรอกชื่อจริง" })
    .trim()
    .min(1, "กรุณากรอกชื่อจริง"),
  lastName: z
    .string({ required_error: "กรุณากรอกนามสกุล" })
    .trim()
    .min(1, "กรุณากรอกนามสกุล"),
  birthDay: z.union([z.string(), z.number()]).refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 1 && num <= 31;
  }, "กรุณาระบุวันเกิดให้ถูกต้อง (1-31)"),
  birthMonth: z.union([z.string(), z.number()]).refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 0 && num <= 11;
  }, "กรุณาระบุเดือนเกิดให้ถูกต้อง"),
  birthYear: z.union([z.string(), z.number()]).refine((val) => {
    const num = Number(val);
    const currentYear = new Date().getFullYear();
    return !isNaN(num) && num >= 1900 && num <= currentYear + 543;
  }, "กรุณาระบุปีเกิดให้ถูกต้อง"),
  idCard: z
    .string({ required_error: "กรุณากรอกเลขประจำตัวประชาชน" })
    .transform((val) => val.replace(/[^0-9]/g, ""))
    .refine((val) => val.length === 13, "เลขประจำตัวประชาชนต้องมี 13 หลัก"),
  phone: z
    .string({ required_error: "กรุณากรอกเบอร์โทรศัพท์" })
    .transform((val) => val.replace(/[^0-9]/g, ""))
    .refine((val) => val.length >= 9 && val.length <= 10, "เบอร์โทรศัพท์ต้องมี 9-10 หลัก"),
  village: z
    .union([z.string(), z.number()])
    .refine((val) => String(val).trim().length > 0, "กรุณาเลือกหมู่บ้าน"),
  houseNumber: z
    .string({ required_error: "กรุณาระบุบ้านเลขที่" })
    .trim()
    .min(1, "กรุณาระบุบ้านเลขที่"),
  zone: z.union([z.string(), z.number()]).optional().nullable(),
});

export default registerSchema;
