import { NextRequest, NextResponse } from 'next/server';
import { TEMPLATES } from '@/config/templates';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: templateId } = await params;

  try {
    // Mencoba mengambil data detail template dari CMS
    const res = await fetch(`http://127.0.0.1:3001/api/templates/${templateId}`, {
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.warn(`Gagal mengambil template ${templateId} dari CMS, menggunakan fallback lokal`, error);
  }

  // FALLBACK LOKAL: Jika CMS mati atau template tidak ditemukan di CMS
  const config = TEMPLATES.find(t => t.id === templateId);

  if (!config) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  if (config.type === 'react') {
    return NextResponse.json({ type: 'react' });
  }

  try {
    const publicDir = path.join(process.cwd(), 'public');
    const templateDir = path.join(publicDir, 'templates', templateId);
    
    let htmlContent = '';
    let cssContent = '';
    let jsContent = '';

    if (fs.existsSync(path.join(templateDir, 'index.html'))) {
      htmlContent = fs.readFileSync(path.join(templateDir, 'index.html'), 'utf-8');
    }
    if (fs.existsSync(path.join(templateDir, 'style.css'))) {
      cssContent = fs.readFileSync(path.join(templateDir, 'style.css'), 'utf-8');
    }
    if (fs.existsSync(path.join(templateDir, 'script.js'))) {
      jsContent = fs.readFileSync(path.join(templateDir, 'script.js'), 'utf-8');
    }

    return NextResponse.json({
      htmlContent,
      cssContent,
      jsContent,
      type: 'html-js' // Selalu kembalikan html-js agar Visual Builder aktif
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read template files' }, { status: 500 });
  }
}
