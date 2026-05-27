"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

/** Zaznamená otevření stránky (jen přihlášený uživatel). */
export default function AccessLogRecorder() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const lastKey = useRef<string>("");

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;
    const key = `${session.user.email}|${pathname}`;
    if (lastKey.current === key) return;
    lastKey.current = key;

    void fetch("/api/access-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    });
  }, [pathname, session?.user?.email, status]);

  return null;
}
