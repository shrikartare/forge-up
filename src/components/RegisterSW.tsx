"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    navigator.serviceWorker
      .register(`${base}/sw.js`)
      .then((registration) => registration.update())
      .catch(() => {
        /* ignore */
      });
  }, []);
  return null;
}
