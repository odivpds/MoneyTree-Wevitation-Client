import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, attendance } = await req.json();

    if (!name || !attendance) {
      return NextResponse.json({ success: false, error: 'Nama dan status kehadiran wajib diisi' }, { status: 400 });
    }

    // Pastikan invitation ada
    const invitation = await prisma.invitation.findUnique({
      where: { id }
    });

    if (!invitation) {
      return NextResponse.json({ success: false, error: 'Undangan tidak ditemukan' }, { status: 404 });
    }

    const rsvp = await prisma.rsvp.create({
      data: {
        name: name.slice(0, 100),
        attendance: attendance.slice(0, 20),
        invitationId: id
      }
    });

    return NextResponse.json({ success: true, rsvp });
  } catch (error) {
    console.error("Error creating RSVP:", error);
    return NextResponse.json({ success: false, error: 'Gagal mengirim RSVP' }, { status: 500 });
  }
}
