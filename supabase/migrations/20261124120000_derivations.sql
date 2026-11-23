-- Derivations: metadata in a table, PDFs in a public storage bucket. Admins write, everyone reads.
-- Chapters are free text typed by the admin; the public page offers the chapters that have uploads.
create table public.derivations (
  id uuid primary key default gen_random_uuid(),
  class_level int not null check (class_level between 9 and 12),
  subject text not null,
  chapter text not null,
  title text not null,
  file_path text not null,
  created_at timestamptz not null default now()
);
create index derivations_lookup_idx on public.derivations (class_level, subject, chapter);
alter table public.derivations enable row level security;

create policy "Anyone can read derivations" on public.derivations
  for select using (true);
create policy "Admins manage derivations" on public.derivations
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into storage.buckets (id, name, public) values ('derivations', 'derivations', true)
  on conflict (id) do nothing;

create policy "Admins upload derivation files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'derivations' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete derivation files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'derivations' and public.has_role(auth.uid(), 'admin'));
