import { NextRequest, NextResponse } from 'next/server';
import { getPendingRsvpGuests } from '@/lib/wo-store';

export async function GET(req: NextRequest) {
  const invId = req.nextUrl.searchParams.get('invitation_id') || 'inv-001';
  const pending = getPendingRsvpGuests(invId);
  const messages = pending.map((g: any) => ({
    guest_name: g.guest_name,
    phone: g.phone,
    message: `Halo ${g.guest_name}, kami mengingatkan untuk konfirmasi kehadiran di acara pernikahan kami. Mohon balas ya. Terima kasih! 🙏`,
    waLink: `https://wa.me/${g.phone?.replace(/^0/, '62')}?text=${encodeURIComponent(`Halo ${g.guest_name}, kami mengingatkan untuk konfirmasi kehadiran di acara pernikahan kami. Mohon balas ya. Terima kasih! 🙏`)}`,
  }));
  return NextResponse.json({ total: pending.length, messages });
}
