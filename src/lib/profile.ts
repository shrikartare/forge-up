import { z } from "zod";

const STORAGE_KEY = "forgeup.profile";
/** Legacy key from the SmokeFree brand; migrated on first load. */
const LEGACY_STORAGE_KEY = "smokefree.profile";

export const JournalEntrySchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  mood: z.enum(["calm", "okay", "low"]).optional(),
  cravingIntensity: z.number().min(1).max(10).optional(),
  triggers: z.array(z.string()).default([]),
  notes: z.string().optional(),
  smoked: z.boolean().default(false),
});

export const SavingsGoalSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  targetAmount: z.number().positive(),
  targetDate: z.string().optional(),
  createdAt: z.string(),
});

export const ProfileSchema = z.object({
  schemaVersion: z.literal(1),
  name: z.string().min(1).max(80),
  quitAt: z.string().min(1),
  cigarettesPerDay: z.number().positive().max(200),
  pricePerCigarette: z.number().positive().max(1000),
  currency: z.string().min(3).max(3).default("INR"),
  averageMinutesPerCigarette: z.number().positive().max(60).optional(),
  /** Selected motivation chips (multi-select). */
  motivations: z.array(z.string().max(80)).max(12).optional(),
  /** Optional custom / display string (e.g. personal reason text or joined labels). */
  motivation: z.string().max(400).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  remindersEnabled: z.boolean().optional(),
  reminderTime: z.string().optional(),
  reinforce: z
    .object({
      lastPlayedAt: z.string().optional(),
      playCount: z.number().int().nonnegative().optional(),
      cadence: z.enum(["daily", "weekly"]).optional(),
      completedModuleIds: z.array(z.string()).optional(),
      completedScriptIds: z.array(z.string()).optional(),
    })
    .optional(),
  affirmations: z
    .object({
      lastReinforcedOn: z.string().optional(),
      streak: z.number().int().nonnegative().optional(),
    })
    .optional(),
  videoWatches: z
    .object({
      byDay: z.array(
        z.object({
          date: z.string(),
          counts: z.record(z.string(), z.number().int().nonnegative()),
        }),
      ),
    })
    .optional(),
  /** Kept for import compatibility; Journal UI removed. */
  journal: z.array(JournalEntrySchema).optional(),
  goals: z.array(SavingsGoalSchema).optional(),
  unlockedAchievementIds: z.array(z.string()).optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type JournalEntry = z.infer<typeof JournalEntrySchema>;
export type SavingsGoal = z.infer<typeof SavingsGoalSchema>;

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  let raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      raw = legacy;
    }
  }
  if (!raw) return null;
  try {
    return ProfileSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile): void {
  const parsed = ProfileSchema.parse(profile);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function clearProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function exportProfileJson(profile: Profile): string {
  return JSON.stringify(ProfileSchema.parse(profile), null, 2);
}

export function importProfileJson(raw: string): Profile {
  return ProfileSchema.parse(JSON.parse(raw));
}

export function createId(): string {
  return crypto.randomUUID();
}
