// Supabase Database Layer — replaces shared-store.ts for production
// All functions work with Supabase when configured, fall back to local JSON otherwise.
import crypto from 'crypto';
import { supabase, isSupabaseMode } from './client';
import { readStore, writeStore } from '../shared-store';

function genToken(): string { return 'tok-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12); }
function genHash(): string { return 'qr-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12); }

// ===== GENERIC HELPERS =====
function sb() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

// ===== INVITATIONS =====
export async function getInvitations() {
  if (!isSupabaseMode()) return readStore().invitations;
  const { data } = await sb().from('invitations').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function getInvitationBySlug(slug: string) {
  if (!isSupabaseMode()) return readStore().invitations.find((i: any) => i.slug === slug) || null;
  const { data } = await sb().from('invitations').select('*').eq('slug', slug).single();
  return data || null;
}

export async function getInvitationById(id: string) {
  if (!isSupabaseMode()) return readStore().invitations.find((i: any) => i.id === id) || null;
  const { data } = await sb().from('invitations').select('*').eq('id', id).single();
  return data || null;
}

export async function createInvitation(data: any) {
  if (!isSupabaseMode()) {
    const s = readStore();
    const inv = { id: `inv-${Date.now()}`, ...data, status: data.status || 'draft', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    s.invitations.push(inv); writeStore(s); return inv;
  }
  const { data: result } = await sb().from('invitations').insert(data).select().single();
  return result;
}

export async function updateInvitation(id: string, data: any) {
  if (!isSupabaseMode()) {
    const s = readStore();
    const idx = s.invitations.findIndex((i: any) => i.id === id);
    if (idx === -1) return null;
    s.invitations[idx] = { ...s.invitations[idx], ...data, updated_at: new Date().toISOString() };
    writeStore(s); return s.invitations[idx];
  }
  const { data: result } = await sb().from('invitations').update(data).eq('id', id).select().single();
  return result;
}

// ===== GUESTS =====
export async function getGuests(invitationId?: string) {
  if (!isSupabaseMode()) {
    const g = readStore().guests;
    return invitationId ? g.filter((x: any) => x.invitation_id === invitationId) : g;
  }
  let query = sb().from('guests').select('*');
  if (invitationId) query = query.eq('invitation_id', invitationId);
  const { data } = await query.order('created_at', { ascending: false });
  return data || [];
}

export async function getGuestByToken(token: string) {
  if (!isSupabaseMode()) return readStore().guests.find((g: any) => g.guest_token === token) || null;
  const { data } = await sb().from('guests').select('*').eq('guest_token', token).single();
  return data || null;
}

export async function addGuest(invitationId: string, data: any) {
  const token = genToken();
  const guest = {
    invitation_id: invitationId, guest_name: data.guest_name, phone: data.phone || '',
    category: data.category || 'Umum', pax_allocated: data.pax_allocated || 1,
    guest_token: token, qr_hash: genHash(),
    invitation_given_status: 'Belum Diberikan', notes: data.notes || '',
  };
  if (!isSupabaseMode()) {
    const s = readStore();
    const g = { id: `g-${Date.now()}`, ...guest, rsvp_status: null, pax_confirmed: 0, is_checked_in: false, is_souvenir_claimed: false };
    s.guests.push(g); writeStore(s); return g;
  }
  const { data: result } = await sb().from('guests').insert(guest).select().single();
  return result;
}

export async function updateGuest(id: string, data: any) {
  if (!isSupabaseMode()) {
    const s = readStore();
    const idx = s.guests.findIndex((g: any) => g.id === id);
    if (idx === -1) return null;
    s.guests[idx] = { ...s.guests[idx], ...data }; writeStore(s); return s.guests[idx];
  }
  const { data: result } = await sb().from('guests').update(data).eq('id', id).select().single();
  return result;
}

export async function deleteGuest(id: string) {
  if (!isSupabaseMode()) {
    const s = readStore(); const idx = s.guests.findIndex((g: any) => g.id === id);
    if (idx === -1) return false; s.guests.splice(idx, 1); writeStore(s); return true;
  }
  const { error } = await sb().from('guests').delete().eq('id', id);
  return !error;
}

// ===== SCAN =====
export async function processScanDb(token: string) {
  if (!isSupabaseMode()) {
    // Local JSON logic
    const s = readStore(); const idx = s.guests.findIndex((g: any) => g.guest_token === token);
    if (idx === -1) return { status: 'INVALID_QR', guest_name: '', category: '', pax: 0, table: '', message: 'QR tidak valid' };
    const g = s.guests[idx];
    if (!g.is_checked_in) {
      g.is_checked_in = true; writeStore(s);
      return { status: 'SUCCESS_CHECKIN', guest_name: g.guest_name, category: g.category, pax: g.pax_allocated, table: g.table_name || '-', message: 'Check-in berhasil!' };
    }
    if (!g.is_souvenir_claimed) {
      g.is_souvenir_claimed = true; writeStore(s);
      return { status: 'SUCCESS_SOUVENIR', guest_name: g.guest_name, category: g.category, pax: g.pax_allocated, table: g.table_name || '-', message: 'Souvenir berhasil!' };
    }
    return { status: 'ALREADY_COMPLETED', guest_name: g.guest_name, message: 'QR sudah digunakan 2x' };
  }

  // Supabase logic
  const { data: guest } = await sb().from('guests').select('*').eq('guest_token', token).single();
  if (!guest) return { status: 'INVALID_QR', message: 'QR tidak valid' };

  if (!guest.is_checked_in) {
    await sb().from('guests').update({ is_checked_in: true }).eq('id', guest.id);
    return { status: 'SUCCESS_CHECKIN', guest_name: guest.guest_name, category: guest.category, pax: guest.pax_allocated, table: guest.table_name || '-', message: 'Check-in berhasil!' };
  }
  if (!guest.is_souvenir_claimed) {
    await sb().from('guests').update({ is_souvenir_claimed: true }).eq('id', guest.id);
    return { status: 'SUCCESS_SOUVENIR', guest_name: guest.guest_name, category: guest.category, pax: guest.pax_allocated, table: guest.table_name || '-', message: 'Souvenir berhasil!' };
  }
  return { status: 'ALREADY_COMPLETED', guest_name: guest.guest_name, message: 'QR sudah digunakan 2x' };
}

// ===== VENDORS =====
export async function getVendors(invId: string) {
  if (!isSupabaseMode()) return (readStore().vendors || []).filter((v: any) => v.invitation_id === invId);
  const { data } = await sb().from('vendors').select('*').eq('invitation_id', invId);
  return data || [];
}

export async function addVendor(invId: string, data: any) {
  if (!isSupabaseMode()) {
    const s = readStore();
    if (!s.vendors) s.vendors = [];
    const v = { id: `v-${Date.now()}`, invitation_id: invId, ...data };
    s.vendors.push(v); writeStore(s); return v;
  }
  const { data: result } = await sb().from('vendors').insert({ invitation_id: invId, ...data }).select().single();
  return result;
}

// ===== TIMELINE =====
export async function getTimeline(invId: string) {
  if (!isSupabaseMode()) return readStore().timeline?.[invId] || [];
  const { data } = await sb().from('timeline_items').select('*').eq('invitation_id', invId).order('sort_order');
  return data || [];
}

// ===== BUDGET =====
export async function getBudget(invId: string) {
  if (!isSupabaseMode()) return readStore().budget?.[invId] || { total: 0, categories: [] };
  const { data } = await sb().from('budget_categories').select('*').eq('invitation_id', invId);
  const total = (data || []).reduce((s: number, c: any) => s + c.budget, 0);
  return { total, categories: data || [] };
}

// ===== SEATING =====
export async function getSeatingTables(invId: string) {
  if (!isSupabaseMode()) return readStore().seating_tables?.[invId] || [];
  const { data } = await sb().from('seating_tables').select('*').eq('invitation_id', invId);
  return data || [];
}

// ===== DASHBOARD STATS =====
export async function getDashboardStatsDb(invId: string = 'inv-001') {
  if (!isSupabaseMode()) {
    const s = readStore();
    const guests = s.guests.filter((g: any) => g.invitation_id === invId);
    return {
      totalInvitations: s.invitations.length, totalGuests: guests.length,
      totalRsvpYes: guests.filter((g: any) => g.rsvp_status === 'Hadir').length,
      totalCheckedIn: guests.filter((g: any) => g.is_checked_in).length,
      totalSouvenir: guests.filter((g: any) => g.is_souvenir_claimed).length,
      totalPax: guests.reduce((s: number, g: any) => s + (g.pax_allocated || 1), 0),
      paxCheckedIn: guests.filter((g: any) => g.is_checked_in).reduce((s: number, g: any) => s + (g.pax_allocated || 1), 0),
      progressPercent: Math.round((guests.filter((g: any) => g.rsvp_status === 'Hadir').length / Math.max(1, guests.length)) * 100),
    };
  }
  const { data: guests } = await sb().from('guests').select('*').eq('invitation_id', invId);
  const g = guests || [];
  return {
    totalInvitations: 1, totalGuests: g.length,
    totalRsvpYes: g.filter((x: any) => x.rsvp_status === 'Hadir').length,
    totalCheckedIn: g.filter((x: any) => x.is_checked_in).length,
    totalSouvenir: g.filter((x: any) => x.is_souvenir_claimed).length,
    totalPax: g.reduce((s: number, x: any) => s + (x.pax_allocated || 1), 0),
    paxCheckedIn: g.filter((x: any) => x.is_checked_in).reduce((s: number, x: any) => s + (x.pax_allocated || 1), 0),
    progressPercent: Math.round((g.filter((x: any) => x.rsvp_status === 'Hadir').length / Math.max(1, g.length)) * 100),
  };
}
