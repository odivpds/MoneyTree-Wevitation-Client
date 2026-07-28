import { NextResponse } from 'next/server';
import { TEMPLATES } from '@/config/templates';

export async function GET() {
  try {
    // Mencoba mengambil data dari CMS
    const res = await fetch('http://localhost:3001/api/templates', {
      cache: 'no-store' // Agar selalu mendapat data terbaru
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.warn('Gagal mengambil data template dari CMS, menggunakan fallback lokal', error);
  }

  // Jika CMS mati atau gagal, gunakan data lokal sebagai fallback
  return NextResponse.json(TEMPLATES);
}
