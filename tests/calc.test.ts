import { describe, expect, it } from "vitest";
import {
  computeProgress,
  estimateCigarettesAvoided,
  estimateMoneySaved,
  estimateTimeSavedMinutes,
  getElapsedMs,
  projectSavings,
} from "../src/lib/calc";
import { formatCurrency, formatElapsed, MS_PER_DAY } from "../src/lib/format";
import { getMilestoneStatuses } from "../src/lib/milestones";
import { getNewAchievementIds } from "../src/lib/achievements";
import { importProfileJson, type Profile } from "../src/lib/profile";

const baseProfile: Profile = {
  schemaVersion: 1,
  name: "Test",
  quitAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
  cigarettesPerDay: 10,
  pricePerCigarette: 20,
  currency: "INR",
  averageMinutesPerCigarette: 5,
  unlockedAchievementIds: [],
};

describe("elapsed time", () => {
  it("computes positive elapsed", () => {
    const now = Date.parse("2026-01-02T00:00:00.000Z");
    expect(getElapsedMs(baseProfile.quitAt, now)).toBe(MS_PER_DAY);
  });

  it("formats countdown for future quit", () => {
    const future = new Date("2026-01-10T00:00:00.000Z").toISOString();
    const now = Date.parse("2026-01-01T00:00:00.000Z");
    const p = computeProgress({ ...baseProfile, quitAt: future }, now);
    expect(p.isCountdown).toBe(true);
    expect(p.moneySaved).toBe(0);
    expect(formatElapsed(p.elapsedMs)).toContain("d");
  });
});

describe("savings and cigarettes", () => {
  it("estimates money and cigarettes from elapsed days", () => {
    const elapsed = MS_PER_DAY * 2;
    expect(estimateCigarettesAvoided(10, elapsed)).toBe(20);
    expect(estimateMoneySaved(10, 20, elapsed)).toBe(400);
    expect(estimateTimeSavedMinutes(10, 5, elapsed)).toBe(100);
    expect(projectSavings(10, 20, 30)).toBe(6000);
  });

  it("formats INR currency", () => {
    expect(formatCurrency(1000, "INR")).toMatch(/1,?000/);
  });
});

describe("milestones and achievements", () => {
  it("marks early milestones completed after 3 days", () => {
    const statuses = getMilestoneStatuses(MS_PER_DAY * 3);
    const twenty = statuses.find((s) => s.milestone.id === "20m");
    expect(twenty?.status).toBe("completed");
  });

  it("keeps interval milestone current inside window", () => {
    const statuses = getMilestoneStatuses(MS_PER_DAY * 20);
    const interval = statuses.find((s) => s.milestone.id === "2w-3m");
    expect(interval?.status).toBe("current");
  });

  it("unlocks achievements without duplicates", () => {
    const ids = getNewAchievementIds(
      {
        elapsedMs: MS_PER_DAY * 3,
        daysElapsed: 3,
        cigarettesAvoided: 30,
        moneySaved: 600,
        completedMilestoneIds: ["20m", "24h", "48h", "72h"],
      },
      ["day-1"],
    );
    expect(ids).toContain("day-3");
    expect(ids).not.toContain("day-1");
    expect(ids).toContain("save-500");
  });
});

describe("import", () => {
  it("parses exported profile JSON", () => {
    const raw = JSON.stringify(baseProfile);
    expect(importProfileJson(raw).name).toBe("Test");
  });

  it("rejects invalid import", () => {
    expect(() => importProfileJson("{}")).toThrow();
  });
});

describe("computeProgress", () => {
  it("uses pricePerCigarette directly", () => {
    const now = Date.parse("2026-01-02T00:00:00.000Z");
    const p = computeProgress(baseProfile, now);
    expect(p.dailyCost).toBe(200);
    expect(p.moneySaved).toBe(200);
  });
});
