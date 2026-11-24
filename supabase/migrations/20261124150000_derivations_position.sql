-- The D number of a derivation (D1, D2, ...), so a chapter lists in order. Null for one-off uploads.
alter table public.derivations add column position int;
