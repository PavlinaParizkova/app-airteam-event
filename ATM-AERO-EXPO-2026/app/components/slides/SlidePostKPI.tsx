type KpiRow = {
  kpi: string;
  plan: string;
  d90: string;
  d180: string;
  d270: string;
  known?: boolean;
};

const ROWS: KpiRow[] = [
  { kpi: "Počet leadů",                           plan: "doplnit",  d90: "doplnit", d180: "doplnit", d270: "doplnit" },
  { kpi: "Počet schůzek na místě",               plan: "43",       d90: "–",       d180: "–",       d270: "–",       known: true },
  { kpi: "Hodnota obchodních příležitostí (EUR)", plan: "doplnit",  d90: "doplnit", d180: "doplnit", d270: "doplnit" },
  { kpi: "Konverze do CRM",                       plan: "doplnit",  d90: "doplnit", d180: "doplnit", d270: "doplnit" },
  { kpi: "PilotStyle – tržba na místě (Kč)",      plan: "doplnit",  d90: "–",       d180: "–",       d270: "–" },
  { kpi: "Brand awareness (social reach)",        plan: "doplnit",  d90: "–",       d180: "–",       d270: "–" },
];

const WAVES = [
  { label: "D+90",  date: "srpen 2026",   col: "d90"  },
  { label: "D+180", date: "říjen 2026",   col: "d180" },
  { label: "D+270", date: "leden 2027",   col: "d270" },
] as const;

function cellColor(value: string, known?: boolean) {
  if (value === "–") return "var(--color-at-blue-v3)";
  if (known) return "var(--color-at-red)";
  if (value === "doplnit") return "var(--color-at-blue-v5)";
  return "var(--color-at-white)";
}

export default function SlidePostKPI() {
  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 gap-5">

      {/* Header */}
      <div>
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Vyhodnocení · KPIs
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          KPI — plán vs. realita
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          Vyhodnocení probíhá ve třech vlnách: D+90 srpen 2026 · D+180 říjen 2026 · D+270 leden 2027
        </p>
      </div>

      {/* Wave badges */}
      <div className="flex flex-wrap gap-3">
        {WAVES.map((w) => (
          <div
            key={w.label}
            className="rounded-lg px-4 py-3 flex flex-col gap-0.5"
            style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-at-blue-v5)" }}>
              {w.label}
            </span>
            <span className="text-sm font-black" style={{ color: "var(--color-at-white)" }}>{w.date}</span>
          </div>
        ))}
        <div
          className="rounded-lg px-4 py-3 flex flex-col gap-0.5"
          style={{ background: "rgba(213,28,23,0.08)", border: "1px solid rgba(213,28,23,0.25)" }}
        >
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-at-red)" }}>
            Nyní známo
          </span>
          <span className="text-sm font-black" style={{ color: "var(--color-at-white)" }}>43 schůzek</span>
        </div>
      </div>

      {/* KPI table – desktop */}
      <div className="overflow-x-auto rounded-xl hidden md:block" style={{ border: "1px solid var(--color-at-blue-v3)" }}>
        {/* Header */}
        <div
          className="grid text-xs font-bold uppercase tracking-widest px-4 py-2.5 min-w-[600px]"
          style={{
            gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr",
            background: "var(--color-at-blue)",
            color: "var(--color-at-white)",
            borderBottom: "2px solid var(--color-at-blue-v3)",
          }}
        >
          <span>KPI</span>
          <span className="text-center">Plán</span>
          <span className="text-center">D+90</span>
          <span className="text-center">D+180</span>
          <span className="text-center">D+270</span>
        </div>

        {ROWS.map((row, i) => (
          <div
            key={row.kpi}
            className="grid px-4 py-3 text-sm items-center min-w-[600px]"
            style={{
              gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr",
              background: i % 2 === 0 ? "var(--color-at-blue-v1)" : "rgba(27,63,103,0.5)",
              borderBottom: i < ROWS.length - 1 ? "1px solid var(--color-at-blue-v3)" : "none",
            }}
          >
            <span style={{ color: "var(--color-at-white)" }}>{row.kpi}</span>
            <span
              className="text-center font-bold tabular-nums"
              style={{ color: cellColor(row.plan, row.known) }}
            >
              {row.plan}
            </span>
            <span
              className="text-center tabular-nums"
              style={{ color: cellColor(row.d90) }}
            >
              {row.d90}
            </span>
            <span
              className="text-center tabular-nums"
              style={{ color: cellColor(row.d180) }}
            >
              {row.d180}
            </span>
            <span
              className="text-center tabular-nums"
              style={{ color: cellColor(row.d270) }}
            >
              {row.d270}
            </span>
          </div>
        ))}
      </div>

      {/* KPI table – mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {ROWS.map((row) => (
          <div
            key={row.kpi}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--color-at-blue-v3)" }}
          >
            <div
              className="px-4 py-2.5 text-sm font-semibold"
              style={{ background: "var(--color-at-blue-v2)", color: "var(--color-at-white)" }}
            >
              {row.kpi}
            </div>
            <div className="grid grid-cols-4 px-4 py-2 gap-2" style={{ background: "var(--color-at-blue-v1)" }}>
              {[
                { label: "Plán", value: row.plan, known: row.known },
                { label: "D+90", value: row.d90 },
                { label: "D+180", value: row.d180 },
                { label: "D+270", value: row.d270 },
              ].map((c) => (
                <div key={c.label} className="flex flex-col gap-0.5 items-center">
                  <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>{c.label}</span>
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: cellColor(c.value, (c as { known?: boolean }).known) }}
                  >
                    {c.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-auto">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: "var(--color-at-red)" }} />
          <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>Potvrzeno</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: "var(--color-at-blue-v5)" }} />
          <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>Čeká na doplnění</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: "var(--color-at-blue-v3)" }} />
          <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>Neměří se v dané vlně</span>
        </div>
      </div>
    </div>
  );
}
