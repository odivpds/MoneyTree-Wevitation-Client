import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Nama, Email, dan Password wajib diisi." },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Strip password from response
    const { password: _, ...userWithoutPassword } = newUser;

    // Create session token and record
    const sessionToken = crypto.randomUUID();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours from now

    await prisma.session.create({
      data: {
        sessionToken,
        userId: newUser.id,
        expires,
      },
    });

    return NextResponse.json({
      message: "Registrasi berhasil",
      user: {
        ...userWithoutPassword,
        sessionToken,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
