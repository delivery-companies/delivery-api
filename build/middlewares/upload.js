"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const config_1 = require("../config");
const AppError_1 = require("../lib/AppError");
const path = require("path");
exports.upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: new client_s3_1.S3Client({
            region: config_1.env.DO_SPACES_REGION,
            endpoint: config_1.env.DO_SPACES_ENDPOINT,
            credentials: {
                accessKeyId: config_1.env.DO_SPACES_KEY,
                secretAccessKey: config_1.env.DO_SPACES_SECRET
            }
        }),
        bucket: config_1.env.DO_SPACES_BUCKET_NAME,
        acl: "public-read",
        contentType(_req, file, callback) {
            callback(null, file.mimetype);
        },
        key: (_request, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `uploads/${file.fieldname}s/${file.fieldname}-${uniqueSuffix}.${file.mimetype.split("/")[1]}`);
        }
    }),
    // multer.diskStorage({
    //     destination: "uploads/images",
    //     filename: (_req, file, cb) => {
    //         const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    //         cb(null, `${file.fieldname}-${uniqueSuffix}.${file.mimetype.split("/")[1]}`);
    //     }
    // }),
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = [".jpeg", ".jpg", ".png"];
        console.log(file);
        if (!allowedTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
            const error = new AppError_1.AppError("نوع الملف غير مدعوم", 400);
            return cb(error);
        }
        cb(null, true);
    }
});
//# sourceMappingURL=upload.js.map