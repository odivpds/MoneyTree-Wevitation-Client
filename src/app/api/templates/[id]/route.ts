import { NextRequest, NextResponse } from 'next/server';
import { TEMPLATES } from '@/config/templates';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: templateId } = await params;
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
