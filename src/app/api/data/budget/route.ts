import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');
    const { data: invs } = await sb.from('invitations').select('id').limit(1);
    const invId = invs?.[0]?.id;
    if (!invId) throw new Error('No invitation');
    const { data } = await sb.from('budget_categories').select('*').eq('invitation_id', invId);
    const total = (data || []).reduce((s: number, c: any) => s + Number(c.budget), 0);
    return NextResponse.json({ total, categories: data || [] });
  } catch {
    const { getBudget: f } = await import('@/lib/wo-store');
    return NextResponse.json(f('inv-001'));
  }
}
