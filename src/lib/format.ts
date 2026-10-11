export function formatCurrency(amount: number, currency = "INR"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: amount < 10 ? 2 : 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
  }).format(value);
}

/** Assumptions: elapsed day = ms / 86_400_000 (not calendar days). */
export const MS_PER_DAY = 86_400_000;

export function formatElapsed(ms: number): string {
  const abs = Math.abs(ms);
  const totalSeconds = Math.floor(abs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

export function formatDurationShort(ms: number): string {
  const abs = Math.abs(ms);
  const days = abs / MS_PER_DAY;
  if (days >= 1) return `${days.toFixed(days >= 10 ? 0 : 1)} days`;
  const hours = abs / 3_600_000;
  if (hours >= 1) return `${hours.toFixed(1)} hours`;
  const minutes = abs / 60_000;
  return `${Math.max(1, Math.round(minutes))} min`;
}

/** datetime-local value from ISO / Date. */
export function toDatetimeLocalValue(isoOrMs: string | number): string {
  const d = new Date(typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO string from datetime-local input. */
export function fromDatetimeLocalValue(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date/time");
  }
  return d.toISOString();
}

/** HTML date input value (YYYY-MM-DD) from ISO / ms. */
export function toDateInputValue(isoOrMs: string | number): string {
  const d = new Date(typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** ISO at local midnight from HTML date input (YYYY-MM-DD). */
export function fromDateInputValue(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) throw new Error("Invalid date");
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const day = Number(match[3]);
  const d = new Date(y, m, day, 0, 0, 0, 0);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date");
  return d.toISOString();
}

/** Whole days for display (no ticking seconds). */
export function formatSmokeFreeDays(daysElapsed: number, isCountdown: boolean): {
  value: number;
  label: string;
} {
  const days = Math.max(0, Math.floor(Math.abs(daysElapsed)));
  return {
    value: days,
    label: isCountdown ? "days until quit" : "smoke-free days",
  };
}
