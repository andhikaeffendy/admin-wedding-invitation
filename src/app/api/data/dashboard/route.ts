import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not configured');

    const { data: invitations } = await sb.from('invitations').select('*').order('created_at', { ascending: false });
    const { data: guests } = await sb.from('guests').select('*');
    if (!guests) throw new Error('No guests');

    return NextResponse.json({
      totalInvitations: invitations?.length || 0,
      totalGuests: guests.length,
      totalRsvpYes: guests.filter((g: any) => g.rsvp_status === 'Hadir').length,
      totalCheckedIn: guests.filter((g: any) => g.is_checked_in).length,
      totalSouvenir: guests.filter((g: any) => g.is_souvenir_claimed).length,
      totalPax: guests.reduce((s: number, g: any) => s + (g.pax_allocated || 1), 0),
      paxCheckedIn: guests.filter((g: any) => g.is_checked_in).reduce((s: number, g: any) => s + (g.pax_allocated || 1), 0),
      progressPercent: Math.round((guests.filter((g: any) => g.rsvp_status === 'Hadir').length / Math.max(1, guests.length)) * 100),
    });
  } catch {
    const { getDashboardStats } = await import('@/lib/shared-store');
    return NextResponse.json(getDashboardStats());
  }
}
