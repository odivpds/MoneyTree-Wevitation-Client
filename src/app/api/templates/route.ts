import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    });
    
    // Convert to the shape the wedding app expects
    const formattedTemplates = templates.map((t: any) => ({
      id: t.slug,
      name: t.name,
      type: t.type === 'html' ? 'html-js' : t.type,
      category: t.category?.name || 'Basic',
      desc: t.desc || '',
      price: t.price || 'Rp 0',
      image: (t.image || '/images/templates/agung.png').replace("http://localhost:3001", ""),
      htmlContent: t.htmlContent,
      cssContent: t.cssContent,
      jsContent: t.jsContent
    }));
    return NextResponse.json(formattedTemplates);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json([], { status: 500 });
  }
}
