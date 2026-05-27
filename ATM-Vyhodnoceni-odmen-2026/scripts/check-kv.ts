/**
 * Diagnostika připojení k Upstash/Vercel KV.
 *
 * Spuštění (PowerShell):
 *   # 1) Z `.env.local` se proměnné nečtou automaticky — musíš je předat:
 *   $env:KV_REST_API_URL="https://..."; $env:KV_REST_API_TOKEN="..."; npx tsx scripts/check-kv.ts
 *
 *   # 2) Alternativně (pokud máš nainstalovaný dotenv-cli):
 *   npx dotenv-cli -e .env.local -- npx tsx scripts/check-kv.ts
 *
 * Co dělá:
 *   1. Zkontroluje, zda jsou nastavené proměnné (URL + TOKEN)
 *   2. Pingne Redis
 *   3. Načte `event:ids` a vypíše ID eventů
 *   4. Pro každé ID ověří, jestli existují všechny slice (meta/team/approvals/...)
 *   5. Vypíše stručný report
 */

import { Redis } from "@upstash/redis";

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

  console.log("== Vercel KV / Upstash diagnostika ==\n");

  if (!url || !token) {
    console.error("❌ Chybí KV_REST_API_URL nebo KV_REST_API_TOKEN.");
    console.error("   Nastav je v PowerShellu:");
    console.error('   $env:KV_REST_API_URL="https://..."');
    console.error('   $env:KV_REST_API_TOKEN="..."');
    process.exit(1);
  }

  console.log(`URL:   ${url.replace(/^(https?:\/\/[^/]+).*$/, "$1")}…`);
  console.log(`TOKEN: ${token.slice(0, 6)}… (${token.length} chars)\n`);

  const redis = new Redis({ url, token });

  // Ping
  try {
    const ping = await redis.ping();
    console.log(`✅ PING → ${ping}`);
  } catch (err) {
    console.error("❌ PING selhal:", err);
    process.exit(1);
  }

  // event:ids
  const ids = (await redis.get<string[]>(IDS_KEY)) ?? [];
  console.log(`\n📋 event:ids → ${ids.length} eventů`);
  if (ids.length === 0) {
    console.log("   (žádné eventy — spusť `scripts/migrate-to-slices.ts` nebo seed přes admin endpoint)");
    return;
  }

  // Per-event check
  let okCount = 0;
  let issueCount = 0;
  for (const id of ids) {
    const present: string[] = [];
    const missing: string[] = [];
    for (const slice of SLICES) {
      const v = await redis.get(`event:${id}:${slice}`);
      if (v) present.push(slice);
      else missing.push(slice);
    }
    if (missing.length === 0) {
      okCount += 1;
      console.log(`   ✅ ${id} — všech ${SLICES.length} sliceů OK`);
    } else {
      issueCount += 1;
      console.log(`   ⚠️  ${id} — chybí slice: ${missing.join(", ")}`);
    }
  }

  console.log(`\nVýsledek: ${okCount} OK, ${issueCount} s chybami`);
  if (issueCount > 0) {
    console.log("→ Spusť migraci: npx tsx scripts/migrate-to-slices.ts");
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("❌ check-kv selhal:", err);
  process.exit(1);
});
