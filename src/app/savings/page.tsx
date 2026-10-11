"use client";

import { useState } from "react";
import { RequireProfile } from "@/components/RequireProfile";
import { useProfile } from "@/components/ProfileProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createId, type SavingsGoal } from "@/lib/profile";
import { formatCurrency, MS_PER_DAY } from "@/lib/format";

function SavingsContent() {
  const { profile, progress, updateProfile } = useProfile();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  if (!profile || !progress) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading…
      </p>
    );
  }

  const daily = progress.dailyCost;
  const moneySavedRounded = Math.round(progress.moneySaved);
  const daysFloor = Math.max(0, Math.floor(progress.daysElapsed));
  const quitLabel = new Date(progress.quitAtMs).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
  const keepGoing = [
    { label: "1 month", days: 30 },
    { label: "3 months", days: 90 },
    { label: "1 year", days: 365 },
  ].map((row) => ({
    ...row,
    money: Math.round(daily * row.days),
  }));

  function addGoal() {
    setError("");
    const targetAmount = Number(amount);
    if (!title.trim() || !(targetAmount > 0)) {
      setError("Enter a title and positive target amount.");
      return;
    }
    const goal: SavingsGoal = {
      id: createId(),
      title: title.trim(),
      targetAmount,
      createdAt: new Date().toISOString(),
    };
    updateProfile({ goals: [...(profile!.goals ?? []), goal] });
    setTitle("");
    setAmount("");
  }

  function removeGoal(id: string) {
    updateProfile({
      goals: (profile!.goals ?? []).filter((g) => g.id !== id),
    });
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Savings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estimated money not spent on cigarettes — the app does not hold funds.
        </p>
      </header>

      <Card className="space-y-2 bg-primary/5 text-center ring-1 ring-primary/15">
        <p className="text-sm text-muted-foreground">Saved since quit</p>
        <p className="text-4xl font-semibold tabular-nums tracking-tight text-primary sm:text-5xl">
          {formatCurrency(moneySavedRounded, profile.currency)}
        </p>
        <p className="text-sm text-muted-foreground">
          Since {quitLabel} · {daysFloor} smoke-free days
        </p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(Math.round(daily), profile.currency)} / day
        </p>
      </Card>

      <Card className="space-y-3">
        <p className="font-medium">If you stay smoke-free</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {keepGoing.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-border bg-muted/40 px-2 py-3"
            >
              <p className="text-xs text-muted-foreground">{row.label}</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                {formatCurrency(row.money, profile.currency)}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          At your current pack rate (
          {formatCurrency(Math.round(daily), profile.currency)}/day)
        </p>
      </Card>

      <Card className="space-y-3">
        <p className="font-medium">Goals</p>
        <ul className="space-y-3">
          {(profile.goals ?? []).map((goal) => {
            const remaining = Math.max(0, goal.targetAmount - moneySavedRounded);
            const pct = Math.min(
              100,
              (moneySavedRounded / goal.targetAmount) * 100,
            );
            const daysLeft = daily > 0 ? Math.ceil(remaining / daily) : null;
            return (
              <li
                key={goal.id}
                className="space-y-1 border-b border-border pb-3 last:border-0"
              >
                <div className="flex justify-between gap-2">
                  <p className="font-medium">{goal.title}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoal(goal.id)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(moneySavedRounded, profile.currency)} of{" "}
                  {formatCurrency(goal.targetAmount, profile.currency)}
                  {remaining > 0 && daysLeft != null
                    ? ` · ~${daysLeft} days at current rate`
                    : " · reached"}
                </p>
              </li>
            );
          })}
        </ul>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Goal title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Target amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <Button type="button" onClick={addGoal}>
          Add goal
        </Button>
      </Card>

      <p className="text-xs text-muted-foreground">
        Daily cost = cigarettes/day × price. Day = {MS_PER_DAY.toLocaleString()}{" "}
        ms. Estimates only.
      </p>
    </div>
  );
}

export default function SavingsPage() {
  return (
    <RequireProfile>
      <SavingsContent />
    </RequireProfile>
  );
}
