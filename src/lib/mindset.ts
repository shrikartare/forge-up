/** Curated, original paraphrases — not book quotes. */

import scriptAffirmCues from "@/data/script-affirm-cues.json";
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
    "script-affirm",
    "Daily principles",
    "Five ideas to practise until they feel familiar.",
    "/media/reinforce/script-affirm.mp4?v=20261012h",
    "/media/reinforce/stills/s1-free.jpg?v=20261012e",
    scriptAffirmCues as TranscriptCue[],
  ),
  scriptFromCues(
    "script-monsters",
    "False beliefs",
    "Smoking only pauses a discomfort it created. Quit, and the relief you were chasing is no longer needed.",
    "/media/reinforce/script-monsters.mp4?v=20261012f",
    "/media/reinforce/thumb-monsters.jpg?v=20261012f",
    scriptMonstersCues as TranscriptCue[],
  ),
  scriptFromCues(
    "script-urge",
    "When the urge comes",
    "Name the urge, breathe, and let it pass without putting your head back under the water.",
    "/media/reinforce/script-urge.mp4?v=20261012e",
    "/media/reinforce/thumb-urge.jpg?v=20261012e",
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
