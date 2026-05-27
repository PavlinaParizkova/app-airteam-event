type DealStatus = "confirmed" | "in_progress" | "pending";

type Deal = {
  index: number;
  company: string;
  country: string;
  description: string;
  topic: string;
  caseStatus: string;
  result: string;
  value: string;
  nextSteps: string;
  owner: string;
  status: DealStatus;
};

const DEALS: Deal[] = [
  {
    index: 1,
    company: "Prince Aviation",
    country: "Srbsko",
    description:
      "Největší business aviation airline v regionu, 35+ let v provozu. AOC/Part OPS, ATO, Part 145, CAMO, Part 147. Flotila 14 letadel včetně 3× Cessna Citation XLS/XLS+. Dojem: tým profesionální a kompetentní.",
    topic: "Part 21 partnerství + livery pro 3× Citation XLS/XLS+",
    caseStatus: "Konkrétní poptávka",
    result: "Dobrý — follow-up call proběhl, focus na rozsah livery 3 × XLS, Part 21 spolupráce na stole",
    value: "EUR 27 000",
    nextSteps: "Čekáme na podklady / dokumentaci od klienta, upřesnit rozsah, časovou osu a obchodně-technický follow-up",
    owner: "Alex Mudrych",
    status: "in_progress",
  },
  {
    index: 2,
    company: "—",
    country: "—",
    description: "Doplní Sales team",
    topic: "—",
    caseStatus: "—",
    result: "—",
    value: "—",
    nextSteps: "—",
    owner: "—",
    status: "pending",
  },
  {
    index: 3,
    company: "—",
    country: "—",
    description: "Doplní Sales team",
    topic: "—",
    caseStatus: "—",
    result: "—",
    value: "—",
    nextSteps: "—",
    owner: "—",
    status: "pending",
  },
  {
    index: 4,
    company: "—",
    country: "—",
    description: "Doplní Sales team",
    topic: "—",
    caseStatus: "—",
    result: "—",
    value: "—",
    nextSteps: "—",
    owner: "—",
    status: "pending",
  },
  {
    index: 5,
    company: "—",
    country: "—",
    description: "Doplní Sales team",
    topic: "—",
    caseStatus: "—",
    result: "—",
    value: "—",
    nextSteps: "—",
    owner: "—",
    status: "pending",
  },
];

const STATUS_CONFIG: Record<DealStatus, { label: string; color: string; bg: string }> = {
  confirmed:   { label: "Potvrzeno",        color: "#22c55e",                      bg: "rgba(34,197,94,0.12)" },
  in_progress: { label: "Probíhá",          color: "var(--color-at-red)",           bg: "rgba(213,28,23,0.10)" },
  pending:     { label: "Čeká na doplnění", color: "var(--color-at-blue-v4)",       bg: "rgba(80,116,153,0.15)" },
};

const FIELDS: { key: keyof Deal; label: string }[] = [
  { key: "country",     label: "Země" },
  { key: "topic",       label: "Téma / poptávka" },
  { key: "caseStatus",  label: "Stav případu" },
  { key: "result",      label: "Výsledek jednání" },
  { key: "value",       label: "Potenciální hodnota" },
  { key: "nextSteps",   label: "Plánované kroky" },
  { key: "owner",       label: "Owner follow-upu" },
];

export default function SlidePostDeals() {
  const filled = DEALS.filter((d) => d.status !== "pending").length;

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 gap-5">

      {/* Header */}
      <div>
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Vyhodnocení · Obchod
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Top 5 klíčových obchodních jednání
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          {filled}/5 doplněno · Sales team doplní zbývající · AERO EXPO 2026
        </p>
      </div>

      {/* Deals grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {DEALS.map((deal) => {
          const sc = STATUS_CONFIG[deal.status];
          const isPending = deal.status === "pending";
          return (
            <div
              key={deal.index}
              className="rounded-xl overflow-hidden flex flex-col"
              style={{
                border: `1px solid ${isPending ? "var(--color-at-blue-v3)" : deal.status === "in_progress" ? "rgba(213,28,23,0.3)" : "rgba(34,197,94,0.3)"}`,
                opacity: isPending ? 0.5 : 1,
              }}
            >
              {/* Deal header */}
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ background: isPending ? "var(--color-at-blue-v2)" : "var(--color-at-blue-v1)", borderBottom: "1px solid var(--color-at-blue-v3)" }}
              >
                <span
                  className="text-xs font-mono font-bold flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}44` }}
                >
                  {deal.index}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-black" style={{ color: "var(--color-at-white)" }}>
                    {deal.company}
                  </span>
                  {!isPending && deal.country !== "—" && (
                    <span className="text-xs ml-2" style={{ color: "var(--color-at-blue-v5)" }}>
                      · {deal.country}
                    </span>
                  )}
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {sc.label}
                </span>
              </div>

              {isPending ? (
                <div
                  className="flex-1 flex items-center justify-center px-4 py-6"
                  style={{ background: "var(--color-at-blue-v1)" }}
                >
                  <p className="text-sm" style={{ color: "var(--color-at-blue-v4)" }}>
                    Doplní Sales team — termín max. D+14
                  </p>
                </div>
              ) : (
                <div
                  className="flex flex-col gap-0 flex-1"
                  style={{ background: "var(--color-at-blue-v1)" }}
                >
                  {/* Description */}
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-at-blue-v3)" }}>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-at-blue-v5)" }}>
                      {deal.description}
                    </p>
                  </div>

                  {/* Fields */}
                  {FIELDS.map(({ key, label }) => {
                    const val = deal[key] as string;
                    if (val === "—") return null;
                    return (
                      <div
                        key={key}
                        className="grid grid-cols-[7rem_1fr] px-4 py-2"
                        style={{ borderBottom: "1px solid var(--color-at-blue-v3)" }}
                      >
                        <span className="text-xs" style={{ color: "var(--color-at-blue-v4)" }}>{label}</span>
                        <span
                          className="text-xs font-semibold leading-snug"
                          style={{ color: key === "value" ? "var(--color-at-red)" : key === "owner" ? "var(--color-at-white)" : "var(--color-at-blue-v5)" }}
                        >
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
