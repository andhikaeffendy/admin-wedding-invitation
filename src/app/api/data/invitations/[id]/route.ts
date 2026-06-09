import { NextRequest, NextResponse } from 'next/server';
import { getInvitationById, updateInvitation } from '@/lib/shared-store';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = getInvitationById(id);
  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(inv);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const inv = updateInvitation(id, body);
  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(inv);
}
