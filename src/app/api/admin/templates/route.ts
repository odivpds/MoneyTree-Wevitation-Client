import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming this exists based on common Next.js patterns

export async function GET(request: Request) {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Convert to the shape the wedding app expects
    const formattedTemplates = templates.map((t: any) => ({
      id: t.slug, // mapping slug to id
      name: t.name,
      type: t.type,
      category: t.category,
      desc: t.desc || '',
      price: t.price || 'Rp 0',
      image: t.image || '/images/templates/agung.png', // Fallback
      htmlContent: t.htmlContent,
      cssContent: t.cssContent,
      jsContent: t.jsContent
    }));

    return NextResponse.json(formattedTemplates, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
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
