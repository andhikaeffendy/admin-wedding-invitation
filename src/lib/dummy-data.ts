import crypto from 'crypto';
import { Invitation, Guest, MediaAsset, Wish } from './types';

const INV_ID = 'inv-001-andhika-laila';
function genToken(): string { return 'tok-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12); }
function genHash(): string { return 'qr-' + crypto.randomUUID().replace(/-/g, '').slice(0, 12); }

export const dummyInvitations: Invitation[] = [
  { id: INV_ID, owner_id: 'u1', title: 'Andhika & Laila', slug: 'andhika-laila', status: 'published', bride_name: 'Laila Nur Azizah, S.Psi', groom_name: 'Andhika Pratama, S.T.', event_date: '2027-01-30', template_id: 'eternal-sage-luxury', theme: { colors: { forest: '#22382D', olive: '#6F7F55', sage: '#A9B89B', cream: '#F7F1E6', gold: '#C9A86A', terracotta: '#B86B4B' } }, settings: {}, created_at: '2026-01-15', updated_at: '2026-06-01' },
  { id: 'inv-002', owner_id: 'u1', title: 'Rizky & Sarah', slug: 'rizky-sarah', status: 'draft', bride_name: 'Sarah Amalia', groom_name: 'Rizky Hermawan', event_date: '2026-09-20', theme: {}, settings: {}, created_at: '2026-05-01', updated_at: '2026-05-15' },
  { id: 'inv-003', owner_id: 'u1', title: 'Fajar & Anisa', slug: 'fajar-anisa', status: 'draft', bride_name: 'Anisa Rahmawati', groom_name: 'Fajar Nugroho', event_date: '2026-10-10', theme: {}, settings: {}, created_at: '2026-06-01', updated_at: '2026-06-05' },
];

export const dummyGuests: Guest[] = [
  { id: 'g-001', invitation_id: INV_ID, guest_name: 'Keluarga Besar Ahmad Dahlan', phone: '081234567890', category: 'Keluarga', pax_allocated: 4, invitation_given_status: 'Sudah Diberikan', guest_token: 'tok-a1b2c3d4e5', qr_hash: 'qr-hash-001', rsvp_status: 'Hadir', pax_confirmed: 4, is_checked_in: true, is_souvenir_claimed: true },
  { id: 'g-002', invitation_id: INV_ID, guest_name: 'Bpk. Rahman & Ibu Siti', phone: '081234567891', category: 'Keluarga', pax_allocated: 2, invitation_given_status: 'Sudah Diberikan', guest_token: 'tok-f6g7h8i9j0', qr_hash: 'qr-hash-002', rsvp_status: 'Hadir', pax_confirmed: 2, is_checked_in: false, is_souvenir_claimed: false },
  { id: 'g-003', invitation_id: INV_ID, guest_name: 'Rizky Hermawan & Partner', phone: '081234567892', category: 'Teman Kantor', pax_allocated: 2, invitation_given_status: 'Sudah Diberikan', guest_token: 'tok-k1l2m3n4o5', qr_hash: 'qr-hash-003', rsvp_status: 'Hadir', pax_confirmed: 2, is_checked_in: false, is_souvenir_claimed: false },
  { id: 'g-004', invitation_id: INV_ID, guest_name: 'Keluarga Pak Budi (4 org)', phone: '081234567893', category: 'Tetangga', pax_allocated: 4, invitation_given_status: 'Sudah Diberikan', guest_token: 'tok-p6q7r8s9t0', qr_hash: 'qr-hash-004', rsvp_status: 'Tidak Hadir', pax_confirmed: 0, is_checked_in: false, is_souvenir_claimed: false },
  { id: 'g-005', invitation_id: INV_ID, guest_name: 'Dewi Sartika, S.E.', phone: '081234567894', category: 'Teman Kuliah', pax_allocated: 1, invitation_given_status: 'Belum Diberikan', guest_token: 'tok-u1v2w3x4y5', qr_hash: 'qr-hash-005', rsvp_status: null },
  { id: 'g-006', invitation_id: INV_ID, guest_name: 'Andi Wirawan & Keluarga', phone: '081234567895', category: 'Keluarga', pax_allocated: 3, invitation_given_status: 'Sudah Diberikan', guest_token: 'tok-z6a7b8c9d0', qr_hash: 'qr-hash-006', rsvp_status: 'Ragu-ragu', pax_confirmed: 2 },
  { id: 'g-007', invitation_id: INV_ID, guest_name: 'Prof. Dr. Hendra Kusuma', phone: '081234567896', category: 'VIP', pax_allocated: 2, invitation_given_status: 'Sudah Diberikan', guest_token: 'tok-e1f2g3h4i5', qr_hash: 'qr-hash-007', rsvp_status: 'Hadir', pax_confirmed: 2 },
  { id: 'g-008', invitation_id: INV_ID, guest_name: 'Sarah Amalia Putri', phone: '081234567897', category: 'Teman Kantor', pax_allocated: 1, invitation_given_status: 'Sudah Diberikan', guest_token: 'tok-j6k7l8m9n0', qr_hash: 'qr-hash-008', rsvp_status: 'Hadir', pax_confirmed: 1 },
];

export const dummyMediaAssets: MediaAsset[] = [
  { id: 'med-001', invitation_id: INV_ID, role: 'cover', public_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80', alt_text: 'Cover', sort_order: 0 },
  { id: 'med-002', invitation_id: INV_ID, role: 'hero', public_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80', alt_text: 'Hero', sort_order: 0 },
  { id: 'med-003', invitation_id: INV_ID, role: 'bride', public_url: 'https://images.unsplash.com/photo-1594552073388-6e3f45e83df6?w=200&q=80', alt_text: 'Bride', sort_order: 0 },
  { id: 'med-004', invitation_id: INV_ID, role: 'groom', public_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80', alt_text: 'Groom', sort_order: 0 },
  { id: 'med-005', invitation_id: INV_ID, role: 'gallery', public_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&q=80', alt_text: 'Gallery 1', sort_order: 1 },
  { id: 'med-006', invitation_id: INV_ID, role: 'gallery', public_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=300&q=80', alt_text: 'Gallery 2', sort_order: 2 },
  { id: 'med-007', invitation_id: INV_ID, role: 'gallery', public_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300&q=80', alt_text: 'Gallery 3', sort_order: 3 },
  { id: 'med-008', invitation_id: INV_ID, role: 'gallery', public_url: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=300&q=80', alt_text: 'Gallery 4', sort_order: 4 },
];

export const dummyWishes: Wish[] = [
  { id: 'w-001', sender_name: 'Keluarga Ahmad Dahlan', message: 'Selamat menempuh hidup baru! Semoga sakinah mawaddah warahmah.', is_visible: true, created_at: '2026-06-01' },
  { id: 'w-002', sender_name: 'Anisa Rahmawati', message: 'Happy wedding day! Kalian pasangan serasi.', is_visible: true, created_at: '2026-06-02' },
];

// Mutable stores
let mutableGuests = [...dummyGuests];
let mutableInvitations = [...dummyInvitations];

export function getGuests(invitationId?: string): Guest[] {
  return mutableGuests.filter(g => !invitationId || g.invitation_id === invitationId);
}
export function getInvitations(): Invitation[] { return mutableInvitations; }
export function getGuestById(id: string): Guest | undefined { return mutableGuests.find(g => g.id === id); }
export function getGuestByToken(token: string): Guest | undefined { return mutableGuests.find(g => g.guest_token === token); }

export function processScan(token: string) {
  const guest = mutableGuests.find(g => g.guest_token === token);
  if (!guest) return { status: 'INVALID_QR' as const, guest_name: '', category: '', pax: 0, message: 'QR Code tidak valid. Tamu tidak ditemukan.' };
  if (!guest.is_checked_in) {
    guest.is_checked_in = true;
    return { status: 'SUCCESS_CHECKIN' as const, guest_name: guest.guest_name, category: guest.category, pax: guest.pax_allocated, message: '✅ Check-in berhasil! Selamat datang.' };
  }
  if (!guest.is_souvenir_claimed) {
    guest.is_souvenir_claimed = true;
    return { status: 'SUCCESS_SOUVENIR' as const, guest_name: guest.guest_name, category: guest.category, pax: guest.pax_allocated, message: '🎁 Souvenir berhasil di-claim!' };
  }
  return { status: 'ALREADY_COMPLETED' as const, guest_name: guest.guest_name, category: guest.category, pax: guest.pax_allocated, message: '⚠️ QR sudah digunakan 2x. Tidak dapat digunakan lagi.' };
}

export function getDashboardStats(): import('./types').DashboardStats {
  const guests = getGuests(INV_ID);
  return {
    totalInvitations: mutableInvitations.length,
    totalGuests: guests.length,
    totalRsvpYes: guests.filter(g => g.rsvp_status === 'Hadir').length,
    totalCheckedIn: guests.filter(g => g.is_checked_in).length,
    totalSouvenir: guests.filter(g => g.is_souvenir_claimed).length,
    totalPax: guests.reduce((s, g) => s + g.pax_allocated, 0),
    paxCheckedIn: guests.filter(g => g.is_checked_in).reduce((s, g) => s + (g.pax_confirmed || g.pax_allocated), 0),
    progressPercent: Math.round((guests.filter(g => g.rsvp_status === 'Hadir').length / guests.length) * 100),
  };
}

export function addGuest(invitationId: string, guest: Partial<Guest>): Guest {
  const newGuest: Guest = {
    id: `g-${Date.now()}`,
    invitation_id: invitationId,
    guest_name: guest.guest_name || 'New Guest',
    phone: guest.phone,
    category: guest.category || 'Umum',
    pax_allocated: guest.pax_allocated || 1,
    invitation_given_status: 'Belum Diberikan',
    guest_token: genToken(),
    qr_hash: genHash(),
    notes: guest.notes,
    rsvp_status: null,
  };
  mutableGuests.push(newGuest);
  return newGuest;
}

export function updateGuest(id: string, updates: Partial<Guest>): Guest | null {
  const idx = mutableGuests.findIndex(g => g.id === id);
  if (idx === -1) return null;
  mutableGuests[idx] = { ...mutableGuests[idx], ...updates };
  return mutableGuests[idx];
}

export function deleteGuest(id: string): boolean {
  const idx = mutableGuests.findIndex(g => g.id === id);
  if (idx === -1) return false;
  mutableGuests.splice(idx, 1);
  return true;
}

export function updateInvitation(id: string, updates: Partial<Invitation>): Invitation | null {
  const idx = mutableInvitations.findIndex(i => i.id === id);
  if (idx === -1) return null;
  mutableInvitations[idx] = { ...mutableInvitations[idx], ...updates };
  return mutableInvitations[idx];
}

export function createInvitation(data: Partial<Invitation>): Invitation {
  const inv: Invitation = {
    id: `inv-${Date.now()}`,
    owner_id: 'u1',
    title: data.title || 'New Wedding',
    slug: data.slug || `wedding-${Date.now()}`,
    status: 'draft',
    bride_name: data.bride_name || '',
    groom_name: data.groom_name || '',
    event_date: data.event_date || '',
    theme: data.theme || {},
    settings: data.settings || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mutableInvitations.push(inv);
  return inv;
}
