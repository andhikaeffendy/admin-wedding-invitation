import { NextRequest, NextResponse } from 'next/server';

// GET /api/data/love-stories?invitation_id=xxx
export async function GET(req: NextRequest) {
  const invitationId = req.nextUrl.searchParams.get('invitation_id');
  if (!invitationId) return NextResponse.json([]);

  try {
    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');

    const { data, error } = await sb.from('love_stories').select('*').eq('invitation_id', invitationId).order('sort_order', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (e: any) {
    console.error('GET love-stories error:', e.message);
    return NextResponse.json([]);
  }
}

// POST /api/data/love-stories — add a love story
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.invitation_id) {
      return NextResponse.json({ error: 'invitation_id required' }, { status: 400 });
    }

    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');

    const { data, error } = await sb.from('love_stories').insert({
      invitation_id: body.invitation_id,
      title: body.title || '',
      description: body.description || '',
      date: body.date || '',
      icon: body.icon || '♡',
      is_visible: body.is_visible !== undefined ? body.is_visible : true,
      sort_order: body.sort_order || 0,
    }).select().single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    console.error('POST love-stories error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/data/love-stories — update a love story
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');

    const updates: any = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.date !== undefined) updates.date = body.date;
    if (body.icon !== undefined) updates.icon = body.icon;
    if (body.is_visible !== undefined) updates.is_visible = body.is_visible;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

    const { data, error } = await sb.from('love_stories').update(updates).eq('id', body.id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('PATCH love-stories error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/data/love-stories?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');

    const { error } = await sb.from('love_stories').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('DELETE love-stories error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}