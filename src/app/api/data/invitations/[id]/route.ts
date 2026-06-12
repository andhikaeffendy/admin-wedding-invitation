import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Try prisma/supabase first
  try {
    const { getInvitationById } = await import('@/lib/prisma/db');
    const inv = await getInvitationById(id);
    if (inv) return NextResponse.json(inv);
  } catch (e: any) {
    console.error('GET invitation (prisma) error:', e.message);
  }
  // Fallback to shared store
  try {
    const { getInvitationById: fallback } = await import('@/lib/shared-store');
    const inv = fallback(id);
    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(inv);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  try {
    const { updateInvitation } = await import('@/lib/prisma/db');
    const inv = await updateInvitation(id, body);
    return NextResponse.json(inv);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { deleteInvitation } = await import('@/lib/prisma/db');
    await deleteInvitation(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
