type BudgetLine = {
  category: string;
  item: string;
  qty: string;
  unitPrice?: string;
  total?: number;
  status: "confirmed" | "tbd" | "missing";
};

const LINES: BudgetLine[] = [
  {
    category: "Rozdávačky",
    item: "Energetický nápoj PilotStyle",
    qty: "100 ks",
    unitPrice: "28,93 Kč",
    total: 2893,
    status: "confirmed",
  },
  {
    category: "Rozdávačky",
    item: "Energetický nápoj ATM",
    qty: "100 ks",
    unitPrice: "28,93 Kč",
    total: 2893,
    status: "confirmed",
  },
  {
    category: "Rozdávačky",
    item: "Karamelky",
    qty: "–",
    total: 1766,
    status: "confirmed",
  },
  {
    category: "Rozdávačky",
    item: "Kuličkové pero Connel – AIR TEAM",
    qty: "100 ks",
    unitPrice: "16 Kč",
    total: 1600,
    status: "confirmed",
  },
  {
    category: "Rozdávačky",
    item: "Kuličkové pero Connel – PilotStyle",
    qty: "50 ks",
    unitPrice: "16 Kč",
    total: 800,
    status: "confirmed",
  },
  {
    category: "Rozdávačky",
    item: "Tašky RAINBOW modrá",
    qty: "150 ks",
    unitPrice: "8,10 Kč",
    total: 1354,
    status: "confirmed",
  },
  {
    category: "Balíček 1",
    item: "Keramický pohárek Qeram + káva Barahona",
    qty: "60 sad",
    unitPrice: "299 Kč",
    total: 17940,
    status: "confirmed",
  },
];

const CONFIRMED_TOTAL = 29246;

const STATUS_CONFIG = {
  confirmed: {
    label: "Potvrzeno",
    color: "var(--color-at-blue-v1)",
    bg: "var(--color-at-blue-a5)",
  },
  tbd: {
    label: "TBD",
    color: "var(--color-at-blue-v1)",
    bg: "#f59e0b",
  },
  missing: {
    label: "CHYBÍ",
    color: "var(--color-at-white)",
    bg: "var(--color-at-red)",
  },
};

const CATEGORY_ORDER = ["Rozdávačky", "Balíček 1"];

export default function SlideGiftsBudget() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    lines: LINES.filter((l) => l.category === cat),
    subtotal: LINES.filter((l) => l.category === cat).reduce(
      (s, l) => s + (l.total ?? 0),
      0
    ),
  }));

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Dárky · Rozpočet
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Sumarizace nákladů na dárky
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          AERO EXPO 2026, Friedrichshafen · 22.–25. 4. 2026
        </p>
      </div>

      {/* Main layout: table + summary side panel */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Mobile card view */}
        <div className="md:hidden flex flex-col gap-2">
          {grouped.map(({ cat, lines, subtotal }) => (
            <div key={cat} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-at-blue-v4)" }}>
              <div
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest"
                style={{ background: "var(--color-at-blue-v2)", color: "var(--color-at-blue-v5)" }}
              >
                {cat}
              </div>
              {lines.map((line) => {
                const sc = STATUS_CONFIG[line.status];
                return (
                  <div
                    key={line.item}
                    className="px-4 py-3"
                    style={{ background: "var(--color-at-blue-v1)", borderBottom: "1px solid var(--color-at-blue-v3)" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sm" style={{ color: "var(--color-at-white)" }}>
                        {line.item}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                      <span>{line.qty}</span>
                      <span>{line.unitPrice ?? "–"} / ks</span>
                    </div>
                    {line.total && (
                      <div className="mt-1 text-right font-black text-base" style={{ color: "var(--color-at-white)" }}>
                        {line.total.toLocaleString("cs-CZ")} Kč
                      </div>
                    )}
                  </div>
                );
              })}
              {subtotal > 0 && (
                <div
                  className="flex justify-between px-4 py-2 text-sm"
                  style={{ background: "var(--color-at-blue-v2)", borderTop: "2px solid var(--color-at-blue-v4)" }}
                >
                  <span style={{ color: "var(--color-at-blue-v5)" }}>Mezisoučet {cat}</span>
                  <span className="font-black" style={{ color: "var(--color-at-white)" }}>
                    {subtotal.toLocaleString("cs-CZ")} Kč
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto rounded-xl" style={{ border: "1px solid var(--color-at-blue-v4)" }}>
          {/* Table header */}
          <div
            className="grid grid-cols-[2fr_1fr_3fr_1fr_1fr_1fr] px-4 py-2.5 text-sm font-bold uppercase tracking-widest sticky top-0 min-w-[600px]"
            style={{
              background: "var(--color-at-blue)",
              color: "var(--color-at-white)",
              borderBottom: "2px solid var(--color-at-blue-v4)",
            }}
          >
            <span>Kategorie</span>
            <span>Množství</span>
            <span>Položka</span>
            <span className="text-right">Cena / ks</span>
            <span className="text-right">Celkem</span>
            <span className="text-center">Stav</span>
          </div>

          {/* Rows */}
          {grouped.map(({ cat, lines, subtotal }) => (
            <div key={cat}>
              {lines.map((line, i) => {
                const sc = STATUS_CONFIG[line.status];
                return (
                  <div
                    key={line.item}
                    className="grid grid-cols-[2fr_1fr_3fr_1fr_1fr_1fr] px-4 py-3 text-sm items-center min-w-[600px]"
                    style={{
                      background:
                        i % 2 === 0 ? "var(--color-at-blue-v1)" : "var(--color-at-blue-v2)",
                      borderBottom: "1px solid var(--color-at-blue-v3)",
                    }}
                  >
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-at-blue-v5)" }}
                    >
                      {i === 0 ? cat : ""}
                    </span>
                    <span style={{ color: "var(--color-at-white)" }}>{line.qty}</span>
                    <span style={{ color: "var(--color-at-white)" }}>{line.item}</span>
                    <span className="text-right" style={{ color: "var(--color-at-blue-v5)" }}>
                      {line.unitPrice ?? "–"}
                    </span>
                    <span
                      className="text-right font-bold"
                      style={{
                        color: line.total ? "var(--color-at-white)" : "var(--color-at-blue-v5)",
                      }}
                    >
                      {line.total ? `${line.total.toLocaleString("cs-CZ")} Kč` : "–"}
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

              {/* Category subtotal */}
              {subtotal > 0 && (
                  <div
                    className="grid grid-cols-[2fr_1fr_3fr_1fr_1fr_1fr] px-4 py-2 text-sm min-w-[600px]"
                  style={{
                    background: "var(--color-at-blue-v1)",
                    borderBottom: "2px solid var(--color-at-blue-v4)",
                  }}
                >
                  <span />
                  <span />
                  <span
                    className="text-right col-span-2 font-semibold"
                    style={{ color: "var(--color-at-blue-v5)" }}
                  >
                    Mezisoučet {cat}
                  </span>
                  <span
                    className="text-right font-black"
                    style={{ color: "var(--color-at-white)" }}
                  >
                    {subtotal.toLocaleString("cs-CZ")} Kč
                  </span>
                  <span />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right summary panel */}
        <div className="flex flex-col gap-4 w-full lg:w-56 flex-shrink-0">
          {/* Confirmed total – inverzní varianta: Blue V1 + bílý text, červený rámeček */}
          <div
            className="rounded-xl p-5 flex flex-col gap-1"
            style={{
              background: "var(--color-at-blue-v1)",
              border: "2px solid var(--color-at-red)",
            }}
          >
            <p
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "var(--color-at-white)" }}
            >
              Potvrzené náklady
            </p>
            <p className="text-3xl font-black mt-1" style={{ color: "var(--color-at-white)" }}>
              {CONFIRMED_TOTAL.toLocaleString("cs-CZ")} Kč
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-at-blue-v5)" }}>
              Včetně Balíčku 1 (60 sad). Vše potvrzeno, bez otevřených položek.
            </p>
          </div>

          {/* Breakdown by category – light card: tmavý text na světlém pozadí */}
          {grouped.map(({ cat, subtotal }) => (
            <div
              key={cat}
              className="rounded-lg px-4 py-3 flex flex-col gap-0.5"
              style={{
                background: "var(--color-at-blue-a5)",
                border: "1px solid var(--color-at-blue-v4)",
              }}
            >
              <p className="text-xs font-bold" style={{ color: "var(--color-at-blue-v3)" }}>
                {cat}
              </p>
              <p className="text-base font-black" style={{ color: "var(--color-at-blue-v1)" }}>
                {subtotal > 0 ? `${subtotal.toLocaleString("cs-CZ")} Kč` : "TBD"}
              </p>
            </div>
          ))}

          {/* All confirmed */}
          <div
            className="rounded-lg px-4 py-3 flex flex-col gap-1 mt-auto"
            style={{
              background: "rgba(147,179,207,0.08)",
              border: "1px solid var(--color-at-blue-a5)",
            }}
          >
            <p className="text-sm font-bold" style={{ color: "var(--color-at-blue-a5)" }}>
              Vše potvrzeno
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-at-blue-v5)" }}>
              Všechny položky dárků jsou zajištěny a máme je ve VB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
