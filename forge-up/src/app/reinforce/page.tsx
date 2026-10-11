"use client";

import { useEffect, useRef, useState } from "react";
import { RequireProfile } from "@/components/RequireProfile";
import { useProfile } from "@/components/ProfileProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  EASYWAY_ATTRIBUTION,
  REINFORCE_SCRIPTS,
  getCueAtTime,
  type ReinforceScript,
} from "@/lib/mindset";
import {
  formatCurrency,
  formatNumber,
  formatSmokeFreeDays,
  MS_PER_DAY,
} from "@/lib/format";
import { assetPath } from "@/lib/milestoneVisuals";
import { cn } from "@/lib/cn";

function ReinforceContent() {
  const { profile, progress, updateProfile } = useProfile();
  const [scriptId, setScriptId] = useState(REINFORCE_SCRIPTS[0]!.id);
  const [timeMs, setTimeMs] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef<HTMLParagraphElement>(null);

  const script =
    REINFORCE_SCRIPTS.find((s) => s.id === scriptId) ?? REINFORCE_SCRIPTS[0]!;
  const activeCue = getCueAtTime(script, timeMs);
  const completed = new Set(profile?.reinforce?.completedScriptIds ?? []);

  useEffect(() => {
    setTimeMs(0);
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

  if (!profile || !progress) return null;

  const daysRaw = progress.isCountdown
    ? Math.abs(progress.elapsedMs) / MS_PER_DAY
    : progress.daysElapsed;
  const daysDisplay = formatSmokeFreeDays(daysRaw, progress.isCountdown);

  function markScriptComplete(s: ReinforceScript) {
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
            s.id,
          ]),
        ],
        completedModuleIds: profile!.reinforce?.completedModuleIds,
      },
    });
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Reinforce</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Music and captions. Transcript highlights as the video plays.
        </p>
      </header>

      <div className="grid gap-2 sm:grid-cols-2">
        {REINFORCE_SCRIPTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScriptId(s.id)}
            className={cn(
              "overflow-hidden rounded-xl border text-left transition",
              scriptId === s.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath(s.thumbSrc)}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{s.title}</p>
                {completed.has(s.id) && (
                  <span className="text-[10px] uppercase text-primary">Done</span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{s.summary}</p>
            </div>
          </button>
        ))}
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
          onTimeUpdate={(e) =>
            setTimeMs(e.currentTarget.currentTime * 1000)
          }
          onEnded={() => markScriptComplete(script)}
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
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => markScriptComplete(script)}
        >
          Mark script complete
        </Button>
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
