/**
 * Centralized API Error Utility สำหรับฝั่ง Frontend
 * ใช้จัดการและแปลงข้อผิดพลาดจาก Backend ให้อยู่ในโครงสร้างมาตรฐาน
 */
export class ApiError extends Error {
  /**
   * @param {string} message - ข้อความแจ้งเตือนผู้ใช้
   * @param {string} code - รหัสข้อผิดพลาด (เช่น TOKEN_EXPIRED, USER_ALREADY_EXISTS)
   * @param {number} statusCode - รหัสสถานะ HTTP (เช่น 400, 401, 409, 500)
   * @param {Object|null} errors - รายละเอียดความผิดพลาดรายฟิลด์ (สำหรับ Validation)
   */
  constructor(
    message = "เกิดข้อผิดพลาดในการเชื่อมต่อ",
    code = "API_ERROR",
    statusCode = 500,
    errors = null
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.errors = errors;
  }

  get isTokenExpired() {
    return this.code === "TOKEN_EXPIRED";
  }

  get isTokenInvalid() {
    return this.code === "TOKEN_INVALID" || this.code === "TOKEN_EXPIRED";
  }

  get isUserExists() {
    return this.code === "USER_ALREADY_EXISTS";
  }

  get isIdCardExists() {
    return this.code === "IDCARD_ALREADY_EXISTS";
  }

  get isValidationError() {
    return this.code === "VALIDATION_ERROR";
  }
}

/**
 * แปลง Error Object ใดๆ (Fetch response, Axios, หรือ JS Error) ให้กลายเป็น ApiError
 * @param {unknown} err - Error object ใดๆ
 * @returns {ApiError}
 */
export function parseApiError(err) {
  if (err instanceof ApiError) {
    return err;
  }

  if (err && typeof err === "object") {
    const message =
      err.message ||
      err.error?.message ||
      "เกิดข้อผิดพลาดในการทำรายการ กรุณาลองใหม่อีกครั้ง";
    const code = err.code || (err.statusCode === 401 ? "TOKEN_INVALID" : "API_ERROR");
    const statusCode = err.statusCode || 500;
    const errors = err.errors || null;

    return new ApiError(message, code, statusCode, errors);
  }

  return new ApiError(String(err || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ"));
}

export default ApiError;
