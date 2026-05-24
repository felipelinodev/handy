const FREE_CANCEL_WINDOW_MS = 5 * 60 * 1000;
const CLOCK_SKEW_TOLERANCE_MS = 60 * 1000;

export function parseServerDate(raw: string | null | undefined): number | null {
  if (!raw) return null;
  let t = new Date(raw).getTime();
  if (Number.isFinite(t)) return t;
  // Server may send "YYYY-MM-DD HH:mm:ss" without timezone info — force UTC.
  if (typeof raw === 'string') {
    const normalized = raw.replace(' ', 'T');
    const withZ = /[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized) ? normalized : normalized + 'Z';
    t = new Date(withZ).getTime();
    if (Number.isFinite(t)) return t;
  }
  return null;
}

export function isWithinFreeWindow(createdAtRaw: string | null | undefined): boolean {
  const createdAt = parseServerDate(createdAtRaw);
  if (createdAt == null) return false;
  const elapsed = Date.now() - createdAt;
  // Tolerate small clock skew between client and server in both directions.
  return (
    elapsed >= -CLOCK_SKEW_TOLERANCE_MS &&
    elapsed <= FREE_CANCEL_WINDOW_MS + CLOCK_SKEW_TOLERANCE_MS
  );
}
