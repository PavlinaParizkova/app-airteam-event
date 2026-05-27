type CostCategory = {
  label: string;
  items: { name: string; amount: number; note?: string; status: "confirmed" | "tbd" }[];
};

const CATEGORIES: CostCategory[] = [
  {
    label: "Stánek – MLT expo",
    items: [
      { name: "Realizace stánku (podlaha, stěny, grafika, AV, elektro)", amount: 181_545, status: "confirmed" },
      { name: "Náklady v místě (montáž, demontáž, cesta, produkce)",     amount:  54_250, status: "confirmed" },
      { name: "Hotel + diety (montážní tým)",                             amount:  14_661, status: "confirmed" },
      { name: "Doprava a spedice",                                        amount:  24_600, status: "confirmed" },
      { name: "Grafika (polep dveří)",                                    amount:   1_480, status: "confirmed" },
      { name: "Vybavení kuchynky",                                        amount:   5_000, note: "Čeká na potvrzení", status: "tbd" },
      { name: "Technické služby (elektro, voda, úklid)",                  amount:       0, note: "Zajišťuje klient", status: "tbd" },
    ],
  },
  {
    label: "Dárky pro zákazníky",
    items: [
      { name: "Energetický nápoj PilotStyle (100 ks × 28,93 Kč)", amount: 2_893, status: "confirmed" },
      { name: "Energetický nápoj ATM (100 ks × 28,93 Kč)",        amount: 2_893, status: "confirmed" },
      { name: "Karamelky",                                         amount: 1_766, status: "confirmed" },
      { name: "Kuličkové pero Connel (150 ks × 16 Kč)",           amount: 2_400, status: "confirmed" },
      { name: "Tašky RAINBOW (150 ks × 8,10 Kč + doprava)",       amount: 1_354, status: "confirmed" },
      { name: "Balíček 1 – pohárek + káva (60 sad × 299 Kč)",     amount: 17_940, status: "confirmed" },
    ],
  },
  {
    label: "Firemní oblečení",
    items: [
      { name: "Polo tričko Collar Up 256/257 (14 ks × 441 Kč)",    amount:  6_174, status: "confirmed" },
      { name: "Tričko Slim 139 – Lucie (2 ks × 213 Kč)",           amount:    426, status: "confirmed" },
      { name: "Mikina Bomber 453/454 (7 ks × 662 Kč)",             amount:  4_634, status: "confirmed" },
      { name: "Mikina BP3869 – Lucie (1 ks × 744 Kč)",             amount:    744, status: "confirmed" },
      { name: "Potisk a výšivka (Bezpotisku.cz)",                   amount:  2_371, status: "confirmed" },
    ],
  },
  {
    label: "Ubytování týmu AIR TEAM",
    items: [
      { name: "Airbnb – Markdorf (21.–26. 4. 2026)", amount: 0, note: "Cena bude doplněna", status: "tbd" },
    ],
  },
];

const STATUS_CONFIG = {
  confirmed: { label: "Zahrnuto",  color: "var(--color-at-blue-v1)", bg: "var(--color-at-blue-a5)" },
  tbd:       { label: "TBD",       color: "var(--color-at-blue-v1)", bg: "#f59e0b" },
};

export default function SlideTotalCosts() {
  const confirmedTotal = CATEGORIES.flatMap((c) => c.items)
    .filter((i) => i.status === "confirmed")
    .reduce((s, i) => s + i.amount, 0);

  const categoryTotals = CATEGORIES.map((cat) => ({
    label: cat.label,
    confirmed: cat.items.filter((i) => i.status === "confirmed").reduce((s, i) => s + i.amount, 0),
    hasTbd: cat.items.some((i) => i.status === "tbd"),
  }));

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Souhrn · Celkové náklady
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Kompletní náklady na veletrh
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          AERO EXPO 2026, Friedrichshafen · 22.–25. 4. 2026 · Všechny potvrzené i otevřené položky
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Mobile card view */}
        <div className="md:hidden flex flex-col gap-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-at-blue-v4)" }}>
              <div
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest"
                style={{ background: "var(--color-at-blue-v2)", color: "var(--color-at-blue-v5)" }}
              >
                {cat.label}
              </div>
              {cat.items.map((item) => {
                const sc = STATUS_CONFIG[item.status];
                return (
                  <div
                    key={item.name}
                    className="px-4 py-3"
                    style={{ background: "var(--color-at-blue-v1)", borderBottom: "1px solid var(--color-at-blue-v3)" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm" style={{ color: "var(--color-at-white)" }}>{item.name}</span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {sc.label}
                      </span>
                    </div>
                    {item.note && (
                      <p className="mt-0.5 text-xs" style={{ color: "var(--color-at-blue-v5)" }}>({item.note})</p>
                    )}
                    {item.amount > 0 && (
                      <div className="mt-1 text-right font-black text-base" style={{ color: "var(--color-at-white)" }}>
                        {item.amount.toLocaleString("cs-CZ")} Kč
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div
          className="hidden md:block overflow-x-auto rounded-xl"
          style={{ border: "1px solid var(--color-at-blue-v4)" }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[2.5fr_3fr_1fr_1fr] px-4 py-2.5 text-xs font-bold uppercase tracking-widest sticky top-0 min-w-[520px]"
            style={{
              background: "var(--color-at-blue)",
              color: "var(--color-at-white)",
              borderBottom: "2px solid var(--color-at-blue-v4)",
            }}
          >
            <span>Kategorie</span>
            <span>Položka</span>
            <span className="text-right">Částka</span>
            <span className="text-center">Stav</span>
          </div>

          {CATEGORIES.map((cat) => (
            <div key={cat.label}>
              {/* Category heading */}
              <div
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "var(--color-at-blue-v2)",
                  color: "var(--color-at-blue-v5)",
                  borderBottom: "1px solid var(--color-at-blue-v3)",
                }}
              >
                {cat.label}
              </div>

              {cat.items.map((item, i) => {
                const sc = STATUS_CONFIG[item.status];
                return (
                  <div
                    key={item.name}
                    className="grid grid-cols-[2.5fr_3fr_1fr_1fr] px-4 py-2.5 text-sm items-center min-w-[520px]"
                    style={{
                      background: i % 2 === 0 ? "var(--color-at-blue-v1)" : "rgba(27,63,103,0.5)",
                      borderBottom: "1px solid var(--color-at-blue-v3)",
                    }}
                  >
                    <span />
                    <div>
                      <span style={{ color: "var(--color-at-white)" }}>{item.name}</span>
                      {item.note && (
                        <span className="text-xs ml-2" style={{ color: "var(--color-at-blue-v5)" }}>
                          ({item.note})
                        </span>
                      )}
                    </div>
                    <span
                      className="text-right font-bold tabular-nums"
                      style={{ color: item.amount > 0 ? "var(--color-at-white)" : "var(--color-at-blue-v4)" }}
                    >
                      {item.amount > 0 ? `${item.amount.toLocaleString("cs-CZ")} Kč` : "–"}
                    </span>
                    <span className="flex justify-center">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {sc.label}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right summary panel */}
        <div className="flex flex-col gap-4 w-full lg:w-64 flex-shrink-0">
          {/* Grand total */}
          <div
            className="rounded-xl p-5 flex flex-col gap-1"
            style={{ background: "var(--color-at-blue-v1)", border: "2px solid var(--color-at-red)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-at-blue-v5)" }}>
              Celkem potvrzeno
            </p>
            <p className="text-3xl font-black mt-1" style={{ color: "var(--color-at-white)" }}>
              {confirmedTotal.toLocaleString("cs-CZ")} Kč
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-at-blue-v5)" }}>
              Bez DPH · bez TBD položek a ubytování
            </p>
          </div>

          {/* By category */}
          <div
            className="rounded-xl px-4 py-4 flex flex-col gap-3"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-at-blue-v5)" }}>
              Dle kategorie
            </p>
            {categoryTotals.map((ct) => (
              <div key={ct.label}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs leading-snug" style={{ color: "var(--color-at-blue-v5)" }}>
                    {ct.label}
                  </span>
                  <span className="text-sm font-black tabular-nums whitespace-nowrap" style={{ color: "var(--color-at-white)" }}>
                    {ct.confirmed > 0 ? `${ct.confirmed.toLocaleString("cs-CZ")} Kč` : "TBD"}
                  </span>
                </div>
                {ct.hasTbd && (
                  <p className="text-xs mt-0.5" style={{ color: "#f59e0b" }}>+ TBD položky</p>
                )}
              </div>
            ))}
            <div
              className="flex justify-between pt-3 mt-1"
              style={{ borderTop: "1px solid var(--color-at-blue-v3)" }}
            >
              <span className="text-sm font-black" style={{ color: "var(--color-at-white)" }}>CELKEM</span>
              <span className="text-sm font-black tabular-nums" style={{ color: "var(--color-at-white)" }}>
                {confirmedTotal.toLocaleString("cs-CZ")} Kč
              </span>
            </div>
          </div>

          {/* Warning TBD */}
          <div
            className="rounded-lg px-4 py-3 flex flex-col gap-1"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid #f59e0b" }}
          >
            <p className="text-sm font-bold" style={{ color: "#f59e0b" }}>⚠ Nezahrnuto (TBD)</p>
            <ul className="text-xs flex flex-col gap-1 mt-1" style={{ color: "#f59e0b" }}>
              <li>· Ubytování AIR TEAM (Airbnb Markdorf)</li>
              <li>· Kuchynka stánku (5 000 Kč)</li>
              <li>· Technické služby stánku</li>
              <li>· Mikina Lucie (Bezpotisku.cz) – k objednání</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
