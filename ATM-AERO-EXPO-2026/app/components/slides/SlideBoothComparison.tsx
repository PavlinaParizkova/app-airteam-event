type CompRow = {
  category: string;
  mlt: number;
  exponex: number;
  note: string;
};

const ROWS: CompRow[] = [
  {
    category: "Podlaha a koberec",
    mlt:      15_035,
    exponex:  68_026,
    note: "Exponex: 36 mm výška + koberec; MLT: koberec, sokl, folie",
  },
  {
    category: "Stěny, konstrukce, grafika",
    mlt:     136_200,
    exponex: 179_294,
    note: "MLT: strečové textilie vč. plnobarevného tisku; Exponex: panelové stěny + opce 1.3b + grafika",
  },
  {
    category: "Mobiliář a zázemí",
    mlt:  16_150,
    exponex: 32_265,
    note: "MLT: stoly, křesla, pult, bar. žid.; Exponex: showcase pult G3X, stůl + 6 žid., sedačky, sklad",
  },
  {
    category: "Elektroinstalace a AV",
    mlt:  20_640,
    exponex: 41_310,
    note: "MLT: 75\" TV, 22× světlo; Exponex: 55\" TV, rozvaděč, kabeláž, světla",
  },
  {
    category: "Transport stánku",
    mlt:  24_600,
    exponex: 156_000,
    note: "MLT: kamion + auto 600 km; Exponex: kamion + spedice na výstavišti",
  },
  {
    category: "Montáž, demontáž, PM",
    mlt:  54_250,
    exponex: 279_760,
    note: "MLT: montáž+demontáž vč. přípravy; Exponex: 5 lidí · 3+1 den + PM + organizace + doprava týmu",
  },
  {
    category: "Ubytování a diety",
    mlt:  14_661,
    exponex: 39_780,
    note: "MLT: hotel + diety dle norem; Exponex: ubytování týmu",
  },
];

const MLT_TOTAL_NO_VAT = 281_536;
const MLT_TOTAL_WITH_VAT = 340_658;
const EXP_TOTAL_13B = 796_435;
const EXP_TOTAL_13A = 817_449;

const MAX_BAR = Math.max(...ROWS.map((r) => Math.max(r.mlt, r.exponex)));

function Bar({ value, color }: { value: number; color: string }) {
  const pct = Math.round((value / MAX_BAR) * 100);
  return (
    <div
      style={{
        width: "100%",
        height: 5,
        background: "var(--color-at-blue-v3)",
        borderRadius: 3,
        marginTop: 3,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: 3,
          background: color,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

export default function SlideBoothComparison() {
  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Stánek · Porovnání nabídek
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          MLT expo vs Exponex s.r.o.
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          AERO EXPO 2026 · Rohový stánek 60 m² · Exponex cena s opcí 1.3b (meshbanner)
        </p>
      </div>

      {/* Supplier totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-5">
        {/* MLT expo */}
        <div
          className="rounded-xl px-5 py-4 flex flex-col gap-0.5"
          style={{
            background: "var(--color-at-blue-v1)",
            border: "2px solid var(--color-at-blue-v3)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-at-blue-v5)" }}>
            MLT expo
          </p>
          <p className="text-2xl font-black" style={{ color: "var(--color-at-white)" }}>
            {MLT_TOTAL_NO_VAT.toLocaleString("cs-CZ")} Kč
          </p>
          <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
            bez DPH · s DPH: {MLT_TOTAL_WITH_VAT.toLocaleString("cs-CZ")} Kč
          </p>
        </div>

        {/* Exponex */}
        <div
          className="rounded-xl px-5 py-4 flex flex-col gap-0.5"
          style={{
            background: "var(--color-at-blue-v1)",
            border: "2px solid var(--color-at-red)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-at-blue-v5)" }}>
            Exponex s.r.o.
          </p>
          <p className="text-2xl font-black" style={{ color: "var(--color-at-white)" }}>
            {EXP_TOTAL_13B.toLocaleString("cs-CZ")} Kč
          </p>
          <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
            s opcí 1.3b · s opcí 1.3a: {EXP_TOTAL_13A.toLocaleString("cs-CZ")} Kč
          </p>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden flex flex-col gap-2 mb-3">
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-at-blue-v4)" }}>
          {ROWS.map((row) => {
            const diff = row.exponex - row.mlt;
            const ratio = (row.exponex / row.mlt).toFixed(1);
            return (
              <div
                key={row.category}
                className="px-4 py-3"
                style={{ background: "var(--color-at-blue-v1)", borderBottom: "1px solid var(--color-at-blue-v3)" }}
              >
                <span className="font-semibold text-sm" style={{ color: "var(--color-at-white)" }}>
                  {row.category}
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-xs font-bold uppercase" style={{ color: "#93cfb3" }}>MLT expo</p>
                    <p className="font-black tabular-nums" style={{ color: "#93cfb3" }}>
                      {row.mlt.toLocaleString("cs-CZ")} Kč
                    </p>
                    <Bar value={row.mlt} color="#93cfb3" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase" style={{ color: "#cf9393" }}>Exponex</p>
                    <p className="font-black tabular-nums" style={{ color: "#cf9393" }}>
                      {row.exponex.toLocaleString("cs-CZ")} Kč
                    </p>
                    <Bar value={row.exponex} color="#cf9393" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded"
                    style={{ background: "rgba(213,28,23,0.12)", color: "var(--color-at-red)" }}
                  >
                    +{diff.toLocaleString("cs-CZ")} Kč ({ratio}×)
                  </span>
                </div>
                <p className="mt-1.5 text-xs" style={{ color: "var(--color-at-blue-v5)" }}>{row.note}</p>
              </div>
            );
          })}
          <div
            className="px-4 py-3 flex flex-col gap-1"
            style={{ background: "var(--color-at-blue)", borderTop: "2px solid var(--color-at-blue-v4)" }}
          >
            <span className="font-black text-sm" style={{ color: "var(--color-at-white)" }}>CELKEM bez DPH</span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <p className="text-xs" style={{ color: "#93cfb3" }}>MLT expo</p>
                <p className="font-black tabular-nums" style={{ color: "#93cfb3" }}>
                  {MLT_TOTAL_NO_VAT.toLocaleString("cs-CZ")} Kč
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "#cf9393" }}>Exponex</p>
                <p className="font-black tabular-nums" style={{ color: "#cf9393" }}>
                  {EXP_TOTAL_13B.toLocaleString("cs-CZ")} Kč
                </p>
              </div>
            </div>
            <span
              className="text-sm font-black px-2 py-1 rounded mt-1 self-start"
              style={{ background: "rgba(213,28,23,0.18)", color: "var(--color-at-red)" }}
            >
              +{(EXP_TOTAL_13B - MLT_TOTAL_NO_VAT).toLocaleString("cs-CZ")} Kč
            </span>
          </div>
        </div>
      </div>

      {/* Desktop comparison table */}
      <div
        className="hidden md:block overflow-x-auto rounded-xl"
        style={{ border: "1px solid var(--color-at-blue-v4)" }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-[2fr_1fr_1fr_1fr_2.5fr] px-4 py-2.5 text-xs font-bold uppercase tracking-widest sticky top-0 min-w-[560px]"
          style={{
            background: "var(--color-at-blue)",
            color: "var(--color-at-white)",
            borderBottom: "2px solid var(--color-at-blue-v4)",
          }}
        >
          <span>Kategorie</span>
          <span className="text-right" style={{ color: "#93cfb3" }}>MLT expo</span>
          <span className="text-right" style={{ color: "#cf9393" }}>Exponex</span>
          <span className="text-right">Rozdíl</span>
          <span className="pl-4">Poznámka</span>
        </div>

        {/* Rows */}
        {ROWS.map((row, i) => {
          const diff = row.exponex - row.mlt;
          const ratio = (row.exponex / row.mlt).toFixed(1);
          return (
            <div
              key={row.category}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_2.5fr] px-4 py-3 text-sm items-start min-w-[560px]"
              style={{
                background: i % 2 === 0 ? "var(--color-at-blue-v1)" : "var(--color-at-blue-v2)",
                borderBottom: "1px solid var(--color-at-blue-v3)",
              }}
            >
              <span className="font-semibold pt-0.5" style={{ color: "var(--color-at-white)" }}>
                {row.category}
              </span>
              <div className="text-right">
                <span className="font-bold tabular-nums text-sm" style={{ color: "#93cfb3" }}>
                  {row.mlt.toLocaleString("cs-CZ")} Kč
                </span>
                <Bar value={row.mlt} color="#93cfb3" />
              </div>
              <div className="text-right">
                <span className="font-bold tabular-nums text-sm" style={{ color: "#cf9393" }}>
                  {row.exponex.toLocaleString("cs-CZ")} Kč
                </span>
                <Bar value={row.exponex} color="#cf9393" />
              </div>
              <div className="text-right">
                <span
                  className="text-xs font-bold px-2 py-1 rounded"
                  style={{
                    background: "rgba(213,28,23,0.12)",
                    color: "var(--color-at-white)",
                  }}
                >
                  +{diff.toLocaleString("cs-CZ")} Kč
                </span>
                <p className="text-xs mt-1" style={{ color: "var(--color-at-blue-v5)" }}>
                  {ratio}×
                </p>
              </div>
              <span className="pl-4 text-xs pt-0.5" style={{ color: "var(--color-at-blue-v5)" }}>
                {row.note}
              </span>
            </div>
          );
        })}

        {/* Total row */}
        <div
          className="grid grid-cols-[2fr_1fr_1fr_1fr_2.5fr] px-4 py-3 text-sm min-w-[560px]"
          style={{
            background: "var(--color-at-blue)",
            borderTop: "2px solid var(--color-at-blue-v4)",
          }}
        >
          <span className="font-black" style={{ color: "var(--color-at-white)" }}>
            CELKEM bez DPH
          </span>
          <span className="text-right font-black tabular-nums" style={{ color: "#93cfb3" }}>
            {MLT_TOTAL_NO_VAT.toLocaleString("cs-CZ")} Kč
          </span>
          <span className="text-right font-black tabular-nums" style={{ color: "#cf9393" }}>
            {EXP_TOTAL_13B.toLocaleString("cs-CZ")} Kč
          </span>
          <span className="text-right">
            <span
              className="text-sm font-black px-2 py-1 rounded"
              style={{ background: "rgba(213,28,23,0.18)", color: "var(--color-at-white)" }}
            >
              +{(EXP_TOTAL_13B - MLT_TOTAL_NO_VAT).toLocaleString("cs-CZ")} Kč
            </span>
          </span>
          <span
            className="pl-4 text-xs font-semibold"
            style={{ color: "var(--color-at-blue-v5)" }}
          >
            Exponex je o {((EXP_TOTAL_13B / MLT_TOTAL_NO_VAT) * 100 - 100).toFixed(0)}&nbsp;% dražší. Největší rozdíl: montáž&nbsp;+&nbsp;logistika (+{(279_760 - 54_250).toLocaleString("cs-CZ")}&nbsp;Kč) a transport (+{(156_000 - 24_600).toLocaleString("cs-CZ")}&nbsp;Kč).
          </span>
        </div>
      </div>

      {/* Bottom note */}
      <div
        className="mt-3 rounded-lg px-4 py-2.5 flex gap-3 items-start"
        style={{
          background: "rgba(245,158,11,0.07)",
          border: "1px solid rgba(245,158,11,0.4)",
        }}
      >
        <span style={{ color: "#f59e0b" }}>⚠</span>
        <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
          <strong style={{ color: "var(--color-at-white)" }}>Exponex OPCE:</strong> Při výběru opce 1.3a (plný panel, grafika z obou stran) je cena {EXP_TOTAL_13A.toLocaleString("cs-CZ")}&nbsp;Kč. Při opci 1.3b (meshbanner) {EXP_TOTAL_13B.toLocaleString("cs-CZ")}&nbsp;Kč.&nbsp;
          <strong style={{ color: "var(--color-at-white)" }}>MLT expo:</strong> Cena je bez DPH; kuchyňka (5 000 Kč) a technické služby (elektro, voda, úklid) jsou otevřené body. Nabídka čeká na schválení.
        </p>
      </div>
    </div>
  );
}
