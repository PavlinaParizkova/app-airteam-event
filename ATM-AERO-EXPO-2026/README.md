# AERO EXPO 2026 – Interní briefing

Next.js 16 prezentační aplikace pro tým AIR TEAM na veletrhu AERO EXPO 2026 (Friedrichshafen, 22.–25. 4. 2026).

---

## Lokální spuštění

```bash
npm install
npm run dev
# → http://localhost:3000
```

Přístupové heslo (lokálně) je definováno v `.env.local`.

---

## Nasazení na Vercel

### 1. Přihlášení do Vercel CLI

```bash
npx vercel login
```

Otevře se odkaz v prohlížeči – přihlas se svým Vercel účtem.

### 2. Nasazení (první deployment)

```bash
npx vercel --cwd . --yes
```

Vercel se zeptá na pár otázek (projekt, organizace) – potvrď výchozí hodnoty.

### 3. Nastavení environment variables na Vercel

Po prvním deploy jdi do **Vercel Dashboard → projekt → Settings → Environment Variables** a přidej:


| Name            | Value                                   | Environment         |
| --------------- | --------------------------------------- | ------------------- |
| `AUTH_PASSWORD` | `AerOAirteam2026`                       | Production, Preview |
| `AUTH_TOKEN`    | tajný token (libovolný náhodný řetězec) | Production, Preview |


⚠️ **Nikdy nepoužívej stejné hodnoty jako v `.env.local` na produkci.**
Vygeneruj silné heslo, např. `openssl rand -base64 24`.

### 4. Produkční redeploy s env vars

```bash
npx vercel --prod
```

### 5. Výsledná URL

Vercel přidělí URL ve tvaru `https://aero-expo-2026-xyz.vercel.app`.  
Můžeš přidat vlastní doménu v **Settings → Domains** (např. `aero2026.airteam.eu`).

---

## Změna hesla

1. Jdi do Vercel Dashboard → Settings → Environment Variables
2. Uprav hodnotu `AUTH_PASSWORD`
3. Spusť nový deploy: `npx vercel --prod`

---

## Struktura projektu

```
app/
  page.tsx                     # Hlavní slide engine
  login/page.tsx               # Heslová brána
  api/auth/route.ts            # POST endpoint pro ověření hesla
  components/
    SlideNav.tsx               # Navigace
    slides/                    # 8 slide komponent
  data/slides-data.ts          # Veškerý obsah (tým, doprava, checklisty)
proxy.ts                       # Auth middleware (běží na Edge Runtime)
vercel.json                    # Vercel konfigurace
```

