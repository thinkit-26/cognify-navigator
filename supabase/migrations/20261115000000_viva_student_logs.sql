-- Viva bot: one row per attempt, one row per answered question, owned by the signed-in student.
-- session_id is the id the FastAPI backend returns from /viva/start.

create table public.viva_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null unique,
  chapters integer[] not null default '{}',
  topics text[] not null default '{}',
  total_questions integer,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  overall_score numeric,
  correct_count integer,
  overall_feedback text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index viva_sessions_user_started_idx on public.viva_sessions (user_id, started_at desc);

create table public.viva_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null references public.viva_sessions(session_id) on delete cascade,
  question_id integer not null,
  question_number integer,
  question text not null,
  student_answer text not null,
  score numeric,
  is_correct boolean,
  feedback text,
  answered_at timestamptz not null default now(),
  unique (session_id, question_id)
);
create index viva_answers_session_idx on public.viva_answers (session_id);

alter table public.viva_sessions enable row level security;
alter table public.viva_answers enable row level security;

create policy "Students read their own viva sessions" on public.viva_sessions
  for select to authenticated using ((select auth.uid()) = user_id or public.has_role((select auth.uid()), 'admin'));
create policy "Students create their own viva sessions" on public.viva_sessions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Students update their own viva sessions" on public.viva_sessions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Students read their own viva answers" on public.viva_answers
  for select to authenticated using ((select auth.uid()) = user_id or public.has_role((select auth.uid()), 'admin'));
create policy "Students create their own viva answers" on public.viva_answers
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.viva_sessions s where s.session_id = viva_answers.session_id and s.user_id = (select auth.uid()))
  );
create policy "Students update their own viva answers" on public.viva_answers
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
