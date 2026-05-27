/**
 * Denní backup všech event sliceů + audit logů do Vercel Blob.
 *
 * Spouští se přes Vercel Cron (viz `vercel.json`) — `0 3 * * *` (3:00 UTC).
 *
 * Ochrana:
 *   - Vercel automaticky posílá hlavičku `Authorization: Bearer ${CRON_SECRET}`.
 *     Pokud `CRON_SECRET` není nastaven, route je dostupná pouze v dev režimu.
 *   - Backup je uložen jako JSON do bucketu `backups/` s ISO timestampem.
 *
 * Co se backupuje:
 *   - `event:ids`
 *   - Pro každé ID — všech 7 sliceů (meta/team/approvals/checklist/results/deallog/kpitracking)
 *   - `audit:{id}` — full audit log per event
 */

import { type NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLICES = [
  "meta",
  "team",
  "approvals",
  "checklist",
  "results",
  "deallog",
  "kpitracking",
] as const;

type EventSnapshot = {
  id: string;
  slices: Record<string, unknown>;
  audit: unknown;
};

type Backup = {
  takenAt: string;
  eventCount: number;
  ids: string[];
  events: EventSnapshot[];
};

function authorize(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error("KV není nakonfigurováno — backup nelze provést.");
  }
  return new Redis({ url, token });
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let redis: Redis;
  try {
    redis = getRedis();
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN není nastaven — backup nelze uložit." },
      { status: 500 },
    );
  }

  const takenAt = new Date().toISOString();
  const ids = (await redis.get<string[]>("event:ids")) ?? [];

  const snapshots: EventSnapshot[] = [];
  for (const id of ids) {
    const slices: Record<string, unknown> = {};
    for (const slice of SLICES) {
      const v = await redis.get(`event:${id}:${slice}`);
      slices[slice] = v ?? null;
    }
    const audit = (await redis.get(`audit:${id}`)) ?? [];
    snapshots.push({ id, slices, audit });
  }

  const backup: Backup = {
    takenAt,
    eventCount: ids.length,
    ids,
    events: snapshots,
  };

  // Filename: backups/2026-05-25T03-00-12-123Z.json
  const safeTimestamp = takenAt.replace(/[:.]/g, "-");
  const filename = `backups/${safeTimestamp}.json`;

  const blob = await put(filename, JSON.stringify(backup, null, 2), {
    access: "public",
    contentType: "application/json",
    token: blobToken,
    addRandomSuffix: false,
  });

  return NextResponse.json({
    ok: true,
    takenAt,
    eventCount: ids.length,
    blobUrl: blob.url,
    pathname: blob.pathname,
  });
}
