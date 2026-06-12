// Shared store — reads/writes store.json (single source of truth for both projects)
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORE_PATH = path.join(process.cwd(), '..', 'shared', 'store.json');

// Cryptographically secure token generation
function generateToken(): string {
  return 'tok-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}
function generateQRHash(): string {
  return 'qr-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}
function generateShortId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8);
}

interface Store {
  invitations: any[];
  guests: any[];
  wishes: any[];
  bank_accounts: any[];
  [key: string]: any;
}

export function readStore(): Store {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { invitations: [], guests: [], wishes: [], bank_accounts: [] };
  }
}

export function writeStore(data: Store): void {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function getInvitations() {
  return readStore().invitations;
}

export function getInvitationBySlug(slug: string) {
  return readStore().invitations.find((i: any) => i.slug === slug) || null;
}

export function getInvitationById(id: string) {
  return readStore().invitations.find((i: any) => i.id === id) || null;
}

export function createInvitation(data: any) {
  const store = readStore();
  const { bank_accounts, ...invData } = data;
  const newInv = {
    id: `inv-${Date.now()}`,
    ...invData,
    status: data.status || 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.invitations.push(newInv);
  // Store bank accounts
  if (bank_accounts && Array.isArray(bank_accounts)) {
    const bankRecords = bank_accounts
      .filter((b: any) => b.account_number)
      .map((b: any) => ({
        id: `bank-${Date.now()}-${generateShortId()}`,
        invitation_id: newInv.id,
        bank_name: b.bank_name,
        account_number: b.account_number,
        account_holder: b.account_holder,
      }));
    store.bank_accounts = store.bank_accounts || [];
    store.bank_accounts.push(...bankRecords);
  }
  writeStore(store);
  return newInv;
}

export function updateInvitation(id: string, data: any) {
  const store = readStore();
  const idx = store.invitations.findIndex((i: any) => i.id === id);
  if (idx === -1) return null;
  store.invitations[idx] = { ...store.invitations[idx], ...data, updated_at: new Date().toISOString() };
  writeStore(store);
  return store.invitations[idx];
}

export function getGuests(invitationId?: string) {
  const guests = readStore().guests;
  return invitationId ? guests.filter((g: any) => g.invitation_id === invitationId) : guests;
}

export function getGuestByToken(token: string) {
  return readStore().guests.find((g: any) => g.guest_token === token) || null;
}

export function addGuest(invitationId: string, data: any) {
  const store = readStore();
  const token = generateToken();
  const newGuest = {
    id: `g-${Date.now()}`,
    invitation_id: invitationId,
    guest_name: data.guest_name,
    phone: data.phone || '',
    category: data.category || 'Umum',
    pax_allocated: data.pax_allocated || 1,
    invitation_given_status: 'Belum Diberikan',
    guest_token: token,
    qr_hash: generateQRHash(),
    notes: data.notes || '',
    rsvp_status: null,
    pax_confirmed: 0,
    is_checked_in: false,
    is_souvenir_claimed: false,
  };
  store.guests.push(newGuest);
  writeStore(store);
  return newGuest;
}

export function updateGuest(id: string, data: any) {
  const store = readStore();
  const idx = store.guests.findIndex((g: any) => g.id === id);
  if (idx === -1) return null;
  store.guests[idx] = { ...store.guests[idx], ...data };
  writeStore(store);
  return store.guests[idx];
}

export function deleteGuest(id: string) {
  const store = readStore();
  const idx = store.guests.findIndex((g: any) => g.id === id);
  if (idx === -1) return false;
  store.guests.splice(idx, 1);
  writeStore(store);
  return true;
}

export function deleteInvitation(id: string) {
  const store = readStore();
  const idx = store.invitations.findIndex((i: any) => i.id === id);
  if (idx === -1) return false;
  // Delete related data
  store.guests = store.guests.filter((g: any) => g.invitation_id !== id);
  store.wishes = store.wishes.filter((w: any) => w.invitation_id !== id);
  store.bank_accounts = store.bank_accounts.filter((b: any) => b.invitation_id !== id);
  store.invitations.splice(idx, 1);
  writeStore(store);
  return true;
}

export function processScan(token: string) {
  const store = readStore();
  const idx = store.guests.findIndex((g: any) => g.guest_token === token);
  if (idx === -1) return { status: 'INVALID_QR', guest_name: '', category: '', pax: 0, message: 'QR tidak valid' };
  const guest = store.guests[idx];
  if (!guest.is_checked_in) {
    guest.is_checked_in = true;
    writeStore(store);
    return { status: 'SUCCESS_CHECKIN', guest_name: guest.guest_name, category: guest.category, pax: guest.pax_allocated, message: 'Check-in berhasil!' };
  }
  if (!guest.is_souvenir_claimed) {
    guest.is_souvenir_claimed = true;
    writeStore(store);
    return { status: 'SUCCESS_SOUVENIR', guest_name: guest.guest_name, category: guest.category, pax: guest.pax_allocated, message: 'Souvenir berhasil!' };
  }
  return { status: 'ALREADY_COMPLETED', guest_name: guest.guest_name, category: guest.category, pax: guest.pax_allocated, message: 'QR sudah digunakan 2x' };
}

export function getWishes(invitationId?: string) {
  const wishes = readStore().wishes.filter((w: any) => w.is_visible);
  return invitationId ? wishes.filter((w: any) => w.invitation_id === invitationId) : wishes;
}

export function addWish(invitationId: string, senderName: string, message: string, guestId?: string) {
  const store = readStore();
  const wish = {
    id: `w-${Date.now()}`,
    invitation_id: invitationId,
    guest_id: guestId || null,
    sender_name: senderName,
    message,
    is_visible: true,
    created_at: new Date().toISOString(),
  };
  store.wishes.unshift(wish);
  writeStore(store);
  return wish;
}

export function getDashboardStats() {
  const store = readStore();
  const guests = store.guests;
  return {
    totalInvitations: store.invitations.length,
    totalGuests: guests.length,
    totalRsvpYes: guests.filter((g: any) => g.rsvp_status === 'Hadir').length,
    totalCheckedIn: guests.filter((g: any) => g.is_checked_in).length,
    totalSouvenir: guests.filter((g: any) => g.is_souvenir_claimed).length,
    totalPax: guests.reduce((s: number, g: any) => s + (g.pax_allocated || 1), 0),
    paxCheckedIn: guests.filter((g: any) => g.is_checked_in).reduce((s: number, g: any) => s + (g.pax_allocated || 1), 0),
    progressPercent: Math.round((guests.filter((g: any) => g.rsvp_status === 'Hadir').length / Math.max(1, guests.length)) * 100),
  };
}
