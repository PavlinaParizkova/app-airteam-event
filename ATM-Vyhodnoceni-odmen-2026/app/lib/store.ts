/**
 * Sliced event store with optimistic concurrency control.
 *
 * Data je rozdělená do nezávislých klíčů — admin editor (`team`) a finance toggle
 * (`approvals`) si tak vzájemně nepřepisují stav. Každý slice má `version` a
 * každý zápis projde přes Lua CAS skript v Upstash. Při neshodě verze vrátíme
 * `conflict` a UI prompne uživatele na refresh.
 *
 * Architektura:
 *   event:{id}:meta        — basic metadata + status + sazby + KPI pásma
 *   event:{id}:team        — salesTeam, nesalesTeam, prepTeam
 *   event:{id}:approvals   — dealApprovals (finance flow Skupiny 1)
 *   event:{id}:checklist   — checklist po eventu
 *   event:{id}:results     — eventResults
 *   event:{id}:deallog     — dealLog (deals přidávané po eventu)
 *   event:{id}:kpitracking — salesKpiTracking + prepKpiTracking
 *   event:ids              — string[] všech ID
 *
 * Žádný silent seed, žádný runtime fallback na static `EVENTS` — chyby jsou hlučné.
 */

import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";
import {
  type EventData,
  type SalesEntry,
  type NesalesEntry,
  type PrepEntry,
  type DealApproval,
  type ChecklistItem,
  type EventResult,
  type DealEntry,
  type SalesPersonTracking,
  type PrepPersonTracking,
  type ApprovalStatus,
  type KpiBand,
  type PrepBandDef,
  type Approver,
  type OemDeal,
} from "@/data/events";

// ── Slice typy ───────────────────────────────────────────────────────────────

export type MetaSlice = {
  id: string;
  name: string;
  shortName: string;
  location: string;
  dateStart: string;
  dateEnd: string;
  processedDate: string;
  owner: string;
  division: string;
  approvalDeadline: string;
  status: ApprovalStatus;
  dailyRateSales: number;
  dailyRateNesales: number;
  dealBonusNote?: string;
  kpiApprover: string;
  kpiBands: KpiBand[];
  prepBands: PrepBandDef[];
  prepTeamNote?: string;
  prepTeamLabel?: string;
  approvers: Approver[];
  approvalNote?: string;
  lastModified?: string;
  grandTotal: number;
  fixTotal: number;
  variableTotal: number;
  version: number;
};

export type TeamSlice = {
  salesTeam: SalesEntry[];
  nesalesTeam: NesalesEntry[];
  prepTeam: PrepEntry[];
  version: number;
};

export type ApprovalsSlice = {
  dealApprovals: DealApproval[];
  version: number;
};

export type ChecklistSlice = {
  checklist: ChecklistItem[];
  version: number;
};

export type ResultsSlice = {
  eventResults: EventResult[];
  version: number;
};

export type DealLogSlice = {
  dealLog: DealEntry[];
  version: number;
};

export type KpiTrackingSlice = {
  salesKpiTracking: SalesPersonTracking[];
  prepKpiTracking: PrepPersonTracking[];
  version: number;
};

export type OemDealsSlice = {
  oemDeals: OemDeal[];
  version: number;
};

export type EventVersions = {
  meta: number;
  team: number;
  approvals: number;
  checklist: number;
  results: number;
  dealLog: number;
  kpiTracking: number;
  oemDeals: number;
};

export type EventWithVersions = EventData & { versions: EventVersions };

export type SliceName =
  | "meta"
  | "team"
  | "approvals"
  | "checklist"
  | "results"
  | "deallog"
  | "kpitracking"
  | "oemdeals";

// ── CAS výsledek ─────────────────────────────────────────────────────────────

export type CasResult =
  | { status: "ok"; version: number }
  | { status: "conflict"; currentVersion: number }
  | { status: "missing"; currentVersion: 0 }
  | { status: "corrupted"; currentVersion: -1 };

export class StoreConflictError extends Error {
  constructor(
    public readonly slice: SliceName,
    public readonly eventId: string,
    public readonly currentVersion: number,
  ) {
    super(
      `Conflict on ${slice} of event ${eventId}: expected version differs from server version ${currentVersion}.`,
    );
    this.name = "StoreConflictError";
  }
}

export class StoreUnavailableError extends Error {
  constructor(reason: string) {
    super(`Store unavailable: ${reason}`);
    this.name = "StoreUnavailableError";
  }
}

// ── Konfigurace ──────────────────────────────────────────────────────────────

const PREFIX = "event:";
const IDS_KEY = "event:ids";

function sliceKey(id: string, slice: SliceName): string {
  return `${PREFIX}${id}:${slice}`;
}

function getRedisConfig(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";
  return url && token ? { url, token } : null;
}

export function isKvConfigured(): boolean {
  return getRedisConfig() !== null;
}

function getRedis(): Redis {
  const cfg = getRedisConfig();
  if (!cfg) throw new StoreUnavailableError("KV_REST_API_URL / KV_REST_API_TOKEN nejsou nastaveny");
  return new Redis({ url: cfg.url, token: cfg.token });
}

// ── Dev file-based store (jen když KV opravdu nejde nakonfigurovat) ──────────
// Lokální vývoj BEZ připojeného KV: data se ukládají do .next/store.json a NIKDY
// nedotečou na Vercel. Jasné varování v konzoli při prvním zápisu.

const DEV_FILE = process.env.VERCEL
  ? path.join("/tmp", "atm-store.json")
  : path.join(process.cwd(), ".next", "atm-store.json");

type DevStore = Record<string, unknown>;

let devWarningShown = false;
function warnDev(): void {
  if (devWarningShown) return;
  devWarningShown = true;
  console.warn(
    "[store] ⚠️  KV není nakonfigurováno — používám lokální file store " +
      DEV_FILE +
      ". Data se NEPÍŠOU do Vercelu.",
  );
}

function devRead(): DevStore {
  warnDev();
  try {
    return JSON.parse(fs.readFileSync(DEV_FILE, "utf-8")) as DevStore;
  } catch {
    return {};
  }
}

function devWrite(store: DevStore): void {
  warnDev();
  try {
    fs.mkdirSync(path.dirname(DEV_FILE), { recursive: true });
    fs.writeFileSync(DEV_FILE, JSON.stringify(store), "utf-8");
  } catch (err) {
    console.warn("[store] dev write failed:", err);
  }
}

// ── Lua CAS skript ──────────────────────────────────────────────────────────
// KEYS[1] = klíč slice
// ARGV[1] = očekávaná verze (number)
// ARGV[2] = nová data jako JSON string (musí obsahovat field "version")
// Vrací JSON string:
//   {"status":"ok","currentVersion":N}
//   {"status":"missing","currentVersion":0}   — klíč chybí a expected != 0
//   {"status":"conflict","currentVersion":N}  — verze nesouhlasí
//   {"status":"corrupted","currentVersion":-1} — neparsovatelný JSON

const CAS_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if not current then
  if tonumber(ARGV[1]) ~= 0 then
    return '{"status":"missing","currentVersion":0}'
  end
  redis.call('SET', KEYS[1], ARGV[2])
  local n1 = cjson.decode(ARGV[2])
  local nv = tonumber(n1.version) or 1
  return '{"status":"ok","currentVersion":' .. nv .. '}'
end
local ok, data = pcall(cjson.decode, current)
if not ok then
  return '{"status":"corrupted","currentVersion":-1}'
end
local curVer = tonumber(data.version) or 0
if curVer ~= tonumber(ARGV[1]) then
  return '{"status":"conflict","currentVersion":' .. curVer .. '}'
end
redis.call('SET', KEYS[1], ARGV[2])
local n2 = cjson.decode(ARGV[2])
local nv2 = tonumber(n2.version) or (curVer + 1)
return '{"status":"ok","currentVersion":' .. nv2 .. '}'
`.trim();

// ── Generický CAS update ─────────────────────────────────────────────────────

type Versioned = { version: number };

/**
 * Atomicky nahradí slice nově poskytnutými daty. Verze v `newData` se ignoruje —
 * helper sám spočítá `expectedVersion + 1`.
 *
 * Pokud klíč v Redisu chybí a `expectedVersion === 0`, slice se vytvoří.
 */
export async function casWriteSlice<T extends Versioned>(
  id: string,
  slice: SliceName,
  expectedVersion: number,
  newDataWithoutVersion: Omit<T, "version">,
): Promise<CasResult> {
  const newData = { ...newDataWithoutVersion, version: expectedVersion + 1 } as T;

  if (!isKvConfigured()) {
    return devCasWrite<T>(id, slice, expectedVersion, newData);
  }

  const redis = getRedis();
  const raw = await redis.eval(
    CAS_SCRIPT,
    [sliceKey(id, slice)],
    [String(expectedVersion), JSON.stringify(newData)],
  );

  // Upstash vrací stringovou hodnotu z Lua skriptu jako string
  const result = parseCasResult(raw);
  return result;
}

function parseCasResult(raw: unknown): CasResult {
  try {
    const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (
      typeof obj === "object" &&
      obj !== null &&
      "status" in obj &&
      "currentVersion" in obj
    ) {
      return obj as CasResult;
    }
  } catch {
    /* fallthrough */
  }
  return { status: "corrupted", currentVersion: -1 };
}

function devCasWrite<T extends Versioned>(
  id: string,
  slice: SliceName,
  expectedVersion: number,
  newData: T,
): CasResult {
  const store = devRead();
  const key = sliceKey(id, slice);
  const cur = store[key] as T | undefined;
  if (!cur) {
    if (expectedVersion !== 0) {
      return { status: "missing", currentVersion: 0 };
    }
    store[key] = newData;
    devWrite(store);
    return { status: "ok", version: newData.version };
  }
  if ((cur.version ?? 0) !== expectedVersion) {
    return { status: "conflict", currentVersion: cur.version ?? 0 };
  }
  store[key] = newData;
  devWrite(store);
  return { status: "ok", version: newData.version };
}

// ── Čtení slice ──────────────────────────────────────────────────────────────

export async function readSlice<T>(id: string, slice: SliceName): Promise<T | null> {
  if (!isKvConfigured()) {
    const store = devRead();
    const v = store[sliceKey(id, slice)];
    return (v as T) ?? null;
  }
  const redis = getRedis();
  return (await redis.get<T>(sliceKey(id, slice))) ?? null;
}

// ── Seznam ID ────────────────────────────────────────────────────────────────

export async function listEventIds(): Promise<string[]> {
  if (!isKvConfigured()) {
    const store = devRead();
    return (store[IDS_KEY] as string[]) ?? [];
  }
  const redis = getRedis();
  return (await redis.get<string[]>(IDS_KEY)) ?? [];
}

export async function addEventId(id: string): Promise<void> {
  if (!isKvConfigured()) {
    const store = devRead();
    const ids = (store[IDS_KEY] as string[]) ?? [];
    if (!ids.includes(id)) {
      store[IDS_KEY] = [...ids, id];
      devWrite(store);
    }
    return;
  }
  const redis = getRedis();
  const ids = (await redis.get<string[]>(IDS_KEY)) ?? [];
  if (!ids.includes(id)) {
    await redis.set(IDS_KEY, [...ids, id]);
  }
}

export async function removeEventId(id: string): Promise<void> {
  if (!isKvConfigured()) {
    const store = devRead();
    const ids = (store[IDS_KEY] as string[]) ?? [];
    store[IDS_KEY] = ids.filter((x) => x !== id);
    devWrite(store);
    return;
  }
  const redis = getRedis();
  const ids = (await redis.get<string[]>(IDS_KEY)) ?? [];
  await redis.set(IDS_KEY, ids.filter((x) => x !== id));
}

// ── Načtení celého eventu z jednotlivých slice ───────────────────────────────

export async function loadEvent(id: string): Promise<EventWithVersions | null> {
  const [meta, team, approvals, checklist, results, deallog, kpiTracking, oemDealsSlice] =
    await Promise.all([
      readSlice<MetaSlice>(id, "meta"),
      readSlice<TeamSlice>(id, "team"),
      readSlice<ApprovalsSlice>(id, "approvals"),
      readSlice<ChecklistSlice>(id, "checklist"),
      readSlice<ResultsSlice>(id, "results"),
      readSlice<DealLogSlice>(id, "deallog"),
      readSlice<KpiTrackingSlice>(id, "kpitracking"),
      readSlice<OemDealsSlice>(id, "oemdeals"),
    ]);

  if (!meta) return null;

  const event: EventWithVersions = {
    id: meta.id,
    name: meta.name,
    shortName: meta.shortName,
    location: meta.location,
    dateStart: meta.dateStart,
    dateEnd: meta.dateEnd,
    processedDate: meta.processedDate,
    owner: meta.owner,
    division: meta.division,
    approvalDeadline: meta.approvalDeadline,
    status: meta.status,
    dailyRateSales: meta.dailyRateSales,
    dailyRateNesales: meta.dailyRateNesales,
    dealBonusNote: meta.dealBonusNote,
    kpiApprover: meta.kpiApprover,
    kpiBands: meta.kpiBands,
    prepBands: meta.prepBands,
    prepTeamNote: meta.prepTeamNote,
    prepTeamLabel: meta.prepTeamLabel,
    approvers: meta.approvers,
    approvalNote: meta.approvalNote,
    lastModified: meta.lastModified,
    grandTotal: meta.grandTotal,
    fixTotal: meta.fixTotal,
    variableTotal: meta.variableTotal,
    salesTeam: team?.salesTeam ?? [],
    nesalesTeam: team?.nesalesTeam ?? [],
    prepTeam: team?.prepTeam ?? [],
    dealApprovals: approvals?.dealApprovals ?? [],
    checklist: checklist?.checklist ?? [],
    eventResults: results?.eventResults ?? [],
    dealLog: deallog?.dealLog ?? [],
    salesKpiTracking: kpiTracking?.salesKpiTracking ?? [],
    prepKpiTracking: kpiTracking?.prepKpiTracking ?? [],
    oemDeals: oemDealsSlice?.oemDeals ?? [],
    versions: {
      meta: meta.version ?? 0,
      team: team?.version ?? 0,
      approvals: approvals?.version ?? 0,
      checklist: checklist?.version ?? 0,
      results: results?.version ?? 0,
      dealLog: deallog?.version ?? 0,
      kpiTracking: kpiTracking?.version ?? 0,
      oemDeals: oemDealsSlice?.version ?? 0,
    },
  };

  return event;
}

export async function listEvents(): Promise<EventWithVersions[]> {
  const ids = await listEventIds();
  const events = await Promise.all(ids.map((id) => loadEvent(id)));
  return events.filter((e): e is EventWithVersions => e !== null);
}

// ── První inicializace (jen pro `create event` flow) ─────────────────────────

export async function createEventSlices(
  data: EventData,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const existing = await readSlice<MetaSlice>(data.id, "meta");
  if (existing) {
    return { ok: false, reason: `Event s ID "${data.id}" už existuje.` };
  }

  const meta: Omit<MetaSlice, "version"> = {
    id: data.id,
    name: data.name,
    shortName: data.shortName,
    location: data.location,
    dateStart: data.dateStart,
    dateEnd: data.dateEnd,
    processedDate: data.processedDate,
    owner: data.owner,
    division: data.division,
    approvalDeadline: data.approvalDeadline,
    status: data.status,
    dailyRateSales: data.dailyRateSales,
    dailyRateNesales: data.dailyRateNesales,
    dealBonusNote: data.dealBonusNote,
    kpiApprover: data.kpiApprover,
    kpiBands: data.kpiBands,
    prepBands: data.prepBands,
    prepTeamNote: data.prepTeamNote,
    prepTeamLabel: data.prepTeamLabel,
    approvers: data.approvers,
    approvalNote: data.approvalNote,
    lastModified: data.lastModified,
    grandTotal: data.grandTotal,
    fixTotal: data.fixTotal,
    variableTotal: data.variableTotal,
  };

  const team: Omit<TeamSlice, "version"> = {
    salesTeam: data.salesTeam,
    nesalesTeam: data.nesalesTeam,
    prepTeam: data.prepTeam,
  };
  const approvals: Omit<ApprovalsSlice, "version"> = {
    dealApprovals: data.dealApprovals ?? [],
  };
  const checklist: Omit<ChecklistSlice, "version"> = {
    checklist: data.checklist ?? [],
  };
  const results: Omit<ResultsSlice, "version"> = {
    eventResults: data.eventResults ?? [],
  };
  const deallog: Omit<DealLogSlice, "version"> = {
    dealLog: data.dealLog ?? [],
  };
  const kpiTracking: Omit<KpiTrackingSlice, "version"> = {
    salesKpiTracking: data.salesKpiTracking ?? [],
    prepKpiTracking: data.prepKpiTracking ?? [],
  };
  const oemDeals: Omit<OemDealsSlice, "version"> = {
    oemDeals: data.oemDeals ?? [],
  };

  await Promise.all([
    casWriteSlice<MetaSlice>(data.id, "meta", 0, meta),
    casWriteSlice<TeamSlice>(data.id, "team", 0, team),
    casWriteSlice<ApprovalsSlice>(data.id, "approvals", 0, approvals),
    casWriteSlice<ChecklistSlice>(data.id, "checklist", 0, checklist),
    casWriteSlice<ResultsSlice>(data.id, "results", 0, results),
    casWriteSlice<DealLogSlice>(data.id, "deallog", 0, deallog),
    casWriteSlice<KpiTrackingSlice>(data.id, "kpitracking", 0, kpiTracking),
    casWriteSlice<OemDealsSlice>(data.id, "oemdeals", 0, oemDeals),
  ]);

  await addEventId(data.id);
  return { ok: true };
}

// ── Smazání eventu (admin only — používá se i pro reseed) ────────────────────

export async function deleteEventSlices(id: string): Promise<void> {
  const slices: SliceName[] = [
    "meta",
    "team",
    "approvals",
    "checklist",
    "results",
    "deallog",
    "kpitracking",
    "oemdeals",
  ];
  if (!isKvConfigured()) {
    const store = devRead();
    for (const s of slices) delete store[sliceKey(id, s)];
    devWrite(store);
    await removeEventId(id);
    return;
  }
  const redis = getRedis();
  await Promise.all(slices.map((s) => redis.del(sliceKey(id, s))));
  await removeEventId(id);
}

// ── Helper pro server actions: ensure version match ──────────────────────────

export function throwOnConflict(
  id: string,
  slice: SliceName,
  result: CasResult,
): asserts result is { status: "ok"; version: number } {
  if (result.status === "ok") return;
  throw new StoreConflictError(slice, id, result.currentVersion);
}
