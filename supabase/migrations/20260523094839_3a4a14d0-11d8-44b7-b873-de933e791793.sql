ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subjects text[] NOT NULL DEFAULT '{}'::text[];