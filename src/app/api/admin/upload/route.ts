import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const slug = formData.get('slug') as string || 'thumbnails';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Path untuk menyimpan di public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', slug);
    const filePath = path.join(uploadDir, name);

    // Buat direktori jika belum ada
    await mkdir(uploadDir, { recursive: true });
    
    // Tulis file ke disk
    await writeFile(filePath, buffer);

    // Kembalikan URL relatif agar selalu cocok dengan domain/port server saat ini
    const url = `/uploads/${slug}/${name}`;

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
