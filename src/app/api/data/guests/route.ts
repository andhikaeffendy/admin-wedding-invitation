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
    const { addGuest } = await import('@/lib/prisma/db');
    const guest = await addGuest(body.invitation_id, body);
    return NextResponse.json(guest, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
