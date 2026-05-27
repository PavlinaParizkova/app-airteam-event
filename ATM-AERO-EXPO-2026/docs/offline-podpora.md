# Offline podpora – ATM AERO EXPO 2026

**Datum implementace:** 5. dubna 2026  
**Aplikace:** `APLIKACE/01-ATM-AERO-EXPO-2026`  
**URL:** `interni-aplikace.vercel.app`

---

## Co to dělá

Aplikace funguje bez internetového připojení po prvním načtení. Prezentační slidy jsou dostupné kdykoli. Ops funkce (checklisty, chat, stav stánku, zápisy) zobrazují naposledy načtená data a write operace jsou zablokované s jasným vizuálním upozorněním.

---

## Jak aktivovat

1. Otevřít aplikaci v prohlížeči **při aktivním připojení** (jednorázově).
2. Prohlížeč automaticky nainstaluje service worker a uloží obsah do cache.
3. Od tohoto okamžiku aplikace funguje offline.

Pro tablety a telefony: v prohlížeči se zobrazí výzva „Přidat na plochu" (Add to Home Screen). Po přidání se aplikace chová jako nainstalovaná nativní aplikace.

---

## Co funguje offline

| Funkce | Offline chování |
|---|---|
| Prezentační slidy (všech 15) | Plně funkční – data jsou v kódu |
| Navigace mezi slidy | Plně funkční |
| `/ops` – Checklisty | Read-only – zobrazí poslední stav, zaškrtávání zablokováno |
| `/ops` – Stav stánku | Read-only – zobrazí poslední polohy týmu, tlačítka zablokována |
| `/ops` – Zápisy z jednání | Read-only – zobrazí poslední zápisy, přidávání zablokováno |
| `/ops` – Chat | Read-only – zobrazí poslední zprávy, odesílání zablokováno |
| Přihlášení (Google OAuth) | Funguje – session je uložena v cookie (platí 30 dní) |

---

## Co nefunguje offline

- **Google Calendar embed** (na stránce `/ops` → Booth) – iframe vyžaduje síť.
- **Nové přihlášení** – pokud session vyprší (30 dní) nebo uživatel se odhlásí, nelze se znovu přihlásit bez sítě.
- **Zápis změn** do checklistů, chatu a zápisů – vše se ukládá do Upstash Redis v cloudu.

---

## Technická implementace

### Použité technologie

- **`@ducanh2912/next-pwa`** – generuje service worker při buildu
- **Workbox** – správa cache strategií (pod kapotou next-pwa)
- **Web App Manifest** – `public/manifest.json`

### Nové / upravené soubory

```
APLIKACE/01-ATM-AERO-EXPO-2026/
├── middleware.ts                          ← NOVÝ – auth ochrana pouze pro /ops
├── next.config.ts                         ← upraveno – PWA konfigurace
├── public/
│   └── manifest.json                      ← NOVÝ – PWA manifest
├── app/
│   ├── layout.tsx                         ← upraveno – manifest link + OfflineBanner
│   ├── hooks/
│   │   └── useIsOffline.ts                ← NOVÝ – sdílený React hook
│   └── components/
│       ├── OfflineBanner.tsx              ← NOVÝ – banner při výpadku sítě
│       └── ops/
│           ├── OpsChecklists.tsx          ← upraveno – offline fallback
│           ├── OpsChat.tsx                ← upraveno – offline fallback
│           ├── OpsBooth.tsx               ← upraveno – offline fallback
│           └── OpsNotes.tsx               ← upraveno – offline fallback
```

### Cache strategie (Workbox)

| URL vzor | Strategie | Cache name | Platnost |
|---|---|---|---|
| `/_next/static/*` | Cache First | `next-static-assets` | 30 dní |
| Obrázky a fonty | Cache First | `static-media` | 30 dní |
| `/api/*` | Network First | `aero-expo-api-cache` | 24 hodin |
| HTML stránky | Network First | `aero-expo-pages` | 24 hodin |
| `accounts.google.com/*` | Network Only | – | – |

**Network First** znamená: zkus síť (timeout 5 s), při selhání vrať cached verzi.  
**Cache First** znamená: vždy vrať z cache, síť ignoruj (pro neměnné assety).

### middleware.ts

Opravuje bezpečnostní mezeru – dříve `proxy.ts` existoval, ale nebyl nikde importovaný, takže auth ochrana nefungovala. Nyní platí:

```
/ (prezentace)    → veřejná, bez přihlášení
/ops/*            → vyžaduje Google přihlášení (allowlist e-mailů)
/login            → veřejná
/api/*            → chráněno na úrovni jednotlivých route handlerů
```

### useIsOffline hook

Sdílený React hook – naslouchá na události `online` / `offline` prohlížeče a vrací boolean. Používají ho všechny čtyři ops komponenty.

```ts
const isOffline = useIsOffline(); // true = bez sítě
```

### OfflineBanner

Client komponenta v rootu layoutu. Zobrazí se **pouze** při výpadku sítě (oranžový banner), krátce po obnovení připojení ukáže potvrzení (zelený banner) a pak zmizí. Neovlivňuje online uživatele.

---

## Nasazení

Service worker se generuje automaticky při `npm run build`. Na Vercelu probíhá build automaticky po push do `main`.

Po prvním deploymentu s touto změnou je potřeba **navštívit aplikaci online** – service worker se nainstaluje a teprve pak funguje offline. Stačí jednou na každém zařízení.

---

## Údržba a aktualizace

Při každém novém buildu se service worker automaticky aktualizuje. Prohlížeč stáhne novou verzi při dalším online otevření aplikace. Uživatelé nemusí dělat nic ručně.

Pokud by bylo potřeba vynutit okamžitou aktualizaci (např. urgentní oprava), stačí v DevTools → Application → Service Workers kliknout „Update" nebo „Skip waiting".
