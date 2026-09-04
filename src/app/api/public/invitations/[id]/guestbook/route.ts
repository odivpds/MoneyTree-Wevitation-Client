import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Pastikan invitation ada
    const invitation = await prisma.invitation.findUnique({
      where: { id }
    });

    if (!invitation) {
      return NextResponse.json({ success: false, error: 'Undangan tidak ditemukan' }, { status: 404 });
    }

    const messages = await prisma.guestbookMessage.findMany({
      where: { invitationId: id },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching guestbook:", error);
    return NextResponse.json({ success: false, error: 'Gagal memuat buku tamu' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, message } = await req.json();

    if (!name || !message) {
      return NextResponse.json({ success: false, error: 'Nama dan pesan wajib diisi' }, { status: 400 });
    }

    // Pastikan invitation ada
    const invitation = await prisma.invitation.findUnique({
      where: { id }
    });

    if (!invitation) {
      return NextResponse.json({ success: false, error: 'Undangan tidak ditemukan' }, { status: 404 });
    }

    const newMessage = await prisma.guestbookMessage.create({
      data: {
        name: name.slice(0, 100), // Mencegah payload terlalu panjang
        message: message.slice(0, 1000),
        invitationId: id
      }
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error creating guestbook entry:", error);
    return NextResponse.json({ success: false, error: 'Gagal mengirim pesan' }, { status: 500 });
  }
}
