import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const invId = req.nextUrl.searchParams.get('invitation_id') || 'inv-001';
  try {
    const { getSeatingTables } = await import('@/lib/prisma/db');
    return NextResponse.json(await getSeatingTables(invId));
  } catch {
    const { getSeatingTables: f } = await import('@/lib/wo-store');
    return NextResponse.json(f(invId));
  }
}
