import type { LucideIcon } from "lucide-react";
import {
  AirVent,
  Baby,
  Droplets,
  Heart,
  HeartHandshake,
  HeartPulse,
  Shield,
  Smile,
  Sparkles,
  Utensils,
  Wind,
} from "lucide-react";

export type MilestoneVisual = {
  icon: LucideIcon;
  media: string;
};

/** One distinct Lucide badge + illustration path per milestone id. */
const VISUALS: Record<string, MilestoneVisual> = {
  "20m": { icon: HeartPulse, media: "/media/health/20m.jpg" },
  "24h": { icon: Wind, media: "/media/health/24h.jpg" },
  "48h": { icon: Utensils, media: "/media/health/48h.jpg" },
  "72h": { icon: AirVent, media: "/media/health/72h.jpg" },
  "2w-3m": { icon: Droplets, media: "/media/health/2w-3m.jpg" },
  reproductive: { icon: Baby, media: "/media/health/reproductive.jpg" },
  "1-9m": { icon: Smile, media: "/media/health/1-9m.jpg" },
  "1y": { icon: Heart, media: "/media/health/1y.jpg" },
  "5y": { icon: Shield, media: "/media/health/5y.jpg" },
  "10y": { icon: HeartHandshake, media: "/media/health/10y.jpg" },
  "15y": { icon: Sparkles, media: "/media/health/15y.jpg" },
};

export function getMilestoneVisual(milestoneId: string): MilestoneVisual {
  return VISUALS[milestoneId] ?? {
    icon: HeartPulse,
    media: "/media/health/20m.jpg",
  };
}

export function assetPath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!path.startsWith("/")) return path;
  return `${base}${path}`;
}
