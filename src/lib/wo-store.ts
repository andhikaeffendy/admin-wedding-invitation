// Extended shared store — all WO features
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), '..', 'shared', 'store.json');

function read() { try { return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8')); } catch { return {}; } }
function write(d: any) { fs.writeFileSync(STORE_PATH, JSON.stringify(d, null, 2), 'utf-8'); }

// ====== SEATING PLAN ======
export function getSeatingTables(invId: string) { const s = read(); return s.seating_tables?.[invId] || []; }
export function getGuestsByTable(invId: string, tableName: string) { return read().guests.filter((g: any) => g.invitation_id === invId && g.table_name === tableName); }
export function assignGuestTable(guestId: string, tableName: string, tableNumber: string) {
  const s = read(); const idx = s.guests.findIndex((g: any) => g.id === guestId);
  if (idx === -1) return null; s.guests[idx].table_name = tableName; s.guests[idx].table_number = tableNumber;
  write(s); return s.guests[idx];
}

// ====== VENDORS ======
export function getVendors(invId: string) { return (read().vendors || []).filter((v: any) => v.invitation_id === invId); }
export function addVendor(invId: string, data: any) {
  const s = read(); const v = { id: `v-${Date.now()}`, invitation_id: invId, ...data }; if (!s.vendors) s.vendors = [];
  s.vendors.push(v); write(s); return v;
}
export function updateVendor(id: string, data: any) {
  const s = read(); const idx = (s.vendors || []).findIndex((v: any) => v.id === id);
  if (idx === -1) return null; s.vendors[idx] = { ...s.vendors[idx], ...data }; write(s); return s.vendors[idx];
}

// ====== TIMELINE ======
export function getTimeline(invId: string) { return read().timeline?.[invId] || []; }
export function updateTimeline(invId: string, items: any[]) {
  const s = read(); if (!s.timeline) s.timeline = {}; s.timeline[invId] = items; write(s); return items;
}

// ====== BUDGET ======
export function getBudget(invId: string) { return read().budget?.[invId] || { total: 0, categories: [] }; }
export function updateBudget(invId: string, data: any) {
  const s = read(); if (!s.budget) s.budget = {}; s.budget[invId] = data; write(s); return data;
}

// ====== SOUVENIR STOCK ======
export function getSouvenirStock(invId: string) {
  return read().souvenir_stock?.[invId] || { total: 0, claimed: 0, remaining: 0, alert_threshold: 20 };
}
export function updateSouvenirStock(invId: string, data: any) {
  const s = read(); if (!s.souvenir_stock) s.souvenir_stock = {}; s.souvenir_stock[invId] = data; write(s); return data;
}

// ====== POST-EVENT REPORT ======
export function getEventReport(invId: string) {
  const s = read();
  const guests = s.guests.filter((g: any) => g.invitation_id === invId);
  const scans = s.attendance_scans || [];
  return {
    invitation: s.invitations.find((i: any) => i.id === invId),
    totalGuests: guests.length,
    rsvpYes: guests.filter((g: any) => g.rsvp_status === 'Hadir').length,
    rsvpNo: guests.filter((g: any) => g.rsvp_status === 'Tidak Hadir').length,
    noResponse: guests.filter((g: any) => !g.rsvp_status).length,
    checkedIn: guests.filter((g: any) => g.is_checked_in).length,
    noShow: guests.filter((g: any) => g.rsvp_status === 'Hadir' && !g.is_checked_in).length,
    souvenirClaimed: guests.filter((g: any) => g.is_souvenir_claimed).length,
    tables: s.seating_tables?.[invId] || [],
    vendors: s.vendors?.filter((v: any) => v.invitation_id === invId) || [],
    budget: s.budget?.[invId] || {},
    wishes: s.wishes?.filter((w: any) => w.invitation_id === invId) || [],
    souvenirStock: s.souvenir_stock?.[invId] || {},
    peakHour: "12:00 - 13:00",
    generatedAt: new Date().toISOString(),
  };
}

// ====== AUTO FOLLOW-UP (guests not RSVP'd) ======
export function getPendingRsvpGuests(invId: string) {
  return read().guests.filter((g: any) => g.invitation_id === invId && !g.rsvp_status && g.phone);
}

// ====== MULTI-EVENT DASHBOARD ======
export function getAllClients(ownerId?: string) {
  const s = read();
  let invs = s.invitations;
  if (ownerId) invs = invs.filter((i: any) => i.owner_id === ownerId);
  return invs.map((inv: any) => {
    const guests = s.guests.filter((g: any) => g.invitation_id === inv.id);
    return {
      ...inv,
      guestCount: guests.length,
      rsvpCount: guests.filter((g: any) => g.rsvp_status === 'Hadir').length,
      checkinCount: guests.filter((g: any) => g.is_checked_in).length,
      progressPercent: Math.round((guests.filter((g: any) => g.rsvp_status === 'Hadir').length / Math.max(1, guests.length)) * 100),
    };
  });
}

// ====== SCAN WITH +1 DETECTION ======
export function processScanAdvanced(token: string, actualPax?: number) {
  const s = read();
  const idx = s.guests.findIndex((g: any) => g.guest_token === token);
  if (idx === -1) return { status: 'INVALID_QR', alert: null };
  
  const guest = s.guests[idx];
  if (!guest.is_checked_in) {
    guest.is_checked_in = true;
    // +1 detection: actual pax exceeds allocated
    let alert = null;
    if (actualPax && actualPax > guest.pax_allocated) {
      alert = { type: 'OVER_PAX', message: `⚠️ Kelebihan ${actualPax - guest.pax_allocated} orang dari alokasi ${guest.pax_allocated}!`, allocated: guest.pax_allocated, actual: actualPax };
    }
    // Update souvenir stock
    if (s.souvenir_stock?.[guest.invitation_id]) {
      s.souvenir_stock[guest.invitation_id].claimed = (s.souvenir_stock[guest.invitation_id].claimed || 0) + 1;
      s.souvenir_stock[guest.invitation_id].remaining = s.souvenir_stock[guest.invitation_id].total - s.souvenir_stock[guest.invitation_id].claimed;
    }
    write(s);
    return { status: 'SUCCESS_CHECKIN', guest_name: guest.guest_name, category: guest.category, pax: guest.pax_allocated, table: guest.table_name || '-', alert };
  }
  if (!guest.is_souvenir_claimed) {
    guest.is_souvenir_claimed = true;
    write(s);
    return { status: 'SUCCESS_SOUVENIR', guest_name: guest.guest_name, category: guest.category, pax: guest.pax_allocated, table: guest.table_name || '-', alert: null };
  }
  return { status: 'ALREADY_COMPLETED', guest_name: guest.guest_name, alert: { type: 'BLOCKED', message: 'QR sudah digunakan 2x' } };
}
