const KEY_FACTS = [
  { label: "Typ účasti", value: "Samostatný stánek" },
  { label: "Plocha & umístění", value: "60 m² (15 × 4 m), rohový stánek, BOOTH A6-102" },
  { label: "Schůzky dohodnuté předem", value: "43 unikátních (51 záznamů)" },
  { label: "Stánek popsán jako", value: "Hvězdný – moderní, čistý, výrazně odlišný od konkurence" },
];

const HIGHLIGHTS = [
  {
    icon: "✅",
    color: "#22c55e",
    text: "Demo panel AIR TEAM SERVICE a zasedací místnost – obrovský úspěch. Přilákal operátory jetů.",
  },
  {
    icon: "✅",
    color: "#22c55e",
    text: "Modulární katalog fungoval jako mini-prezentace – klienti si ho odnášeli domů.",
  },
  {
    icon: "✅",
    color: "#22c55e",
    text: "Energetické drinky hit – návštěvníci se ptali, zda jde o rebrand Red Bullu.",
  },
  {
    icon: "⚠️",
    color: "#f59e0b",
    text: "Tým poddimenzovaný → chaos 1. dne, ušlé prodejní příležitosti.",
  },
  {
    icon: "⚠️",
    color: "#f59e0b",
    text: "PilotStyle podprodán – chybí přímý prodejce, ceny EUR a platební terminál.",
  },
  {
    icon: "⚠️",
    color: "#f59e0b",
    text: "Příprava na poslední chvíli – HubSpot zprovozněn až ve středu ráno, prezentace hotové noc předem.",
  },
  {
    icon: "🔒",
    color: "var(--color-at-red)",
    text: "Na stánku bylo něco ukradeno – pro 2027 povinné bezpečnostní kamery.",
  },
];

const GOALS = [
  "Prezentace AIR TEAM jako integrátora systémů",
  "Navázání obchodních jednání & sběr leadů",
  "Brand awareness GA segment",
  "Představit PilotStyle a Aerospec",
  'Odpoutat se od image "pouze e-shop"',
];

export default function SlidePostSummary() {
  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 gap-5">

      {/* Header */}
      <div>
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Vyhodnocení · Shrnutí účasti
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          AERO Friedrichshafen 2026 — výsledek
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          22.–25. 4. 2026 · Messe Friedrichshafen · Samostatný stánek BOOTH A6-102
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* Left: facts + goals */}
        <div className="flex flex-col gap-4 flex-1">

          {/* Key facts */}
          <div
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: "var(--color-at-white)" }}>
              Základní fakta
            </p>
            {KEY_FACTS.map((f) => (
              <div key={f.label} className="flex flex-col gap-0.5">
                <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>{f.label}</span>
                <span className="text-sm font-semibold" style={{ color: "var(--color-at-white)" }}>{f.value}</span>
              </div>
            ))}
          </div>

          {/* Cíle */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "var(--color-at-white)" }}>
              Hlavní cíle účasti
            </p>
            <div className="flex flex-col gap-2">
              {GOALS.map((g, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="flex-shrink-0 mt-1.5"
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-at-red)", display: "inline-block" }}
                  />
                  <span className="text-sm" style={{ color: "var(--color-at-blue-v5)", lineHeight: 1.5 }}>{g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Celkové hodnocení */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--color-at-blue-v1)", border: "2px solid var(--color-at-red)" }}
          >
            <p className="text-xs font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--color-at-blue-v5)" }}>
              Celkové zhodnocení
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-at-white)" }}>
              AERO 2026 byl úspěch z pohledu prezentace. Stánek budoval důvěryhodnost, přitahoval bonitní zákazníky a demo panel fungoval jako kotva. Slabiny byly provozní — a mají jasné řešení pro 2027.
            </p>
          </div>
        </div>

        {/* Right: highlights */}
        <div className="flex flex-col gap-3 w-full lg:w-96 flex-shrink-0">
          <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: "var(--color-at-white)" }}>
            Klíčové postřehy
          </p>
          {HIGHLIGHTS.map((h, i) => (
            <div
              key={i}
              className="rounded-lg px-4 py-3 flex items-start gap-3"
              style={{
                background: "var(--color-at-blue-v2)",
                border: `1px solid ${h.color === "#22c55e" ? "rgba(34,197,94,0.25)" : h.color === "#f59e0b" ? "rgba(245,158,11,0.25)" : "rgba(213,28,23,0.25)"}`,
              }}
            >
              <span className="text-lg flex-shrink-0 leading-snug">{h.icon}</span>
              <span className="text-sm leading-relaxed" style={{ color: "var(--color-at-blue-v5)" }}>
                {h.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
