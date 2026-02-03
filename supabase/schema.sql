-- FreshBooks Clone Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clients table
create table if not exists clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  phone text,
  company text,
  address text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Estimates table
create table if not exists estimates (
  id uuid default uuid_generate_v4() primary key,
  number text not null,
  client_id uuid references clients(id) on delete set null,
  status text default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
  valid_until date,
  items jsonb default '[]'::jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Proposals table
create table if not exists proposals (
  id uuid default uuid_generate_v4() primary key,
  number text not null,
  client_id uuid references clients(id) on delete set null,
  title text not null,
  description text,
  status text default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
  valid_until date,
  items jsonb default '[]'::jsonb,
  terms text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invoices table
create table if not exists invoices (
  id uuid default uuid_generate_v4() primary key,
  number text not null,
  client_id uuid references clients(id) on delete set null,
  status text default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  items jsonb default '[]'::jsonb,
  notes text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Counters table for auto-incrementing document numbers
create table if not exists counters (
  id text primary key,
  value integer default 0 not null
);

-- Initialize counters
insert into counters (id, value) values ('estimate', 0) on conflict (id) do nothing;
insert into counters (id, value) values ('proposal', 0) on conflict (id) do nothing;
insert into counters (id, value) values ('invoice', 0) on conflict (id) do nothing;

-- Function to get next number
create or replace function get_next_number(counter_id text, prefix text)
returns text
language plpgsql
as $$
declare
  next_val integer;
begin
  update counters set value = value + 1 where id = counter_id returning value into next_val;
  return prefix || '-' || lpad(next_val::text, 5, '0');
end;
$$;

-- Updated_at trigger function
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Add updated_at triggers
create trigger update_clients_updated_at
  before update on clients
  for each row execute function update_updated_at_column();

create trigger update_estimates_updated_at
  before update on estimates
  for each row execute function update_updated_at_column();

create trigger update_proposals_updated_at
  before update on proposals
  for each row execute function update_updated_at_column();

create trigger update_invoices_updated_at
  before update on invoices
  for each row execute function update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
alter table clients enable row level security;
alter table estimates enable row level security;
alter table proposals enable row level security;
alter table invoices enable row level security;
alter table counters enable row level security;

-- For demo purposes, allow all operations (you should restrict this in production)
-- These policies allow anyone with the anon key to read/write
create policy "Allow all operations on clients" on clients for all using (true) with check (true);
create policy "Allow all operations on estimates" on estimates for all using (true) with check (true);
create policy "Allow all operations on proposals" on proposals for all using (true) with check (true);
create policy "Allow all operations on invoices" on invoices for all using (true) with check (true);
create policy "Allow all operations on counters" on counters for all using (true) with check (true);

-- Create indexes for better query performance
create index if not exists idx_estimates_client_id on estimates(client_id);
create index if not exists idx_proposals_client_id on proposals(client_id);
create index if not exists idx_invoices_client_id on invoices(client_id);
create index if not exists idx_estimates_status on estimates(status);
create index if not exists idx_proposals_status on proposals(status);
create index if not exists idx_invoices_status on invoices(status);
