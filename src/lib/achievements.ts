export type Achievement = {
  id: string;
  title: string;
  description: string;
  /** Unlock when days smoke-free >= this value. */
  minDays?: number;
  /** Unlock when money saved >= this value (profile currency). */
  minMoney?: number;
  /** Unlock when a milestone id is completed. */
  milestoneId?: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "day-1",
    title: "First day",
    description: "24 hours smoke-free.",
    minDays: 1,
  },
  {
    id: "day-3",
    title: "Three days",
    description: "The first tough stretch.",
    minDays: 3,
  },
  {
    id: "week-1",
    title: "One week",
    description: "A full week free.",
    minDays: 7,
  },
  {
    id: "month-1",
    title: "One month",
    description: "A month of freedom.",
    minDays: 30,
  },
  {
    id: "save-500",
    title: "Saver",
    description: "Estimated savings crossed 500.",
    minMoney: 500,
  },
  {
    id: "save-5000",
    title: "Big saver",
    description: "Estimated savings crossed 5,000.",
    minMoney: 5000,
  },
  {
    id: "milestone-20m",
    title: "Heart settling",
    description: "Reached the 20-minute health marker.",
    milestoneId: "20m",
  },
  {
    id: "milestone-72h",
    title: "Breathing easier",
    description: "Reached the 72-hour health marker.",
    milestoneId: "72h",
  },
];

export type ProgressSnapshot = {
  elapsedMs: number;
  daysElapsed: number;
  cigarettesAvoided: number;
  moneySaved: number;
  completedMilestoneIds: string[];
};

export function isAchievementUnlocked(
  achievement: Achievement,
  snapshot: ProgressSnapshot,
): boolean {
  if (achievement.minDays != null && snapshot.daysElapsed >= achievement.minDays) {
    return true;
  }
  if (achievement.minMoney != null && snapshot.moneySaved >= achievement.minMoney) {
    return true;
  }
  if (
    achievement.milestoneId != null &&
    snapshot.completedMilestoneIds.includes(achievement.milestoneId)
  ) {
    return true;
  }
  return false;
}

export function getNewAchievementIds(
  snapshot: ProgressSnapshot,
  alreadyUnlocked: string[],
): string[] {
  const unlocked = new Set(alreadyUnlocked);
  return ACHIEVEMENTS.filter(
    (a) => !unlocked.has(a.id) && isAchievementUnlocked(a, snapshot),
  ).map((a) => a.id);
}
