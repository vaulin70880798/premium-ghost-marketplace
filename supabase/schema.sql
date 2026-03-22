-- Ghost Market production baseline schema (Supabase/Postgres)

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'buyer' check (role in ('buyer', 'producer', 'admin')),
  display_name text not null default 'New Member',
  bio text,
  avatar_url text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists producers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  artist_name text not null,
  genres text[] not null default '{}',
  rating numeric(2,1) not null default 0,
  total_sales integer not null default 0,
  response_time text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  package_url text,
  has_stems boolean not null default true,
  has_midi boolean not null default true,
  has_master boolean not null default true,
  has_unmastered boolean not null default true,
  has_extended_mix boolean not null default true,
  has_radio_edit boolean not null default true,
  exclusivity_status text not null default 'available' check (exclusivity_status in ('available', 'sold')),
  status text not null default 'published' check (status in ('draft', 'pending', 'published', 'rejected')),
  duration_seconds integer not null,
  tags text[] not null default '{}',
  popularity integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  user_id uuid not null references profiles(id) on delete cascade,
  track_id uuid not null references tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, track_id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles(id) on delete cascade,
  total integer not null,
  payment_provider text,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  paypal_order_id text,
  paypal_capture_id text,
  rights_transfer_pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  buyer_id uuid not null references profiles(id) on delete cascade,
  producer_id uuid references producers(id) on delete set null,
  service text not null,
  genre text,
  budget_range text,
  notes text,
  status text not null check (status in ('submitted', 'in_review', 'accepted', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  producer_id uuid not null references producers(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  text text,
  created_at timestamptz not null default now(),
  unique(profile_id, producer_id)
);

create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  producer_id uuid not null references producers(id) on delete cascade,
  amount integer not null,
  currency text not null default 'USD',
  payout_provider text,
  payout_reference text,
  status text not null check (status in ('pending', 'processing', 'paid', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create index if not exists idx_tracks_genre on tracks(genre);
create index if not exists idx_tracks_status on tracks(status);
create index if not exists idx_tracks_created_at on tracks(created_at desc);
create index if not exists idx_orders_buyer on orders(buyer_id);
create index if not exists idx_orders_payment_status on orders(payment_status);
create index if not exists idx_service_requests_buyer on service_requests(buyer_id);

alter table profiles enable row level security;
alter table producers enable row level security;
alter table tracks enable row level security;
alter table track_files enable row level security;
alter table favorites enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table service_requests enable row level security;
alter table reviews enable row level security;
alter table payouts enable row level security;
alter table audit_logs enable row level security;

create policy "Profiles are publicly readable"
on profiles for select
using (true);

create policy "Users can insert their own profile"
on profiles for insert
with check (
  id = auth.uid()
  and role = 'buyer'
);

create policy "Users can update their own profile"
on profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "Producers are publicly readable"
on producers for select
using (true);

create policy "Producer owner or admin can insert producers"
on producers for insert
with check (profile_id = auth.uid() or public.is_admin());

create policy "Producer owner or admin can update producers"
on producers for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy "Tracks are visible when published"
on tracks for select
using (
  status = 'published'
  or public.is_admin()
  or exists (
    select 1 from producers p where p.id = tracks.producer_id and p.profile_id = auth.uid()
  )
);

create policy "Track owner or admin can insert tracks"
on tracks for insert
with check (
  public.is_admin()
  or exists (
    select 1 from producers p where p.id = tracks.producer_id and p.profile_id = auth.uid()
  )
);

create policy "Track owner or admin can update tracks"
on tracks for update
using (
  public.is_admin()
  or exists (
    select 1 from producers p where p.id = tracks.producer_id and p.profile_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from producers p where p.id = tracks.producer_id and p.profile_id = auth.uid()
  )
);

create policy "Track owner or admin can delete tracks"
on tracks for delete
using (
  public.is_admin()
  or exists (
    select 1 from producers p where p.id = tracks.producer_id and p.profile_id = auth.uid()
  )
);

create policy "Track files visible with track visibility"
on track_files for select
using (
  public.is_admin()
  or exists (
    select 1 from tracks t
    left join producers p on p.id = t.producer_id
    where t.id = track_files.track_id and (t.status = 'published' or p.profile_id = auth.uid())
  )
);

create policy "Service role full access profiles"
on profiles for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Service role full access producers"
on producers for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Service role full access tracks"
on tracks for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Track owner/admin can manage track files"
on track_files for all
using (
  public.is_admin()
  or exists (
    select 1 from tracks t join producers p on p.id = t.producer_id
    where t.id = track_files.track_id and p.profile_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from tracks t join producers p on p.id = t.producer_id
    where t.id = track_files.track_id and p.profile_id = auth.uid()
  )
);

create policy "Users manage their own favorites"
on favorites for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "Users view their orders"
on orders for select
using (buyer_id = auth.uid() or public.is_admin());

create policy "Users create their orders"
on orders for insert
with check (buyer_id = auth.uid() or public.is_admin());

create policy "Users update their orders if pending"
on orders for update
using (buyer_id = auth.uid() or public.is_admin())
with check (buyer_id = auth.uid() or public.is_admin());

create policy "Order items visible to owner"
on order_items for select
using (
  public.is_admin()
  or exists (
    select 1 from orders o where o.id = order_items.order_id and o.buyer_id = auth.uid()
  )
);

create policy "Order items insert with order ownership"
on order_items for insert
with check (
  public.is_admin()
  or exists (
    select 1 from orders o where o.id = order_items.order_id and o.buyer_id = auth.uid()
  )
);

create policy "Users view service requests they created"
on service_requests for select
using (
  buyer_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from producers p where p.id = service_requests.producer_id and p.profile_id = auth.uid()
  )
);

create policy "Users create their service requests"
on service_requests for insert
with check (buyer_id = auth.uid() or public.is_admin());

create policy "Owners and admin update service requests"
on service_requests for update
using (
  buyer_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from producers p where p.id = service_requests.producer_id and p.profile_id = auth.uid()
  )
)
with check (
  buyer_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from producers p where p.id = service_requests.producer_id and p.profile_id = auth.uid()
  )
);

create policy "Reviews are readable"
on reviews for select
using (true);

create policy "Users can write their own reviews"
on reviews for insert
with check (profile_id = auth.uid());

create policy "Users can edit their own reviews"
on reviews for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy "Payouts are admin or producer visible"
on payouts for select
using (
  public.is_admin()
  or exists (
    select 1 from producers p where p.id = payouts.producer_id and p.profile_id = auth.uid()
  )
);

create policy "Payouts are admin managed"
on payouts for all
using (public.is_admin())
with check (public.is_admin());

create policy "Audit logs are admin readable"
on audit_logs for select
using (public.is_admin());

create policy "Audit logs are admin insert-only"
on audit_logs for insert
with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', 'New Member'),
    'buyer'
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  if new.role <> old.role then
    raise exception 'Role changes are restricted to admin.';
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

drop trigger if exists before_profile_update_prevent_role_escalation on public.profiles;
create trigger before_profile_update_prevent_role_escalation
before update on public.profiles
for each row
execute procedure public.prevent_role_escalation();
