import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const guests = await prisma.guest.findMany({
      where: { invitationId: params.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(guests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { names } = await request.json(); // expect { names: string[] }

    if (!Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ error: 'Names array is required' }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: params.id },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const data = names.map((item: any) => {
      // support both string or object {name, phone}
      if (typeof item === 'string') {
        return { name: item.trim(), invitationId: params.id };
      }
      return {
        name: item.name?.trim(),
        phone: item.phone?.trim() || null,
        invitationId: params.id,
      };
    }).filter((guest: any) => guest.name && guest.name.length > 0);

    if (data.length === 0) {
      return NextResponse.json({ error: 'No valid names provided' }, { status: 400 });
    }

    await prisma.guest.createMany({
      data,
    });

    // Fetch the newly added guests (or all guests)
    const updatedGuests = await prisma.guest.findMany({
      where: { invitationId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, guests: updatedGuests });
  } catch (error: any) {
    console.error('Add guests error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');

    if (!guestId) {
      return NextResponse.json({ error: 'guestId is required' }, { status: 400 });
    }

    await prisma.guest.deleteMany({
      where: { 
        id: guestId,
        invitationId: params.id
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete guest error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
