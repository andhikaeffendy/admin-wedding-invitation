import { NextRequest, NextResponse } from 'next/server';
import { getGuests, addGuest } from '@/lib/shared-store';

export async function GET(req: NextRequest) {
  const invitationId = req.nextUrl.searchParams.get('invitation_id') || undefined;
  return NextResponse.json(getGuests(invitationId));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.invitation_id || !body.guest_name) {
      return NextResponse.json({ error: 'invitation_id and guest_name required' }, { status: 400 });
    }
    const guest = addGuest(body.invitation_id, body);
    return NextResponse.json(guest, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
