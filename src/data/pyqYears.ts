// Academic sessions from 2000-01 up to the current calendar year's session, e.g. "2025-26".
export const PYQ_SESSIONS: string[] = Array.from(
  { length: new Date().getFullYear() - 2000 + 1 },
  (_, i) => `${2000 + i}-${String((2001 + i) % 100).padStart(2, "0")}`,
);
