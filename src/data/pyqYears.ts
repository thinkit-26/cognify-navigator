// Academic sessions from the current calendar year's session (e.g. "2025-26") back to 2000-01, newest first.
export const PYQ_SESSIONS: string[] = Array.from(
  { length: new Date().getFullYear() - 2000 + 1 },
  (_, i) => `${2000 + i}-${String((2001 + i) % 100).padStart(2, "0")}`,
).reverse();
