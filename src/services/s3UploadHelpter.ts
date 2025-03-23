// src/utils/s3UploadHelper.ts
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from './s3Uploader';

export const uploadFileBufferToS3 = async (
  buffer: Buffer,
  originalName: string,
  folder: string,
  subPath: string,
  mimetype: string,
) => {
  const ext = originalName.split('.').pop();
  const filename = `${Date.now()}.${ext}`;
  const key = `${folder}/${subPath}/${filename}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: 'usp-admissions-dev',
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    }),
  );
  return `https://usp-admissions-dev.s3.amazonaws.com/${key}`;
};
