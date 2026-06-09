import { NextRequest, NextResponse } from 'next/server';
import { getEventReport } from '@/lib/wo-store';

export async function GET(req: NextRequest) {
  const invId = req.nextUrl.searchParams.get('invitation_id') || 'inv-001';
  return NextResponse.json(getEventReport(invId));
}
