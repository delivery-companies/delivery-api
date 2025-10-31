import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import { env } from "../config";
import { AppError } from "../lib/AppError";
const path = require("path");

export const upload = multer({
    storage: multerS3({
        s3: new S3Client({
            region: env.DO_SPACES_REGION,
            endpoint: env.DO_SPACES_ENDPOINT,
            credentials: {
                accessKeyId: env.DO_SPACES_KEY,
                secretAccessKey: env.DO_SPACES_SECRET
            }
        }),
        bucket: env.DO_SPACES_BUCKET_NAME,
        acl: "public-read",
        contentType(_req, file, callback) {
            callback(null, file.mimetype);
        },
        key: (_request, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(
                null,
                `uploads/${file.fieldname}s/${file.fieldname}-${uniqueSuffix}.${file.mimetype.split("/")[1]}`
            );
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
            const error = new AppError("نوع الملف غير مدعوم", 400);
            return cb(error);
        }
        cb(null, true);
    }
});
