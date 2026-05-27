const DAYS_STATS = [
  { day: "Den 1", date: "22. 4. 2026 (středa)", count: 14 },
  { day: "Den 2", date: "23. 4. 2026 (čtvrtek)", count: 28 },
  { day: "Den 3", date: "24. 4. 2026 (pátek)", count: 21 },
  { day: "Den 4", date: "25. 4. 2026 (sobota)", count: 4 },
];

const SALESPEOPLE = [
  { name: "Magdaléna Ševčíková", role: "MRO Sales Manager",    d1: 4, d2: 5, d3: 4, d4: 3, total: 16 },
  { name: "Jan Polák",           role: "Part 145 Manager",     d1: 4, d2: 5, d3: 4, d4: 3, total: 16 },
  { name: "Jakub Dryska",        role: "Key Account Manager",  d1: 0, d2: 3, d3: 2, d4: 0, total: 5 },
  { name: "Vratko Kapuš",        role: "Account Manager",      d1: 3, d2: 0, d3: 0, d4: 0, total: 3 },
  { name: "Alex Mudrych",        role: "Business Development", d1: 0, d2: 9, d3: 9, d4: 0, total: 18 },
  { name: "Petr Polák",          role: "CEO",                  d1: 1, d2: 0, d3: 0, d4: 1, total: 2 },
];

const OFFSITE = [
  { date: "23. 4.", event: "BOSE – Dealer Dinner 2026", place: "BOSE Hall A6, Stand 101 – outside" },
  { date: "24. 4.", event: "Garmin – Dealer Dinner",    place: "Max & Moritz Gasthaus-Brauerei, Kressbronn-Berg (max 4 osoby)" },
];

const MAX_COUNT = Math.max(...DAYS_STATS.map((d) => d.count));

export default function SlidePostMeetings() {
  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 gap-5">

      {/* Header */}
      <div>
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Vyhodnocení · Schůzky
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Statistika schůzek
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          67 schůzek celkem (43 unikátních před veletrhem + doplnění) · AERO EXPO 2026
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* Left: per-day bar chart + off-site */}
        <div className="flex flex-col gap-4 w-full lg:w-80 flex-shrink-0">

          {/* Bar chart */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold tracking-[0.15em] uppercase mb-4" style={{ color: "var(--color-at-white)" }}>
              Schůzky per den
            </p>
            <div className="flex flex-col gap-3">
              {DAYS_STATS.map((d) => (
                <div key={d.day}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: "var(--color-at-white)" }}>{d.day}</span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: "var(--color-at-red)" }}>{d.count}</span>
                  </div>
                  <div className="text-xs mb-1.5" style={{ color: "var(--color-at-blue-v5)" }}>{d.date}</div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-at-blue-v3)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(d.count / MAX_COUNT) * 100}%`,
                        background: d.count === MAX_COUNT ? "var(--color-at-red)" : "var(--color-at-blue-v4)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div
              className="flex items-center justify-between mt-4 pt-3"
              style={{ borderTop: "1px solid var(--color-at-blue-v3)" }}
            >
              <span className="text-sm font-bold" style={{ color: "var(--color-at-white)" }}>Celkem unikátních</span>
              <span className="text-2xl font-black" style={{ color: "var(--color-at-red)" }}>67</span>
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--color-at-blue-v5)" }}>
              U 11 schůzek není obchodník přiřazen – tým doplní dle vlastní evidence.
            </p>
          </div>

          {/* Off-site events */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "var(--color-at-white)" }}>
              Off-site akce
            </p>
            <div className="flex flex-col gap-3">
              {OFFSITE.map((o) => (
                <div key={o.event} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}
                    >
                      {o.date}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "var(--color-at-white)" }}>{o.event}</span>
                  </div>
                  <span className="text-xs pl-1" style={{ color: "var(--color-at-blue-v5)" }}>{o.place}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: per-person table */}
        <div className="flex flex-col gap-3 flex-1">
          <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: "var(--color-at-white)" }}>
            Schůzky per obchodník
          </p>

          {/* Desktop table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--color-at-blue-v3)" }}
          >
            {/* Header */}
            <div
              className="grid text-xs font-bold uppercase tracking-widest px-4 py-2.5"
              style={{
                gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 1fr",
                background: "var(--color-at-blue)",
                color: "var(--color-at-white)",
                borderBottom: "2px solid var(--color-at-blue-v3)",
              }}
            >
              <span>Jméno</span>
              <span className="hidden sm:block">Role</span>
              <span className="text-center">22. 4.</span>
              <span className="text-center">23. 4.</span>
              <span className="text-center">24. 4.</span>
              <span className="text-center">25. 4.</span>
              <span className="text-center font-black">Celkem</span>
            </div>

            {SALESPEOPLE.map((p, i) => (
              <div
                key={p.name}
                className="grid px-4 py-3 text-sm items-center"
                style={{
                  gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 1fr",
                  background: i % 2 === 0 ? "var(--color-at-blue-v1)" : "rgba(27,63,103,0.5)",
                  borderBottom: i < SALESPEOPLE.length - 1 ? "1px solid var(--color-at-blue-v3)" : "none",
                }}
              >
                <div>
                  <span className="font-semibold" style={{ color: "var(--color-at-white)" }}>{p.name}</span>
                </div>
                <span className="text-xs hidden sm:block" style={{ color: "var(--color-at-blue-v5)" }}>{p.role}</span>
                {[p.d1, p.d2, p.d3, p.d4].map((v, di) => (
                  <span
                    key={di}
                    className="text-center tabular-nums font-semibold"
                    style={{ color: v > 0 ? "var(--color-at-white)" : "var(--color-at-blue-v3)" }}
                  >
                    {v > 0 ? v : "–"}
                  </span>
                ))}
                <span
                  className="text-center font-black text-base tabular-nums"
                  style={{ color: "var(--color-at-red)" }}
                >
                  {p.total}
                </span>
              </div>
            ))}

            {/* Footer total */}
            <div
              className="grid px-4 py-3 text-sm"
              style={{
                gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 1fr",
                background: "var(--color-at-blue)",
                borderTop: "2px solid var(--color-at-blue-v3)",
              }}
            >
              <span className="font-black" style={{ color: "var(--color-at-white)" }}>CELKEM</span>
              <span className="hidden sm:block" />
              {[12, 31, 28, 7].map((v, i) => (
                <span key={i} className="text-center font-bold tabular-nums" style={{ color: "var(--color-at-blue-v5)" }}>{v}</span>
              ))}
              <span className="text-center font-black text-base tabular-nums" style={{ color: "var(--color-at-red)" }}>
                60
              </span>
            </div>
          </div>

          <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
            * Součty v řádcích odpovídají přiřazeným schůzkám (60). Zbývajících 7 bez přiřazení obchodníka AIR TEAM.
          </p>
        </div>
      </div>
    </div>
  );
}
