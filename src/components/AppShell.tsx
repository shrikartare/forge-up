"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartPulse,
  Home,
  PiggyBank,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { assetPath } from "@/lib/milestoneVisuals";
import type { ReactNode } from "react";
import { useProfile } from "./ProfileProvider";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/savings", label: "Savings", icon: PiggyBank, desktopOnly: true },
  { href: "/reinforce", label: "Reinforce", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { ready, profile } = useProfile();
  const hideNav =
    pathname.startsWith("/onboarding") || !ready || !profile;
  const profileActive = pathname.startsWith("/profile");

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {!hideNav && (
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 border-r border-border bg-card p-4 md:flex md:flex-col">
          <div className="mb-8 px-2">
            <p className="text-lg font-semibold text-primary">ForgeUp</p>
            <p className="text-xs text-muted-foreground">
              Local-first quit tracker
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      <div className={cn(!hideNav && "md:pl-56")}>
        {!hideNav && (
          <div className="mx-auto flex w-full max-w-2xl items-center px-4 pt-4 md:pt-6">
            <Link
              href="/profile"
              aria-label="Profile"
              className={cn(
                "flex size-10 items-center justify-center overflow-hidden rounded-full border-2 bg-primary/15 text-primary transition",
                profileActive
                  ? "border-primary"
                  : "border-transparent hover:border-primary/40",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assetPath("/media/profile/avatar.webp")}
                alt=""
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
              <User className="size-5 hidden" aria-hidden />
            </Link>
          </div>
        )}
        <main
          className={cn(
            "mx-auto w-full max-w-2xl px-4 pb-24 md:pb-10",
            hideNav ? "pt-6 md:pt-8" : "pt-3 md:pt-4",
          )}
        >
          {children}
        </main>
      </div>

      {!hideNav && (
        <nav
          className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card md:hidden"
          aria-label="Mobile"
        >
          <ul className="mx-auto grid max-w-lg grid-cols-4">
            {NAV.filter((n) => !("desktopOnly" in n && n.desktopOnly)).map(
              (item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex flex-col items-center gap-1 py-2.5 text-[11px]",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              },
            )}
          </ul>
        </nav>
      )}
    </div>
  );
}
