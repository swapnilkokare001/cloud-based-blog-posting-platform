/**
 * AWS S3 Upload Utility
 * Handles image uploads to S3 and generates CloudFront CDN URLs
 */
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || '';

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload image buffer to AWS S3
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = 'blogs'
): Promise<{ url: string; key: string }> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`);
  }

  // Validate file size
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5MB limit');
  }

  // Generate unique key: folder/uuid-original-name
  const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const uniqueKey = `${folder}/${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uniqueKey,
    Body: fileBuffer,
    ContentType: mimeType,
    Metadata: {
      originalName: fileName,
      uploadedAt: new Date().toISOString(),
    },
    CacheControl: 'max-age=31536000', // 1 year cache
  });

  await s3Client.send(command);

  // Generate URL: prefer CloudFront CDN, fallback to S3 direct
  const url = CLOUDFRONT_URL
    ? `${CLOUDFRONT_URL}/${uniqueKey}`
    : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

  return { url, key: uniqueKey };
}

/**
 * Delete image from S3 by key
 */
export async function deleteFromS3(key: string): Promise<void> {
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
  console.log(`🗑️ Deleted S3 object: ${key}`);
}

/**
 * Generate a pre-signed URL for direct browser upload
 * This avoids routing large files through the server
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  mimeType: string,
  folder: string = 'blogs'
): Promise<{ presignedUrl: string; key: string; publicUrl: string }> {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error('Invalid file type');
  }

  const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `${folder}/${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  // Pre-signed URL expires in 5 minutes
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  const publicUrl = CLOUDFRONT_URL
    ? `${CLOUDFRONT_URL}/${key}`
    : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { presignedUrl, key, publicUrl };
}

/**
 * Generate a CloudFront CDN URL from an S3 key
 */
export function getCDNUrl(key: string): string {
  if (!key) return '/images/placeholder.jpg';
  if (key.startsWith('http')) return key; // Already a full URL
  return CLOUDFRONT_URL
    ? `${CLOUDFRONT_URL}/${key}`
    : `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
}

/**
 * Convert base64 data URL to Buffer for S3 upload
 */
export function base64ToBuffer(base64DataUrl: string): { buffer: Buffer; mimeType: string } {
  const matches = base64DataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 data URL');
  }
  return {
    mimeType: matches[1],
    buffer: Buffer.from(matches[2], 'base64'),
  };
}
