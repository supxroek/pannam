/**
 * Centralized Application Error Class
 * ห่อหุ้ม Error สำหรับส่งกลับผ่าน Express Error Middleware ในรูปแบบมาตรฐานเดียวกันทั้งระบบ
 */
export class AppError extends Error {
  /**
   * @param {string} message - ข้อความอธิบายข้อผิดพลาด
   * @param {number} statusCode - รหัสสถานะ HTTP (เช่น 400, 401, 404, 409, 500)
   * @param {string} code - Error Code อ้างอิง (เช่น VALIDATION_ERROR, TOKEN_EXPIRED)
   * @param {Object|null} errors - รายละเอียดความผิดพลาดรายฟิลด์ (สำหรับ Validation)
   */
  constructor(message, statusCode = 500, code = "INTERNAL_SERVER_ERROR", errors = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  // --- Static Factory Methods สำหรับเรียกใช้งานได้สะดวกรวดเร็ว ---

  /**
   * 400 Bad Request
   */
  static badRequest(message = "คำขอไม่ถูกต้อง", errors = null, code = "BAD_REQUEST") {
    return new AppError(message, 400, code, errors);
  }

  /**
   * 400 Validation Error (สำหรับ Zod หรือ Form Validation)
   */
  static validation(errors, message = "ข้อมูลที่ส่งมาไม่ถูกต้อง") {
    return new AppError(message, 400, "VALIDATION_ERROR", errors);
  }

  /**
   * 401 Unauthorized
   */
  static unauthorized(message = "ไม่ได้รับอนุญาตให้เข้าถึง", code = "UNAUTHORIZED") {
    return new AppError(message, 401, code);
  }

  /**
   * 401 Token Expired (LINE LIFF ID Token หมดอายุ)
   */
  static tokenExpired(message = "เซสชัน LINE ID Token หมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง") {
    return new AppError(message, 401, "TOKEN_EXPIRED");
  }

  /**
   * 401 Token Invalid / Missing (LINE LIFF ID Token ผิดพลาดหรือไม่พบ)
   */
  static tokenInvalid(message = "ไม่พบ LINE ID Token หรือโทเค็นไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่") {
    return new AppError(message, 401, "TOKEN_INVALID");
  }

  /**
   * 403 Forbidden
   */
  static forbidden(message = "ไม่มีสิทธิ์ในการทำรายการนี้", code = "FORBIDDEN") {
    return new AppError(message, 403, code);
  }

  /**
   * 404 Not Found
   */
  static notFound(message = "ไม่พบข้อมูลที่ร้องขอ", code = "NOT_FOUND") {
    return new AppError(message, 404, code);
  }

  /**
   * 409 Conflict (เช่น ข้อมูลซ้ำในระบบ)
   */
  static conflict(message = "ข้อมูลนี้มีอยู่ในระบบแล้ว", code = "CONFLICT") {
    return new AppError(message, 409, code);
  }

  /**
   * 409 Conflict: บัญชี LINE ซ้ำ
   */
  static userAlreadyExists(message = "บัญชี LINE นี้ได้ทำการลงทะเบียนในระบบแล้ว") {
    return new AppError(message, 409, "USER_ALREADY_EXISTS");
  }

  /**
   * 409 Conflict: บัตรประชาชนซ้ำ
   */
  static idCardAlreadyExists(message = "เลขประจำตัวประชาชนนี้ถูกลงทะเบียนในระบบแล้ว") {
    return new AppError(message, 409, "IDCARD_ALREADY_EXISTS");
  }

  /**
   * 500 Internal Server Error
   */
  static internal(message = "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง", code = "INTERNAL_SERVER_ERROR") {
    const error = new AppError(message, 500, code);
    error.isOperational = false;
    return error;
  }
}

export default AppError;
