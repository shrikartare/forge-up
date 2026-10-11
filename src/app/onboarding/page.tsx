"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/components/ProfileProvider";
import { fromDateInputValue, toDateInputValue } from "@/lib/format";
import type { Profile } from "@/lib/profile";

const MOTIVATIONS = [
  "Improve health",
  "Save money",
  "Improve fitness",
  "Family",
  "Regain control",
  "Personal reason",
] as const;

export default function OnboardingPage() {
  const { profile, ready, setProfile } = useProfile();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [motivations, setMotivations] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState("");
  const [cigarettesPerDay, setCigarettesPerDay] = useState("10");
  const [pricePerCigarette, setPricePerCigarette] = useState("20");
  const [quitDate, setQuitDate] = useState(() => toDateInputValue(Date.now()));
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && profile) router.replace("/");
  }, [ready, profile, router]);

  function finish() {
    setError("");
    const cigs = Number(cigarettesPerDay);
    const price = Number(pricePerCigarette);
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!(cigs > 0) || !(price > 0)) {
      setError("Cigarettes per day and price per cigarette must be positive.");
      return;
    }
    let quitAt: string;
    try {
      quitAt = fromDateInputValue(quitDate);
    } catch {
      setError("Enter a valid quit date.");
      return;
    }

    const displayLabels = motivations.map((m) =>
      m === "Personal reason" ? customReason.trim() || m : m,
    );
    const next: Profile = {
      schemaVersion: 1,
      name: name.trim(),
      quitAt,
      cigarettesPerDay: cigs,
      pricePerCigarette: price,
      currency: "INR",
      motivations: motivations.length ? motivations : undefined,
      motivation: displayLabels.length ? displayLabels.join(" · ") : undefined,
      theme: "system",
      reinforce: { cadence: "daily", playCount: 0, completedModuleIds: [] },
      journal: [],
      goals: [],
      unlockedAchievementIds: [],
    };
    setProfile(next);
    router.replace("/");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-primary">ForgeUp</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every smoke-free day moves you forward.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">Step {step} of 3</p>
      </header>

      {step === 1 && (
        <Card className="space-y-4">
          <h2 className="font-medium">About you</h2>
          <label className="block space-y-1 text-sm">
            <span>Name</span>
            <Input
              aria-label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-sm">
              Motivation (optional — select all that apply)
            </legend>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Motivations"
            >
              {MOTIVATIONS.map((m) => {
                const selected = motivations.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setMotivations((prev) =>
                        selected ? prev.filter((x) => x !== m) : [...prev, m],
                      )
                    }
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
            {motivations.includes("Personal reason") && (
              <Input
                placeholder="Your personal reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                aria-label="Personal reason"
              />
            )}
          </fieldset>
          <Button type="button" className="w-full" onClick={() => setStep(2)}>
            Continue
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="space-y-4">
          <h2 className="font-medium">Smoking habits</h2>
          <label className="block space-y-1 text-sm">
            <span>Cigarettes per day</span>
            <Input
              type="number"
              min={0.1}
              step="any"
              value={cigarettesPerDay}
              onChange={(e) => setCigarettesPerDay(e.target.value)}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Price per cigarette (₹)</span>
            <Input
              type="number"
              min={0.01}
              step="any"
              value={pricePerCigarette}
              onChange={(e) => setPricePerCigarette(e.target.value)}
              aria-label="Price per cigarette in rupees"
            />
          </label>
          <p className="text-xs text-muted-foreground">
            Amounts are in Indian rupees (₹). Used only to estimate savings.
            Stored on this device.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" className="flex-1" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-4">
          <h2 className="font-medium">Quit date</h2>
          <label className="block space-y-1 text-sm">
            <span>Quit date</span>
            <Input
              type="date"
              value={quitDate}
              onChange={(e) => setQuitDate(e.target.value)}
              aria-label="Quit date"
            />
          </label>
          <p className="text-xs text-muted-foreground">
            Defaults to today. Past dates start your count. Future dates show
            days until quit — no negative progress.
          </p>
          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="button" className="flex-1" onClick={finish}>
              Start tracking
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
