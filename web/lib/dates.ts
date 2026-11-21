// Haq Dilao — Date logic (Asia/Kolkata, date-only comparisons)

const TZ = "Asia/Kolkata";

export function nowInKolkata(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
}

export function todayISO(): string {
  const d = nowInKolkata();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function parseISODate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  // Construct at noon to avoid DST edge cases
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

export function dateToISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function isBeforeDay(a: Date, b: Date): boolean {
  if (a.getUTCFullYear() !== b.getUTCFullYear()) return a.getUTCFullYear() < b.getUTCFullYear();
  if (a.getUTCMonth() !== b.getUTCMonth()) return a.getUTCMonth() < b.getUTCMonth();
  return a.getUTCDate() < b.getUTCDate();
}

export function isAfterDay(a: Date, b: Date): boolean {
  if (a.getUTCFullYear() !== b.getUTCFullYear()) return a.getUTCFullYear() > b.getUTCFullYear();
  if (a.getUTCMonth() !== b.getUTCMonth()) return a.getUTCMonth() > b.getUTCMonth();
  return a.getUTCDate() > b.getUTCDate();
}

export function daysUntil(target: Date | null): number | null {
  if (!target) return null;
  const today = nowInKolkata();
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export type SchemeDateLabel =
  | "New"
  | "Closing soon"
  | "Closed"
  | "Open all year"
  | "Applied";

export interface SchemeDateInfo {
  label: SchemeDateLabel;
  countdownText: string | null;
  daysUntilClose: number | null;
}

export function getSchemeDateInfo(
  postedDate: string | null,
  lastDate: string | null
): SchemeDateInfo {
  const today = nowInKolkata();
  const posted = parseISODate(postedDate);
  const last = parseISODate(lastDate);

  // Closed: last_date before today
  if (last && isBeforeDay(last, today)) {
    return {
      label: "Closed",
      countdownText: null,
      daysUntilClose: daysUntil(last),
    };
  }

  // Open all year: no last_date
  if (!last) {
    return {
      label: "Open all year",
      countdownText: null,
      daysUntilClose: null,
    };
  }

  // New: posted within last 7 days
  const postedDays = posted ? daysUntil(posted) : null;
  if (postedDays !== null && postedDays >= -7) {
    // Check if also closing soon
    const daysLeft = last ? daysUntil(last) : null;
    if (daysLeft !== null && daysLeft <= 7) {
      return {
        label: "Closing soon",
        countdownText: `Closes in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
        daysUntilClose: daysLeft,
      };
    }
    return {
      label: "New",
      countdownText: null,
      daysUntilClose: daysUntil(last),
    };
  }

  // Closing soon: last_date within next 7 days
  const daysLeft2 = daysUntil(last);
  if (daysLeft2 !== null && daysLeft2 <= 7) {
    return {
      label: "Closing soon",
      countdownText: `Closes in ${daysLeft2} day${daysLeft2 === 1 ? "" : "s"}`,
      daysUntilClose: daysLeft2,
    };
  }

  // Otherwise open
  return {
    label: "Open all year",
    countdownText: null,
    daysUntilClose: daysUntil(last),
  };
}

export function sortSchemesByPriority(
  schemes: Array<{ id: string; posted_date: string | null; last_date: string | null }>
): Array<{ id: string; posted_date: string | null; last_date: string | null }> {
  const today = nowInKolkata();

  return [...schemes].sort((a, b) => {
    const aInfo = getSchemeDateInfo(a.posted_date, a.last_date);
    const bInfo = getSchemeDateInfo(b.posted_date, b.last_date);

    // Priority: Closing soon (ascending days left) > New > Open all year
    const priority = (info: SchemeDateInfo) => {
      if (info.label === "Closing soon") return 0;
      if (info.label === "New") return 1;
      return 2;
    };

    const pa = priority(aInfo);
    const pb = priority(bInfo);
    if (pa !== pb) return pa - pb;

    // Within Closing soon: sooner deadline first
    if (pa === 0) {
      const da = aInfo.daysUntilClose ?? 999;
      const db = bInfo.daysUntilClose ?? 999;
      return da - db;
    }

    // Within New: newer posted first
    if (pa === 1) {
      const ap = parseISODate(a.posted_date);
      const bp = parseISODate(b.posted_date);
      if (ap && bp) return bp.getTime() - ap.getTime();
    }

    return 0;
  });
}