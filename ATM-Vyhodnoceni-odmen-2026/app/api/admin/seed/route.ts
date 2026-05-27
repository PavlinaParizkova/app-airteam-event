/**
 * Explicit admin reseed — žádný silent auto-seed. Volat ručně.
 *
 * POST /api/admin/seed                 → vytvoří jen ty eventy ze static `EVENTS`,
 *                                         které ještě v KV neexistují (idempotent)
 * POST /api/admin/seed?force=true      → DROP + reseed všech eventů (DANGER)
 *
 * Vyžaduje admin session.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/app/lib/getAuth";
import {
  createEventSlices,
  deleteEventSlices,
  listEventIds,
  readSlice,
  type MetaSlice,
} from "@/app/lib/store";
import { recordAudit } from "@/app/lib/audit";
import { EVENTS, DEFAULT_CHECKLIST } from "@/data/events";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAuth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const force = new URL(req.url).searchParams.get("force") === "true";
  const who = {
    email: session.user.email ?? "unknown",
    name: session.user.name ?? "unknown",
  };

  const existing = new Set(await listEventIds());
  const created: string[] = [];
  const skipped: string[] = [];
  const recreated: string[] = [];

  for (const seed of EVENTS) {
    const inStore = existing.has(seed.id);
    if (inStore && !force) {
      skipped.push(seed.id);
      continue;
    }

    const seedFull = {
      ...seed,
      checklist: seed.checklist ?? DEFAULT_CHECKLIST.map((i) => ({ ...i })),
      dealLog: seed.dealLog ?? [],
    };

    if (inStore && force) {
      // Backup before drop
      const meta = await readSlice<MetaSlice>(seed.id, "meta");
      await recordAudit(
        seed.id,
        who,
        "delete",
        `Force reseed — admin dropped event ${seed.id}`,
        meta,
        undefined,
      );
      await deleteEventSlices(seed.id);
      const res = await createEventSlices(seedFull);
      if (res.ok) {
        recreated.push(seed.id);
        await recordAudit(seed.id, who, "create", "Force reseed — vytvořeno ze static EVENTS", undefined, seedFull);
      }
    } else {
      const res = await createEventSlices(seedFull);
      if (res.ok) {
        created.push(seed.id);
        await recordAudit(seed.id, who, "create", "Seed — vytvořeno ze static EVENTS", undefined, seedFull);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    created,
    recreated,
    skipped,
    force,
    by: who,
  });
}
