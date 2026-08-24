import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();
    const { waTemplate, title, slug, status } = body;

    // Build the update data dynamically — only update fields that were sent
    const updateData: Record<string, any> = {};
    if (waTemplate !== undefined) updateData.waTemplate = waTemplate;
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // If slug is being changed, validate it
    if (slug !== undefined) {
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
      }

      // Check for duplicate slug (exclude current invitation)
      const existing = await prisma.invitation.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'Slug already in use by another invitation' }, { status: 409 });
      }
    }

    const invitation = await prisma.invitation.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, invitation });
  } catch (error: any) {
    console.error('Update invitation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
