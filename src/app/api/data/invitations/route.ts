import { NextRequest, NextResponse } from 'next/server';
import { getInvitations, createInvitation } from '@/lib/shared-store';

export async function GET() {
  return NextResponse.json(getInvitations());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inv = createInvitation(body);
    return NextResponse.json(inv, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
