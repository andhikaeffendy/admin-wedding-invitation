import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const invId = req.nextUrl.searchParams.get('invitation_id') || 'inv-001';
  try {
    const { getVendors } = await import('@/lib/prisma/db');
    return NextResponse.json(await getVendors(invId));
  } catch {
    const { getVendors: f } = await import('@/lib/wo-store');
    return NextResponse.json(f(invId));
  }
}
export async function POST(req: NextRequest) {
  const { invitation_id, ...data } = await req.json();
  try {
    const { addVendor } = await import('@/lib/prisma/db');
    return NextResponse.json(await addVendor(invitation_id || 'inv-001', data));
  } catch {
    const { addVendor: f } = await import('@/lib/wo-store');
    return NextResponse.json(f(invitation_id || 'inv-001', data));
  }
}
