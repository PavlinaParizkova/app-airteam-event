type CostRow = {
  supplier: string;
  description: string;
  invoice: string;
  amount: number;
  isAsset?: boolean;
};

const COSTS: CostRow[] = [
  { supplier: "ML1 expo s.r.o.",         description: "Výroba expozice AERO 2026",              invoice: "Z26001 2026064", amount: 293_886 },
  { supplier: "VKF Renzel ČR s.r.o.",    description: "Cube systém",                             invoice: "0000044750",    amount: 72_300, isAsset: true },
  { supplier: "Petr Moravčík",           description: "Garmin Panel",                            invoice: "20200004",      amount: 45_000, isAsset: true },
  { supplier: "K a P O – plus s.r.o.",   description: "Oblečení na veletrh",                    invoice: "44260375",      amount: 13_604 },
  { supplier: "RD Present s.r.o.",       description: "Keramický pohářek 330 ml",               invoice: "260100283",     amount: 12_600 },
  { supplier: "OLD STYLE, s.r.o.",       description: "Výroba 3 desek a dodání stojanu",        invoice: "260075",        amount: 9_900 },
  { supplier: "OLD STYLE, s.r.o.",       description: "Obrazy na plátno 500×500 mm",            invoice: "260073",        amount: 4_650 },
  { supplier: "LEMICOM spol. s r.o.",    description: "Zboží bez potisku",                      invoice: "1919911",       amount: 602 },
  { supplier: "Jaroslav Paučír",         description: "Vlastní energetický drink AIR TEAM",     invoice: "20060012",      amount: 3_039 },
  { supplier: "Schenker Deutschland AG", description: "Doprava z veletrhu",                     invoice: "26FPE00405",    amount: 13_874 },
  { supplier: "Schenker Deutschland AG", description: "Doprava z veletrhu AERO do VB",          invoice: "26FPT00523",    amount: 8_320 },
  { supplier: "Schenker Deutschland AG", description: "Doprava na veletrh AERO",                invoice: "26FPT00524",    amount: 6_788 },
];

const TOTAL = COSTS.reduce((s, c) => s + c.amount, 0);
const ASSETS = COSTS.filter((c) => c.isAsset).reduce((s, c) => s + c.amount, 0);
const OPERATING = TOTAL - ASSETS;

export default function SlidePostFinance() {
  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 gap-5">

      {/* Header */}
      <div>
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Vyhodnocení · Finance
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Finanční vyhodnocení
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          Celkové náklady na veletrh · plán vs. skutečnost · AERO EXPO 2026
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* Left: cost table */}
        <div className="flex-1 overflow-x-auto">
          <div
            className="rounded-xl overflow-hidden min-w-[460px]"
            style={{ border: "1px solid var(--color-at-blue-v3)" }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-[2fr_3fr_1fr] px-4 py-2.5 text-xs font-bold uppercase tracking-widest"
              style={{ background: "var(--color-at-blue)", color: "var(--color-at-white)", borderBottom: "2px solid var(--color-at-blue-v3)" }}
            >
              <span>Dodavatel</span>
              <span>Popis</span>
              <span className="text-right">Částka Kč</span>
            </div>

            {COSTS.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-[2fr_3fr_1fr] px-4 py-2.5 text-sm items-start"
                style={{
                  background: i % 2 === 0 ? "var(--color-at-blue-v1)" : "rgba(27,63,103,0.5)",
                  borderBottom: "1px solid var(--color-at-blue-v3)",
                }}
              >
                <span className="text-xs leading-snug" style={{ color: "var(--color-at-blue-v5)" }}>{row.supplier}</span>
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="text-sm" style={{ color: "var(--color-at-white)" }}>{row.description}</span>
                  {row.isAsset && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}
                    >
                      aktivum
                    </span>
                  )}
                </div>
                <span
                  className="text-right font-bold tabular-nums text-sm"
                  style={{ color: row.isAsset ? "#f59e0b" : "var(--color-at-white)" }}
                >
                  {row.amount.toLocaleString("cs-CZ")}
                </span>
              </div>
            ))}

            {/* Footer total */}
            <div
              className="grid grid-cols-[2fr_3fr_1fr] px-4 py-3"
              style={{ background: "var(--color-at-blue)", borderTop: "2px solid var(--color-at-blue-v3)" }}
            >
              <span className="font-black text-sm" style={{ color: "var(--color-at-white)" }}>CELKEM</span>
              <span />
              <span className="text-right font-black text-base tabular-nums" style={{ color: "var(--color-at-red)" }}>
                {TOTAL.toLocaleString("cs-CZ")}
              </span>
            </div>
          </div>
        </div>

        {/* Right: summary panel */}
        <div className="flex flex-col gap-4 w-full lg:w-72 flex-shrink-0">

          {/* Plan vs reality */}
          <div
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1" style={{ color: "var(--color-at-white)" }}>
              Plán vs. skutečnost
            </p>

            <div className="flex flex-col gap-1">
              <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>Předpokládané náklady (plán)</span>
              <span className="text-lg font-black tabular-nums" style={{ color: "var(--color-at-white)" }}>350 000 – 400 000 Kč</span>
            </div>

            <div className="flex flex-col gap-1" style={{ borderTop: "1px solid var(--color-at-blue-v3)", paddingTop: "0.75rem" }}>
              <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>Skutečné náklady celkem</span>
              <span className="text-xl font-black tabular-nums" style={{ color: "var(--color-at-red)" }}>
                {TOTAL.toLocaleString("cs-CZ")} Kč
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs" style={{ color: "#f59e0b" }}>z toho dlouhodobá aktiva ¹</span>
              <span className="text-base font-black tabular-nums" style={{ color: "#f59e0b" }}>
                {ASSETS.toLocaleString("cs-CZ")} Kč
              </span>
              <span className="text-xs mt-0.5" style={{ color: "var(--color-at-blue-v5)" }}>
                Cube systém + Garmin Panel — budou využívána na dalších akcích
              </span>
            </div>

            <div
              className="flex flex-col gap-1 pt-3 rounded-lg px-3 py-3"
              style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <span className="text-xs font-bold" style={{ color: "#22c55e" }}>Provozní náklady (bez aktiv)</span>
              <span className="text-xl font-black tabular-nums" style={{ color: "#22c55e" }}>
                {OPERATING.toLocaleString("cs-CZ")} Kč
              </span>
              <span className="text-xs" style={{ color: "#22c55e", opacity: 0.8 }}>
                V rámci plánu · mírně pod horní hranicí 400 000 Kč
              </span>
            </div>
          </div>

          {/* Asset note */}
          <div
            className="rounded-lg px-4 py-3"
            style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)" }}
          >
            <p className="text-xs font-bold mb-1.5" style={{ color: "#f59e0b" }}>¹ Poznámka k aktivům</p>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(245,158,11,0.8)" }}>
              Cube systém (72 300 Kč) a Garmin Panel (45 000 Kč) jsou dlouhodobá aktiva. Původní plán s touto investicí nemohl počítat dopředu. Při porovnání s plánem posuzovat odděleně.
            </p>
          </div>

          {/* Pending */}
          <div
            className="rounded-lg px-4 py-3"
            style={{ background: "rgba(80,116,153,0.15)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold mb-1.5" style={{ color: "var(--color-at-blue-v5)" }}>Zatím nezahrnuto</p>
            <ul className="text-xs flex flex-col gap-1" style={{ color: "var(--color-at-blue-v5)" }}>
              <li>· Ubytování posádky (doplnit z dokladů)</li>
              <li>· Karta Pavlína P. — 4633830171</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
