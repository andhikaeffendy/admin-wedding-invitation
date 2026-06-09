-- ============================================================
-- WEDDING CMS - Supabase Migration + RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==================== CORE TABLES ====================

-- User profiles linked to Supabase Auth
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'viewer'
    check (role in ('super_admin','editor','scanner','viewer')),
  created_at timestamptz default now()
);

-- Invitations (wedding events)
create table invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),
  title text not null,
  slug text unique not null,
  status text not null default 'draft'
    check (status in ('draft','published','archived')),
  bride_name text,
  groom_name text,
  event_date date,
  timezone text default 'Asia/Jakarta',
  theme jsonb not null default '{}',
  settings jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sections per invitation
create table invitation_sections (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references invitations(id) on delete cascade,
  section_key text not null,
  title text,
  content jsonb not null default '{}',
  is_active boolean not null default true,
  sort_order int not null default 0,
  unique(invitation_id, section_key)
);

-- Media assets
create table media_assets (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references invitations(id) on delete cascade,
  role text not null,
  bucket text not null default 'wedding-media',
  path text not null,
  public_url text,
  alt_text text,
  sort_order int default 0,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Guests
create table guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references invitations(id) on delete cascade,
  guest_name text not null,
  phone text,
  category text,
  pax_allocated int not null default 1,
  address text,
  invitation_given_status text default 'Belum Diberikan',
  invitation_given_at timestamptz,
  guest_token text unique not null,
  qr_hash text unique not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RSVP
create table rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests(id) on delete cascade,
  invitation_id uuid references invitations(id) on delete cascade,
  status text not null check (status in ('Hadir','Tidak Hadir','Ragu-ragu')),
  pax_confirmed int default 0,
  message text,
  submitted_at timestamptz default now(),
  unique(guest_id)
);

-- Attendance scans (check-in, souvenir, blocked)
create table attendance_scans (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests(id) on delete cascade,
  invitation_id uuid references invitations(id) on delete cascade,
  scan_type text not null check (scan_type in ('checkin','souvenir','blocked')),
  scanned_by uuid references auth.users(id),
  scanned_at timestamptz default now(),
  device_info jsonb default '{}',
  notes text
);

-- Guest status (denormalized for fast lookup)
create table guest_statuses (
  guest_id uuid primary key references guests(id) on delete cascade,
  invitation_id uuid references invitations(id) on delete cascade,
  is_checked_in boolean default false,
  checked_in_at timestamptz,
  checked_in_by uuid references auth.users(id),
  is_souvenir_claimed boolean default false,
  souvenir_claimed_at timestamptz,
  souvenir_claimed_by uuid references auth.users(id),
  last_scan_result text,
  updated_at timestamptz default now()
);

-- Wishes
create table wishes (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references invitations(id) on delete cascade,
  guest_id uuid references guests(id) on delete set null,
  sender_name text not null,
  message text not null,
  is_visible boolean default true,
  created_at timestamptz default now()
);

-- Gifts
create table gifts (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references invitations(id) on delete cascade,
  guest_id uuid references guests(id) on delete set null,
  sender_name text,
  bank_name text,
  amount numeric,
  proof_asset_id uuid references media_assets(id),
  notes text,
  created_at timestamptz default now()
);

-- ==================== INDEXES ====================
create index idx_guests_invitation on guests(invitation_id);
create index idx_guests_token on guests(guest_token);
create index idx_scans_guest on attendance_scans(guest_id);
create index idx_media_invitation_role on media_assets(invitation_id, role);
create index idx_wishes_invitation on wishes(invitation_id, created_at desc);
create index idx_rsvps_invitation on rsvps(invitation_id);

-- ==================== ROW LEVEL SECURITY ====================

-- Profiles: users can read their own profile
alter table profiles enable row level security;
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);
create policy "Super admins can read all profiles"
  on profiles for select
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'super_admin'
  ));

-- Invitations: owner + editor can CRUD, viewer can read published
alter table invitations enable row level security;
create policy "Owner full access"
  on invitations for all
  using (owner_id = auth.uid());
create policy "Editors can read all"
  on invitations for select
  using (exists (
    select 1 from profiles where id = auth.uid() and role in ('super_admin','editor','scanner')
  ));
create policy "Anyone can read published"
  on invitations for select
  using (status = 'published');

-- Guests: editor+ can manage, scanner can read
alter table guests enable row level security;
create policy "Editor can manage guests"
  on guests for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role in ('super_admin','editor')
  ));
create policy "Scanner can read guests"
  on guests for select
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'scanner'
  ));

-- Attendance scans: editor+ and scanner can insert/read
alter table attendance_scans enable row level security;
create policy "Scanner and editor can insert scans"
  on attendance_scans for insert
  with check (exists (
    select 1 from profiles where id = auth.uid() and role in ('super_admin','editor','scanner')
  ));
create policy "Editor can read all scans"
  on attendance_scans for select
  using (exists (
    select 1 from profiles where id = auth.uid() and role in ('super_admin','editor')
  ));

-- Wishes: public can insert (with token validation), editor can moderate
alter table wishes enable row level security;
create policy "Anyone can insert wishes"
  on wishes for insert
  with check (true);
create policy "Anyone can read visible wishes"
  on wishes for select
  using (is_visible = true);
create policy "Editor can moderate wishes"
  on wishes for update
  using (exists (
    select 1 from profiles where id = auth.uid() and role in ('super_admin','editor')
  ));

-- Media assets: editor can manage, public can read
alter table media_assets enable row level security;
create policy "Editor can manage media"
  on media_assets for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role in ('super_admin','editor')
  ));
create policy "Public can read media"
  on media_assets for select
  using (true);

-- RSVPs: public can insert/update with guest token, editor can read
alter table rsvps enable row level security;
create policy "Public can submit RSVP"
  on rsvps for insert
  with check (true);
create policy "Public can update own RSVP"
  on rsvps for update
  using (true);
create policy "Editor can read all RSVPs"
  on rsvps for select
  using (exists (
    select 1 from profiles where id = auth.uid() and role in ('super_admin','editor','scanner')
  ));

-- Gift: public can insert, editor can read
alter table gifts enable row level security;
create policy "Anyone can insert gifts"
  on gifts for insert
  with check (true);
create policy "Editor can read gifts"
  on gifts for select
  using (exists (
    select 1 from profiles where id = auth.uid() and role in ('super_admin','editor')
  ));

-- ==================== STORAGE BUCKET SETUP ====================
-- Note: Run this separately or via Supabase Dashboard

-- 1. Create bucket "wedding-media" (public or private as needed)
-- 2. Set bucket RLS policies:
--    - Editor+ can upload/delete
--    - Public can read (if public bucket)

/*
-- Storage RLS for wedding-media bucket:
-- Allow public read
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'wedding-media');

-- Allow editor+ to upload
create policy "Editor upload access"
  on storage.objects for insert
  with check (
    bucket_id = 'wedding-media' and
    exists (select 1 from profiles where id = auth.uid() and role in ('super_admin','editor'))
  );

-- Allow editor+ to delete
create policy "Editor delete access"
  on storage.objects for delete
  using (
    bucket_id = 'wedding-media' and
    exists (select 1 from profiles where id = auth.uid() and role in ('super_admin','editor'))
  );
*/

-- ==================== SEED DATA ====================

-- Insert sample invitation
insert into invitations (id, title, slug, status, bride_name, groom_name, event_date, theme)
values (
  gen_random_uuid(),
  'Andhika & Laila',
  'andhika-laila',
  'published',
  'Laila Nur Azizah',
  'Andhika Pratama',
  '2026-08-15',
  '{
    "primaryColor": "#22382D",
    "secondaryColor": "#6F7F55",
    "accentColor": "#A9B89B",
    "bgColor": "#F7F1E6",
    "textColor": "#22382D",
    "goldColor": "#C9A86A",
    "fontHeading": "Playfair Display",
    "fontBody": "Inter",
    "cardRadius": 24,
    "ornamentDensity": "medium",
    "animationIntensity": "medium"
  }'::jsonb
);
