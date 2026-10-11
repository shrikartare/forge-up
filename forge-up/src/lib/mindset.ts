/** Curated, original paraphrases — not book quotes. */

import scriptMonstersCues from "@/data/script-monsters-cues.json";
import scriptUrgeCues from "@/data/script-urge-cues.json";

export type Motivator = {
  id: string;
  text: string;
};

export const MOTIVATORS: Motivator[] = [
  {
    id: "trap-reset",
    text: "One cigarette is not a reward — it is how the trap resets.",
  },
  {
    id: "craving-ending",
    text: "A craving is withdrawal ending, not a need returning.",
  },
  {
    id: "already-free",
    text: "You do not need a cigarette to cope. You are already free.",
  },
  {
    id: "break-not-tax",
    text: "The break is the pause. The cigarette was the tax.",
  },
  {
    id: "lie-fades",
    text: "Name the lie, ride the wave a few minutes, and let it pass.",
  },
  {
    id: "feed-or-fade",
    text: "The empty itch fades when you stop feeding it.",
  },
];

export function pickMotivator(seed: number): Motivator {
  const index = Math.abs(Math.floor(seed)) % MOTIVATORS.length;
  return MOTIVATORS[index]!;
}

export type TranscriptCue = {
  id: string;
  startMs: number;
  durationMs: number;
  text: string;
};

export type ReinforceScript = {
  id: string;
  title: string;
  summary: string;
  videoSrc: string;
  thumbSrc: string;
  cues: TranscriptCue[];
  fullScript: string;
};

function scriptFromCues(
  id: string,
  title: string,
  summary: string,
  videoSrc: string,
  thumbSrc: string,
  cues: TranscriptCue[],
): ReinforceScript {
  return {
    id,
    title,
    summary,
    videoSrc,
    thumbSrc,
    cues,
    fullScript: cues.map((c) => c.text).join("\n\n"),
  };
}

export const REINFORCE_SCRIPTS: ReinforceScript[] = [
  scriptFromCues(
    "script-monsters",
    "Deceptions: little & big monster",
    "Why smoking feels helpful, why it isn’t — then the freedom waiting on the other side.",
    "/media/reinforce/script-monsters.mp4",
    "/media/reinforce/thumb-monsters.jpg",
    scriptMonstersCues as TranscriptCue[],
  ),
  scriptFromCues(
    "script-urge",
    "When the urge comes",
    "Notice the urge, breathe through it, and let it pass without smoking.",
    "/media/reinforce/script-urge.mp4",
    "/media/reinforce/thumb-urge.jpg",
    scriptUrgeCues as TranscriptCue[],
  ),
];

export function getCueAtTime(
  script: ReinforceScript,
  timeMs: number,
): TranscriptCue {
  const found = script.cues.find(
    (c) => timeMs >= c.startMs && timeMs < c.startMs + c.durationMs,
  );
  return found ?? script.cues[script.cues.length - 1]!;
}

export function getReinforceScript(id: string): ReinforceScript | undefined {
  return REINFORCE_SCRIPTS.find((s) => s.id === id);
}

export const EASYWAY_ATTRIBUTION =
  "Inspired by concepts from Allen Carr’s Easyway method. Original paraphrases — not book quotes. Not affiliated with or endorsed by Allen Carr’s Easyway. Not medical advice.";
