import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import {env} from "../config";

const s3 = new S3Client({
  region: env.DO_SPACES_REGION,
  endpoint: env.DO_SPACES_ENDPOINT,
  credentials: {
    accessKeyId: env.DO_SPACES_KEY,
    secretAccessKey: env.DO_SPACES_SECRET,
  },
});

export const uploadPdfToSpaces = async (
  pdfBuffer: Buffer,
  reportId: number
) => {
  const key = `reports/report-${reportId}-${Date.now()}.pdf`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.DO_SPACES_BUCKET_NAME,
      Key: key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
      ACL: "public-read",
    })
  );

  // Public URL
  const url = `${env.DO_SPACES_ENDPOINT}/${env.DO_SPACES_BUCKET_NAME}/${key}`;

  return url;
};
