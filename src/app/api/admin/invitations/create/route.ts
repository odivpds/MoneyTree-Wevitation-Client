import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { title, slug } = await request.json();

    if (!title || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' }, { status: 400 });
    }

    // Check if slug already exists in DB
    const existing = await prisma.invitation.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'URL slug already exists. Please choose a different one.' }, { status: 400 });
    }

    // Determine the base URL for the invitation
    // Since Cloudflare R2 / Custom Domain is used for serving, the URL will be cdnUrl/slug
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
    if (!cdnUrl) {
      return NextResponse.json({ error: 'Storage configuration is missing.' }, { status: 500 });
    }

    const url = `${cdnUrl.replace(/\/$/, '')}/${slug}/index.html`;

    // Save to Database
    const invitation = await prisma.invitation.create({
      data: {
        title,
        slug,
        bucketUrl: url,
      }
    });

    return NextResponse.json({ success: true, invitation });
  } catch (error: any) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ error: error.message || 'Failed to create invitation' }, { status: 500 });
  }
}
