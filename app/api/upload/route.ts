import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToS3, generatePresignedUploadUrl } from '@/lib/s3';

// ── POST /api/upload ───────────────────────────────────
// Accepts multipart form data with an "image" file field
// Returns: { url, key } — CloudFront URL + S3 key
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const folder = (formData.get('folder') as string) || 'blogs';

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { url, key } = await uploadToS3(buffer, file.name, file.type, folder);

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      data: { url, key },
    });
  } catch (error: any) {
    console.error('[UPLOAD ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

// ── GET /api/upload?fileName=...&mimeType=... ──────────
// Returns a pre-signed URL for direct browser-to-S3 upload
// This avoids large files routing through the Next.js server
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');
    const mimeType = searchParams.get('mimeType');
    const folder = searchParams.get('folder') || 'blogs';

    if (!fileName || !mimeType) {
      return NextResponse.json(
        { success: false, message: 'fileName and mimeType are required' },
        { status: 400 }
      );
    }

    const { presignedUrl, key, publicUrl } = await generatePresignedUploadUrl(
      fileName,
      mimeType,
      folder
    );

    return NextResponse.json({
      success: true,
      data: { presignedUrl, key, publicUrl },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
