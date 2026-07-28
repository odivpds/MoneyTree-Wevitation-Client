import { NextResponse } from 'next/server';
import { TEMPLATES } from '@/config/templates';

export async function GET() {
  return NextResponse.json(TEMPLATES);
}
