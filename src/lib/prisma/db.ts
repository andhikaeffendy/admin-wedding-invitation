// Prisma database service — replaces shared-store.ts & wo-store.ts for production
// Uses Supabase PostgreSQL via Prisma ORM

import prisma from './client';
import type { Prisma } from '@prisma/client';

// ==================== INVITATIONS ====================
export async function getInvitations() {
  return await prisma.invitation.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getInvitationBySlug(slug: string) {
  return await prisma.invitation.findUnique({ where: { slug } });
}

export async function getInvitationById(id: string) {
  return await prisma.invitation.findUnique({ where: { id } });
}

export async function createInvitation(data: any) {
  return await prisma.invitation.create({ data: { ...data, status: data.status || 'draft' } });
}

export async function updateInvitation(id: string, data: any) {
  return await prisma.invitation.update({ where: { id }, data });
}

// ==================== GUESTS ====================
export async function getGuests(invitationId?: string) {
  const where = invitationId ? { invitationId } : {};
  return await prisma.guest.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function getGuestByToken(token: string) {
  return await prisma.guest.findUnique({ where: { guestToken: token } });
}

export async function addGuest(invitationId: string, data: any) {
  const token = 'tok-' + Math.random().toString(36).slice(2, 12);
  return await prisma.guest.create({
    data: {
      invitationId,
      guestName: data.guest_name,
      phone: data.phone || '',
      category: data.category || 'Umum',
      paxAllocated: data.pax_allocated || 1,
      guestToken: token,
      qrHash: 'qr-' + Math.random().toString(36).slice(2, 12),
      invitationGivenStatus: 'Belum Diberikan',
      notes: data.notes || '',
    },
  });
}

export async function updateGuest(id: string, data: any) {
  return await prisma.guest.update({ where: { id }, data });
}

export async function deleteGuest(id: string) {
  await prisma.guest.delete({ where: { id } });
  return true;
}

// ==================== SCAN ====================
export async function processScanDb(token: string) {
  const guest = await prisma.guest.findUnique({ where: { guestToken: token } });
  if (!guest) return { status: 'INVALID_QR', message: 'QR tidak valid' };

  if (!guest.isCheckedIn) {
    await prisma.guest.update({ where: { id: guest.id }, data: { isCheckedIn: true } });
    return { status: 'SUCCESS_CHECKIN', guest_name: guest.guestName, category: guest.category || '', pax: guest.paxAllocated, table: guest.tableName || '-', message: 'Check-in berhasil!' };
  }
  if (!guest.isSouvenirClaimed) {
    await prisma.guest.update({ where: { id: guest.id }, data: { isSouvenirClaimed: true } });
    return { status: 'SUCCESS_SOUVENIR', guest_name: guest.guestName, category: guest.category || '', pax: guest.paxAllocated, table: guest.tableName || '-', message: 'Souvenir berhasil!' };
  }
  return { status: 'ALREADY_COMPLETED', guest_name: guest.guestName, message: 'QR sudah digunakan 2x' };
}

// ==================== VENDORS ====================
export async function getVendors(invId: string) {
  return await prisma.vendor.findMany({ where: { invitationId: invId } });
}

export async function addVendor(invId: string, data: any) {
  return await prisma.vendor.create({ data: { invitationId: invId, ...data } });
}

// ==================== TIMELINE ====================
export async function getTimeline(invId: string) {
  return await prisma.timelineItem.findMany({ where: { invitationId: invId }, orderBy: { sortOrder: 'asc' } });
}

// ==================== BUDGET ====================
export async function getBudget(invId: string) {
  const cats = await prisma.budgetCategory.findMany({ where: { invitationId: invId } });
  const total = cats.reduce((s, c) => s + Number(c.budget), 0);
  return { total, categories: cats };
}

// ==================== SEATING ====================
export async function getSeatingTables(invId: string) {
  return await prisma.seatingTable.findMany({ where: { invitationId: invId } });
}

// ==================== WISHES ====================
export async function getWishes(invId: string) {
  return await prisma.wish.findMany({ where: { invitationId: invId, isVisible: true }, orderBy: { createdAt: 'desc' } });
}

// ==================== DASHBOARD ====================
export async function getDashboardStatsDb(invId: string) {
  const guests = await prisma.guest.findMany({ where: { invitationId: invId } });
  const invs = await prisma.invitation.count();
  return {
    totalInvitations: invs,
    totalGuests: guests.length,
    totalRsvpYes: guests.filter(g => g.rsvpStatus === 'Hadir').length,
    totalCheckedIn: guests.filter(g => g.isCheckedIn).length,
    totalSouvenir: guests.filter(g => g.isSouvenirClaimed).length,
    totalPax: guests.reduce((s, g) => s + g.paxAllocated, 0),
    paxCheckedIn: guests.filter(g => g.isCheckedIn).reduce((s, g) => s + g.paxAllocated, 0),
    progressPercent: Math.round((guests.filter(g => g.rsvpStatus === 'Hadir').length / Math.max(1, guests.length)) * 100),
  };
}

// ==================== EVENT REPORT ====================
export async function getEventReport(invId: string) {
  const [guests, tables, vendors, budget, wishes, inv] = await Promise.all([
    prisma.guest.findMany({ where: { invitationId: invId } }),
    prisma.seatingTable.findMany({ where: { invitationId: invId } }),
    prisma.vendor.findMany({ where: { invitationId: invId } }),
    prisma.budgetCategory.findMany({ where: { invitationId: invId } }),
    prisma.wish.findMany({ where: { invitationId: invId, isVisible: true } }),
    prisma.invitation.findUnique({ where: { id: invId } }),
  ]);

  return {
    invitation: inv,
    totalGuests: guests.length,
    rsvpYes: guests.filter(g => g.rsvpStatus === 'Hadir').length,
    rsvpNo: guests.filter(g => g.rsvpStatus === 'Tidak Hadir').length,
    noResponse: guests.filter(g => !g.rsvpStatus).length,
    checkedIn: guests.filter(g => g.isCheckedIn).length,
    noShow: guests.filter(g => g.rsvpStatus === 'Hadir' && !g.isCheckedIn).length,
    souvenirClaimed: guests.filter(g => g.isSouvenirClaimed).length,
    tables,
    vendors,
    budget: { total: budget.reduce((s, c) => s + Number(c.budget), 0), categories: budget },
    wishes,
    peakHour: '12:00 - 13:00',
    generatedAt: new Date().toISOString(),
  };
}

// ==================== FOLLOW-UP ====================
export async function getPendingRsvp(invId: string) {
  return await prisma.guest.findMany({
    where: { invitationId: invId, rsvpStatus: null, phone: { not: null } },
  });
}

// ==================== MULTI-CLIENT ====================
export async function getAllClients() {
  const invs = await prisma.invitation.findMany({ orderBy: { createdAt: 'desc' } });
  return Promise.all(invs.map(async (inv) => {
    const guests = await prisma.guest.findMany({ where: { invitationId: inv.id } });
    return {
      ...inv,
      guestCount: guests.length,
      rsvpCount: guests.filter(g => g.rsvpStatus === 'Hadir').length,
      checkinCount: guests.filter(g => g.isCheckedIn).length,
      progressPercent: Math.round((guests.filter(g => g.rsvpStatus === 'Hadir').length / Math.max(1, guests.length)) * 100),
    };
  }));
}
