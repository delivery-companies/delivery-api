"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPdfToSpaces = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("../config");
const s3 = new client_s3_1.S3Client({
    region: config_1.env.DO_SPACES_REGION,
    endpoint: config_1.env.DO_SPACES_ENDPOINT,
    credentials: {
        accessKeyId: config_1.env.DO_SPACES_KEY,
        secretAccessKey: config_1.env.DO_SPACES_SECRET,
    },
});
const uploadPdfToSpaces = async (pdfBuffer, reportId) => {
    const key = `reports/report-${reportId}-${Date.now()}.pdf`;
    await s3.send(new client_s3_1.PutObjectCommand({
        Bucket: config_1.env.DO_SPACES_BUCKET_NAME,
        Key: key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
        ACL: "public-read",
    }));
    // Public URL
    const url = `${config_1.env.DO_SPACES_ENDPOINT}/${config_1.env.DO_SPACES_BUCKET_NAME}/${key}`;
    return url;
};
exports.uploadPdfToSpaces = uploadPdfToSpaces;
//# sourceMappingURL=uploadPdfToSpaces.js.map