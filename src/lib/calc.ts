import type { Profile } from "./profile";
import { MS_PER_DAY } from "./format";
import { getMilestoneStatuses, type Milestone } from "./milestones";
import { getNewAchievementIds, type Achievement } from "./achievements";

export type Progress = {
  now: number;
  quitAtMs: number;
  elapsedMs: number;
  isCountdown: boolean;
  daysElapsed: number;
  cigarettesAvoided: number;
  moneySaved: number;
  timeSavedMinutes: number;
  dailyCost: number;
  projections: { days: number; money: number; cigarettes: number }[];
  milestones: ReturnType<typeof getMilestoneStatuses>;
  nextMilestone: Milestone | null;
  newAchievementIds: string[];
};

/**
 * Runtime-dynamic progress from profile + now.
 * Assumptions: day = ms/86_400_000; daily cost = cigs/day × price/cig.
 */
export function computeProgress(profile: Profile, now = Date.now()): Progress {
  const quitAtMs = Date.parse(profile.quitAt);
  const elapsedMs = now - quitAtMs;
  const isCountdown = elapsedMs < 0;
  const positiveMs = Math.max(0, elapsedMs);
  const daysElapsed = positiveMs / MS_PER_DAY;
  const dailyCost = profile.cigarettesPerDay * profile.pricePerCigarette;
  const minutesPerCig = profile.averageMinutesPerCigarette ?? 5;

  const cigarettesAvoided = profile.cigarettesPerDay * daysElapsed;
  const moneySaved = dailyCost * daysElapsed;
  const timeSavedMinutes = cigarettesAvoided * minutesPerCig;

  const projections = [7, 30, 90, 365].map((days) => ({
    days,
    money: dailyCost * days,
    cigarettes: profile.cigarettesPerDay * days,
  }));

  const milestones = getMilestoneStatuses(positiveMs);
  const nextMilestone =
    milestones.find((m) => m.status === "current" || m.status === "upcoming")
      ?.milestone ?? null;

  const snapshot = {
    elapsedMs: positiveMs,
    daysElapsed,
    cigarettesAvoided,
    moneySaved,
    completedMilestoneIds: milestones
      .filter((m) => m.status === "completed")
      .map((m) => m.milestone.id),
  };
  const newAchievementIds = getNewAchievementIds(
    snapshot,
    profile.unlockedAchievementIds ?? [],
  );

  return {
    now,
    quitAtMs,
    elapsedMs,
    isCountdown,
    daysElapsed,
    cigarettesAvoided,
    moneySaved,
    timeSavedMinutes,
    dailyCost,
    projections,
    milestones,
    nextMilestone,
    newAchievementIds,
  };
}

export function getElapsedMs(quitAt: string, now = Date.now()): number {
  return now - Date.parse(quitAt);
}

export function estimateCigarettesAvoided(
  cigarettesPerDay: number,
  elapsedMs: number,
): number {
  return cigarettesPerDay * (Math.max(0, elapsedMs) / MS_PER_DAY);
}

export function estimateMoneySaved(
  cigarettesPerDay: number,
  pricePerCigarette: number,
  elapsedMs: number,
): number {
  return (
    cigarettesPerDay *
    pricePerCigarette *
    (Math.max(0, elapsedMs) / MS_PER_DAY)
  );
}

export function estimateTimeSavedMinutes(
  cigarettesPerDay: number,
  minutesPerCigarette: number,
  elapsedMs: number,
): number {
  return (
    estimateCigarettesAvoided(cigarettesPerDay, elapsedMs) *
    minutesPerCigarette
  );
}

export function projectSavings(
  cigarettesPerDay: number,
  pricePerCigarette: number,
  days: number,
): number {
  return cigarettesPerDay * pricePerCigarette * days;
}

export type { Achievement };
