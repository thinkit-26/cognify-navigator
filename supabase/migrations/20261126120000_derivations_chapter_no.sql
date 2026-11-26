-- The chapter's number in its subject, so chapters list in book order. Null for a chapter typed by hand.
alter table public.derivations add column chapter_no int;

-- The two chapters already uploaded keep their names; they only get their numbers.
update public.derivations set chapter_no = 1 where class_level = 12 and subject = 'Physics' and chapter = 'Electric Charges & Fields';
update public.derivations set chapter_no = 2 where class_level = 12 and subject = 'Physics' and chapter = 'Electrostatic Potential and Capacitance';
