create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  "desc" text,
  price numeric(10, 2),
  weight_g integer,
  venue_id uuid not null references public.venues(id) on delete cascade,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null,
  qty integer not null,
  price_per_item numeric(10, 2) not null,
  size text,
  note text,

  created_at timestamptz default now()
);
