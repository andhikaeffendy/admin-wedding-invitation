import { NextRequest, NextResponse } from 'next/server';
import { getBudget, updateBudget } from '@/lib/wo-store';

export async function GET(req: NextRequest) {
  const invId = req.nextUrl.searchParams.get('invitation_id') || 'inv-001';
  return NextResponse.json(getBudget(invId));
}
export async function PUT(req: NextRequest) {
  const { invitation_id, ...data } = await req.json();
  return NextResponse.json(updateBudget(invitation_id || 'inv-001', data));
}
