import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const template = await prisma.template.findUnique({
      where: { slug }
    });
    
    if (!template) {
      return NextResponse.json({ error: "Template tidak ditemukan" }, { status: 404 });
    }

    const formattedTemplate = {
      id: template.slug,
      name: template.name,
      type: template.type,
      category: template.category,
      desc: template.desc || '',
      price: template.price || 'Rp 0',
      image: template.image || '/images/templates/agung.png',
      htmlContent: template.htmlContent,
      cssContent: template.cssContent,
      jsContent: template.jsContent
    };

    return NextResponse.json(formattedTemplate, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json({ error: "Gagal mengambil template" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
