// Database initialization — auto-creates tables if not exist
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isConfigured = !!(SUPABASE_URL && SUPABASE_SERVICE_KEY && SUPABASE_URL.includes('supabase.co'));

// NOTE: This uses SERVICE_ROLE key for schema setup — only call from admin API routes
const adminClient = isConfigured ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

export async function initDatabase() {
  if (!adminClient) return { success: false, message: 'Supabase not configured' };

  try {
    // Check if tables exist by querying invitations
    const { error } = await adminClient.from('invitations').select('id').limit(1);

    // If table doesn't exist, create everything
    if (error && error.code === '42P01') {
      // Create tables via raw SQL
      const sql = `
        CREATE TABLE IF NOT EXISTS invitations (
          id uuid primary key default gen_random_uuid(),
          owner_id text,
          title text not null,
          slug text unique not null,
          status text default 'draft',
          bride_name text, groom_name text,
          bride_full_name text, groom_full_name text,
          bride_parents text, groom_parents text,
          bride_ig text, groom_ig text,
          event_date text,
          timezone text default 'Asia/Jakarta',
          theme jsonb default '{}',
          settings jsonb default '{}',
          white_label jsonb default '{}',
          created_at timestamptz default now(),
          updated_at timestamptz default now()
        );
        CREATE TABLE IF NOT EXISTS guests (
          id uuid primary key default gen_random_uuid(),
          invitation_id uuid references invitations(id) on delete cascade,
          guest_name text not null, phone text, category text,
          pax_allocated int default 1,
          table_number text, table_name text,
          invitation_given_status text default 'Belum Diberikan',
          guest_token text unique not null, qr_hash text unique,
          notes text, rsvp_status text,
          pax_confirmed int default 0,
          is_checked_in boolean default false,
          is_souvenir_claimed boolean default false,
          created_at timestamptz default now()
        );
        CREATE TABLE IF NOT EXISTS vendors (
          id uuid primary key default gen_random_uuid(),
          invitation_id uuid references invitations(id) on delete cascade,
          name text not null, category text, contact text,
          cost bigint default 0, paid bigint default 0,
          status text default 'Belum Bayar', notes text
        );
        CREATE TABLE IF NOT EXISTS seating_tables (
          id uuid primary key default gen_random_uuid(),
          invitation_id uuid references invitations(id) on delete cascade,
          name text not null, section text, capacity int default 10,
          seats_taken int default 0
        );
        CREATE TABLE IF NOT EXISTS timeline_items (
          id uuid primary key default gen_random_uuid(),
          invitation_id uuid references invitations(id) on delete cascade,
          time text, activity text, location text, pic text,
          sort_order int default 0
        );
        CREATE TABLE IF NOT EXISTS budget_categories (
          id uuid primary key default gen_random_uuid(),
          invitation_id uuid references invitations(id) on delete cascade,
          name text not null, budget bigint default 0, spent bigint default 0
        );
        CREATE TABLE IF NOT EXISTS wishes (
          id uuid primary key default gen_random_uuid(),
          invitation_id uuid references invitations(id) on delete cascade,
          sender_name text, message text,
          is_visible boolean default true,
          created_at timestamptz default now()
        );
        CREATE TABLE IF NOT EXISTS bank_accounts (
          id uuid primary key default gen_random_uuid(),
          invitation_id uuid references invitations(id) on delete cascade,
          bank_name text, account_number text, account_holder text
        );
        CREATE TABLE IF NOT EXISTS souvenir_stock (
          id uuid primary key default gen_random_uuid(),
          invitation_id uuid references invitations(id) on delete unique,
          total int default 0, claimed int default 0,
          remaining int default 0, alert_threshold int default 20
        );
      `;

      // Execute SQL via Supabase REST API (use rpc or raw query)
      const { error: sqlError } = await adminClient.rpc('exec_sql' as any, { query: sql });
      
      if (sqlError) {
        // If rpc not available, try creating one by one
        return { success: false, message: 'Schema auto-init failed. Run migration.sql manually.', sqlError };
      }

      return { success: true, message: 'Database initialized successfully' };
    }

    return { success: true, message: 'Database already initialized' };
  } catch (e: any) {
    console.error('DB init error:', e.message);
    return { success: false, message: 'Database initialization failed. Check server logs.' };
  }
}

// Seed data for demo
export async function seedDatabase() {
  if (!adminClient) return { success: false };

  const { data: existing } = await adminClient.from('invitations').select('id').limit(1);
  if (existing && existing.length > 0) return { success: true, message: 'Data already exists' };

  const { data: inv } = await adminClient.from('invitations').insert({
    title: 'Andhika & Laila', slug: 'andhika-laila', status: 'published',
    bride_name: 'Laila', groom_name: 'Andhika',
    bride_full_name: 'Laila Nur Azizah, S.Psi', groom_full_name: 'Andhika Pratama, S.T.',
    bride_parents: 'Putri dari Bpk. H. Ahmad Fauzi & Ibu Hj. Siti Mariam',
    groom_parents: 'Putra dari Bpk. Ir. Budi Santoso & Ibu Dewi Kartika',
    event_date: '2026-08-15',
    theme: { primaryColor: '#22382D', secondaryColor: '#6F7F55', accentColor: '#A9B89B', bgColor: '#F7F1E6', textColor: '#22382D', goldColor: '#C9A86A' },
    settings: { coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', heroImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80' },
  }).select('id').single();

  if (!inv) return { success: false };

  const invId = inv.id;

  // Seed guests
  const guests = [
    { invitation_id: invId, guest_name: 'Keluarga Besar Ahmad Dahlan', category: 'Keluarga', pax_allocated: 4, guest_token: 'tok-a1b2c3d4e5', rsvp_status: 'Hadir', pax_confirmed: 4, is_checked_in: true, table_name: 'Anggrek', table_number: 'A1' },
    { invitation_id: invId, guest_name: 'Bpk. Rahman & Ibu Siti', category: 'Keluarga', pax_allocated: 2, guest_token: 'tok-f6g7h8i9j0', rsvp_status: 'Hadir', pax_confirmed: 2, table_name: 'Anggrek', table_number: 'A2' },
    { invitation_id: invId, guest_name: 'Rizky Hermawan & Partner', category: 'Teman Kantor', pax_allocated: 2, guest_token: 'tok-k1l2m3n4o5', rsvp_status: 'Hadir', pax_confirmed: 2, table_name: 'Mawar', table_number: 'B1' },
    { invitation_id: invId, guest_name: 'Dewi Sartika, S.E.', category: 'Teman Kuliah', pax_allocated: 1, guest_token: 'tok-u1v2w3x4y5', table_name: 'Melati', table_number: 'C1' },
    { invitation_id: invId, guest_name: 'Prof. Dr. Hendra Kusuma', category: 'VIP', pax_allocated: 2, guest_token: 'tok-e1f2g3h4i5', rsvp_status: 'Hadir', pax_confirmed: 2, table_name: 'VIP', table_number: 'V1' },
  ];
  await adminClient.from('guests').insert(guests);

  // Seed tables
  const tables = [
    { invitation_id: invId, name: 'Anggrek', section: 'Keluarga', capacity: 10, seats_taken: 6 },
    { invitation_id: invId, name: 'Mawar', section: 'Teman', capacity: 8, seats_taken: 4 },
    { invitation_id: invId, name: 'Melati', section: 'Teman', capacity: 8, seats_taken: 1 },
    { invitation_id: invId, name: 'VIP', section: 'VIP', capacity: 5, seats_taken: 2 },
  ];
  await adminClient.from('seating_tables').insert(tables);

  // Seed vendors
  await adminClient.from('vendors').insert([
    { invitation_id: invId, name: 'Gedung Graha', category: 'Venue', cost: 15000000, paid: 15000000, status: 'Lunas' },
    { invitation_id: invId, name: 'Dekorasi Anggun', category: 'Dekorasi', cost: 25000000, paid: 15000000, status: 'DP 60%' },
    { invitation_id: invId, name: 'Catering Berkah', category: 'Katering', cost: 35000000, paid: 0, status: 'Belum Bayar' },
  ]);

  // Seed budget
  await adminClient.from('budget_categories').insert([
    { invitation_id: invId, name: 'Venue', budget: 20000000, spent: 15000000 },
    { invitation_id: invId, name: 'Katering', budget: 50000000, spent: 0 },
    { invitation_id: invId, name: 'Dekorasi', budget: 30000000, spent: 15000000 },
    { invitation_id: invId, name: 'Dokumentasi', budget: 15000000, spent: 10000000 },
  ]);

  // Seed timeline
  await adminClient.from('timeline_items').insert([
    { invitation_id: invId, time: '06:00', activity: 'Persiapan Pengantin', location: 'Hotel', pic: 'MUA Team', sort_order: 1 },
    { invitation_id: invId, time: '08:00', activity: 'Akad Nikah', location: 'Masjid Agung', pic: 'Penghulu', sort_order: 2 },
    { invitation_id: invId, time: '11:00', activity: 'Resepsi', location: 'Gedung Graha', pic: 'MC', sort_order: 3 },
    { invitation_id: invId, time: '17:00', activity: 'Penutupan', location: 'Gedung Graha', pic: 'EO', sort_order: 4 },
  ]);

  return { success: true, message: 'Seed data created' };
}
