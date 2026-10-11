"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearProfile,
  loadProfile,
  saveProfile,
  type Profile,
} from "@/lib/profile";
import { computeProgress, type Progress } from "@/lib/calc";

type ProfileContextValue = {
  profile: Profile | null;
  ready: boolean;
  progress: Progress | null;
  now: number;
  setProfile: (profile: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  resetProfile: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setTimeout(() => {
      setProfileState(loadProfile());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (!document.hidden) setNow(Date.now());
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const setProfile = useCallback((next: Profile) => {
    saveProfile(next);
    setProfileState(next);
    setNow(Date.now());
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfileState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      saveProfile(next);
      return next;
    });
    setNow(Date.now());
  }, []);

  const resetProfile = useCallback(() => {
    clearProfile();
    setProfileState(null);
    setNow(Date.now());
  }, []);

  const progress = useMemo(
    () => (profile ? computeProgress(profile, now) : null),
    [profile, now],
  );

  const value = useMemo(
    () => ({
      profile,
      ready,
      progress,
      now,
      setProfile,
      updateProfile,
      resetProfile,
    }),
    [profile, ready, progress, now, setProfile, updateProfile, resetProfile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
