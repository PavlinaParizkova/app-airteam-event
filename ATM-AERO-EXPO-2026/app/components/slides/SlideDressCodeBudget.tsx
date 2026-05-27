type ClothingRow = {
  item: string;
  model: string;
  gender: "Muži" | "Ženy" | "Lucie";
  qty: number;
  unitPrice: number;
};

type PrintRow = {
  item: string;
  desc: string;
  qty: number;
  unitPrice: number;
};

const ROWS: ClothingRow[] = [
  { item: "Polo tričko", model: "Collar Up 256",              gender: "Muži",  qty: 12, unitPrice: 441 },
  { item: "Mikina",      model: "Bomber 453",                 gender: "Muži",  qty: 6,  unitPrice: 662 },
  { item: "Polo tričko", model: "Collar Up 257",              gender: "Ženy",  qty: 2,  unitPrice: 441 },
  { item: "Mikina",      model: "Bomber 454",                 gender: "Ženy",  qty: 1,  unitPrice: 662 },
  { item: "Tričko",      model: "Slim 139 (Lucie)",           gender: "Lucie", qty: 2,  unitPrice: 213 },
  { item: "Mikina",      model: "Nabírané rukávy BP3869 (Lucie)", gender: "Lucie", qty: 1, unitPrice: 744 },
];

const PRINT_ROWS: PrintRow[] = [
  { item: "Potisk záda", desc: "Polokošile/trika (≤ 150 cm², 2 barvy)", qty: 16, unitPrice: 49.5 },
  { item: "Potisk záda", desc: "Mikiny (≤ 750 cm², 2 barvy)", qty: 8, unitPrice: 53.5 },
  { item: "Výšivka",     desc: "AIR TEAM logo", qty: 24, unitPrice: 45 },
  { item: "Výšivka",     desc: "Křídla (vlastní košile)", qty: 1, unitPrice: 35 },
  { item: "Potisk",      desc: "Límeček GARMIN (vlastní košile)", qty: 1, unitPrice: 35.5 },
];

const GENDER_BADGE: Record<string, { bg: string; color: string }> = {
  Muži:  { bg: "var(--color-at-blue-v3)", color: "var(--color-at-white)" },
  Ženy:  { bg: "var(--color-at-blue-v5)", color: "var(--color-at-blue-v1)" },
  Lucie: { bg: "rgba(245,158,11,0.2)",    color: "#f59e0b" },
};

export default function SlideDressCodeBudget() {
  const totalMuzi  = ROWS.filter((r) => r.gender === "Muži").reduce((s, r) => s + r.qty * r.unitPrice, 0);
  const totalZeny  = ROWS.filter((r) => r.gender !== "Muži").reduce((s, r) => s + r.qty * r.unitPrice, 0);
  const totalClothing = totalMuzi + totalZeny;

  const totalPrint = PRINT_ROWS.reduce((s, r) => s + r.qty * r.unitPrice, 0);
  const totalAll   = totalClothing + totalPrint;

  const totalPolo   = ROWS.filter((r) => r.item === "Polo tričko" || r.item === "Tričko").reduce((s, r) => s + r.qty * r.unitPrice, 0);
  const totalMikina = ROWS.filter((r) => r.item === "Mikina").reduce((s, r) => s + r.qty * r.unitPrice, 0);

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Dress Code · Rozpočet
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Náklady na firemní oblečení
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          AERO EXPO 2026 · Malfini Premium + Bezpotisku.cz · 6 mužů + 2 ženy · 24 ks celkem
        </p>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Mobile card view */}
        <div className="md:hidden flex flex-col gap-2">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-at-blue-v4)" }}>
            {ROWS.map((row) => {
              const badge = GENDER_BADGE[row.gender];
              return (
                <div
                  key={`${row.model}-${row.gender}`}
                  className="px-4 py-3"
                  style={{ background: "var(--color-at-blue-v1)", borderBottom: "1px solid var(--color-at-blue-v3)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm" style={{ color: "var(--color-at-white)" }}>
                      {row.item}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {row.gender}
                    </span>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: "var(--color-at-blue-v5)" }}>{row.model}</p>
                  <div className="flex justify-between mt-1.5 text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                    <span>{row.qty} ks · {row.unitPrice.toLocaleString("cs-CZ")} Kč / ks</span>
                    <span className="font-black text-sm" style={{ color: "var(--color-at-white)" }}>
                      {(row.qty * row.unitPrice).toLocaleString("cs-CZ")} Kč
                    </span>
                  </div>
                </div>
              );
            })}
            <div
              className="flex justify-between px-4 py-2.5 text-sm"
              style={{ background: "var(--color-at-blue)", borderTop: "2px solid var(--color-at-blue-v4)" }}
            >
              <span className="font-black" style={{ color: "var(--color-at-white)" }}>
                CELKEM · {ROWS.reduce((s, r) => s + r.qty, 0)} ks
              </span>
              <span className="font-black" style={{ color: "var(--color-at-white)" }}>
                {totalAll.toLocaleString("cs-CZ")} Kč
              </span>
            </div>
            <div
              className="px-4 py-2.5"
              style={{ background: "var(--color-at-blue-v2)", borderTop: "1px solid var(--color-at-blue-v4)" }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: "var(--color-at-blue-v5)" }}>Potisk a výšivka</p>
              <span className="text-xs font-black" style={{ color: "var(--color-at-white)" }}>
                {totalPrint.toLocaleString("cs-CZ")} Kč
              </span>
            </div>
            <div
              className="flex justify-between px-4 py-2.5 text-sm"
              style={{ background: "var(--color-at-blue)", borderTop: "2px solid var(--color-at-red)" }}
            >
              <span className="font-black" style={{ color: "var(--color-at-white)" }}>CELKEM VČ. POTISKU</span>
              <span className="font-black" style={{ color: "var(--color-at-white)" }}>
                {totalAll.toLocaleString("cs-CZ")} Kč
              </span>
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div
          className="hidden md:block rounded-xl overflow-x-auto"
          style={{ border: "1px solid var(--color-at-blue-v4)" }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] px-4 py-2.5 text-xs font-bold uppercase tracking-widest sticky top-0 min-w-[560px]"
            style={{
              background: "var(--color-at-blue)",
              color: "var(--color-at-white)",
              borderBottom: "2px solid var(--color-at-blue-v4)",
            }}
          >
            <span>Produkt</span>
            <span>Model</span>
            <span className="text-center">Pohlaví</span>
            <span className="text-right">Počet</span>
            <span className="text-right">Cena / ks</span>
            <span className="text-right">Celkem</span>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => {
            const badge = GENDER_BADGE[row.gender];
            return (
              <div
                key={`${row.model}-${row.gender}`}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] px-4 py-3 text-sm items-center min-w-[560px]"
                style={{
                  background: i % 2 === 0 ? "var(--color-at-blue-v1)" : "var(--color-at-blue-v2)",
                  borderBottom: "1px solid var(--color-at-blue-v3)",
                }}
              >
                <span className="font-semibold" style={{ color: "var(--color-at-white)" }}>
                  {row.item}
                </span>
                <span style={{ color: "var(--color-at-blue-v5)" }}>{row.model}</span>
                <span className="flex justify-center">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {row.gender}
                  </span>
                </span>
                <span className="text-right font-bold tabular-nums" style={{ color: "var(--color-at-white)" }}>
                  {row.qty} ks
                </span>
                <span className="text-right tabular-nums" style={{ color: "var(--color-at-blue-v5)" }}>
                  {row.unitPrice.toLocaleString("cs-CZ")} Kč
                </span>
                <span className="text-right font-black tabular-nums" style={{ color: "var(--color-at-white)" }}>
                  {(row.qty * row.unitPrice).toLocaleString("cs-CZ")} Kč
                </span>
              </div>
            );
          })}

          {/* Total row */}
          <div
            className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] px-4 py-3 text-sm min-w-[560px]"
            style={{
              background: "var(--color-at-blue)",
              borderTop: "2px solid var(--color-at-blue-v4)",
            }}
          >
            <span className="font-black" style={{ color: "var(--color-at-white)" }}>CELKEM</span>
            <span />
            <span />
            <span className="text-right font-black tabular-nums" style={{ color: "var(--color-at-white)" }}>
              {ROWS.reduce((s, r) => s + r.qty, 0)} ks
            </span>
            <span />
            <span className="text-right font-black tabular-nums" style={{ color: "var(--color-at-white)" }}>
              {totalAll.toLocaleString("cs-CZ")} Kč
            </span>
          </div>
          {/* Potisk / výšivka section */}
          <div
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest min-w-[560px]"
            style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)", borderTop: "2px solid var(--color-at-blue-v4)" }}
          >
            Potisk a výšivka
          </div>
          {PRINT_ROWS.map((row, i) => (
            <div
              key={`${row.item}-${row.desc}`}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] px-4 py-2.5 text-sm items-center min-w-[560px]"
              style={{
                background: i % 2 === 0 ? "var(--color-at-blue-v1)" : "var(--color-at-blue-v2)",
                borderBottom: "1px solid var(--color-at-blue-v3)",
              }}
            >
              <span className="font-semibold" style={{ color: "var(--color-at-white)" }}>{row.item}</span>
              <span style={{ color: "var(--color-at-blue-v5)" }}>{row.desc}</span>
              <span />
              <span className="text-right font-bold tabular-nums" style={{ color: "var(--color-at-white)" }}>{row.qty} ks</span>
              <span className="text-right tabular-nums" style={{ color: "var(--color-at-blue-v5)" }}>{row.unitPrice.toLocaleString("cs-CZ")} Kč</span>
              <span className="text-right font-black tabular-nums" style={{ color: "var(--color-at-white)" }}>{(row.qty * row.unitPrice).toLocaleString("cs-CZ")} Kč</span>
            </div>
          ))}

          {/* Grand total */}
          <div
            className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] px-4 py-3 text-sm min-w-[560px]"
            style={{ background: "var(--color-at-blue)", borderTop: "2px solid var(--color-at-red)" }}
          >
            <span className="font-black" style={{ color: "var(--color-at-white)" }}>CELKEM VČ. POTISKU</span>
            <span />
            <span />
            <span />
            <span />
            <span className="text-right font-black tabular-nums" style={{ color: "var(--color-at-white)" }}>
              {totalAll.toLocaleString("cs-CZ")} Kč
            </span>
          </div>
        </div>

        {/* Right summary panel */}
        <div className="flex flex-col gap-4 w-full lg:w-56 flex-shrink-0">
          {/* Total */}
          <div
            className="rounded-xl p-5 flex flex-col gap-1"
            style={{ background: "var(--color-at-blue-v1)", border: "2px solid var(--color-at-red)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-at-blue-v5)" }}>
              Celkové náklady
            </p>
            <p className="text-3xl font-black mt-1" style={{ color: "var(--color-at-white)" }}>
              {totalAll.toLocaleString("cs-CZ")} Kč
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-at-blue-v5)" }}>
              Oblečení {totalClothing.toLocaleString("cs-CZ")} Kč + potisk {totalPrint.toLocaleString("cs-CZ")} Kč
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-at-blue-v4)" }}>
              Faktura KaPO č. 44260375: 13 604 Kč bez DPH / 16 461 Kč s DPH
            </p>
          </div>

          {/* Breakdown by gender */}
          <div
            className="rounded-lg px-4 py-3 flex flex-col gap-2"
            style={{ background: "var(--color-at-blue-a5)", border: "1px solid var(--color-at-blue-v4)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-at-blue-v3)" }}>
              Dle pohlaví
            </p>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--color-at-blue-v2)" }}>Muži (6 os.)</span>
              <span className="text-sm font-black tabular-nums" style={{ color: "var(--color-at-blue-v1)" }}>
                {totalMuzi.toLocaleString("cs-CZ")} Kč
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--color-at-blue-v2)" }}>Ženy + Lucie (2 os.)</span>
              <span className="text-sm font-black tabular-nums" style={{ color: "var(--color-at-blue-v1)" }}>
                {totalZeny.toLocaleString("cs-CZ")} Kč
              </span>
            </div>
          </div>

          {/* Breakdown by type */}
          <div
            className="rounded-lg px-4 py-3 flex flex-col gap-2"
            style={{ background: "var(--color-at-blue-a5)", border: "1px solid var(--color-at-blue-v4)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-at-blue-v3)" }}>
              Dle produktu
            </p>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--color-at-blue-v2)" }}>Polokošile / tričko</span>
              <span className="text-sm font-black tabular-nums" style={{ color: "var(--color-at-blue-v1)" }}>
                {totalPolo.toLocaleString("cs-CZ")} Kč
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: "var(--color-at-blue-v2)" }}>Mikiny</span>
              <span className="text-sm font-black tabular-nums" style={{ color: "var(--color-at-blue-v1)" }}>
                {totalMikina.toLocaleString("cs-CZ")} Kč
              </span>
            </div>
          </div>

          {/* Status */}
          <div
            className="rounded-lg px-4 py-3 flex flex-col gap-1 mt-auto"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            <p className="text-sm font-bold" style={{ color: "#22c55e" }}>✓ Stav objednávky</p>
            <ul className="text-xs flex flex-col gap-1 mt-1" style={{ color: "#22c55e" }}>
              <li>· Oblečení Malfini – fakturováno</li>
              <li>· Potisk a výšivka – fakturováno</li>
              <li>· Mikina Lucie (Bezpotisku.cz) – k objednání</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
