/* Color tokens used:
   Light table:
     thead bg  → var(--color-at-blue)      #153151  white text
     row odd   → #ffffff                    dark blue text
     row even  → var(--color-at-blue-a5)   #cddce8  dark blue text
   Text hierarchy on dark panels:
     primary   → var(--color-at-white)     #ffffff
     secondary → var(--color-at-blue-a5)   #cddce8  (replaces blue-v5 / blue-v4)
*/

const COLORS = [
  {
    dot: "#D50000",
    gcal: "Tomato",
    gcalCz: "Rajčatová",
    prefix: "[CEO]",
    label: "CEO – Petr Polák",
    desc: "Vyžaduje přítomnost CEO. Nelze přesunout bez jeho souhlasu. Přítomen 22.–24. 4.",
    labelEn: "Requires CEO presence. Cannot be moved without approval. On-site 22–24 Apr.",
  },
  {
    dot: "#1565C0",
    gcal: "Blueberry",
    gcalCz: "Borůvková",
    prefix: "[STÁNEK]",
    label: "Zasedačka",
    desc: "Zákazník nebo partner přichází k nám na stánek AIR TEAM.",
    labelEn: "Customer/partner comes to the AIR TEAM booth.",
  },
  {
    dot: "#0097A7",
    gcal: "Peacock",
    gcalCz: "Azurová",
    prefix: "[ZÁKAZNÍK]",
    label: "U zákazníka (areál)",
    desc: "Náš tým jde za zákazníkem do jeho stánku v areálu veletrhu.",
    labelEn: "Our team visits the customer's booth within the fair grounds.",
  },
  {
    dot: "#EF6C00",
    gcal: "Tangerine",
    gcalCz: "Mandarinková",
    prefix: "[OFF-SITE]",
    label: "Mimo veletrh",
    desc: "Schůzka mimo areál Messe – restaurace, hotel, jiné místo.",
    labelEn: "Meeting outside Messe – restaurant, hotel, other location.",
  },
  {
    dot: "#2E7D32",
    gcal: "Sage",
    gcalCz: "Šalvějová",
    prefix: "[STÁNEK]",
    label: "Na stánku AIR TEAM",
    desc: "Schůzka na našem stánku AIR TEAM (plocha stánku).",
    labelEn: "Meeting at our AIR TEAM booth (booth area).",
  },
  {
    dot: "#616161",
    gcal: "Graphite",
    gcalCz: "Uhlová",
    prefix: "[SETUP]",
    label: "Setup & logistika",
    desc: "Příprava stánku, transport, příjezd, technická příprava.",
    labelEn: "Booth setup, transport, arrival, technical preparation.",
  },
  {
    dot: "#F9A825",
    gcal: "Banana",
    gcalCz: "Banánová",
    prefix: "[BUFFER]",
    label: "Volný slot / rezerva",
    desc: "Nepotvrzená schůzka, buffer pro příchozí zájem, holding slot.",
    labelEn: "Unconfirmed meeting, buffer for walk-in interest.",
  },
];

const CHECKLIST = [
  "Přiřazena správná barva dle typu schůzky?",
  "Název obsahuje správný prefix v [ ] závorkách?",
  "V názvu je stručný účel (za druhou pomlčkou)?",
  "Pole Účel schůzky vyplněno v popisu (1–2 věty)?",
  "Vyplněna všechna povinná pole (zákazník, kontakt, účastníci, místo)?",
  "Pole Dárek vyplněno (Ano / Ne)?",
  "CEO schůzka → potvrdila Lucie Kysučanová?",
  "Off-site → adresa + kdo zůstává na stánku?",
  "Pozváni všichni relevantní účastníci?",
  "Schůzka v rámci doby přítomnosti všech účastníků?",
];

/* Colours for the light table — dark text on white / air-blue-a5 rows */
const ROW_ODD  = "#ffffff";
const ROW_EVEN = "#cddce8";   /* --color-at-blue-a5 */
const TEXT_MAIN = "#153151";  /* --color-at-blue — high contrast on light bg */
const TEXT_SUB  = "#23517c";  /* --color-at-blue-v3 — readable secondary on light bg */

export default function SlideCalendar() {
  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">

      {/* Header */}
      <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p
            className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
            style={{ color: "var(--color-at-white)" }}
          >
            Logistika · Google Kalendář
          </p>
          <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
            Metodika schůzek na veletrhu
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-a5)" }}>
            Závazná pravidla pro Google Kalendář · Owner: Lucie Kysučanová · AERO EXPO 2026, Friedrichshafen 22.–25. 4. 2026
          </p>
        </div>

        {/* Calendar CTA button */}
        <a
          href="https://calendar.google.com/calendar/u/0?cid=Y184OTkxNWJlMTQ4ZWJkMmQzYTczYWU3OGQyZWFlMzY5MDcxMzU0OTM1ODU5Y2MzMjhjYzI0OTY3MWRmOWQ4MDJhQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 flex-shrink-0 font-bold text-sm px-5 py-3 rounded-xl transition-opacity hover:opacity-90 active:opacity-75"
          style={{
            background: "var(--color-at-red)",
            color: "var(--color-at-white)",
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(213,28,23,0.35)",
            letterSpacing: "0.01em",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Otevřít kalendář AERO EXPO 2026
        </a>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Color coding table (light style) ───────────────────────── */}
        <div
          className="rounded-xl overflow-x-auto"
          style={{ border: "1px solid var(--color-at-blue-v4)", flex: "1 1 0" }}
        >
          {/* thead */}
          <div
            className="grid px-4 py-2.5 text-xs font-bold uppercase tracking-widest min-w-[600px]"
            style={{
              gridTemplateColumns: "20px 80px 80px 120px 1fr",
              gap: "12px",
              background: "var(--color-at-blue)",
              color: "var(--color-at-white)",
              borderBottom: "2px solid var(--color-at-blue-v3)",
              borderRadius: "12px 12px 0 0",
            }}
          >
            <span />
            <span>GCal (EN)</span>
            <span>GCal (CZ)</span>
            <span>Prefix</span>
            <span>Popis · Description</span>
          </div>

          {/* rows */}
          {COLORS.map((c, i) => (
            <div
              key={c.gcal}
              className="grid px-4 py-3 text-sm items-start min-w-[600px]"
              style={{
                gridTemplateColumns: "20px 80px 80px 120px 1fr",
                gap: "12px",
                background: i % 2 === 0 ? ROW_ODD : ROW_EVEN,
                borderBottom: i < COLORS.length - 1 ? "1px solid #c0d0e0" : "none",
                borderRadius: i === COLORS.length - 1 ? "0 0 12px 12px" : undefined,
              }}
            >
              {/* color dot */}
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: c.dot,
                  display: "inline-block",
                  marginTop: 3,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${c.dot}80`,
                }}
              />

              {/* GCal name EN */}
              <span className="font-bold text-xs" style={{ color: TEXT_MAIN }}>
                {c.gcal}
              </span>

              {/* GCal name CZ */}
              <span className="font-bold text-xs" style={{ color: TEXT_SUB }}>
                {c.gcalCz}
              </span>

              {/* prefix badge – btn-secondary style (air-blue bg, white text) */}
              <span
                className="text-xs font-mono font-bold self-start"
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "var(--color-at-blue)",
                  color: "#ffffff",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.02em",
                }}
              >
                {c.prefix}
              </span>

              {/* description */}
              <div>
                <span className="font-bold text-xs" style={{ color: TEXT_MAIN }}>
                  {c.label}
                </span>
                <p className="text-xs mt-0.5" style={{ color: TEXT_SUB, lineHeight: 1.45 }}>
                  {c.desc}
                </p>
                <p className="text-xs mt-0.5 italic" style={{ color: TEXT_SUB, opacity: 0.75, lineHeight: 1.4 }}>
                  {c.labelEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Right column ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 w-full lg:w-80 flex-shrink-0">

          {/* Naming convention */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p
              className="text-xs font-bold tracking-[0.18em] uppercase mb-2"
              style={{ color: "var(--color-at-white)" }}
            >
              Formát názvu události
            </p>
            <code
              className="block text-xs rounded px-3 py-2 mb-3 leading-relaxed font-mono font-bold"
              style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
            >
              [PREFIX] Firma – Účel – Zodpovídá
            </code>
            <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--color-at-blue-a5)" }}>
              Příklady · Examples
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { color: "#D50000", text: "[CEO] Lufthansa Technik – Avionika – Petr P. + Kuba" },
                { color: "#1565C0", text: "[STÁNEK] AviaTech GmbH – Panely – Vratko" },
                { color: "#0097A7", text: "[ZÁKAZNÍK] Garmin EMEA – Partner update – Magdaléna" },
                { color: "#EF6C00", text: "[OFF-SITE] Dinner Zeppelin – Networking – Jan" },
                { color: "#2E7D32", text: "[INTERNÍ] Ranní debriefing – Koordinace 08:00" },
              ].map((ex) => (
                <div key={ex.text} className="flex items-start gap-2">
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: ex.color,
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                  <span className="text-xs font-mono" style={{ color: "var(--color-at-white)", lineHeight: 1.5 }}>
                    {ex.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Required description fields */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p
              className="text-xs font-bold tracking-[0.18em] uppercase mb-2"
              style={{ color: "var(--color-at-white)" }}
            >
              Povinná pole v popisu
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { field: "Zákazník / firma", required: true },
                { field: "Kontaktní osoba", required: true },
                { field: "Účel schůzky", required: true },
                { field: "Tým AIR TEAM (účastníci)", required: true },
                { field: "Místo (stánek č. / restaurace)", required: true },
                { field: "Podklady / demo", required: false },
                { field: "Dárek: Ano / Ne + kdo zajišťuje", required: false },
                { field: "Poznámky", required: false },
              ].map((f) => (
                <div key={f.field} className="flex items-center gap-2">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      color: f.required ? "var(--color-at-red)" : "var(--color-at-blue-v4)",
                      flexShrink: 0,
                      minWidth: 12,
                    }}
                  >
                    {f.required ? "✱" : "○"}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: f.required ? "var(--color-at-white)" : "var(--color-at-blue-a5)" }}
                  >
                    {f.field}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CEO rules */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(213,0,0,0.1)", border: "1px solid rgba(213,0,0,0.35)" }}
          >
            <p
              className="text-xs font-bold tracking-[0.18em] uppercase mb-2"
              style={{ color: "var(--color-at-white)" }}
            >
              CEO schůzky – Petr Polák
            </p>
            <div className="flex flex-col gap-1.5 text-xs" style={{ color: "var(--color-at-white)" }}>
              <span>📅 Přítomnost: <strong>22. 4. – 24. 4.</strong></span>
              <span>⏱ Slot min.: <strong>30 min + 15 min buffer</strong></span>
              <span>📊 Max: <strong>2 dop. + 2 odp. = 4/den</strong></span>
              <span>✅ Schválení: <strong>vždy Lucie Kysučanová</strong></span>
              <span>⚡ Priorita: <strong>nejvyšší – nikdy nepřesouvat</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Checklist strip ──────────────────────────────────────────── */}
      <div
        className="mt-4 rounded-xl p-4"
        style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
      >
        <p
          className="text-xs font-bold tracking-[0.18em] uppercase mb-3"
          style={{ color: "var(--color-at-white)" }}
        >
          Checklist před přidáním schůzky do kalendáře
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {CHECKLIST.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className="text-xs font-mono font-bold flex-shrink-0"
                style={{ color: "var(--color-at-blue-a5)", marginTop: 1 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-xs" style={{ color: "var(--color-at-white)", lineHeight: 1.4 }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HubSpot footer note ──────────────────────────────────────── */}
      <div className="mt-3 flex items-center gap-3">
        <div
          className="flex-shrink-0 rounded px-2 py-1 text-xs font-bold tracking-wide uppercase"
          style={{ background: "rgba(255,122,0,0.2)", color: "#FF7A00" }}
        >
          HubSpot
        </div>
        <p className="text-xs" style={{ color: "var(--color-at-blue-a5)" }}>
          Každá schůzka z GCal → HubSpot záznam do 48 h · Výsledek + A/B/C lead zalogovat tentýž den do 20:00 · Lucie kontroluje záznamy každý večer.{" "}
          <span className="italic" style={{ color: "var(--color-at-blue-v5)" }}>
            Every GCal meeting → HubSpot record within 48 h.
          </span>
        </p>
      </div>
    </div>
  );
}
