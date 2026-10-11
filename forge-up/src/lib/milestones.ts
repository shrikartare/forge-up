export type Milestone = {
  id: string;
  title: string;
  /** Start of benefit window (ms after quit). */
  startMs: number;
  /** End of interval, or null for a point-in-time milestone. */
  endMs: number | null;
  shortBenefit: string;
  detail: string;
  source: string;
  sourceUrl: string;
  needsVerification?: boolean;
};

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** Typical population-level recovery markers — not personal medical advice. */
export const MILESTONES: Milestone[] = [
  {
    id: "20m",
    title: "20 minutes",
    startMs: 20 * MIN,
    endMs: null,
    shortBenefit: "Heart rate and blood pressure often begin to drop.",
    detail:
      "Many people see heart rate and blood pressure start to move toward a healthier range within about 20 minutes of the last cigarette.",
    source: "CDC / Smokefree.gov",
    sourceUrl: "https://www.cdc.gov/tobacco/",
  },
  {
    id: "24h",
    title: "24 hours",
    startMs: DAY,
    endMs: null,
    shortBenefit: "Carbon monoxide levels in the blood often fall.",
    detail:
      "Within about a day, carbon monoxide levels typically begin to decline as the body clears leftover gas from smoking.",
    source: "CDC",
    sourceUrl: "https://www.cdc.gov/tobacco/",
  },
  {
    id: "48h",
    title: "48 hours",
    startMs: 2 * DAY,
    endMs: null,
    shortBenefit: "Taste and smell may start to improve.",
    detail:
      "Nerve endings related to taste and smell often begin recovering within a couple of days for many people.",
    source: "Smokefree.gov",
    sourceUrl: "https://smokefree.gov/",
  },
  {
    id: "72h",
    title: "72 hours",
    startMs: 3 * DAY,
    endMs: null,
    shortBenefit: "Breathing may feel a little easier.",
    detail:
      "Bronchial tubes often start to relax and breathing can feel less constrained for many people around this time.",
    source: "NHS / Smokefree.gov",
    sourceUrl: "https://www.nhs.uk/live-well/quit-smoking/",
  },
  {
    id: "2w-3m",
    title: "2 weeks to 3 months",
    startMs: 14 * DAY,
    endMs: 90 * DAY,
    shortBenefit: "Circulation and lung function often improve over this window.",
    detail:
      "Circulation and lung function commonly improve across the weeks after quitting. This is a range, not a single finish line.",
    source: "CDC",
    sourceUrl: "https://www.cdc.gov/tobacco/",
  },
  {
    id: "reproductive",
    title: "1 month",
    startMs: 30 * DAY,
    endMs: null,
    shortBenefit: "Reproductive health often begins to improve.",
    detail:
      "Within about a month smoke-free, fertility and reproductive markers (such as sperm quality or menstrual regularity for some people) commonly start improving at a population level. This is not a personal medical prediction.",
    source: "CDC / NHS",
    sourceUrl: "https://www.cdc.gov/tobacco/",
    needsVerification: true,
  },
  {
    id: "1-9m",
    title: "1 to 9 months",
    startMs: 30 * DAY,
    endMs: 270 * DAY,
    shortBenefit: "Coughing and shortness of breath often decrease.",
    detail:
      "Cilia in the lungs often regain more normal function over months, which can reduce coughing and infection risk for many people.",
    source: "CDC",
    sourceUrl: "https://www.cdc.gov/tobacco/",
    needsVerification: false,
  },
  {
    id: "1y",
    title: "1 year",
    startMs: 365 * DAY,
    endMs: null,
    shortBenefit: "Coronary heart disease risk is often substantially lower than while smoking.",
    detail:
      "After about a year smoke-free, risk of coronary heart disease is often much lower compared with continued smoking.",
    source: "CDC",
    sourceUrl: "https://www.cdc.gov/tobacco/",
  },
  {
    id: "5y",
    title: "5 years",
    startMs: 5 * 365 * DAY,
    endMs: null,
    shortBenefit: "Stroke risk often falls closer to that of a non-smoker over time.",
    detail:
      "Stroke risk commonly decreases over several years after quitting, approaching non-smoker levels for many people.",
    source: "CDC",
    sourceUrl: "https://www.cdc.gov/tobacco/",
  },
  {
    id: "10y",
    title: "10 years",
    startMs: 10 * 365 * DAY,
    endMs: null,
    shortBenefit: "Lung cancer death risk is often about half that of a continuing smoker.",
    detail:
      "Risk of dying from lung cancer is often roughly half that of people who continue smoking after about a decade smoke-free.",
    source: "CDC",
    sourceUrl: "https://www.cdc.gov/tobacco/",
  },
  {
    id: "15y",
    title: "15 years",
    startMs: 15 * 365 * DAY,
    endMs: null,
    shortBenefit: "Heart disease risk often approaches that of a non-smoker.",
    detail:
      "After around 15 years, risk of coronary heart disease is often close to that of someone who never smoked.",
    source: "CDC",
    sourceUrl: "https://www.cdc.gov/tobacco/",
  },
];

export type MilestoneStatus = "completed" | "current" | "upcoming";

export function getMilestoneStatus(
  milestone: Milestone,
  elapsedMs: number,
): MilestoneStatus {
  if (elapsedMs < milestone.startMs) return "upcoming";
  if (milestone.endMs != null && elapsedMs < milestone.endMs) return "current";
  if (milestone.endMs == null && elapsedMs >= milestone.startMs) {
    // Point milestone: current only until the next milestone starts
    return "completed";
  }
  return "completed";
}

export function getMilestoneStatuses(elapsedMs: number) {
  const nextUpcoming = MILESTONES.find((m) => elapsedMs < m.startMs);
  return MILESTONES.map((m) => {
    let status = getMilestoneStatus(m, elapsedMs);
    if (
      nextUpcoming &&
      m.id === nextUpcoming.id &&
      elapsedMs < m.startMs
    ) {
      status = "current";
    } else if (
      m.endMs != null &&
      elapsedMs >= m.startMs &&
      elapsedMs < m.endMs
    ) {
      status = "current";
    } else if (elapsedMs >= (m.endMs ?? m.startMs)) {
      status = "completed";
    } else if (elapsedMs < m.startMs) {
      status = nextUpcoming?.id === m.id ? "current" : "upcoming";
    }
    return { milestone: m, status };
  });
}
