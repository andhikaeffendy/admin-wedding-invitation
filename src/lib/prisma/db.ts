// Database service using Supabase JS client (HTTPS) instead of Prisma direct connection
// This works reliably on Vercel serverless because it uses HTTPS (port 443)
import { supabase } from '../supabase/client';

async function sb() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

// ==================== INVITATIONS ====================
export async function getInvitations() {
  const { data } = await (await sb()).from('invitations').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function getInvitationBySlug(slug: string) {
  const { data } = await (await sb()).from('invitations').select('*').eq('slug', slug).single();
  return data || null;
}

export async function getInvitationById(id: string) {
  const { data } = await (await sb()).from('invitations').select('*').eq('id', id).single();
  return data || null;
}

export async function createInvitation(data: any) {
  const { data: result, error } = await (await sb()).from('invitations').insert({
    title: data.title,
    slug: data.slug,
    status: data.status || 'draft',
    bride_name: data.bride_name || null,
    groom_name: data.groom_name || null,
    event_date: data.event_date || null,
    theme: data.theme || { id: 'modern-organic-luxury', primaryColor: '#22382D', secondaryColor: '#6F7F55', accentColor: '#A9B89B', bgColor: '#F7F1E6', textColor: '#22382D', goldColor: '#C9A86A' },
  }).select().single();
  if (error) throw new Error(error.message);
  return result;
}

export async function updateInvitation(id: string, data: any) {
  const { data: result } = await (await sb()).from('invitations').update(data).eq('id', id).select().single();
  return result;
}

// ==================== GUESTS ====================
export async function getGuests(invitationId?: string) {
  let q = (await sb()).from('guests').select('*').order('created_at', { ascending: false });
  if (invitationId) q = q.eq('invitation_id', invitationId);
  const { data } = await q;
  return data || [];
}

export async function addGuest(invitationId: string, data: any) {
  const token = 'tok-' + Math.random().toString(36).slice(2, 12);
  const { data: result } = await (await sb()).from('guests').insert({
    invitation_id: invitationId,
    guest_name: data.guest_name,
    phone: data.phone || '',
    category: data.category || 'Umum',
    pax_allocated: data.pax_allocated || 1,
    guest_token: token,
    qr_hash: 'qr-' + Math.random().toString(36).slice(2, 12),
    invitation_given_status: 'Belum Diberikan',
    notes: data.notes || '',
  }).select().single();
  return result;
}

// ==================== SCAN ====================
export async function processScanDb(token: string) {
  const { data: guest } = await (await sb()).from('guests').select('*').eq('guest_token', token).single();
  if (!guest) return { status: 'INVALID_QR', message: 'QR tidak valid' };
  if (!guest.is_checked_in) {
    await (await sb()).from('guests').update({ is_checked_in: true }).eq('id', guest.id);
    return { status: 'SUCCESS_CHECKIN', guest_name: guest.guest_name, category: guest.category || '', pax: guest.pax_allocated, table: guest.table_name || '-', message: 'Check-in berhasil!' };
  }
  if (!guest.is_souvenir_claimed) {
    await (await sb()).from('guests').update({ is_souvenir_claimed: true }).eq('id', guest.id);
    return { status: 'SUCCESS_SOUVENIR', guest_name: guest.guest_name, category: guest.category || '', pax: guest.pax_allocated, table: guest.table_name || '-', message: 'Souvenir berhasil!' };
  }
  return { status: 'ALREADY_COMPLETED', guest_name: guest.guest_name, message: 'QR sudah digunakan 2x' };
}

// ==================== VENDORS ====================
export async function getVendors(invId: string) {
  const { data } = await (await sb()).from('vendors').select('*').eq('invitation_id', invId);
  return data || [];
}

export async function addVendor(invId: string, data: any) {
  const { data: result } = await (await sb()).from('vendors').insert({ invitation_id: invId, ...data }).select().single();
  return result;
}

// ==================== TIMELINE ====================
export async function getTimeline(invId: string) {
  const { data } = await (await sb()).from('timeline_items').select('*').eq('invitation_id', invId).order('sort_order');
  return data || [];
}

// ==================== BUDGET ====================
export async function getBudget(invId: string) {
  const { data } = await (await sb()).from('budget_categories').select('*').eq('invitation_id', invId);
  const total = (data || []).reduce((s: number, c: any) => s + Number(c.budget), 0);
  return { total, categories: data || [] };
}

// ==================== SEATING ====================
export async function getSeatingTables(invId: string) {
  const { data } = await (await sb()).from('seating_tables').select('*').eq('invitation_id', invId);
  return data || [];
}

// ==================== DASHBOARD ====================
export async function getDashboardStatsDb(invId: string = 'inv-001') {
  const guests = await getGuests(invId);
  const invs = (await getInvitations()).length;
  return {
    totalInvitations: invs,
    totalGuests: guests.length,
    totalRsvpYes: guests.filter((g: any) => g.rsvp_status === 'Hadir').length,
    totalCheckedIn: guests.filter((g: any) => g.is_checked_in).length,
    totalSouvenir: guests.filter((g: any) => g.is_souvenir_claimed).length,
    totalPax: guests.reduce((s: number, g: any) => s + (g.pax_allocated || 1), 0),
    paxCheckedIn: guests.filter((g: any) => g.is_checked_in).reduce((s: number, g: any) => s + (g.pax_allocated || 1), 0),
    progressPercent: Math.round((guests.filter((g: any) => g.rsvp_status === 'Hadir').length / Math.max(1, guests.length)) * 100),
  };
}

// ==================== WISHES ====================
export async function getWishes(invId: string) {
  const { data } = await (await sb()).from('wishes').select('*').eq('invitation_id', invId).eq('is_visible', true).order('created_at', { ascending: false });
  return data || [];
}

// ==================== EVENT REPORT ====================
export async function getEventReport(invId: string) {
  const [guests, tables, vendors, categories, wishes, inv] = await Promise.all([
    getGuests(invId),
    getSeatingTables(invId),
    getVendors(invId),
    (await sb()).from('budget_categories').select('*').eq('invitation_id', invId).then(r => r.data || []),
    getWishes(invId),
    getInvitationById(invId),
  ]);
  return {
    invitation: inv, totalGuests: guests.length,
    rsvpYes: guests.filter((g: any) => g.rsvp_status === 'Hadir').length,
    rsvpNo: guests.filter((g: any) => g.rsvp_status === 'Tidak Hadir').length,
    noResponse: guests.filter((g: any) => !g.rsvp_status).length,
    checkedIn: guests.filter((g: any) => g.is_checked_in).length,
    noShow: guests.filter((g: any) => g.rsvp_status === 'Hadir' && !g.is_checked_in).length,
    souvenirClaimed: guests.filter((g: any) => g.is_souvenir_claimed).length,
    tables, vendors, wishes,
    budget: { total: categories.reduce((s: number, c: any) => s + Number(c.budget), 0), categories },
    peakHour: '12:00 - 13:00', generatedAt: new Date().toISOString(),
  };
}

// ==================== FOLLOW-UP ====================
export async function getPendingRsvp(invId: string) {
  const { data } = await (await sb()).from('guests').select('*').eq('invitation_id', invId).is('rsvp_status', null).not('phone', 'is', null);
  return data || [];
}

// ==================== ALL CLIENTS ====================
export async function getAllClients() {
  const invs = await getInvitations();
  return Promise.all(invs.map(async (inv: any) => ({
    ...inv,
    guestCount: 0, rsvpCount: 0, checkinCount: 0, progressPercent: 0,
  })));
}
