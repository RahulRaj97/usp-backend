// src/services/s3Uploader.ts
import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

export const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = (folder: string, getSubPath?: (req: any) => string) =>
  multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_BUCKET_NAME || 'usp-admissions-dev',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req: any, file: any, cb: any) => {
        const subPath = getSubPath
          ? getSubPath(req)
          : req.params.id || req.user?.id || 'unknown';
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}${ext}`;
        const filePath = `${folder}/${subPath}/${filename}`;
        console.log('Uploading to S3:', filePath);
        cb(null, filePath);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  });
