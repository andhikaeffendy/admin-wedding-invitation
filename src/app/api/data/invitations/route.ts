import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getInvitations } = await import('@/lib/prisma/db');
    const invitations = await getInvitations();
    return NextResponse.json(invitations);
  } catch {
    const { getInvitations: fallback } = await import('@/lib/shared-store');
    return NextResponse.json(fallback());
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Extract bank accounts before sending to DB
    const { bank_accounts, settings, ...invitationData } = body;

    // Try Prisma/Supabase first
    try {
      const { createInvitation } = await import('@/lib/prisma/db');
      const inv = await createInvitation({
        ...invitationData,
        template_id: invitationData.theme?.id || 'modern-organic-luxury',
        bride_full_name: body.bride_full_name || null,
        groom_full_name: body.groom_full_name || null,
        bride_parents: body.bride_parents || null,
        groom_parents: body.groom_parents || null,
        bride_ig: body.bride_ig || null,
        groom_ig: body.groom_ig || null,
        theme: body.theme || { id: 'modern-organic-luxury' },
        settings: settings || {},
      });

      // Store bank accounts if provided
      if (bank_accounts && Array.isArray(bank_accounts) && bank_accounts.length > 0) {
        const sb = await import('@/lib/supabase/client');
        if (sb.supabase) {
          const bankRecords = bank_accounts
            .filter((b: any) => b.account_number)
            .map((b: any) => ({
              invitation_id: inv.id,
              bank_name: b.bank_name,
              account_number: b.account_number,
              account_holder: b.account_holder,
            }));
          if (bankRecords.length > 0) {
            await sb.supabase.from('bank_accounts').insert(bankRecords);
          }
        }
      }

      return NextResponse.json(inv, { status: 201 });
    } catch (dbError) {
      // Fallback to shared store
      const { createInvitation: fallbackCreate } = await import('@/lib/shared-store');
      const inv = fallbackCreate({
        ...invitationData,
        template_id: invitationData.theme?.id || 'modern-organic-luxury',
        bride_full_name: body.bride_full_name || null,
        groom_full_name: body.groom_full_name || null,
        bride_parents: body.bride_parents || null,
        groom_parents: body.groom_parents || null,
        bride_ig: body.bride_ig || null,
        groom_ig: body.groom_ig || null,
        theme: body.theme || { id: 'modern-organic-luxury' },
        settings: settings || {},
        bank_accounts: bank_accounts || [],
      });
      return NextResponse.json(inv, { status: 201 });
    }
  } catch (e: any) {
    console.error('POST invitation error:', e.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
