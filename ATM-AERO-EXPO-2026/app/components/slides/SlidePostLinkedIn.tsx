type PostRow = {
  title: string;
  date: string;
  impressions: number;
  clicks: number;
  ctr: string;
  reactions: number;
  shares: number;
  isTop?: boolean;
};

const POSTS: PostRow[] = [
  {
    title: 'Day 1 recap – "One direction, countless conversations"',
    date: "22. 4. 2026",
    impressions: 1_670,
    clicks: 496,
    ctr: "29,7 %",
    reactions: 54,
    shares: 7,
    isTop: true,
  },
  {
    title: 'Recap video – "AERO is behind us"',
    date: "27. 4. 2026",
    impressions: 1_288,
    clicks: 111,
    ctr: "8,6 %",
    reactions: 32,
    shares: 7,
  },
  {
    title: "DOTAS Aviation GmbH – partnership",
    date: "26. 4. 2026",
    impressions: 891,
    clicks: 44,
    ctr: "4,9 %",
    reactions: 20,
    shares: 2,
  },
  {
    title: `Pre-AERO – "We don't sell boxes"`,
    date: "21. 4. 2026",
    impressions: 416,
    clicks: 115,
    ctr: "27,6 %",
    reactions: 11,
    shares: 1,
  },
  {
    title: `Teaser – "We're heading to AERO"`,
    date: "16. 4. 2026",
    impressions: 258,
    clicks: 29,
    ctr: "11,2 %",
    reactions: 4,
    shares: 0,
  },
];

const TOTAL_IMPRESSIONS = POSTS.reduce((s, p) => s + p.impressions, 0);
const TOTAL_CLICKS = POSTS.reduce((s, p) => s + p.clicks, 0);
const TOTAL_REACTIONS = POSTS.reduce((s, p) => s + p.reactions, 0);
const TOTAL_SHARES = POSTS.reduce((s, p) => s + p.shares, 0);

const MAX_IMPRESSIONS = Math.max(...POSTS.map((p) => p.impressions));

export default function SlidePostLinkedIn() {
  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 gap-5">

      {/* Header */}
      <div>
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Vyhodnocení · Marketing
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          LinkedIn — AERO kampaň
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          5 příspěvků · 16.–27. 4. 2026 · Sledované období celkem: 05.04.–04.05.2026
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Zobrazení (AERO posty)", value: TOTAL_IMPRESSIONS.toLocaleString("cs-CZ"), color: "var(--color-at-red)" },
          { label: "Kliknutí",               value: TOTAL_CLICKS.toLocaleString("cs-CZ"),      color: "var(--color-at-white)" },
          { label: "Reakce",                 value: TOTAL_REACTIONS.toString(),                 color: "var(--color-at-white)" },
          { label: "Sdílení",                value: TOTAL_SHARES.toString(),                    color: "var(--color-at-white)" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg p-4 flex flex-col gap-1"
            style={{ background: "var(--color-at-blue-v2)", border: s.color === "var(--color-at-red)" ? "1px solid var(--color-at-red)" : "1px solid var(--color-at-blue-v3)" }}
          >
            <span className="text-2xl sm:text-3xl font-black leading-none tabular-nums" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Posts list */}
      <div className="flex flex-col gap-3 flex-1">
        <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: "var(--color-at-white)" }}>
          Výkon jednotlivých příspěvků
        </p>

        {POSTS.map((post, i) => (
          <div
            key={i}
            className="rounded-xl px-4 py-3 flex flex-col gap-2"
            style={{
              background: post.isTop ? "rgba(213,28,23,0.07)" : "var(--color-at-blue-v2)",
              border: post.isTop ? "1px solid rgba(213,28,23,0.3)" : "1px solid var(--color-at-blue-v3)",
            }}
          >
            {/* Title row */}
            <div className="flex items-start gap-2 flex-wrap">
              {post.isTop && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                  style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}
                >
                  TOP POST
                </span>
              )}
              <span className="text-sm font-semibold" style={{ color: "var(--color-at-white)", flex: 1 }}>{post.title}</span>
              <span className="text-xs flex-shrink-0" style={{ color: "var(--color-at-blue-v5)" }}>{post.date}</span>
            </div>

            {/* Bar + stats */}
            <div className="flex items-center gap-3">
              <div className="h-1.5 rounded-full flex-1 overflow-hidden" style={{ background: "var(--color-at-blue-v3)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(post.impressions / MAX_IMPRESSIONS) * 100}%`,
                    background: post.isTop ? "var(--color-at-red)" : "var(--color-at-blue-v4)",
                  }}
                />
              </div>
              <div className="flex gap-4 flex-shrink-0 flex-wrap">
                <span className="text-xs tabular-nums" style={{ color: post.isTop ? "var(--color-at-red)" : "var(--color-at-white)" }}>
                  <strong>{post.impressions.toLocaleString("cs-CZ")}</strong>{" "}
                  <span style={{ color: "var(--color-at-blue-v5)" }}>zobrazení</span>
                </span>
                <span className="text-xs tabular-nums" style={{ color: "var(--color-at-white)" }}>
                  <strong>{post.clicks}</strong>{" "}
                  <span style={{ color: "var(--color-at-blue-v5)" }}>kliků</span>
                </span>
                <span className="text-xs tabular-nums" style={{ color: "var(--color-at-blue-v5)" }}>
                  CTR <strong style={{ color: "var(--color-at-white)" }}>{post.ctr}</strong>
                </span>
                <span className="text-xs tabular-nums" style={{ color: "var(--color-at-blue-v5)" }}>
                  <strong style={{ color: "var(--color-at-white)" }}>{post.reactions}</strong> reakcí
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Period total */}
      <div
        className="rounded-lg px-4 py-3 flex flex-wrap gap-4 items-center"
        style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-at-blue-v5)" }}>
          Sledované období celkem 05.04.–04.05.2026
        </span>
        <div className="flex gap-5 flex-wrap">
          <span className="text-sm tabular-nums" style={{ color: "var(--color-at-white)" }}>
            <strong style={{ color: "var(--color-at-red)" }}>6 688</strong>{" "}
            <span style={{ color: "var(--color-at-blue-v5)" }}>zobrazení</span>
          </span>
          <span className="text-sm tabular-nums" style={{ color: "var(--color-at-white)" }}>
            <strong>979</strong>{" "}
            <span style={{ color: "var(--color-at-blue-v5)" }}>kliků</span>
          </span>
          <span className="text-sm tabular-nums" style={{ color: "var(--color-at-white)" }}>
            <strong>157</strong>{" "}
            <span style={{ color: "var(--color-at-blue-v5)" }}>reakcí</span>
          </span>
        </div>
        <span className="text-xs ml-auto" style={{ color: "var(--color-at-blue-v5)" }}>
          Nejsilnější den: 23. 4. 2026 (Den 2) — 961 zobrazení, 261 kliků
        </span>
      </div>
    </div>
  );
}
