"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { RequireProfile } from "@/components/RequireProfile";
import { useProfile } from "@/components/ProfileProvider";
import { formatDurationShort } from "@/lib/format";
import type { Milestone } from "@/lib/milestones";
import { assetPath, getMilestoneVisual } from "@/lib/milestoneVisuals";
import { EASYWAY_ATTRIBUTION } from "@/lib/mindset";
import { cn } from "@/lib/cn";

function HealthContent() {
  const { progress } = useProfile();
  const [openId, setOpenId] = useState<string | null>(null);
  if (!progress) return null;

  const currentEntry =
    progress.milestones.find((m) => m.status === "current") ??
    progress.milestones.find((m) => m.status === "upcoming") ??
    progress.milestones[0]!;
  const currentVisual = getMilestoneVisual(currentEntry.milestone.id);
  const isCurrentOpen = openId === currentEntry.milestone.id;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Your body</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Typical changes after quitting — not a personal medical prediction.
        </p>
      </header>

      <button
        type="button"
        onClick={() =>
          setOpenId((id) =>
            id === currentEntry.milestone.id ? null : currentEntry.milestone.id,
          )
        }
        className="relative w-full overflow-hidden rounded-2xl text-left shadow-sm ring-2 ring-accent/40"
        aria-expanded={isCurrentOpen}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPath(currentVisual.media)}
          alt=""
          className="aspect-[16/10] w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-12">
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">
            Happening now
          </span>
          <p className="mt-2 text-xl font-semibold text-white">
            {currentEntry.milestone.title}
          </p>
          <p className="mt-1 text-sm text-white/90">
            {currentEntry.milestone.shortBenefit}
          </p>
        </div>
      </button>
      {isCurrentOpen && (
        <MilestoneDetail
          milestone={currentEntry.milestone}
          celebrated={currentEntry.status === "completed"}
        />
      )}

      <div className="relative space-y-0 pl-2">
        <div
          className="absolute bottom-6 left-[2.25rem] top-2 w-0.5 bg-gradient-to-b from-primary via-primary/40 to-border"
          aria-hidden
        />
        <ul className="space-y-4">
          {progress.milestones.map(({ milestone, status }) => {
            if (milestone.id === currentEntry.milestone.id) return null;
            const visual = getMilestoneVisual(milestone.id);
            const isOpen = openId === milestone.id;
            return (
              <li key={milestone.id} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenId((id) => (id === milestone.id ? null : milestone.id))
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl bg-card p-2 text-left shadow-sm ring-1 ring-border transition",
                    status === "upcoming" && "opacity-70",
                  )}
                  aria-expanded={isOpen}
                >
                  <div className="relative z-10 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={assetPath(visual.media)}
                      alt=""
                      className="size-16 rounded-xl object-cover"
                    />
                    {status === "completed" && (
                      <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" aria-hidden />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-1 pr-2">
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {milestone.shortBenefit}
                    </p>
                  </div>
                </button>
                {isOpen && (
                  <div className="mt-2 ml-[4.5rem]">
                    <MilestoneDetail
                      milestone={milestone}
                      celebrated={status === "completed"}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">{EASYWAY_ATTRIBUTION}</p>
    </div>
  );
}

function MilestoneDetail({
  milestone,
  celebrated,
}: {
  milestone: Milestone;
  celebrated?: boolean;
}) {
  return (
    <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-sm">
      {celebrated && (
        <p className="font-medium text-primary">You have passed this marker.</p>
      )}
      <p>{milestone.detail}</p>
      <p className="text-muted-foreground">
        After quit: from {formatDurationShort(milestone.startMs)}
        {milestone.endMs != null
          ? ` to ${formatDurationShort(milestone.endMs)}`
          : ""}
      </p>
      <p>
        Source:{" "}
        <a
          href={milestone.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          {milestone.source}
        </a>
      </p>
    </div>
  );
}

export default function HealthPage() {
  return (
    <RequireProfile>
      <HealthContent />
    </RequireProfile>
  );
}
