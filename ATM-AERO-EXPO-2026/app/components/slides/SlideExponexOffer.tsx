type OfferRow = {
  no: string;
  name: string;
  desc: string;
  type: "sale" | "rental";
  price: number | null;
  isOption?: boolean;
};

type OfferSection = {
  title: string;
  rows: OfferRow[];
};

const SECTIONS_A: OfferSection[] = [
  {
    title: "1. Podlahy a stěny",
    rows: [
      { no: "1.1",  name: "Podlaha 36mm + koberec – 60 m²",      desc: "Podkladní vrstva, okopová lišta, ochranný igelit",         type: "sale",   price: 68_026 },
      { no: "1.2",  name: "Panelové stěny, výška 3,5 m",          desc: "Lišty pro grafiku, dveře do zázemí, spojovací pera",      type: "rental", price: 63_571 },
      { no: "1.3a", name: "⚠ OPCE A: Přední stěna MR, 2,5 m",    desc: "Plný panel, grafika z obou stran",                        type: "rental", price: 49_014, isOption: true },
      { no: "1.3b", name: "⚠ OPCE B: Přední stěna MR, 2,5 m",    desc: "Dřevěný rám, potištěný meshbanner z jedné strany",        type: "rental", price: 28_000, isOption: true },
    ],
  },
  {
    title: "2. Vybavení a dekorace",
    rows: [
      { no: "2.1", name: "Recepční pult",               desc: "Dodávka klient",                                            type: "sale",   price: null },
      { no: "2.2", name: "Showcase pult pro G3X",       desc: "Nová výroba",                                               type: "sale",   price: 10_125 },
      { no: "2.3", name: "Demo panel a vzorník",        desc: "Dodávka klient",                                            type: "sale",   price: null },
      { no: "2.4", name: "Stůl + 6× kancelářské židle",desc: "–",                                                          type: "rental", price: 7_560 },
      { no: "2.5", name: "Posezení vč. recepce",        desc: "–",                                                          type: "rental", price: 6_480 },
      { no: "2.6", name: "Vybavení skladu",             desc: "Platové regály, koše, lednička, stolek",                    type: "rental", price: 8_100 },
    ],
  },
  {
    title: "3. Elektroinstalace",
    rows: [
      { no: "3.1", name: "Elektroinstalace",            desc: "Rozvaděč, kabeláž, zásuvky, světla na stěně",              type: "rental", price: 33_750 },
    ],
  },
  {
    title: "4. Grafika",
    rows: [
      { no: "4.1", name: "Grafika na stěnách 3,5 m",   desc: "–",                                                          type: "sale",   price: 75_438 },
      { no: "4.2", name: "Bílá látka – zázemí + pravá strana", desc: "–",                                                  type: "sale",   price: 12_285 },
    ],
  },
  {
    title: "5. AV technika",
    rows: [
      { no: "5.1", name: "TV 55\"",                    desc: "–",                                                          type: "rental", price: 7_560 },
    ],
  },
];

const SECTIONS_B: OfferSection[] = [
  {
    title: "B – Logistika, montáž a PM",
    rows: [
      { no: "B.1", name: "Transport – DK → Friedrichshafen a zpět", desc: "Kamion s vybavením stánku",                    type: "rental", price: 110_500 },
      { no: "B.2", name: "Spedice na výstavišti",                    desc: "Vykládka/nakládka, skladování obalů",          type: "rental", price: 45_500 },
      { no: "B.3", name: "Organizační náklady",                      desc: "Nakládka, odpad, nářadí, spojovací materiál",  type: "rental", price: 41_028 },
      { no: "B.4", name: "Montážní tým – 5 osob, 3+1 den",          desc: "Montáž + demontáž vč. cesty",                  type: "rental", price: 174_460 },
      { no: "B.5", name: "Doprava týmu do/z Friedrichshafenu",       desc: "–",                                             type: "rental", price: 38_272 },
      { no: "B.6", name: "Ubytování týmu",                           desc: "Friedrichshafen",                               type: "rental", price: 39_780 },
      { no: "B.7", name: "Projektový management",                    desc: "–",                                             type: "rental", price: 26_000 },
    ],
  },
];

const SUMMARY = [
  { label: "Podlahy a stěny (vč. obou OPCÍ)",   amount: 208_611 },
  { label: "Vybavení a dekorace",                amount: 32_265 },
  { label: "Elektroinstalace",                   amount: 33_750 },
  { label: "Grafika",                            amount: 87_723 },
  { label: "AV technika",                        amount: 7_560 },
  { label: "Logistika, montáž, PM",              amount: 475_540 },
];

const TOTAL_13B = 796_435;
const TOTAL_13A = 817_449;

function TypeBadge({ type }: { type: "sale" | "rental" }) {
  return (
    <span
      className="text-xs font-bold px-1.5 py-0.5 rounded"
      style={
        type === "sale"
          ? { background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }
          : { background: "var(--color-at-blue-v1)", color: "var(--color-at-blue-v5)", border: "1px solid var(--color-at-blue-v4)" }
      }
    >
      {type === "sale" ? "prodej" : "nájem"}
    </span>
  );
}

export default function SlideExponexOffer() {
  const allSections = [...SECTIONS_A, ...SECTIONS_B];

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Stánek · Exponex s.r.o.
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Nabídka Exponex s.r.o.
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          AERO EXPO 2026, Friedrichshafen · 22.–25. 4. 2026 · Rohový stánek 60 m² · Nabídka: 25. 3. 2026
        </p>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Mobile card view */}
        <div className="md:hidden flex flex-col gap-3">
          {allSections.map((sec) => (
            <div key={sec.title} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-at-blue-v4)" }}>
              <div
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest"
                style={{ background: "var(--color-at-blue-v2)", color: "var(--color-at-blue-v5)" }}
              >
                {sec.title}
              </div>
              {sec.rows.map((row) => (
                <div
                  key={row.no}
                  className="px-4 py-3"
                  style={{
                    background: row.isOption ? "rgba(245,158,11,0.06)" : "var(--color-at-blue-v1)",
                    borderBottom: "1px solid var(--color-at-blue-v3)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: row.isOption ? "#f59e0b" : "var(--color-at-white)" }}
                    >
                      <span className="text-xs mr-1.5" style={{ color: "var(--color-at-blue-v5)" }}>{row.no}</span>
                      {row.name}
                    </span>
                    <TypeBadge type={row.type} />
                  </div>
                  {row.desc && (
                    <p className="mt-1 text-xs" style={{ color: "var(--color-at-blue-v5)" }}>{row.desc}</p>
                  )}
                  <div className="mt-1.5 text-right font-black text-base" style={{ color: row.price === null ? "var(--color-at-blue-v4)" : "var(--color-at-white)" }}>
                    {row.price === null ? "Klient" : `${row.price.toLocaleString("cs-CZ")} Kč`}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Desktop scrollable table */}
        <div
          className="hidden md:block overflow-x-auto rounded-xl"
          style={{ border: "1px solid var(--color-at-blue-v4)" }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[0.6fr_2fr_2.5fr_0.7fr_1fr] px-4 py-2.5 text-xs font-bold uppercase tracking-widest sticky top-0 min-w-[520px]"
            style={{
              background: "var(--color-at-blue)",
              color: "var(--color-at-white)",
              borderBottom: "2px solid var(--color-at-blue-v4)",
            }}
          >
            <span>Č.</span>
            <span>Položka</span>
            <span>Popis</span>
            <span className="text-center">Typ</span>
            <span className="text-right">Cena bez DPH</span>
          </div>

          {allSections.map((sec) => (
            <div key={sec.title}>
              {/* Section heading */}
              <div
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "var(--color-at-blue-v2)",
                  color: "var(--color-at-blue-v5)",
                  borderBottom: "1px solid var(--color-at-blue-v3)",
                }}
              >
                {sec.title}
              </div>

              {sec.rows.map((row, i) => (
                <div
                  key={row.no}
                  className="grid grid-cols-[0.6fr_2fr_2.5fr_0.7fr_1fr] px-4 py-2 text-sm items-center min-w-[520px]"
                  style={{
                    background: row.isOption
                      ? "rgba(245,158,11,0.06)"
                      : i % 2 === 0
                      ? "var(--color-at-blue-v1)"
                      : "rgba(27,63,103,0.5)",
                    borderBottom: "1px solid var(--color-at-blue-v3)",
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: "var(--color-at-blue-v5)" }}>
                    {row.no}
                  </span>
                  <span
                    className="font-semibold text-xs"
                    style={{ color: row.isOption ? "#f59e0b" : "var(--color-at-white)" }}
                  >
                    {row.name}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                    {row.desc}
                  </span>
                  <span className="flex justify-center">
                    <TypeBadge type={row.type} />
                  </span>
                  <span
                    className="text-right font-bold tabular-nums text-xs"
                    style={{ color: row.price === null ? "var(--color-at-blue-v4)" : "var(--color-at-white)" }}
                  >
                    {row.price === null ? "Klient" : `${row.price.toLocaleString("cs-CZ")} Kč`}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-3 w-full lg:w-56 flex-shrink-0">
          {/* Total cards */}
          <div
            className="rounded-xl p-4 flex flex-col gap-1"
            style={{ background: "var(--color-at-blue-v1)", border: "2px solid var(--color-at-red)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-at-blue-v5)" }}>
              Cena s opcí 1.3b
            </p>
            <p className="text-2xl font-black mt-1" style={{ color: "var(--color-at-white)" }}>
              {TOTAL_13B.toLocaleString("cs-CZ")} Kč
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-at-blue-v5)" }}>meshbanner</p>
          </div>

          <div
            className="rounded-xl p-4 flex flex-col gap-1"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v4)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-at-blue-v5)" }}>
              Cena s opcí 1.3a
            </p>
            <p className="text-xl font-black mt-1" style={{ color: "var(--color-at-white)" }}>
              {TOTAL_13A.toLocaleString("cs-CZ")} Kč
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-at-blue-v5)" }}>plný panel, oboustranná grafika</p>
          </div>

          {/* Summary breakdown */}
          <div
            className="rounded-xl p-4 flex flex-col gap-2"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-at-blue-v5)" }}>
              Rekapitulace
            </p>
            {SUMMARY.map((s) => (
              <div key={s.label} className="flex justify-between gap-2">
                <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>{s.label}</span>
                <span className="text-xs font-bold tabular-nums whitespace-nowrap" style={{ color: "var(--color-at-white)" }}>
                  {s.amount.toLocaleString("cs-CZ")} Kč
                </span>
              </div>
            ))}
            <div
              className="flex justify-between gap-2 pt-2 mt-1"
              style={{ borderTop: "1px solid var(--color-at-blue-v3)" }}
            >
              <span className="text-xs font-bold" style={{ color: "var(--color-at-white)" }}>Mezisoučet A</span>
              <span className="text-xs font-black tabular-nums" style={{ color: "var(--color-at-white)" }}>
                369 909 Kč
              </span>
            </div>
          </div>

          {/* Option warning */}
          <div
            className="rounded-lg px-3 py-3 flex flex-col gap-1"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid #f59e0b" }}
          >
            <p className="text-xs font-bold" style={{ color: "#f59e0b" }}>⚠ Volba OPCE</p>
            <p className="text-xs mt-0.5" style={{ color: "#f59e0b" }}>
              Zvolit jednu variantu přední stěny meeting roomu (1.3a nebo 1.3b) před podpisem smlouvy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
