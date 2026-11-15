-- The report lists weak topics, so keep each question's topic and chapter with the answer.
alter table public.viva_answers add column topic text;
alter table public.viva_answers add column chapter text;
