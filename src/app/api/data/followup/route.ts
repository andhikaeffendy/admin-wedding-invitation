import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const invId = req.nextUrl.searchParams.get('invitation_id') || 'inv-001';
  try {
    const { getPendingRsvp } = await import('@/lib/prisma/db');
    const pending = await getPendingRsvp(invId);
    const messages = pending.map((g: any) => ({
      guest_name: g.guestName,
      phone: g.phone,
      waLink: `https://wa.me/${g.phone?.replace(/^0/, '62')}?text=${encodeURIComponent(`Halo ${g.guestName}, kami mengingatkan untuk konfirmasi kehadiran. Terima kasih! 🙏`)}`,
    }));
    return NextResponse.json({ total: pending.length, messages });
  } catch {
    const { getPendingRsvpGuests: f } = await import('@/lib/wo-store');
    const pending = f(invId);
    return NextResponse.json({ total: pending.length, messages: [] });
  }
}
