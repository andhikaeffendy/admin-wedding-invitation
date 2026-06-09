import { NextRequest, NextResponse } from 'next/server';
import { getSeatingTables, assignGuestTable } from '@/lib/wo-store';

export async function GET(req: NextRequest) {
  const invId = req.nextUrl.searchParams.get('invitation_id') || 'inv-001';
  return NextResponse.json(getSeatingTables(invId));
}

export async function PUT(req: NextRequest) {
  const { guestId, tableName, tableNumber } = await req.json();
  const guest = assignGuestTable(guestId, tableName, tableNumber);
  if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(guest);
}
