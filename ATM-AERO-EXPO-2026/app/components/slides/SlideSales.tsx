const TARGETS = [
  { label: "Schůzky celkem", value: "30+", sub: "za celý veletrh", color: "var(--color-at-red)" },
  { label: "Min. na osobu", value: "4", sub: "potvrzené před odjezdem", color: "var(--color-at-blue-v3)" },
  { label: "Nové HubSpot leady", value: "50+", sub: "za 4 dny", color: "var(--color-at-blue-v3)" },
  { label: "Follow-up deadline", value: "48 h", sub: "po skončení veletrhu", color: "var(--color-at-blue-v3)" },
];

const PRODUCTS = [
  {
    code: "01",
    title: "Komplexní upgrade avioniky",
    tag: "PRIORITA",
    tagColor: "var(--color-at-red)",
    targets: [
      "MRO centra hledající certifikovaného partnera pro avioniku",
      "Majitelé business a GA letadel – modernizace palubní desky",
      "Completion centra – STC a DOA podpora pro změny",
    ],
    kpi: "Min. 10 relevantních kontaktů do pipeline",
  },
  {
    code: "02",
    title: "Aerospec & PilotStyle",
    tag: "BRAND",
    tagColor: "var(--color-at-blue-v3)",
    targets: [
      "GA piloti a homebuilders – produkty PilotStyle",
      "Distributoři avioniky v EMEA – Aerospec produktový katalog",
      "Malé letecké školy a aero kluby",
    ],
    kpi: "Min. 15 nových kontaktů, 5 distribučních konverzací",
  },
  {
    code: "03",
    title: "G3X – Garmin EMEA",
    tag: "FOCUS",
    tagColor: "var(--color-at-blue-v2)",
    targets: [
      "Experimentální builders (kit, LSA, homebuilt)",
      "OEM výrobci hledající panelová řešení",
      "Letecké školy – modernizace cvičných letadel",
    ],
    kpi: "Min. 8 demo konverzací, 3 konkrétní poptávky",
  },
];

const DAILY = [
  {
    time: "08:00",
    activity: "Ranní briefing",
    note: "Koordinace – kdo kde, jaké schůzky, co chybí",
    type: "internal",
  },
  {
    time: "08:30–12:00",
    activity: "Dopolední bloky",
    note: "CEO schůzky, klíčoví partneři (max. 2 sloty dopoledne)",
    type: "meetings",
  },
  {
    time: "12:00–13:00",
    activity: "Polední window",
    note: "Walk-in zájem, networking u stánku, oběd",
    type: "networking",
  },
  {
    time: "13:00–17:00",
    activity: "Odpolední bloky",
    note: "Zákaznické schůzky, demo G3X, Aerospec/PilotStyle (max. 2 sloty)",
    type: "meetings",
  },
  {
    time: "17:30",
    activity: "Večerní debriefing",
    note: "Zalogovat leady do HubSpotu do 20:00 – každý, každý den",
    type: "internal",
  },
];

const HUBSPOT = [
  { step: "01", action: "Kontakt naskenovat / zapsat ihned na místě" },
  { step: "02", action: "Vytvořit Deal nebo Contact v HubSpotu do 20:00 téhož dne" },
  { step: "03", action: "Označit A / B / C lead a produkt zákazníka" },
  { step: "04", action: "Zapsat výsledek schůzky do poznámky (1–3 věty)" },
  { step: "05", action: "Follow-up email odeslat do 48 h po veletrhu" },
];

const TYPE_COLORS: Record<string, string> = {
  internal: "var(--color-at-blue-v3)",
  meetings: "var(--color-at-red)",
  networking: "#2E7D32",
};

export default function SlideSales() {
  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 gap-5">

      {/* Header */}
      <div>
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Obchod · Sales
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Obchodní cíle & KPIs
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          Cíle, priority a denní rytmus pro AERO EXPO 2026 · Friedrichshafen 22.–25. 4. 2026
        </p>
      </div>

      {/* KPI targets strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TARGETS.map((t) => (
          <div
            key={t.label}
            className="rounded-lg p-4 flex flex-col gap-1"
            style={{ background: "var(--color-at-blue-v2)", border: `1px solid ${t.color === "var(--color-at-red)" ? "var(--color-at-red)" : "var(--color-at-blue-v3)"}` }}
          >
            <span
              className="text-2xl sm:text-3xl font-black leading-none"
              style={{ color: t.color }}
            >
              {t.value}
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--color-at-white)" }}>
              {t.label}
            </span>
            <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
              {t.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Main two-column layout */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1">

        {/* Left: Products + targets */}
        <div className="flex flex-col gap-3 flex-1">
          <p
            className="text-xs font-bold tracking-[0.15em] uppercase"
            style={{ color: "var(--color-at-white)" }}
          >
            Produktové priority & cílové skupiny
          </p>
          {PRODUCTS.map((p) => (
            <div
              key={p.code}
              className="rounded-lg p-4"
              style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color: "var(--color-at-blue-v4)" }}
                >
                  {p.code}
                </span>
                <span className="text-sm font-bold" style={{ color: "var(--color-at-white)" }}>
                  {p.title}
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: p.tagColor, color: "var(--color-at-white)", letterSpacing: "0.06em" }}
                >
                  {p.tag}
                </span>
              </div>
              <div className="flex flex-col gap-1 mb-2">
                {p.targets.map((target, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 flex-shrink-0"
                      style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-at-blue-v4)", display: "inline-block" }}
                    />
                    <span className="text-xs" style={{ color: "var(--color-at-blue-v5)", lineHeight: 1.5 }}>
                      {target}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="mt-2 pt-2 flex items-center gap-2"
                style={{ borderTop: "1px solid var(--color-at-blue-v3)" }}
              >
                <span
                  className="flex-shrink-0"
                  style={{ width: 3, height: 12, borderRadius: 2, background: "var(--color-at-red)", display: "inline-block" }}
                />
                <span className="text-xs font-semibold" style={{ color: "var(--color-at-blue-a5)" }}>
                  {p.kpi}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Daily rhythm + HubSpot */}
        <div className="flex flex-col gap-3 w-full lg:w-72 flex-shrink-0">

          {/* Daily rhythm */}
          <div
            className="rounded-lg p-4"
            style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p
              className="text-xs font-bold tracking-[0.15em] uppercase mb-3"
              style={{ color: "var(--color-at-white)" }}
            >
              Denní rytmus
            </p>
            <div className="flex flex-col gap-2">
              {DAILY.map((d, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div
                    className="flex-shrink-0 mt-0.5"
                    style={{
                      width: 3,
                      alignSelf: "stretch",
                      borderRadius: 2,
                      background: TYPE_COLORS[d.type],
                      minHeight: 14,
                    }}
                  />
                  <div>
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: "var(--color-at-blue-v4)" }}
                    >
                      {d.time}
                    </span>
                    <span
                      className="text-xs font-semibold ml-1.5"
                      style={{ color: "var(--color-at-white)" }}
                    >
                      {d.activity}
                    </span>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-at-blue-v5)", lineHeight: 1.4 }}>
                      {d.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HubSpot checklist */}
          <div
            className="rounded-lg p-4"
            style={{ background: "rgba(255,122,0,0.08)", border: "1px solid rgba(255,122,0,0.3)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded tracking-wide uppercase"
                style={{ background: "rgba(255,122,0,0.2)", color: "#FF7A00" }}
              >
                HubSpot
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--color-at-white)" }}>
                Postup na místě
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {HUBSPOT.map((h) => (
                <div key={h.step} className="flex items-start gap-2">
                  <span
                    className="text-xs font-mono font-bold flex-shrink-0"
                    style={{ color: "#FF7A00" }}
                  >
                    {h.step}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-at-blue-v5)", lineHeight: 1.4 }}>
                    {h.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
