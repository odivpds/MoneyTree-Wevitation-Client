import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Token sesi tidak diberikan." },
        { status: 400 }
      );
    }

    // Delete session from database
    await prisma.session.delete({
      where: { sessionToken },
    });

    return NextResponse.json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Logout error:", error);
    // Even if it fails (e.g. session already deleted), return success to client
    return NextResponse.json({ message: "Logout diproses" });
  }
}
