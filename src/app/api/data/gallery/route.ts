import { NextRequest, NextResponse } from 'next/server';

// GET /api/data/gallery?invitation_id=xxx — list gallery images for an invitation
export async function GET(req: NextRequest) {
  const invitationId = req.nextUrl.searchParams.get('invitation_id');
  if (!invitationId) return NextResponse.json([]);

  try {
    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');

    const { data, error } = await sb.from('gallery').select('*').eq('invitation_id', invitationId).order('sort_order', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (e: any) {
    console.error('GET gallery error:', e.message);
    // No local fallback for gallery — return empty
    return NextResponse.json([]);
  }
}

// POST /api/data/gallery — add a gallery image
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.invitation_id || !body.public_url) {
      return NextResponse.json({ error: 'invitation_id and public_url required' }, { status: 400 });
    }

    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');

    const { data, error } = await sb.from('gallery').insert({
      invitation_id: body.invitation_id,
      role: body.role || 'gallery',
      public_url: body.public_url,
      alt_text: body.alt_text || '',
      sort_order: body.sort_order || 0,
    }).select().single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    console.error('POST gallery error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/data/gallery — update a gallery image (role, sort_order, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');

    const updates: any = {};
    if (body.role) updates.role = body.role;
    if (body.alt_text !== undefined) updates.alt_text = body.alt_text;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
    if (body.public_url) updates.public_url = body.public_url;

    const { data, error } = await sb.from('gallery').update(updates).eq('id', body.id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('PATCH gallery error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/data/gallery?id=xxx — delete a gallery image
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    const { getSupabase } = await import('@/lib/supabase/client');
    const sb = getSupabase();
    if (!sb) throw new Error('No Supabase');

    const { error } = await sb.from('gallery').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('DELETE gallery error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}