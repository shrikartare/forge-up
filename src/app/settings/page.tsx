"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Old Settings bookmarks redirect to Profile. */
export default function SettingsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/profile");
  }, [router]);
  return (
    <p className="text-sm text-muted-foreground" role="status">
      Redirecting to Profile…
    </p>
  );
}
