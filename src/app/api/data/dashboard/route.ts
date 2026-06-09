import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getInvitations, getDashboardStatsDb } = await import('@/lib/prisma/db');
    const invitations = await getInvitations();
    const invId = invitations[0]?.id || '';
    if (!invId) throw new Error('No invitations');
    const stats = await getDashboardStatsDb(invId);
    return NextResponse.json(stats);
  } catch {
    const { getDashboardStats } = await import('@/lib/shared-store');
    return NextResponse.json(getDashboardStats());
  }
}
