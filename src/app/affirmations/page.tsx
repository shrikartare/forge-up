"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AffirmationsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/reinforce");
  }, [router]);
  return (
    <p className="text-sm text-muted-foreground">
      Opening Reinforce…
    </p>
  );
}
