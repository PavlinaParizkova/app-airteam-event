# Interní aplikace (AERO EXPO) – odkaz na Vercel

## Povinná adresa

V odpovědích, dokumentaci, e-mailech, OAuth redirect URI a v kódu (pokud není přepsáno env) používej **jen**:

`https://interni-aplikace.vercel.app`

Operativa: `https://interni-aplikace.vercel.app/ops`

Zdroj v repozitáři: `APLIKACE/01-ATM-AERO-EXPO-2026/app/lib/site.ts` (`INTERNAL_APP_ORIGIN`, `INTERNAL_APP_OPS_URL`).

## Zakázáno

- Odkazovat na **jakýkoli jiný host** pro tutéž aplikaci na Vercelu (preview deployment, týmová URL, „barevné" aliasy typu `interni-aplikace-….vercel.app`, kromě výše uvedené kanonické domény).
- Uživateli nebo v dokumentaci **nepřiřazovat** aplikaci k náhodnému deployment URL z CLI / dashboardu.

Interní technické aliasy Vercelu můžeš zmínit jen jako poznámku k debugu, pokud to uživatel výslovně řeší – **nikdy** jako hlavní nebo „oficiální" odkaz.

## Nasazení

Nikdy nenavrhuj jako cíl nasazení ani jako sdílený odkaz nic jiného než kanonickou doménu výše. Po deployi předpokládej, že produkce je dostupná na `interni-aplikace.vercel.app` (alias projektu), ne na jednorázových URL.
