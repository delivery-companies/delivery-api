"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const config_1 = require("../config");
const AppError_1 = require("../lib/AppError");
const logger_1 = require("../lib/logger");
const handlePrismaError = (err) => {
    logger_1.Logger.error(err.meta);
    const errMeta = err.meta;
    const errTarget = errMeta?.target;
    // const errCause = errMeta?.cause;
    switch (err.code) {
        case "P2002": {
            // handling duplicate key errors
            if (errTarget && Array.isArray(errTarget)) {
                if (errTarget.includes("phone")) {
                    return new AppError_1.AppError("رقم الهاتف موجود مسبقاً", 400);
                }
                if (errTarget.includes("username")) {
                    return new AppError_1.AppError("رقم الهاتف موجود مسبقاً", 400);
                }
                const errTargetString = errTarget.join(", ");
                return new AppError_1.AppError(`القيمة في حقول (${errTargetString}) موجودة مسبقاً`, 400);
            }
            if (errTarget && typeof errTarget === "string") {
                if (errTarget === "phone") {
                    return new AppError_1.AppError("رقم الهاتف موجود مسبقاً", 400);
                }
                if (errTarget === "username") {
                    return new AppError_1.AppError("رقم الهاتف موجود مسبقاً", 400);
                }
                return new AppError_1.AppError(`القيمة في حقل (${errTarget}) موجودة مسبقاً`, 400);
            }
            return new AppError_1.AppError("تم إدخال قيمة موجودة مسبقاً", 400);
        }
        // case "P2025": {
        //     // handling foreign key constraint errors
        //     if (errCause && Array.isArray(errCause)) {
        //         const errCauseString = errCause.join(", ");
        //         return new AppError(`${errCauseString})`, 400);
        //     }
        //     if (errCause && typeof errCause === "string") {
        //         return new AppError(`${errCause})`, 400);
        //     }
        //     return new AppError(`حدث خطأ ما بقاعدة البيانات [رمز الخطأ: ${err.code}]`, 500);
        // }
        // case "P2014": {
        //     // handling invalid id errors
        //     if (errTarget && Array.isArray(errTarget)) {
        //         const errTargetString = errTarget.join(", ");
        //         return new AppError(`الرجاء التأكد من صحة القيمة المدخلة في حقول (${errTargetString})`, 400);
        //     }
        //     if (errTarget && typeof errTarget === "string") {
        //         return new AppError(`الرجاء التأكد من صحة القيمة المدخلة في حقل (${errTarget})`, 400);
        //     }
        //     return new AppError("الرجاء التأكد من صحة القيمة المدخلة", 400);
        // }
        // case "P2003": {
        //     // handling invalid data errors
        //     if (errTarget && Array.isArray(errTarget)) {
        //         const errTargetString = errTarget.join(", ");
        //         return new AppError(
        //             `الرجاء التأكد من صحة البيانات المدخلة في حقول (${errTargetString})`,
        //             400
        //         );
        //     }
        //     if (errTarget && typeof errTarget === "string") {
        //         return new AppError(`الرجاء التأكد من صحة البيانات المدخلة في حقل (${errTarget})`, 400);
        //     }
        //     return new AppError("الرجاء التأكد من صحة البيانات المدخلة", 400);
        // }
        default: {
            // handling all other errors
            return new AppError_1.AppError(`حدث خطأ ما بقاعدة البيانات [رمز الخطأ: ${err.code || "غير معروف"}]`, 500);
        }
    }
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleJWTError = (_err) => {
    // const message = err.message;
    const message = "الرجاء تسجيل الدخول مرة أخرى";
    return new AppError_1.AppError(message, 401);
};
const handleZODError = (err) => {
    // const message = `${err.issues[0].path[0]}: ${err.issues[0].message}`;
    const message = `الرجاء التأكد من صحة البيانات المدخلة في حقل (${err.issues[0].path[0]})`;
    return new AppError_1.AppError(message, 400);
};
const handleMulterError = (err) => {
    if (err.message === "File too large") {
        return new AppError_1.AppError("حجم الملف اكبر من 5 ميجابايت", 400);
    }
    if (err.message === "Unexpected field") {
        return new AppError_1.AppError("حدث خطأ ما", 400);
    }
    if (err.message === "File too small") {
        return new AppError_1.AppError("حجم الملف صغير جداً", 400);
    }
    if (err.message === "Too many files") {
        return new AppError_1.AppError("عدد الملفات كبير جداً", 400);
    }
    if (err.message === "Unexpected file") {
        return new AppError_1.AppError("حدث خطأ ما", 400);
    }
    if (err.message === "Wrong file type") {
        return new AppError_1.AppError("نوع الملف غير مدعوم", 400);
    }
    return new AppError_1.AppError(err.message, 400);
};
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
        // Programming or other unknown error: don't leak error details
    }
    else {
        // 1) Log error
        // console.error("ERROR 💥", err);
        // 2) Send generic message
        res.status(500).json({
            status: "error",
            message: "حدث خطأ ما!"
        });
    }
};
exports.default = (err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
_next) => {
    // console.log(err.stack);
    // console.log(err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (config_1.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    }
    else if (config_1.env.NODE_ENV === "production") {
        let error = { ...err };
        // console.log(error);
        if (err.name === "JsonWebTokenError") {
            error = handleJWTError(err);
        }
        if (err.name === "ZodError") {
            error = handleZODError(err);
        }
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError ||
            err instanceof client_1.Prisma.PrismaClientUnknownRequestError ||
            err instanceof client_1.Prisma.PrismaClientValidationError ||
            err instanceof client_1.Prisma.PrismaClientInitializationError ||
            err instanceof client_1.Prisma.PrismaClientRustPanicError) {
            error = handlePrismaError(err);
        }
        if (err.name === "MulterError") {
            error = handleMulterError(err);
        }
        sendErrorProd(error, res);
    }
    logger_1.Logger.error(err.message, { stack: err.stack });
};
//# sourceMappingURL=globalErrorHandler.js.map