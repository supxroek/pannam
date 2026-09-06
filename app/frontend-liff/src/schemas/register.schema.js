import { z } from "zod";

/**
 * Zod Validation Schemas สำหรับการลงทะเบียนสมาชิกผ่าน LINE LIFF
 */

// Step 1: ข้อมูลส่วนตัว
export const step1Schema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อจริง"),
  lastName: z
    .string()
    .trim()
    .min(1, "กรุณากรอกนามสกุล"),
  birthDay: z
    .union([z.string(), z.number()])
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1 && num <= 31;
    }, "กรุณาระบุวันเกิด"),
  birthMonth: z
    .union([z.string(), z.number()])
    .refine((val) => {
      if (val === "" || val === undefined || val === null) return false;
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 11;
    }, "กรุณาระบุเดือนเกิด"),
  birthYear: z
    .union([z.string(), z.number()])
    .refine((val) => {
      if (!val) return false;
      const num = Number(val);
      return !isNaN(num) && num > 1900;
    }, "กรุณาระบุปีเกิด"),
});

// Step 2: ข้อมูลติดต่อ & บัตร ปชช.
export const step2Schema = z.object({
  idCard: z
    .string()
    .min(1, "กรุณากรอกเลขบัตรประชาชน")
    .refine((val) => {
      const clean = val.replace(/[^0-9]/g, "");
      return clean.length === 13;
    }, "กรุณากรอกเลขบัตรประชาชน 13 หลักให้ครบถ้วน"),
  phone: z
    .string()
    .min(1, "กรุณากรอกเบอร์โทรศัพท์")
    .refine((val) => {
      const clean = val.replace(/[^0-9]/g, "");
      return clean.length >= 9 && clean.length <= 10;
    }, "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)"),
});

// Step 3: ที่อยู่ (หมู่บ้าน และ บ้านเลขที่)
export const step3Schema = z.object({
  village: z
    .union([z.string(), z.number()])
    .refine((val) => String(val).trim().length > 0, "กรุณาเลือกหมู่บ้าน"),
  houseNumber: z
    .string()
    .trim()
    .min(1, "กรุณาเลือกหรือระบุบ้านเลขที่"),
  zone: z.union([z.string(), z.number()]).optional().nullable(),
});

// รวมทุกขั้นตอนสำหรับ Final Validation ก่อนส่ง API
export const fullRegisterSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

/**
 * ฟังก์ชัน Helper สำหรับ validate ทีละ Step ในหน้า Form
 * @param {number} stepIndex - index ของขั้นตอน (0 = Step1, 1 = Step2, 2 = Step3)
 * @param {Object} formData - ข้อมูลจากฟอร์ม
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateFormStep(stepIndex, formData) {
  let schema;
  if (stepIndex === 0) schema = step1Schema;
  else if (stepIndex === 1) schema = step2Schema;
  else if (stepIndex === 2) schema = step3Schema;
  else schema = fullRegisterSchema;

  const result = schema.safeParse(formData);
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  });

  return { isValid: false, errors };
}
