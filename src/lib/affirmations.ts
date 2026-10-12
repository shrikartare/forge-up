export type DailyPrinciple = {
  id: string;
  title: string;
  body: string;
};

export const DAILY_PRINCIPLES: DailyPrinciple[] = [
  {
    id: "mindful",
    title: "Be mindful of what is in front of you",
    body: "Notice where your attention is. Stay with the current task. Timebox it, give it your full attention, finish what matters, then move to the next priority. When unrelated worries appear, notice them and return to the task. Do not let them use the time meant for this work. Keep a learning mindset always. Stay hungry for knowledge, and for the power to use what you learn. Keep learning and growing.",
  },
  {
    id: "day",
    title: "A negative event does not own the rest of your day",
    body: "One bad event is not a bad day. Pause before responding. Think clearly and respond calmly, not from anger or impulse. Accept what happened, take the lesson, let the event go, and keep moving.",
  },
  {
    id: "career",
    title: "Prepare seriously for the next career move",
    body: "Prepare for a job switch. Build technical skill, and learn people management. Learn how to handle people, and do not be afraid of them. Practise with people all the time. Also practise speaking, listening, and explaining ideas. Answer questions without a script, record yourself, write, read selectively, and apply what you learn. Steady practice creates options.",
  },
  {
    id: "smoking",
    title: "Remember the reality of smoking",
    body: "Smoking does not solve stress, frustration, boredom, or a hard situation. The feeling that a cigarette makes it better is false. It mainly relieves discomfort that nicotine dependence created. The situation is the same after the cigarette.",
  },
  {
    id: "better",
    title: "Get a little better every day",
    body: "Real change does not happen in a single day. Become a slightly better person each day, even by one percent. Keep going. Small gains, repeated, become a different life.",
  },
];

export const WATCH_SCRIPT_IDS = [
  "script-affirm",
  "script-monsters",
  "script-urge",
] as const;

export type WatchScriptId = (typeof WATCH_SCRIPT_IDS)[number];

export type VideoWatchDay = {
  date: string;
  counts: Record<string, number>;
};

export type VideoWatches = {
  byDay: VideoWatchDay[];
};

export function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shiftDateKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const next = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  next.setDate(next.getDate() + days);
  return localDateKey(next);
}

export function repeatLines(): string[] {
  return DAILY_PRINCIPLES.flatMap((p) => [p.title, p.body]);
}

export function recordVideoWatch(
  prev: VideoWatches | undefined,
  scriptId: string,
  today = localDateKey(),
): VideoWatches {
  const byDay = (prev?.byDay ?? []).map((day) => ({
    date: day.date,
    counts: { ...day.counts },
  }));
  const existing = byDay.find((day) => day.date === today);
  if (existing) {
    existing.counts[scriptId] = (existing.counts[scriptId] ?? 0) + 1;
  } else {
    byDay.push({ date: today, counts: { [scriptId]: 1 } });
  }
  return { byDay };
}

export function watchCount(
  day: VideoWatchDay | undefined,
  scriptId: string,
): number {
  return day?.counts[scriptId] ?? 0;
}

export function findWatchDay(
  watches: VideoWatches | undefined,
  date: string,
): VideoWatchDay | undefined {
  return watches?.byDay.find((day) => day.date === date);
}

export const TRACKED_SCRIPT_IDS = ["script-affirm", "script-monsters"] as const;

export function isPracticeDayComplete(day: VideoWatchDay | undefined): boolean {
  return TRACKED_SCRIPT_IDS.every((id) => watchCount(day, id) >= 1);
}

export type CalendarMark = "blank" | "empty" | "tick" | "miss";

function firstTrackedDate(watches: VideoWatches | undefined): string | null {
  const dates = (watches?.byDay ?? [])
    .filter((day) => TRACKED_SCRIPT_IDS.some((id) => watchCount(day, id) > 0))
    .map((day) => day.date)
    .sort();
  return dates[0] ?? null;
}

export function calendarMark(
  watches: VideoWatches | undefined,
  date: string,
  today = localDateKey(),
): CalendarMark {
  if (date > today) return "blank";
  const first = firstTrackedDate(watches);
  if (!first || date < first) return date === today ? "empty" : "blank";
  if (isPracticeDayComplete(findWatchDay(watches, date))) return "tick";
  if (date === today) return "empty";
  return "miss";
}

export function watchStreak(
  watches: VideoWatches | undefined,
  today = localDateKey(),
): number {
  const todayDay = findWatchDay(watches, today);
  let cursor = isPracticeDayComplete(todayDay) ? today : shiftDateKey(today, -1);
  let streak = 0;
  while (isPracticeDayComplete(findWatchDay(watches, cursor))) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

export function lifetimeWatchCounts(
  watches: VideoWatches | undefined,
): Record<WatchScriptId, number> {
  const totals = {
    "script-affirm": 0,
    "script-monsters": 0,
    "script-urge": 0,
  };
  for (const day of watches?.byDay ?? []) {
    for (const id of WATCH_SCRIPT_IDS) {
      totals[id] += day.counts[id] ?? 0;
    }
  }
  return totals;
}

export type WatchDayCell = {
  date: string;
  label: string;
  complete: boolean;
  isToday: boolean;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function weekStrip(
  watches: VideoWatches | undefined,
  today = localDateKey(),
): WatchDayCell[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = shiftDateKey(today, index - 6);
    const parsed = parseDateKey(date);
    return {
      date,
      label: WEEKDAYS[(parsed.getDay() + 6) % 7]!,
      complete: isPracticeDayComplete(findWatchDay(watches, date)),
      isToday: date === today,
    };
  });
}

export type MonthCell = {
  date: string | null;
  dayNumber: number | null;
  mark: CalendarMark;
  isToday: boolean;
};

export function monthGrid(
  watches: VideoWatches | undefined,
  today = localDateKey(),
): { title: string; cells: MonthCell[] } {
  const current = parseDateKey(today);
  const year = current.getFullYear();
  const month = current.getMonth();
  const first = new Date(year, month, 1);
  const leading = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: MonthCell[] = [];
  for (let i = 0; i < leading; i += 1) {
    cells.push({ date: null, dayNumber: null, mark: "blank", isToday: false });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = localDateKey(new Date(year, month, day));
    cells.push({
      date,
      dayNumber: day,
      mark: calendarMark(watches, date, today),
      isToday: date === today,
    });
  }
  return {
    title: first.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    cells,
  };
}

export const MONTH_WEEKDAYS = WEEKDAYS;

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}
