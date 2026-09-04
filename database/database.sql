create extension if not exists pgcrypto;

create table events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references auth.users(id),
  name text not null,
  event_date timestamptz not null,
  location text,
  created_at timestamptz default now()
);

create table registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  attendee_name text not null,
  email text not null,
  code text unique not null default encode(gen_random_bytes(9), 'base64'),
  status text not null default 'not_arrived' check (status in ('not_arrived','checked_in')),
  checked_in_at timestamptz,
  created_at timestamptz default now()
);

create index idx_registrations_event_id on registrations(event_id);

alter table events enable row level security;
alter table registrations enable row level security;

create policy "Events are publicly readable"
on events for select
using (true);

create policy "Anyone can create an event for now"
on events for insert
with check (true);

create policy "Registrations are publicly readable"
on registrations for select
using (true);

create policy "Anyone can register"
on registrations for insert
with check (true);