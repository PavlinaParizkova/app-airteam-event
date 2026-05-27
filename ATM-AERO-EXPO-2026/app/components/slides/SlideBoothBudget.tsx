type BudgetRow = {
  name: string;
  amount: number;
  note?: string;
  status: "confirmed" | "tbd" | "client";
};

const ROWS: BudgetRow[] = [
  { name: "Podlaha",                  amount: 15_035,  note: "60 m² koberec, sokl, folie, AL hrana",             status: "confirmed" },
  { name: "Stavebnice a konstrukce",  amount: 46_520,  note: "Zázemí, jednací místnost, stěny, profily",          status: "confirmed" },
  { name: "Obvodové stěny",           amount: 88_200,  note: "82 m² plnobarevné textilie + bílé textilie 38 m²",  status: "confirmed" },
  { name: "Mobiliář",                 amount: 11_150,  note: "3× stůl, 6× křesílko, 4× křeslo, pult, 2× bar. žid.", status: "confirmed" },
  { name: "AV technika",              amount:  7_500,  note: "1× TV 75\" do jednací místnosti",                   status: "confirmed" },
  { name: "Elektroinstalace a světla",amount: 13_140,  note: "Rozvody, 22× světlo na ramínku, rozvaděč, dřez",    status: "confirmed" },
  { name: "Vybavení kuchynky",        amount:  5_000,  note: "Presovač, konvice, lednice, nádobí – dle požadavku", status: "tbd" },
  { name: "Technické služby",         amount:      0,  note: "Elektro, voda, úklid – zajišťuje klient samostatně", status: "client" },
  { name: "Náklady v místě",          amount: 54_250,  note: "Montáž, demontáž, příprava, cesta, produkce",        status: "confirmed" },
  { name: "Hotel",                    amount:  5_625,  note: "",                                                   status: "confirmed" },
  { name: "Diety",                    amount:  9_036,  note: "",                                                   status: "confirmed" },
  { name: "Doprava a spedice",        amount: 24_600,  note: "Kamion 600 km + osobní auto 600 km",                 status: "confirmed" },
  { name: "Grafika",                  amount:  1_480,  note: "Polep dveří (ostatní grafika v ceně stěn)",          status: "confirmed" },
];

const TOTAL_NO_VAT = 281_536;
const VAT = 59_122;
const TOTAL_WITH_VAT = 340_658;

const STATUS_CONFIG = {
  confirmed: { label: "Zahrnuto",  color: "var(--color-at-blue-v1)", bg: "var(--color-at-blue-a5)" },
  tbd:       { label: "TBD",       color: "var(--color-at-blue-v1)", bg: "#f59e0b" },
  client:    { label: "Klient",    color: "var(--color-at-blue-v1)", bg: "var(--color-at-blue-v5)" },
};

const OPEN_ITEMS = [
  "Kuchyňka – potvrdit zájem (5 000 Kč)",
  "Pult recepce – vlastní nebo MLT expo?",
  "Křesílka u kokpitu – varianta kožená / šedá",
  "Počet světel – max. 22 ks, potvrdit dle layoutu",
  "Technické služby – elektro, voda, úklid zajistit",
  "Schválit nabídku a podepsat smlouvu – ASAP",
];

export default function SlideBoothBudget() {
  const confirmedTotal = ROWS.filter((r) => r.status === "confirmed").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Stánek · Rozpočet
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Nabídka MLT expo – realizace stánku
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          AERO EXPO 2026, Friedrichshafen · 22.–25. 4. 2026 · Rohový stánek 15 × 4 m (60 m²)
        </p>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Mobile card view */}
        <div className="md:hidden flex flex-col gap-2">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-at-blue-v4)" }}>
            {ROWS.map((row) => {
              const sc = STATUS_CONFIG[row.status];
              return (
                <div
                  key={row.name}
                  className="px-4 py-3"
                  style={{ background: "var(--color-at-blue-v1)", borderBottom: "1px solid var(--color-at-blue-v3)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm" style={{ color: "var(--color-at-white)" }}>
                      {row.name}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </div>
                  {row.note && (
                    <p className="mt-1 text-xs" style={{ color: "var(--color-at-blue-v5)" }}>{row.note}</p>
                  )}
                  {row.amount > 0 && (
                    <div className="mt-1.5 text-right font-black text-base" style={{ color: "var(--color-at-white)" }}>
                      {row.amount.toLocaleString("cs-CZ")} Kč
                    </div>
                  )}
                </div>
              );
            })}
            <div
              className="flex justify-between px-4 py-2.5 text-sm"
              style={{ background: "var(--color-at-blue-v2)", borderTop: "2px solid var(--color-at-blue-v4)" }}
            >
              <span style={{ color: "var(--color-at-blue-v5)" }}>Potvrzeno (bez TBD)</span>
              <span className="font-black" style={{ color: "var(--color-at-white)" }}>
                {confirmedTotal.toLocaleString("cs-CZ")} Kč
              </span>
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div
          className="hidden md:block overflow-x-auto rounded-xl"
          style={{ border: "1px solid var(--color-at-blue-v4)" }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[2.5fr_1fr_3fr_1fr] px-4 py-2.5 text-xs font-bold uppercase tracking-widest sticky top-0 min-w-[560px]"
            style={{
              background: "var(--color-at-blue)",
              color: "var(--color-at-white)",
              borderBottom: "2px solid var(--color-at-blue-v4)",
            }}
          >
            <span>Kategorie</span>
            <span className="text-right">Cena bez DPH</span>
            <span className="pl-4">Poznámka</span>
            <span className="text-center">Stav</span>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => {
            const sc = STATUS_CONFIG[row.status];
            return (
              <div
                key={row.name}
                className="grid grid-cols-[2.5fr_1fr_3fr_1fr] px-4 py-2.5 text-sm items-center min-w-[560px]"
                style={{
                  background: i % 2 === 0 ? "var(--color-at-blue-v1)" : "var(--color-at-blue-v2)",
                  borderBottom: "1px solid var(--color-at-blue-v3)",
                }}
              >
                <span className="font-semibold" style={{ color: "var(--color-at-white)" }}>
                  {row.name}
                </span>
                <span
                  className="text-right font-bold tabular-nums"
                  style={{ color: row.amount === 0 ? "var(--color-at-blue-v5)" : "var(--color-at-white)" }}
                >
                  {row.amount === 0 ? "—" : `${row.amount.toLocaleString("cs-CZ")} Kč`}
                </span>
                <span className="pl-4 text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                  {row.note}
                </span>
                <span className="flex justify-center">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded"
                    style={{ background: sc.bg, color: sc.color }}
                  >
                    {sc.label}
                  </span>
                </span>
              </div>
            );
          })}

          {/* Subtotal row */}
          <div
            className="grid grid-cols-[2.5fr_1fr_3fr_1fr] px-4 py-2.5 text-sm min-w-[560px]"
            style={{
              background: "var(--color-at-blue-v1)",
              borderTop: "2px solid var(--color-at-blue-v4)",
            }}
          >
            <span className="font-bold" style={{ color: "var(--color-at-blue-v5)" }}>
              Potvrzeno (bez TBD)
            </span>
            <span
              className="text-right font-black tabular-nums"
              style={{ color: "var(--color-at-white)" }}
            >
              {confirmedTotal.toLocaleString("cs-CZ")} Kč
            </span>
            <span />
            <span />
          </div>
        </div>

        {/* Right summary panel */}
        <div className="flex flex-col gap-4 w-full lg:w-56 flex-shrink-0">
          {/* Total bez DPH */}
          <div
            className="rounded-xl p-5 flex flex-col gap-1"
            style={{
              background: "var(--color-at-blue-v1)",
              border: "2px solid var(--color-at-red)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-at-blue-v5)" }}
            >
              Celkem bez DPH
            </p>
            <p className="text-3xl font-black mt-1" style={{ color: "var(--color-at-white)" }}>
              {TOTAL_NO_VAT.toLocaleString("cs-CZ")} Kč
            </p>
            <div
              className="mt-2 pt-2 flex flex-col gap-1"
              style={{ borderTop: "1px solid var(--color-at-blue-v3)" }}
            >
              <div className="flex justify-between text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                <span>DPH 21 %</span>
                <span>{VAT.toLocaleString("cs-CZ")} Kč</span>
              </div>
              <div
                className="flex justify-between text-sm font-bold mt-1"
                style={{ color: "var(--color-at-white)" }}
              >
                <span>Celkem s DPH</span>
                <span>{TOTAL_WITH_VAT.toLocaleString("cs-CZ")} Kč</span>
              </div>
            </div>
          </div>

          {/* Supplier info */}
          <div
            className="rounded-lg px-4 py-3 flex flex-col gap-1"
            style={{
              background: "var(--color-at-blue-a5)",
              border: "1px solid var(--color-at-blue-v4)",
            }}
          >
            <p className="text-xs font-bold" style={{ color: "var(--color-at-blue-v3)" }}>
              Dodavatel
            </p>
            <p className="text-base font-black" style={{ color: "var(--color-at-blue-v1)" }}>
              MLT expo
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-at-blue-a4)" }}>
              Rohový stánek · 60 m²<br />
              15 × 4 m
            </p>
          </div>

          {/* Open items */}
          <div
            className="rounded-lg px-4 py-3 flex flex-col gap-1 mt-auto"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid #f59e0b",
            }}
          >
            <p className="text-sm font-bold" style={{ color: "#f59e0b" }}>
              ⚠ Otevřené body
            </p>
            <ul className="text-xs flex flex-col gap-1 mt-1" style={{ color: "#f59e0b" }}>
              {OPEN_ITEMS.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
