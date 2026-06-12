import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');
    const { data: invs } = await sb.from('invitations').select('id').limit(1);
    const invId = invs?.[0]?.id;
    if (!invId) throw new Error('No invitation');
    const { data } = await sb.from('vendors').select('*').eq('invitation_id', invId);
    return NextResponse.json(data || []);
  } catch {
    const { getVendors: f } = await import('@/lib/wo-store');
    return NextResponse.json(f('inv-001'));
  }
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');
    const { data: invs } = await sb.from('invitations').select('id').limit(1);
    const { data } = await sb.from('vendors').insert({ invitation_id: (invs?.[0]?.id || 'inv-001'), ...body }).select().single();
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('POST vendor error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
