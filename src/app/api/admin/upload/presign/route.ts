import { NextResponse } from 'next/server';
import { s3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import mime from 'mime-types';

export async function POST(request: Request) {
  try {
    const { slug, files } = await request.json();

    if (!slug || !files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Missing slug or files array' }, { status: 400 });
    }

    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json({ error: 'Storage configuration is missing.' }, { status: 500 });
    }

    const presignedUrls = [];

    for (const file of files) {
      const { name, type } = file;
      const key = `${slug}/${name}`;
      const contentType = mime.lookup(name) || type || 'application/octet-stream';

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      presignedUrls.push({
        name,
        url,
        key,
        contentType,
      });
    }

    return NextResponse.json({ presignedUrls });
  } catch (err: any) {
    console.error("Presign error:", err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
