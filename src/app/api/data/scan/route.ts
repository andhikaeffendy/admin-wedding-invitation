import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ status: 'INVALID_QR', message: 'Token required' }, { status: 400 });
  try {
    const { processScanDb } = await import('@/lib/prisma/db');
    const result = await processScanDb(token);
    return NextResponse.json(result);
  } catch {
    const { processScan } = await import('@/lib/shared-store');
    return NextResponse.json(processScan(token));
  }
}
