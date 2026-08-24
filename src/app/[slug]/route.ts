import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  // Cek apakah slug adalah invitation yang ada di database
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
  });

  if (invitation && invitation.bucketUrl) {
    try {
      // Ambil konten HTML asli dari R2 Bucket
      const res = await fetch(invitation.bucketUrl, { cache: 'no-store' });
      if (res.ok) {
        let html = await res.text();
        
        // Inject <base> tag to fix relative CSS and JS assets pointing to CDN
        const baseUrl = invitation.bucketUrl.substring(0, invitation.bucketUrl.lastIndexOf('/') + 1);
        const baseTag = `<base href="${baseUrl}">`;
        
        if (html.toLowerCase().includes('<head>')) {
          html = html.replace(/<head>/i, `<head>\n    ${baseTag}`);
        } else {
          html = `${baseTag}\n${html}`;
        }
        
        // Kembalikan HTML secara langsung tanpa ada wrapper Next.js Layout
        return new NextResponse(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        });
      }
    } catch (e) {
      console.error("Gagal memuat template dari bucket:", e);
    }
    
    // Fallback if bucket fetch fails
    return new NextResponse('Gagal memuat undangan dari server penyimpanan.', { status: 500 });
  }

  // Jika bukan invitation, cek apakah ini adalah nama template editor
  const template = await prisma.template.findUnique({
    where: { slug },
  });

  if (template) {
     return NextResponse.redirect(new URL(`/preview?template=${slug}&pure=true`, request.url));
  }

  return new NextResponse('Halaman tidak ditemukan.', { status: 404 });
}
