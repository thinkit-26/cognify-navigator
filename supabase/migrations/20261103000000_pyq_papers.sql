-- PYQ papers: metadata in a table, PDFs in a public storage bucket. Admins write, everyone reads.
create table public.pyq_papers (
  id uuid primary key default gen_random_uuid(),
  class_level int not null check (class_level between 9 and 12),
  subject text not null,
  chapter text not null,
  exam text not null,
  year int not null,
  paper_path text not null,
  solution_path text,
  created_at timestamptz not null default now()
);
alter table public.pyq_papers enable row level security;

create policy "Anyone can read pyq papers" on public.pyq_papers
  for select using (true);
create policy "Admins manage pyq papers" on public.pyq_papers
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into storage.buckets (id, name, public) values ('pyqs', 'pyqs', true)
  on conflict (id) do nothing;

create policy "Admins upload pyq files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pyqs' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete pyq files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pyqs' and public.has_role(auth.uid(), 'admin'));
