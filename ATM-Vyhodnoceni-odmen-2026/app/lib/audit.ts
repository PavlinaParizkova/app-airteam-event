/**
 * Audit log — kdo, kdy, co změnil. Per event.
 *
 * Redis key: `audit:{eventId}` — JSON array (LIFO order, nejnovější první).
 * Limit 500 záznamů per event, starší ořezány.
 *
 * Žádný delete API — log je append-only.
 */

import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

export type AuditAction =
  | "create"
  | "update-meta"
  | "update-team"
  | "update-approvals"
  | "update-checklist"
  | "update-results"
  | "update-deallog"
  | "update-kpitracking"
  | "submit"
  | "approve"
  | "send-to-finance"
  | "toggle-finance"
  | "toggle-paid"
  | "set-payment-type"
  | "delete";

export type AuditEntry = {
  id: string;
  at: string; // ISO
  who: { email: string; name: string };
  action: AuditAction;
  detail?: string; // human-readable kratká věta
  before?: unknown;
  after?: unknown;
};

const PREFIX = "audit:";
const MAX_ENTRIES = 500;

function getRedisConfig(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";
  return url && token ? { url, token } : null;
}

function isKvConfigured(): boolean {
  return getRedisConfig() !== null;
}

const DEV_FILE = process.env.VERCEL
  ? path.join("/tmp", "atm-audit.json")
  : path.join(process.cwd(), ".next", "atm-audit.json");

function devReadAll(): Record<string, AuditEntry[]> {
  try {
    return JSON.parse(fs.readFileSync(DEV_FILE, "utf-8")) as Record<
      string,
      AuditEntry[]
    >;
  } catch {
    return {};
  }
}

function devWriteAll(data: Record<string, AuditEntry[]>): void {
  try {
    fs.mkdirSync(path.dirname(DEV_FILE), { recursive: true });
    fs.writeFileSync(DEV_FILE, JSON.stringify(data), "utf-8");
  } catch {
    /* ignore */
  }
}

export async function recordAudit(
  eventId: string,
  who: { email: string; name: string },
  action: AuditAction,
  detail?: string,
  before?: unknown,
  after?: unknown,
): Promise<void> {
  const entry: AuditEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: new Date().toISOString(),
    who,
    action,
    detail,
    before,
    after,
  };

  if (!isKvConfigured()) {
    const all = devReadAll();
    const list = all[eventId] ?? [];
    all[eventId] = [entry, ...list].slice(0, MAX_ENTRIES);
    devWriteAll(all);
    return;
  }

  const cfg = getRedisConfig()!;
  const redis = new Redis(cfg);
  try {
    const existing =
      (await redis.get<AuditEntry[]>(`${PREFIX}${eventId}`)) ?? [];
    await redis.set(
      `${PREFIX}${eventId}`,
      [entry, ...existing].slice(0, MAX_ENTRIES),
    );
  } catch (err) {
    console.warn("[audit] write failed:", err);
  }
}

export async function listAudit(
  eventId: string,
  limit = 200,
): Promise<AuditEntry[]> {
  if (!isKvConfigured()) {
    const all = devReadAll();
    return (all[eventId] ?? []).slice(0, limit);
  }
  const cfg = getRedisConfig()!;
  const redis = new Redis(cfg);
  try {
    const list =
      (await redis.get<AuditEntry[]>(`${PREFIX}${eventId}`)) ?? [];
    return list.slice(0, limit);
  } catch {
    return [];
  }
}
