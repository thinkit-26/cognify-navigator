-- PYQs are whole-syllabus papers: no chapter, and the year is a label like "2025-26".
alter table public.pyq_papers alter column chapter drop not null;
alter table public.pyq_papers alter column year type text using year::text;
