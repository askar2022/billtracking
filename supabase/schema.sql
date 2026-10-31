-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_overhead boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income', 'expense', 'owner_contribution', 'owner_draw')),
  amount_cents integer not null check (amount_cents > 0),
  date date not null,
  description text not null,
  vendor text,
  payer text,
  paid_by text check (paid_by is null or paid_by in ('llc', 'owner')),
  notes text,
  product_id uuid references products (id),
  category_id uuid references categories (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null unique references transactions (id) on delete cascade,
  file_name text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_date_idx on transactions (date desc);
create index if not exists transactions_type_idx on transactions (type);
create index if not exists transactions_product_idx on transactions (product_id);
create index if not exists transactions_category_idx on transactions (category_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at
before update on users
for each row execute function set_updated_at();

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
before update on products
for each row execute function set_updated_at();

drop trigger if exists categories_set_updated_at on categories;
create trigger categories_set_updated_at
before update on categories
for each row execute function set_updated_at();

drop trigger if exists transactions_set_updated_at on transactions;
create trigger transactions_set_updated_at
before update on transactions
for each row execute function set_updated_at();

alter table users enable row level security;
alter table products enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table receipts enable row level security;

insert into products (name, description, is_overhead)
values
  ('ParentPickup', 'School pickup and dismissal app', false),
  ('EnrollFlow', 'Enrollment and registration app', false),
  ('OurDugsi', 'School management app', false),
  ('Finiin', 'Business operations app', false),
  (
    'Shared / LLC overhead',
    'Costs that support more than one product. These are not split automatically.',
    true
  )
on conflict (name) do nothing;

insert into categories (name)
values
  ('Services and software'),
  ('Hardware and equipment'),
  ('Staff'),
  ('Other')
on conflict (name) do nothing;
