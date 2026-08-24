import { NextRequest, NextResponse } from 'next/server';
import { TEMPLATES } from '@/config/templates';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: templateId } = await params;

  try {
    const template = await prisma.template.findUnique({
      where: {
        slug: templateId.toLowerCase(),
      },
    });

    if (!template) {
      // Coba cari berdasarkan id string untuk kompatibilitas ke belakang
      const templateById = await prisma.template.findUnique({
        where: {
          id: templateId,
        },
      });

      if (!templateById) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
      
      // Override type agar Visual Editor selalu aktif
      if (templateById.type === 'html') {
        templateById.type = 'html-js';
      }
      return NextResponse.json(templateById);
    }

    // Override type agar Visual Editor selalu aktif
    if (template.type === 'html') {
      template.type = 'html-js';
    }
    return NextResponse.json(template);
  } catch (error) {
    console.error(`Gagal mengambil template ${templateId} dari database`, error);
    return NextResponse.json({ error: 'Failed to read template' }, { status: 500 });
  }
}
