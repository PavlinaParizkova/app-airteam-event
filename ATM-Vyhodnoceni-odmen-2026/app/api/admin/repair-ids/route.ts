/**
 * Repair endpoint — obnoví `event:ids` ze skutečných dat v Redis.
 *
 * POST /api/admin/repair-ids
 *
 * Bezpečné: jen čte meta slice každého známého ID a pokud existuje,
 * přidá ID do event:ids. Žádná data se nemění ani nemaže.
 *
 * Vyžaduje admin session.
 */

import { NextResponse } from "next/server";
import { getAuth } from "@/app/lib/getAuth";
import { readSlice, addEventId, listEventIds, type MetaSlice } from "@/app/lib/store";
import { EVENTS } from "@/data/events";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getAuth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const currentIds = new Set(await listEventIds());
  const restored: string[] = [];
  const alreadyPresent: string[] = [];
  const missing: string[] = [];

  for (const seed of EVENTS) {
    const meta = await readSlice<MetaSlice>(seed.id, "meta");
    if (!meta) {
      missing.push(seed.id);
      continue;
    }
    if (currentIds.has(seed.id)) {
      alreadyPresent.push(seed.id);
    } else {
      await addEventId(seed.id);
      restored.push(seed.id);
    }
  }

  return NextResponse.json({
    ok: true,
    restored,
    alreadyPresent,
    missing,
    note: "Pouze event:ids obnoven. Data eventů nebyla změněna.",
  });
}
