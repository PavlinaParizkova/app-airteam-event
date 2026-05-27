import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

export type AccessLogEntry = {
  id: string;
  email: string;
  name: string;
  path: string;
  at: string;
};

const LOG_KEY = "access-log:entries";
const MAX_ENTRIES = 2000;

function getRedisConfig(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";
  return url && token ? { url, token } : null;
}

const DEV_LOG_FILE = process.env.VERCEL
  ? path.join("/tmp", "access-log.json")
  : path.join(process.cwd(), ".next", "access-log.json");

function devRead(): AccessLogEntry[] {
  try {
    return JSON.parse(fs.readFileSync(DEV_LOG_FILE, "utf-8")) as AccessLogEntry[];
  } catch {
    return [];
  }
}

function devWrite(entries: AccessLogEntry[]): void {
  try {
    fs.mkdirSync(path.dirname(DEV_LOG_FILE), { recursive: true });
    fs.writeFileSync(DEV_LOG_FILE, JSON.stringify(entries), "utf-8");
  } catch {
    /* ignore */
  }
}

export async function listAccessLogs(limit = 500): Promise<AccessLogEntry[]> {
  if (!getRedisConfig()) {
    return devRead().slice(0, limit);
  }
  const redis = new Redis(getRedisConfig()!);
  try {
    const entries = (await redis.get<AccessLogEntry[]>(LOG_KEY)) ?? [];
    return entries.slice(0, limit);
  } catch {
    return devRead().slice(0, limit);
  }
}

export async function appendAccessLog(entry: Omit<AccessLogEntry, "id">): Promise<void> {
  const full: AccessLogEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };

  if (!getRedisConfig()) {
    const entries = [full, ...devRead()].slice(0, MAX_ENTRIES);
    devWrite(entries);
    return;
  }

  const redis = new Redis(getRedisConfig()!);
  try {
    const existing = (await redis.get<AccessLogEntry[]>(LOG_KEY)) ?? [];
    await redis.set(LOG_KEY, [full, ...existing].slice(0, MAX_ENTRIES));
  } catch {
    const entries = [full, ...devRead()].slice(0, MAX_ENTRIES);
    devWrite(entries);
  }
}
