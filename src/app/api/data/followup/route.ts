import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');
    const { data } = await sb.from('guests').select('*').is('rsvp_status', null).not('phone', 'is', null);
    const messages = (data || []).map((g: any) => ({
      guest_name: g.guest_name,
      phone: g.phone,
      waLink: `https://wa.me/${g.phone?.replace(/^0/, '62')}?text=${encodeURIComponent(`Halo ${g.guest_name}, kami mengingatkan untuk konfirmasi kehadiran. Terima kasih! 🙏`)}`,
    }));
    return NextResponse.json({ total: messages.length, messages });
  } catch {
    return NextResponse.json({ total: 0, messages: [] });
  }
}
