import AppError from "../utils/app-error.js";

// ข้อผิดพลาดจากการแปลงประเภทข้อมูลในฐานข้อมูล
const handleCastErrorDB = (err) => {
  return AppError.badRequest(`Invalid ${err.path}: ${err.value}`);
};

// ข้อผิดพลาดจากฐานข้อมูลที่ซ้ำกัน (Prisma P2002 หรือ MongoDB 11000)
const handlePrismaConflictDB = (err) => {
  const target = err.meta?.target;
  if (target?.includes("line_user_id")) {
    return AppError.userAlreadyExists();
  }
  if (target?.includes("national_id")) {
    return AppError.idCardAlreadyExists();
  }
  if (target?.includes("village_id") && target?.includes("house_number")) {
    return AppError.conflict("บ้านเลขที่นี้มีอยู่ในหมู่บ้านดังกล่าวแล้ว");
  }
  return AppError.conflict("ข้อมูลนี้มีอยู่ในระบบแล้ว");
};

// ข้อผิดพลาดจากการตรวจสอบข้อมูลในฐานข้อมูล
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  return AppError.badRequest(`ข้อมูล input ไม่ถูกต้อง. ${errors.join(". ")}`);
};

// ข้อผิดพลาดจากโทเค็นที่ไม่ถูกต้อง
const handleJWTError = () =>
  AppError.tokenInvalid("โทเค็นไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง");

// ข้อผิดพลาดจากโทเค็นที่หมดอายุ
const handleJWTExpiredError = () =>
  AppError.tokenExpired("โทเค็นของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง");

const sendErrorDev = (err, res) => {
  console.error("ERROR 💥", err);
  if (err.originalError?.response?.data) {
    console.error(
      "LINE API Error Details:",
      JSON.stringify(err.originalError.response.data, null, 2),
    );
  }
  res.status(err.statusCode).json({
    success: false,
    code: err.code || (err.statusCode < 500 ? "CLIENT_ERROR" : "INTERNAL_SERVER_ERROR"),
    message: err.message,
    errors: err.errors || null,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  const isClientError = err.statusCode < 500 || err.isOperational || err.expose;
  if (isClientError) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code || "CLIENT_ERROR",
      message: err.message,
      errors: err.errors || null,
    });
  } else {
    console.error("ERROR 💥", err);

    res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "เกิดข้อผิดพลาดบางอย่างในระบบ กรุณาลองใหม่อีกครั้ง",
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    // ในโหมด dev ถ้าเป็น Prisma P2002 ให้แปลงเพื่อทดสอบ error code
    if (err.code === "P2002") {
      const converted = handlePrismaConflictDB(err);
      converted.stack = err.stack;
      return sendErrorDev(converted, res);
    }
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode;
    error.code = err.code;
    error.errors = err.errors;

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === "P2002" || err.code === 11000) error = handlePrismaConflictDB(err);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export default errorHandler;
