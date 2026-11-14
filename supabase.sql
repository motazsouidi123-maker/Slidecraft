-- Run this ONCE in Supabase > SQL Editor
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  whatsapp text not null,
  topic text not null,
  slides int not null check (slides between 1 and 200),
  language text,
  type text,
  deadline date,
  instructions text,
  file_url text,
  status text not null default 'pending' check (status in ('pending','in_progress','completed'))
);
alter table public.orders enable row level security;

-- Customers (not logged in) can ONLY create pending orders
create policy "customers create orders" on public.orders
  for insert to anon, authenticated with check (status = 'pending');
-- Only logged-in admin can read / change / delete
create policy "admin read" on public.orders for select to authenticated using (true);
create policy "admin update" on public.orders for update to authenticated using (true) with check (true);
create policy "admin delete" on public.orders for delete to authenticated using (true);

-- File uploads
insert into storage.buckets (id, name, public) values ('order-files','order-files', true)
  on conflict (id) do nothing;
create policy "customers upload files" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'order-files');
