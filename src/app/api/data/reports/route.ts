import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');
    const { data: invs } = await sb.from('invitations').select('id').limit(1);
    const invId = invs?.[0]?.id;
    if (!invId) throw new Error('No invitation');

    const [guests, tables, vendors, cats, wishes, inv] = await Promise.all([
      sb.from('guests').select('*').eq('invitation_id', invId).then(r => r.data || []),
      sb.from('seating_tables').select('*').eq('invitation_id', invId).then(r => r.data || []),
      sb.from('vendors').select('*').eq('invitation_id', invId).then(r => r.data || []),
      sb.from('budget_categories').select('*').eq('invitation_id', invId).then(r => r.data || []),
      sb.from('wishes').select('*').eq('invitation_id', invId).eq('is_visible', true).then(r => r.data || []),
      sb.from('invitations').select('*').eq('id', invId).single().then(r => r.data),
    ]);

    return NextResponse.json({
      invitation: inv, totalGuests: guests.length,
      rsvpYes: guests.filter((g: any) => g.rsvp_status === 'Hadir').length,
      rsvpNo: guests.filter((g: any) => g.rsvp_status === 'Tidak Hadir').length,
      noResponse: guests.filter((g: any) => !g.rsvp_status).length,
      checkedIn: guests.filter((g: any) => g.is_checked_in).length,
      noShow: guests.filter((g: any) => g.rsvp_status === 'Hadir' && !g.is_checked_in).length,
      souvenirClaimed: guests.filter((g: any) => g.is_souvenir_claimed).length,
      tables, vendors, wishes,
      budget: { total: cats.reduce((s: number, c: any) => s + Number(c.budget), 0), categories: cats },
      peakHour: '12:00 - 13:00', generatedAt: new Date().toISOString(),
    });
  } catch {
    const { getEventReport: f } = await import('@/lib/wo-store');
    return NextResponse.json(f('inv-001'));
  }
}
