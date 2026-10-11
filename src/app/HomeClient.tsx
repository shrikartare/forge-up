"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Cigarette,
  IndianRupee,
  PiggyBank,
  Sparkles,
  SquarePen,
  Trophy,
} from "lucide-react";
import { RequireProfile } from "@/components/RequireProfile";
import { useProfile } from "@/components/ProfileProvider";
import { Card } from "@/components/ui/card";
import { ACHIEVEMENTS } from "@/lib/achievements";
import {
  formatCurrency,
  formatNumber,
  formatSmokeFreeDays,
  MS_PER_DAY,
} from "@/lib/format";
import { assetPath, getMilestoneVisual } from "@/lib/milestoneVisuals";
import { cn } from "@/lib/cn";

function HomeContent() {
  const { profile, progress, updateProfile } = useProfile();

  useEffect(() => {
    if (!profile || !progress?.newAchievementIds.length) return;
    const merged = [
      ...new Set([
        ...(profile.unlockedAchievementIds ?? []),
        ...progress.newAchievementIds,
      ]),
    ];
    if (merged.length !== (profile.unlockedAchievementIds ?? []).length) {
      updateProfile({ unlockedAchievementIds: merged });
    }
  }, [profile, progress, updateProfile]);

  if (!profile || !progress) return null;

  const daysRaw = progress.isCountdown
    ? Math.abs(progress.elapsedMs) / MS_PER_DAY
    : progress.daysElapsed;
  const daysDisplay = formatSmokeFreeDays(daysRaw, progress.isCountdown);
  const unlocked = new Set(profile.unlockedAchievementIds ?? []);
  const nextAchievement = ACHIEVEMENTS.find((a) => !unlocked.has(a.id));
  const quitLabel = new Date(progress.quitAtMs).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });

  const currentEntry =
    progress.milestones.find((m) => m.status === "current") ??
    progress.milestones.find((m) => m.status === "upcoming") ??
    progress.milestones[progress.milestones.length - 1];
  const currentVisual = currentEntry
    ? getMilestoneVisual(currentEntry.milestone.id)
    : null;

  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm text-muted-foreground">Hi, {profile.name}</p>
        <h1 className="text-2xl font-semibold">Your progress</h1>
      </header>

      <Card className="relative space-y-3 p-4">
        <Link
          href="/profile"
          aria-label="Edit profile and quit data"
          className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <SquarePen className="size-4" aria-hidden />
        </Link>

        <div className="flex flex-col items-center gap-2 pr-8 text-center">
          <Link
            href="/profile"
            aria-label="Edit quit data"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
          >
            <CalendarDays className="size-5" aria-hidden />
          </Link>
          <div className="min-w-0">
            <p className="text-3xl font-semibold tabular-nums leading-none">
              {daysDisplay.value}
            </p>
            <p className="text-sm text-muted-foreground">{daysDisplay.label}</p>
          </div>
        </div>

        <Link
          href="/profile"
          aria-label="Edit quit date"
          className="flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          Quit · {quitLabel}
        </Link>

        <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
          <Metric
            href="/profile"
            ariaLabel="Edit savings inputs"
            icon={<IndianRupee className="size-4" aria-hidden />}
            label="money saved"
            value={formatCurrency(Math.round(progress.moneySaved), "INR")}
          />
          <Metric
            href="/profile"
            ariaLabel="Edit habit"
            icon={<Cigarette className="size-4" aria-hidden />}
            label="cigarettes avoided"
            value={formatNumber(Math.round(progress.cigarettesAvoided), 0)}
          />
        </div>
      </Card>

      {currentEntry && currentVisual && (
        <Card className="space-y-3 overflow-hidden p-0">
          <div className="flex items-center justify-between gap-2 px-4 pt-3">
            <p className="text-sm font-medium">Progress ahead</p>
            <Link
              href="/health"
              className="text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              See full timeline
            </Link>
          </div>
          <Link href="/health" className="block">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assetPath(currentVisual.media)}
                alt=""
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                  Happening now
                </span>
                <p className="mt-1 font-semibold text-white">
                  {currentEntry.milestone.title}
                </p>
                <p className="text-xs text-white/90">
                  {currentEntry.milestone.shortBenefit}
                </p>
              </div>
            </div>
          </Link>
          {nextAchievement && (
            <div className="flex items-start gap-3 px-4 pb-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Trophy className="size-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{nextAchievement.title}</p>
                <p className="text-xs text-muted-foreground">
                  {nextAchievement.description}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/reinforce"
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition hover:border-primary/40"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <p className="text-sm font-medium">Reinforce</p>
          <p className="text-xs text-muted-foreground">Scripts to stay free</p>
        </Link>
        <Link
          href="/savings"
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition hover:border-primary/40"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <PiggyBank className="size-5" aria-hidden />
          </div>
          <p className="text-sm font-medium">Savings</p>
          <p className="text-xs text-muted-foreground">Money not spent</p>
        </Link>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  href,
  ariaLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Link
        href={href}
        aria-label={ariaLabel}
        className={cn(
          "flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground",
        )}
      >
        {icon}
      </Link>
      <p className="text-lg font-semibold tabular-nums leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function HomeClient() {
  return (
    <RequireProfile>
      <HomeContent />
    </RequireProfile>
  );
}
