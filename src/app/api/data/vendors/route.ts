import { NextRequest, NextResponse } from 'next/server';
import { getVendors, addVendor, updateVendor } from '@/lib/wo-store';

export async function GET(req: NextRequest) {
  const invId = req.nextUrl.searchParams.get('invitation_id') || 'inv-001';
  return NextResponse.json(getVendors(invId));
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json(addVendor(body.invitation_id || 'inv-001', body));
}
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json(updateVendor(body.id, body));
}
