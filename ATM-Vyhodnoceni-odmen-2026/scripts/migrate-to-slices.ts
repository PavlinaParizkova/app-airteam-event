/**
 * Migrační skript — rozdělí starý monolitický `event:{id}` na nové slice.
 *
 * Co dělá:
 *   1. Načte všechny event:{id} (legacy, celý EventData v jednom klíči)
 *   2. Vytvoří lokální backup `migration-backup-{ISO}.json` v `scripts/`
 *   3. Rozseká data na sliceové klíče (event:{id}:meta, :team, :approvals, …)
 *   4. Nastaví version=1 u každého slice
 *   5. STARÉ klíče `event:{id}` ponechá — admin je smaže ručně po ověření
 *
 * Spuštění (PowerShell):
 *   $env:KV_REST_API_URL="..."; $env:KV_REST_API_TOKEN="..."
 *   npx tsx scripts/migrate-to-slices.ts
 *
 * Bezpečné spuštění opakovaně — pokud slice už existuje (version>0), přeskočí ho.
 */

import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";
import { type EventData } from "../data/events";

const PREFIX = "event:";
const IDS_KEY = "event:ids";

const SLICES = [
  "meta",
  "team",
  "approvals",
  "checklist",
  "results",
  "deallog",
  "kpitracking",
] as const;

async function main(): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.error("❌ KV_REST_API_URL nebo KV_REST_API_TOKEN nejsou nastavené.");
    process.exit(1);
  }

  const redis = new Redis({ url, token });

  console.log("🔍 Načítám seznam event ID …");
  const ids = (await redis.get<string[]>(IDS_KEY)) ?? [];
  console.log(`   nalezeno ${ids.length} eventů: ${ids.join(", ")}`);

  if (ids.length === 0) {
    console.log("Nic k migraci.");
    return;
  }

  // Backup
  const backup: Record<string, unknown> = { _idsKey: ids };
  for (const id of ids) {
    const data = await redis.get(`${PREFIX}${id}`);
    if (data) backup[`${PREFIX}${id}`] = data;
  }

  const backupPath = path.join(
    process.cwd(),
    "scripts",
    `migration-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), "utf-8");
  console.log(`💾 Backup uložen do ${backupPath}`);

  // Migrate
  for (const id of ids) {
    console.log(`\n📦 Migruji event "${id}" …`);
    const legacy = (await redis.get<EventData>(`${PREFIX}${id}`)) ?? null;
    if (!legacy) {
      console.warn(`   ⚠️  Legacy klíč event:${id} prázdný — přeskočeno.`);
      continue;
    }

    // Zkontroluj, jestli už nějaký slice existuje
    const existingSlices: string[] = [];
    for (const slice of SLICES) {
      const v = await redis.get(`${PREFIX}${id}:${slice}`);
      if (v) existingSlices.push(slice);
    }
    if (existingSlices.length > 0) {
      console.log(
        `   ⏭  Slice ${existingSlices.join(", ")} už existují — přeskočeno.`,
      );
      continue;
    }

    const meta = {
      id: legacy.id,
      name: legacy.name,
      shortName: legacy.shortName,
      location: legacy.location,
      dateStart: legacy.dateStart,
      dateEnd: legacy.dateEnd,
      processedDate: legacy.processedDate,
      owner: legacy.owner,
      division: legacy.division,
      approvalDeadline: legacy.approvalDeadline,
      status: legacy.status,
      dailyRateSales: legacy.dailyRateSales,
      dailyRateNesales: legacy.dailyRateNesales,
      dealBonusNote: legacy.dealBonusNote,
      kpiApprover: legacy.kpiApprover,
      kpiBands: legacy.kpiBands,
      prepBands: legacy.prepBands,
      prepTeamNote: legacy.prepTeamNote,
      prepTeamLabel: legacy.prepTeamLabel,
      approvers: legacy.approvers,
      approvalNote: legacy.approvalNote,
      lastModified: legacy.lastModified,
      grandTotal: legacy.grandTotal,
      fixTotal: legacy.fixTotal,
      variableTotal: legacy.variableTotal,
      version: 1,
    };

    const team = {
      salesTeam: legacy.salesTeam,
      nesalesTeam: legacy.nesalesTeam,
      prepTeam: legacy.prepTeam,
      version: 1,
    };

    const approvals = {
      dealApprovals: legacy.dealApprovals ?? [],
      version: 1,
    };

    const checklist = {
      checklist: legacy.checklist ?? [],
      version: 1,
    };

    const results = {
      eventResults: legacy.eventResults ?? [],
      version: 1,
    };

    const deallog = {
      dealLog: legacy.dealLog ?? [],
      version: 1,
    };

    const kpitracking = {
      salesKpiTracking: legacy.salesKpiTracking ?? [],
      prepKpiTracking: legacy.prepKpiTracking ?? [],
      version: 1,
    };

    await Promise.all([
      redis.set(`${PREFIX}${id}:meta`, meta),
      redis.set(`${PREFIX}${id}:team`, team),
      redis.set(`${PREFIX}${id}:approvals`, approvals),
      redis.set(`${PREFIX}${id}:checklist`, checklist),
      redis.set(`${PREFIX}${id}:results`, results),
      redis.set(`${PREFIX}${id}:deallog`, deallog),
      redis.set(`${PREFIX}${id}:kpitracking`, kpitracking),
    ]);

    console.log(`   ✅ Migrace dokončena — 7 sliceů vytvořeno.`);
  }

  console.log("\n🎉 Hotovo. Po ověření v aplikaci smaž stará event:{id} ručně:");
  for (const id of ids) {
    console.log(`   redis.del("event:${id}")`);
  }
}

main().catch((err) => {
  console.error("❌ Migrace selhala:", err);
  process.exit(1);
});
