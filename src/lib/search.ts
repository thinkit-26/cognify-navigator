/** Search params come back parsed (the year "2025" arrives as a number), so read them all as text. */
export const text = (v: unknown) => (v == null || v === "" ? undefined : String(v));
