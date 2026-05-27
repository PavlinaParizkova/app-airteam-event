# ATM Vyhodnocení odměn – 11-ATM-Vyhodnoceni-odmen-2026

Interní dashboard AIR TEAM pro vyhodnocení odměn z eventů a akcí.

**Zdroj pravidel odměňování:** `AIR-TEAM/ATM-procesy-sop-2026/10-eventy/10-eventy-PROCES-2026.md`

---

## Funkce

- Přehled všech eventů s celkovými odměnami a statusy
- Detail eventu:
  - **Skupina 1 – Sales** (deal bonus + KPI bonus + tracking finance výplat)
  - **Skupina 2 – Nesales** (denní sazba + KPI bonus s detailem kritérií a progress bary)
  - **Skupina 3 – Přípravný tým** (hodiny z ClickUp + KPI bonus)
  - Celkový přehled odměn na osobu
  - Schvalovací tabulka, deal log, checklist
- Google OAuth (přístup pouze pro @airteam.eu)
- Responzivní (desktop sidebar + mobilní top bar)
- Audit log per event (kdo, kdy, co změnil)
- Denní zálohy do Vercel Blob přes Vercel Cron

---

## Role model

| Role | Vidí | Edituje |
|---|---|---|
| **admin** (Pavlína) | vše, draft/submitted/approved/paid, audit log, admin sekce | vše — tým, výsledky, KPI, schválení |
| **approver** (Petr Polák) | submitted + approved + paid eventy; dashboard sekce „Čeká na tvé schválení" | tlačítko **Schválit** u submitted eventu |
| **finance** (David, Věra) | approved + paid eventy + Platební plán; dashboard sekce „K úhradě napříč eventy" | finance checkpointy (finance flag, proplaceno flag) |
| **team member** | svůj event ve stavech submitted/approved/paid, jinak jen approved/paid | svůj `paymentType` (faktura / IČO / DPP) |
| **anyone** (@airteam.eu) | jen approved + paid eventy | nic |

Místo 404 se uživateli vždy zobrazí **role-aware view** (`EventAccessFallback`) se statusem eventu a vysvětlením, proč nemá přístup.

---

## Datová architektura

Data jsou **rozdělená do nezávislých sliceů** v Upstash/Vercel KV:

```
event:{id}:meta        — id, name, status, sazby, KPI pásma, approvers
event:{id}:team        — salesTeam, nesalesTeam, prepTeam
event:{id}:approvals   — dealApprovals (finance flow Skupiny 1)
event:{id}:checklist   — checklist po eventu
event:{id}:results     — eventResults
event:{id}:deallog     — dealLog (deals přidávané po eventu)
event:{id}:kpitracking — salesKpiTracking + prepKpiTracking
event:ids              — string[] všech ID
audit:{id}             — JSON array auditních záznamů (max 500)
```

Každý slice má vlastní `version`. Zápis jde přes **Lua CAS skript v Redisu** — při konfliktu verzí vrátíme `conflict` a UI uživatele informuje, že event byl změněn jinde.

Žádný silent seed, žádný runtime fallback na statický `EVENTS`. Pokud Redis nedostupný, chyba je hlučná.

---

## Server actions místo REST API

Všechny mutace dat běží přes Next.js server actions v `app/actions/events.ts`:

- `patchTeamAction`, `patchApprovalsAction`, `setPaymentTypeAction`
- `toggleFinanceCheckpointAction`, `toggleGroupApprovalAction`
- `submitEventAction`, `approveEventAction`, `sendToFinanceAction`
- `toggleChecklistItemAction`, `patchResultsAction`
- `addDealAction`, `removeDealAction`
- `patchSalesKpiAction`, `patchPrepKpiAction`

Každá action:
1. ověří roli,
2. načte aktuální slice + verzi,
3. provede CAS update,
4. zapíše audit záznam,
5. zavolá `revalidatePath` — žádný `router.refresh()` v klientu už nepotřebujeme.

Návratová hodnota je vždy `ActionResult` — UI rozliší `ok / conflict / forbidden / not-found / invalid / error`.

Staré `/api/events/[id]/*` route handlery byly **smazány**. Zůstaly jen:
- `GET /api/events`, `POST /api/events` — listing a create
- `POST /api/events/[id]/clickup-tasks` — integrace s externí ClickUp API
- `POST /api/admin/seed` — explicitní reseed (admin only)
- `GET /api/cron/backup` — denní backup (Vercel Cron)

---

## Spuštění (lokál)

```bash
cp .env.local.example .env.local
# Vyplň AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET, KV_REST_API_URL, KV_REST_API_TOKEN

npm install
npm run dev
# → http://localhost:3001
```

Detail lokálního setupu (sdílený Redis s Vercelem): `LOCAL-DEV.md`.

### Diagnostika KV připojení

```bash
$env:KV_REST_API_URL="..."; $env:KV_REST_API_TOKEN="..."
npx tsx scripts/check-kv.ts
```

Vypíše ping, seznam event ID a stav všech sliceů per event.

### Migrace dat ze starého formátu

Pokud Redis ještě obsahuje stará monolitická `event:{id}` (před přestavbou):

```bash
npx tsx scripts/migrate-to-slices.ts
```

Skript vytvoří lokální backup a rozdělí data do nových sliceů.

---

## Deploy (Vercel)

1. Přidej projekt na Vercel z `APLIKACE/11-ATM-Vyhodnoceni-odmen-2026/`
2. Nastav env variables (viz `.env.local.example` + sekce níže)
3. V Google Cloud Console přidej Authorized redirect URI:
   `https://tvoje-url.vercel.app/api/auth/callback/google`
4. `AUTH_URL` nastav na produkční URL
5. Vercel Cron automaticky spouští `/api/cron/backup` 1× denně (viz `vercel.json`)

### Env variables

| Proměnná | Účel |
|---|---|
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash/Vercel KV (povinné) |
| `AUTH_SECRET` | NextAuth |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth |
| `AUTH_URL` | URL aplikace |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob pro denní zálohy |
| `CRON_SECRET` | Bearer token pro Vercel Cron (`/api/cron/*`) |
| `CLICKUP_API_TOKEN` / `CLICKUP_LIST_ID` | volitelné — ClickUp deal follow-up tasky |

---

## Backupy

Denní backup všech eventů + audit logů do Vercel Blob:

- spouští se přes Vercel Cron 03:00 UTC,
- ukládá JSON do `backups/{ISO-timestamp}.json`,
- chráněno `Authorization: Bearer ${CRON_SECRET}`.

Ručně lze spustit: `curl -H "Authorization: Bearer $CRON_SECRET" https://app/api/cron/backup`.

---

## Audit log

Každá změna eventu (submit, approve, toggle finance, edit team, atd.) se zapisuje do `audit:{eventId}` v Redisu — max 500 záznamů per event.

Admin si historii zobrazí na `/admin/audit/[id]` (link z event detail footeru).

---

## Tech stack

- **Next.js 16** (App Router, server actions)
- **NextAuth v5** (Google OAuth)
- **Upstash Redis** (KV store s Lua CAS skripty)
- **Vercel Blob** (denní zálohy)
- **Tailwind CSS v4**
- **TypeScript 5**

---

*AIR TEAM | 11-ATM-Vyhodnoceni-odmen-2026 | Vlastník: Pavlína Pařízková*
