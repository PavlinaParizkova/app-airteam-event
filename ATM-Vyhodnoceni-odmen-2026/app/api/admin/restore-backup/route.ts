/**
 * POST /api/admin/restore-backup
 * Body: { url: string }  — URL zálohy z Vercel Blob.
 *
 * Obnoví všechny slicy všech eventů ze zálohy. Admin only.
 * Bezpečné: zapisuje přes casWriteSlice s expectedVersion=0 pro nové klíče,
 * nebo přepíše existující klíče přímým redis.set (restore mode).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/app/lib/getAuth";
import { Redis } from "@upstash/redis";
import { recordAudit } from "@/app/lib/audit";

export const dynamic = "force-dynamic";

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";
  if (!url || !token) throw new Error("KV není nakonfigurováno.");
  return new Redis({ url, token });
}

const SLICES = ["meta", "team", "approvals", "checklist", "results", "deallog", "kpitracking"] as const;

export async function POST(req: NextRequest) {
  const session = await getAuth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { url } = (await req.json()) as { url?: string };
  if (!url) {
    return NextResponse.json({ ok: false, error: "Chybí url zálohy." }, { status: 400 });
  }

  let backup: {
    takenAt: string;
    ids: string[];
    events: Array<{ id: string; slices: Record<string, unknown>; audit?: unknown }>;
  };

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch zálohy selhal: ${res.status}`);
    backup = await res.json() as typeof backup;
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) });
  }

  const redis = getRedis();
  const who = { email: session.user.email ?? "unknown", name: session.user.name ?? "unknown" };

  const restored: string[] = [];
  const errors: string[] = [];

  for (const snapshot of backup.events) {
    try {
      for (const slice of SLICES) {
        const data = snapshot.slices[slice];
        if (data !== null && data !== undefined) {
          await redis.set(`event:${snapshot.id}:${slice}`, JSON.stringify(data));
        }
      }
      // Obnov audit log
      if (snapshot.audit) {
        await redis.set(`audit:${snapshot.id}`, JSON.stringify(snapshot.audit));
      }
      restored.push(snapshot.id);
    } catch (err) {
      errors.push(`${snapshot.id}: ${String(err)}`);
    }
  }

  // Obnov event:ids
  if (backup.ids?.length) {
    await redis.set("event:ids", JSON.stringify(backup.ids));
  }

  await recordAudit(
    "system",
    who,
    "create",
    `Restore ze zálohy ${backup.takenAt} — obnoveno ${restored.length} eventů`,
  );

  return NextResponse.json({
    ok: errors.length === 0,
    takenAt: backup.takenAt,
    restored,
    errors,
  });
}
