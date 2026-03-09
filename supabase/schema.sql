-- Ghost Market MVP schema (Supabase/Postgres)

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null check (role in ('buyer', 'producer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  display_name text not null,
  bio text,
  avatar_url text,
  country text,
  created_at timestamptz not null default now()
);

create table if not exists producers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  artist_name text not null,
  rating numeric(2,1) default 0,
  total_sales integer default 0,
  response_time text,
  created_at timestamptz not null default now()
);

create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  producer_id uuid not null references producers(id) on delete cascade,
  genre text not null,
  bpm integer not null,
  musical_key text not null,
  mood text not null,
  description text,
  price integer not null,
  artwork_url text,
  preview_url text,
  has_stems boolean not null default true,
  has_midi boolean not null default true,
  has_master boolean not null default true,
  has_unmastered boolean not null default true,
  has_extended_mix boolean not null default true,
  has_radio_edit boolean not null default true,
  exclusivity_status text not null default 'available' check (exclusivity_status in ('available', 'sold')),
  duration_seconds integer not null,
  popularity integer default 0,
  created_at timestamptz not null default now()
);

create table if not exists track_files (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references tracks(id) on delete cascade,
  file_type text not null,
  included boolean not null default true,
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, track_id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references users(id) on delete cascade,
  total integer not null,
  status text not null check (status in ('paid', 'processing', 'refunded')),
  rights_transfer_pdf_url text,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  track_id uuid not null references tracks(id),
  price integer not null,
  created_at timestamptz not null default now()
);

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references users(id) on delete cascade,
  service text not null,
  genre text,
  budget_range text,
  notes text,
  status text not null check (status in ('submitted', 'in_review', 'accepted', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  producer_id uuid not null references producers(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  text text,
  created_at timestamptz not null default now()
);

create index if not exists idx_tracks_genre on tracks(genre);
create index if not exists idx_tracks_created_at on tracks(created_at desc);
create index if not exists idx_orders_buyer on orders(buyer_id);
