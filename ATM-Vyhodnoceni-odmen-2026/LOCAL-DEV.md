# Lokál = stejná data jako Vercel

Aby `localhost:3001` ukazoval **stejný obsah** jako [produkce](https://atm-vyhodnoceni-odmen-2026.vercel.app), musí lokál číst **stejný Redis (KV)**. Bez toho běží jen ze souboru v `.next/` nebo `C:\tmp\`.

## 1. Zkopíruj proměnné z Vercelu (jednorázově, ~2 min)

1. Otevři: [Vercel → atm-vyhodnoceni-odmen-2026 → Settings → Environment Variables](https://vercel.com/pavlina-parizkovas-projects/atm-vyhodnoceni-odmen-2026/settings/environment-variables)
2. U každé proměnné (Production) klikni **Reveal** a zkopíruj hodnotu do `.env.local`:

| Proměnná | Povinné pro stejná data |
|---|---|
| `KV_REST_API_URL` | ano |
| `KV_REST_API_TOKEN` | ano |
| `AUTH_SECRET` | ano (přihlášení) |
| `AUTH_GOOGLE_ID` | ano (Google login) |
| `AUTH_GOOGLE_SECRET` | ano (Google login) |
| `BLOB_READ_WRITE_TOKEN` | volitelné (denní backupy) |
| `CRON_SECRET` | volitelné (cron backup) |

3. V `.env.local` **musí** být také (už je nastaveno):

```
AUTH_URL=http://localhost:3001
```

4. **Nemaž** řádky `VERCEL=1` do souboru — `vercel env pull` je přidává prázdné a přepisuje secrets. Použij ruční kopii z dashboardu.

> `vercel env pull` u tohoto projektu často stáhne **prázdné** hodnoty. Ruční kopie z dashboardu je spolehlivější.

## 2. Ověř KV připojení

Nový diagnostický skript ověří, že lokál vidí stejná data jako Vercel:

```powershell
cd APLIKACE\11-ATM-Vyhodnoceni-odmen-2026
$env:KV_REST_API_URL="https://..."
$env:KV_REST_API_TOKEN="..."
npx tsx scripts/check-kv.ts
```

Skript:
- pingne Redis,
- vypíše seznam eventů (`event:ids`),
- ověří, že každý event má všech 7 sliceů (`meta`, `team`, `approvals`, `checklist`, `results`, `deallog`, `kpitracking`).

Pokud chybí slice → spusť migraci:

```powershell
npx tsx scripts/migrate-to-slices.ts
```

## 3. Google OAuth pro localhost

V [Google Cloud Console](https://console.cloud.google.com/) → OAuth client přidej redirect URI:

`http://localhost:3001/api/auth/callback/google`

## 4. Spusť aplikaci

```powershell
cd APLIKACE\11-ATM-Vyhodnoceni-odmen-2026
npm run dev
```

Otevři: http://localhost:3001/event/aero-expo-2026
Přihlas se přes Google (`@airteam.eu`).

## 5. Ověření

- Vidíš stejné semafory Sales (D+7, D+3M…) jako na Vercelu.
- Po uložení změny na lokálu se projeví i na Vercelu (sdílený Redis).
- Pokud uvidíš toast „event byl změněn někým jiným, načítám aktuální stav" — někdo souběžně upravil stejný slice (správné chování CAS).

## Volba: dev bez Google (jen pro rychlý náhled)

Do `.env.local` přidej:

```
DEV_AUTH_BYPASS=true
NEXT_PUBLIC_DEV_AUTH_BYPASS=true
```

Stále ale potřebuješ **KV_REST_API_URL** a **KV_REST_API_TOKEN** — jinak data nebudou z produkce.

## Reseed eventů (jen ručně, jen admin)

Auto-seed při startu byl zrušen, aby se nepřepisovala produkční data. Když chceš donastavit chybějící eventy ze statického seedu (`data/events.ts`):

```bash
# pouze přidá chybějící eventy (nikoho nepřepíše)
curl -X POST http://localhost:3001/api/admin/seed

# vynucený reseed (smaže a vrátí do počátečního stavu — pozor)
curl -X POST "http://localhost:3001/api/admin/seed?force=true"
```

Admin endpoint je dostupný jen po přihlášení s rolí `isAdmin`.
