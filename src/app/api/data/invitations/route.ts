import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getInvitations } = await import('@/lib/prisma/db');
    const invitations = await getInvitations();
    return NextResponse.json(invitations);
  } catch (e: any) {
    const { getInvitations: fallback } = await import('@/lib/shared-store');
    return NextResponse.json(fallback());
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { createInvitation } = await import('@/lib/prisma/db');
    const inv = await createInvitation(body);
    return NextResponse.json(inv, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
