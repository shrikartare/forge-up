"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play } from "lucide-react";
import { RequireProfile } from "@/components/RequireProfile";
import { useProfile } from "@/components/ProfileProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DAILY_PRINCIPLES,
  MONTH_WEEKDAYS,
  findWatchDay,
  isPracticeDayComplete,
  lifetimeWatchCounts,
  localDateKey,
  monthGrid,
  recordVideoWatch,
  repeatLines,
  watchCount,
  watchStreak,
  weekStrip,
} from "@/lib/affirmations";
import {
  EASYWAY_ATTRIBUTION,
  REINFORCE_SCRIPTS,
  getCueAtTime,
} from "@/lib/mindset";
import {
  formatCurrency,
  formatNumber,
  formatSmokeFreeDays,
  MS_PER_DAY,
} from "@/lib/format";
import { assetPath } from "@/lib/milestoneVisuals";
import { cn } from "@/lib/cn";

const REPEAT_MS = 7000;
const TOTAL_LABELS: Record<string, string> = {
  "script-affirm": "Principles",
  "script-monsters": "Water bucket",
  "script-urge": "Urge",
};

function ReinforceContent() {
  const { profile, progress, updateProfile } = useProfile();
  const [scriptId, setScriptId] = useState(REINFORCE_SCRIPTS[0]!.id);
  const [timeMs, setTimeMs] = useState(0);
  const [repeatOn, setRepeatOn] = useState(false);
  const [playingRepeat, setPlayingRepeat] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);
  const [monthOpen, setMonthOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef<HTMLParagraphElement>(null);

  const script =
    REINFORCE_SCRIPTS.find((s) => s.id === scriptId) ?? REINFORCE_SCRIPTS[0]!;
  const activeCue = getCueAtTime(script, timeMs);
  const lines = repeatLines();
  const today = localDateKey();
  const watches = profile?.videoWatches;
  const todayWatch = findWatchDay(watches, today);
  const doneToday = isPracticeDayComplete(todayWatch);
  const streak = watchStreak(watches, today);
  const week = weekStrip(watches, today);
  const month = monthGrid(watches, today);
  const totals = lifetimeWatchCounts(watches);

  useEffect(() => {
    setTimeMs(0);
    setRepeatOn(false);
    setLineIndex(0);
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
      el.load();
    }
  }, [scriptId]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeCue.id]);

  useEffect(() => {
    if (!repeatOn || !playingRepeat) return;
    const timer = window.setInterval(() => {
      setLineIndex((index) => (index + 1) % lines.length);
    }, REPEAT_MS);
    return () => window.clearInterval(timer);
  }, [repeatOn, playingRepeat, lines.length]);

  if (!profile || !progress) return null;

  const daysRaw = progress.isCountdown
    ? Math.abs(progress.elapsedMs) / MS_PER_DAY
    : progress.daysElapsed;
  const daysDisplay = formatSmokeFreeDays(daysRaw, progress.isCountdown);

  function finishVideo() {
    const playCount = (profile!.reinforce?.playCount ?? 0) + 1;
    updateProfile({
      reinforce: {
        ...profile!.reinforce,
        lastPlayedAt: new Date().toISOString(),
        playCount,
        cadence: profile!.reinforce?.cadence ?? "daily",
        completedScriptIds: [
          ...new Set([
            ...(profile!.reinforce?.completedScriptIds ?? []),
            script.id,
          ]),
        ],
        completedModuleIds: profile!.reinforce?.completedModuleIds,
      },
      videoWatches: recordVideoWatch(profile!.videoWatches, script.id, today),
    });
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Reinforce</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Watch all three videos to complete today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{doneToday ? "Watched" : "Not yet"}</p>
          <p className="text-xs text-muted-foreground">
            {streak} day{streak === 1 ? "" : "s"} in a row
          </p>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {REINFORCE_SCRIPTS.map((item) => {
          const watched = watchCount(todayWatch, item.id) >= 1;
          const selected = item.id === script.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setScriptId(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card",
              )}
            >
              {watched && <Check className="size-3.5" aria-hidden />}
              {item.title}
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden p-0">
        <video
          key={script.id}
          ref={videoRef}
          className="aspect-video w-full bg-black"
          controls
          playsInline
          preload="auto"
          src={assetPath(script.videoSrc)}
          onLoadedData={(e) => {
            e.currentTarget.muted = false;
            e.currentTarget.volume = 1;
          }}
          onPlay={(e) => {
            e.currentTarget.muted = false;
            e.currentTarget.volume = 1;
          }}
          onTimeUpdate={(e) => setTimeMs(e.currentTarget.currentTime * 1000)}
          onEnded={finishVideo}
        />
      </Card>

      <Card className="space-y-3">
        <p className="text-sm font-medium">Transcript</p>
        <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
          {script.cues.map((cue) => {
            const isActive = cue.id === activeCue.id;
            return (
              <p
                key={cue.id}
                ref={isActive ? activeRef : undefined}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-sm leading-relaxed transition",
                  isActive
                    ? "bg-primary/15 font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {cue.text}
              </p>
            );
          })}
        </div>
        {(activeCue.id === "s2-close" || activeCue.id === "s1-close") && (
          <p className="text-sm font-medium">
            {daysDisplay.value} {daysDisplay.label} ·{" "}
            {formatCurrency(Math.round(progress.moneySaved), profile.currency)}{" "}
            · {formatNumber(Math.round(progress.cigarettesAvoided), 0)} cigs
            avoided
          </p>
        )}
      </Card>

      {script.id === "script-affirm" &&
        (repeatOn ? (
          <Card className="space-y-6 py-8 text-center">
            <p className="text-xl font-semibold leading-snug">{lines[lineIndex]}</p>
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={() => setPlayingRepeat((value) => !value)}
              >
                {playingRepeat ? (
                  <Pause className="size-4" aria-hidden />
                ) : (
                  <Play className="size-4" aria-hidden />
                )}
                {playingRepeat ? "Pause" : "Play"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRepeatOn(false);
                  setLineIndex(0);
                }}
              >
                Back to principles
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {DAILY_PRINCIPLES.map((principle) => (
              <Card key={principle.id} className="space-y-2">
                <p className="text-sm font-medium">{principle.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {principle.body}
                </p>
              </Card>
            ))}
            <Button type="button" variant="secondary" onClick={() => setRepeatOn(true)}>
              Repeat mode
            </Button>
          </div>
        ))}

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">This week</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMonthOpen((open) => !open)}
          >
            {monthOpen ? "Hide month" : "See month"}
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {week.map((day) => (
            <div key={day.date} className="space-y-1">
              <p className="text-[10px] text-muted-foreground">{day.label}</p>
              <div
                className={cn(
                  "mx-auto flex size-8 items-center justify-center rounded-full text-xs",
                  day.complete
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                  day.isToday && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                )}
                aria-label={`${day.date}${day.complete ? ", watched" : ""}`}
              >
                {day.date.slice(-2)}
              </div>
            </div>
          ))}
        </div>
        {monthOpen && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{month.title}</p>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
              {MONTH_WEEKDAYS.map((label) => (
                <p key={label}>{label}</p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {month.cells.map((cell, index) => (
                <div
                  key={cell.date ?? `empty-${index}`}
                  className={cn(
                    "flex h-8 items-center justify-center rounded-md text-xs",
                    cell.date && cell.complete && "bg-primary text-primary-foreground",
                    cell.date && !cell.complete && "bg-muted text-muted-foreground",
                    cell.isToday && "ring-2 ring-primary",
                  )}
                >
                  {cell.dayNumber ?? ""}
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {Object.entries(TOTAL_LABELS)
            .map(([id, label]) => `${label} ${totals[id as keyof typeof totals]}`)
            .join(" · ")}
        </p>
      </Card>

      <p className="text-xs text-muted-foreground">{EASYWAY_ATTRIBUTION}</p>
    </div>
  );
}

export default function ReinforcePage() {
  return (
    <RequireProfile>
      <ReinforceContent />
    </RequireProfile>
  );
}
