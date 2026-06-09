import { NextRequest, NextResponse } from 'next/server';
import { getTimeline, updateTimeline } from '@/lib/wo-store';

export async function GET(req: NextRequest) {
  const invId = req.nextUrl.searchParams.get('invitation_id') || 'inv-001';
  return NextResponse.json(getTimeline(invId));
}
export async function PUT(req: NextRequest) {
  const { invitation_id, items } = await req.json();
  return NextResponse.json(updateTimeline(invitation_id || 'inv-001', items));
}
