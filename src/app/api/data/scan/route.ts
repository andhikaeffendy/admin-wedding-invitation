import { NextRequest, NextResponse } from 'next/server';
import { processScan } from '@/lib/shared-store';

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ status: 'INVALID_QR', message: 'Token required' }, { status: 400 });
  const result = processScan(token);
  return NextResponse.json(result);
}
