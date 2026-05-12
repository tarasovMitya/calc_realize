-- ============================================================
-- SLOT platform — Supabase schema
-- Run this in the Supabase SQL editor (dashboard → SQL editor)
-- ============================================================

-- ─── Client profiles ──────────────────────────────────────────────────────────

create table if not exists profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          text not null default '',
  email         text not null default '',
  phone         text not null default '',
  address       text not null default '',
  avatar        text not null default '',
  notify_email  boolean not null default true,
  notify_sms    boolean not null default true,
  notify_push   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint profiles_user_id_key unique (user_id)
);

alter table profiles enable row level security;

create policy "profiles_select" on profiles for select using (auth.uid() = user_id);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update" on profiles for update using (auth.uid() = user_id);
create policy "profiles_delete" on profiles for delete using (auth.uid() = user_id);

-- ─── Performer profiles ────────────────────────────────────────────────────────

create table if not exists performer_profiles (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete cascade not null,
  name               text not null default '',
  phone              text not null default '',
  telegram           text not null default '',
  avatar             text not null default '',
  rating             numeric(3,2) not null default 0,
  completed_orders   int not null default 0,
  specializations    text[] not null default '{}',
  address            text not null default '',
  city               text not null default '',
  lat                double precision not null default 0,
  lng                double precision not null default 0,
  work_radius        int not null default 10,
  inn                text not null default '',
  experience         text not null default '',
  has_certification  boolean not null default false,
  availability       text[] not null default '{}',
  is_online          boolean not null default false,
  balance            numeric(12,2) not null default 0,
  pending_balance    numeric(12,2) not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint performer_profiles_user_id_key unique (user_id)
);

alter table performer_profiles enable row level security;

create policy "performer_profiles_select" on performer_profiles for select using (auth.uid() = user_id);
create policy "performer_profiles_insert" on performer_profiles for insert with check (auth.uid() = user_id);
create policy "performer_profiles_update" on performer_profiles for update using (auth.uid() = user_id);
create policy "performer_profiles_delete" on performer_profiles for delete using (auth.uid() = user_id);

-- ─── Saved addresses ──────────────────────────────────────────────────────────

create table if not exists addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  label       text not null default 'Новый адрес',
  street      text not null default '',
  city        text not null default '',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table addresses enable row level security;

create policy "addresses_all" on addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Order history ────────────────────────────────────────────────────────────

create table if not exists order_history (
  id                       text primary key,
  user_id                  uuid references auth.users(id) not null,
  category_name            text not null default '',
  service_name             text not null default '',
  service_id               text not null default '',
  address                  text not null default '',
  price_total              numeric not null default 0,
  price_breakdown          jsonb not null default '[]',
  duration                 text not null default '',
  comment                  text not null default '',
  status                   text not null default 'searching',
  scheduled_date           text not null default '',
  scheduled_time           text not null default '',
  performer_id             text,
  performer_name           text,
  performer_phone          text,
  performer_telegram       text,
  performer_rating         numeric,
  performer_avatar         text,
  performer_jobs_completed int,
  performer_review_count   int,
  field_values             jsonb not null default '{}',
  timeline                 jsonb not null default '[]',
  eta                      text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table order_history enable row level security;

create policy "order_history_all" on order_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
