import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const invitationId = req.nextUrl.searchParams.get('invitation_id') || undefined;
  try {
    const { getGuests } = await import('@/lib/prisma/db');
    const guests = await getGuests(invitationId);
    return NextResponse.json(guests);
  } catch {
    const { getGuests: fallback } = await import('@/lib/shared-store');
    return NextResponse.json(fallback(invitationId));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.invitation_id || !body.guest_name) {
      return NextResponse.json({ error: 'invitation_id and guest_name required' }, { status: 400 });
    }
    try {
      const { addGuest } = await import('@/lib/prisma/db');
      const guest = await addGuest(body.invitation_id, body);
      if (guest) return NextResponse.json(guest, { status: 201 });
    } catch (e: any) {
      console.error('POST guest (prisma) error:', e.message);
    }
    // Fallback to shared store
    const { addGuest: fallback } = await import('@/lib/shared-store');
    const guest = fallback(body.invitation_id, body);
    return NextResponse.json(guest, { status: 201 });
  } catch (e: any) {
    console.error('POST guest error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    const { deleteGuest } = await import('@/lib/prisma/db');
    await deleteGuest(id);
    return NextResponse.json({ success: true });
  } catch {
    const { deleteGuest: fallback } = await import('@/lib/shared-store');
    const result = fallback(id);
    if (!result) return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  }
}
