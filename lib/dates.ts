// Date helpers. Dates are stored as YYYY-MM-DD and handled in UTC to avoid timezone drift.

export const toISO = (d: Date) => d.toISOString().slice(0, 10);
export const parseISO = (s: string) => new Date(s + "T00:00:00Z");
export const todayISO = () => toISO(new Date());

export function addDays(iso: string, days: number) {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}

export function daysBetween(fromISO: string, toISO_: string) {
  return Math.round((parseISO(toISO_).getTime() - parseISO(fromISO).getTime()) / 86_400_000);
}

// Monday of the week containing the date.
export function weekStart(iso: string) {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return toISO(d);
}

export function formatDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  if (!iso) return "—";
  return parseISO(iso.slice(0, 10)).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

export function monthStartISO(iso = todayISO()) {
  return iso.slice(0, 8) + "01";
}
