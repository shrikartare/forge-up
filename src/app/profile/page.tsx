"use client";

import { useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Database,
  Palette,
  Trophy,
  User,
} from "lucide-react";
import { RequireProfile } from "@/components/RequireProfile";
import { useProfile } from "@/components/ProfileProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  exportProfileJson,
  importProfileJson,
  type Profile,
} from "@/lib/profile";
import {
  fromDateInputValue,
  toDateInputValue,
  MS_PER_DAY,
} from "@/lib/format";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { assetPath } from "@/lib/milestoneVisuals";

function ProfileContent() {
  const { profile, setProfile, updateProfile, resetProfile, progress } =
    useProfile();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [resetText, setResetText] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  if (!profile) return null;

  function saveField<K extends keyof Profile>(key: K, value: Profile[K]) {
    updateProfile({ [key]: value } as Partial<Profile>);
    setStatus("Saved.");
  }

  function downloadExport() {
    const blob = new Blob([exportProfileJson(profile!)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "forgeup-profile.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Export downloaded.");
  }

  async function onImport(file: File | null) {
    if (!file) return;
    setError("");
    try {
      const text = await file.text();
      const next = importProfileJson(text);
      setProfile(next);
      setStatus("Profile imported.");
    } catch {
      setError("Import failed. File must be a valid ForgeUp profile JSON.");
    }
  }

  function doReset() {
    if (resetText !== "RESET") {
      setError('Type RESET to confirm.');
      return;
    }
    resetProfile();
    router.replace("/onboarding");
  }

  const unlocked = new Set(profile.unlockedAchievementIds ?? []);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set your quit data here. Everything stays in this browser&apos;s
          localStorage — export a backup before clearing site data.
        </p>
      </header>

      <div className="relative overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPath("/media/profile/header.jpg")}
          alt=""
          className="aspect-[21/9] w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetPath("/media/profile/avatar.webp")}
            alt=""
            className="size-16 rounded-full border-2 border-white object-cover shadow"
          />
          <div className="min-w-0 pb-0.5">
            <p className="truncate text-lg font-semibold text-white">
              {profile.name}
            </p>
            <p className="text-xs text-white/85">Your ForgeUp profile</p>
          </div>
        </div>
      </div>

      <Card className="space-y-3">
        <p className="flex items-center gap-2 font-medium">
          <User className="size-4 text-primary" aria-hidden />
          Quit & habit
        </p>
        <label className="block space-y-1 text-sm">
          <span>Name</span>
          <Input
            defaultValue={profile.name}
            onBlur={(e) =>
              e.target.value.trim() && saveField("name", e.target.value.trim())
            }
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden />
            Quit date
          </span>
          <Input
            type="date"
            defaultValue={toDateInputValue(profile.quitAt)}
            onBlur={(e) => {
              try {
                saveField("quitAt", fromDateInputValue(e.target.value));
              } catch {
                setError("Invalid quit date.");
              }
            }}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Cigarettes per day</span>
          <Input
            type="number"
            defaultValue={profile.cigarettesPerDay}
            onBlur={(e) => {
              const n = Number(e.target.value);
              if (n > 0) saveField("cigarettesPerDay", n);
            }}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Price per cigarette (₹)</span>
          <Input
            type="number"
            defaultValue={profile.pricePerCigarette}
            onBlur={(e) => {
              const n = Number(e.target.value);
              if (n > 0) {
                saveField("pricePerCigarette", n);
                saveField("currency", "INR");
              }
            }}
          />
        </label>
        <fieldset className="space-y-2">
          <legend className="text-sm">Motivations (select all that apply)</legend>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Motivations">
            {[
              "Improve health",
              "Save money",
              "Improve fitness",
              "Family",
              "Regain control",
              "Personal reason",
            ].map((m) => {
              const selected = (profile.motivations ?? []).includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    const current = [...(profile.motivations ?? [])];
                    const next = selected
                      ? current.filter((x) => x !== m)
                      : [...current, m];
                    updateProfile({
                      motivations: next.length ? next : undefined,
                      motivation: next.length ? next.join(" · ") : undefined,
                    });
                    setStatus("Saved.");
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </fieldset>
      </Card>

      <Card className="space-y-3">
        <p className="flex items-center gap-2 font-medium">
          <Palette className="size-4 text-primary" aria-hidden />
          Preferences
        </p>
        <label className="block space-y-1 text-sm">
          <span>Theme</span>
          <select
            className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
            value={theme ?? "system"}
            onChange={(e) => {
              setTheme(e.target.value);
              saveField(
                "theme",
                e.target.value as Profile["theme"],
              );
            }}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={profile.remindersEnabled ?? false}
            onChange={(e) => saveField("remindersEnabled", e.target.checked)}
          />
          Reminder preference (local only — no push in MVP)
        </label>
        <label className="block space-y-1 text-sm">
          <span>Reminder time</span>
          <Input
            type="time"
            defaultValue={profile.reminderTime ?? "09:00"}
            onBlur={(e) => saveField("reminderTime", e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Reinforce cadence</span>
          <select
            className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
            value={profile.reinforce?.cadence ?? "daily"}
            onChange={(e) =>
              updateProfile({
                reinforce: {
                  ...profile.reinforce,
                  cadence: e.target.value as "daily" | "weekly",
                },
              })
            }
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
      </Card>

      <Card className="space-y-2">
        <p className="flex items-center gap-2 font-medium">
          <Trophy className="size-4 text-primary" aria-hidden />
          Achievements
        </p>
        <ul className="space-y-1 text-sm">
          {ACHIEVEMENTS.map((a) => (
            <li key={a.id} className="flex justify-between gap-2">
              <span>{a.title}</span>
              <span className="text-muted-foreground">
                {unlocked.has(a.id) ? "Unlocked" : "Locked"}
              </span>
            </li>
          ))}
        </ul>
        {progress && (
          <p className="text-xs text-muted-foreground">
            Progress recalculates when you open the app or change profile data.
          </p>
        )}
      </Card>

      <Card className="space-y-3">
        <p className="flex items-center gap-2 font-medium">
          <Database className="size-4 text-primary" aria-hidden />
          Data
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={downloadExport}>
            Export JSON
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
          >
            Import JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => onImport(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">
            Reset deletes your local profile. Type RESET to confirm.
          </p>
          <Input
            value={resetText}
            onChange={(e) => setResetText(e.target.value)}
            placeholder="RESET"
          />
          <Button type="button" variant="danger" onClick={doReset}>
            Reset all data
          </Button>
        </div>
      </Card>

      <Card className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Assumptions</p>
        <p className="mt-1">
          Daily cost = cigarettes/day × price/cigarette. Elapsed day = ms /{" "}
          {MS_PER_DAY.toLocaleString()}. Estimates only.
        </p>
      </Card>

      {status && (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      )}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireProfile>
      <ProfileContent />
    </RequireProfile>
  );
}
