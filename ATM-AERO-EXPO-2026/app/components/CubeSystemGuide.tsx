"use client";

const PANEL_STYLE = {
  background: "var(--color-at-blue-v1)",
  border: "1px solid var(--color-at-blue-v3)",
} as const;

/** Jedna buňka = 40 × 40 cm (Floor / sloupec) v půdorysu */
function TopDownGrid({
  cols,
  rows,
  title,
  subtitle,
}: {
  cols: number;
  rows: number;
  title: string;
  subtitle: string;
}) {
  const pad = 8;
  const cw = 100;
  const ch = 100;
  const totalW = cols * cw + pad * 2;
  const totalH = rows * ch + pad * 2 + 28;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--color-at-blue-v2)" }}>
      <div className="px-3 py-2" style={{ borderBottom: "1px solid var(--color-at-blue-v3)" }}>
        <p className="text-xs font-bold" style={{ color: "var(--color-at-white)" }}>
          {title}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--color-at-blue-v5)" }}>
          {subtitle}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="w-full h-auto max-h-[220px]"
        role="img"
        aria-label={`Půdorys ${cols}×${rows} sloupců`}
      >
        <text x={totalW / 2} y={16} textAnchor="middle" fill="var(--color-at-blue-v5)" fontSize="10" fontWeight="700">
          Pohled shora · každé pole = 40×40 cm (1× Floor)
        </text>
        {Array.from({ length: rows }).flatMap((_, ri) =>
          Array.from({ length: cols }).map((_, ci) => {
            const x = pad + ci * cw;
            const y = pad + 28 + ri * ch;
            return (
              <g key={`${ci}-${ri}`}>
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={cw - 4}
                  height={ch - 4}
                  rx={4}
                  fill="rgba(147,179,207,0.12)"
                  stroke="var(--color-at-blue-v4)"
                  strokeWidth={1.5}
                />
                <text
                  x={x + cw / 2}
                  y={y + ch / 2 + 4}
                  textAnchor="middle"
                  fill="var(--color-at-white)"
                  fontSize="11"
                  fontWeight="700"
                >
                  1×
                </text>
                <text
                  x={x + cw / 2}
                  y={y + ch / 2 + 18}
                  textAnchor="middle"
                  fill="var(--color-at-blue-v5)"
                  fontSize="9"
                >
                  sloupec
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}

/** Boční řez jedním sloupcem: shora Cover, Cube, dole Floor */
function ColumnStack({ cubeCount, label }: { cubeCount: number; label: string }) {
  const floorH = 14;
  const cubeH = 22;
  const coverH = 8;
  const w = 72;
  const titleOffset = 14;
  const totalH = titleOffset + coverH + cubeCount * cubeH + floorH + 28;

  const parts: { h: number; fill: string; stroke: string; text: string; textFill: string }[] = [
    { h: coverH, fill: "rgba(255,255,255,0.95)", stroke: "var(--color-at-blue-v4)", text: "Cover", textFill: "var(--color-at-blue-v1)" },
    ...Array.from({ length: cubeCount }).map(() => ({
      h: cubeH,
      fill: "rgba(255,255,255,0.35)",
      stroke: "var(--color-at-blue-v4)",
      text: "Cube",
      textFill: "var(--color-at-blue-v1)",
    })),
    {
      h: floorH,
      fill: "rgba(27,63,103,0.95)",
      stroke: "var(--color-at-red)",
      text: "Floor",
      textFill: "var(--color-at-white)",
    },
  ];

  let y = titleOffset;
  const stackTop = titleOffset;
  const rects = parts.map((p, idx) => {
    const top = y;
    y += p.h;
    return (
      <g key={idx}>
        <rect
          x={8}
          y={top}
          width={w}
          height={p.h}
          rx={3}
          fill={p.fill}
          stroke={p.stroke}
          strokeWidth={1.5}
        />
        <text
          x={8 + w / 2}
          y={top + p.h / 2 + 4}
          textAnchor="middle"
          fill={p.textFill}
          fontSize="9"
          fontWeight="700"
        >
          {p.text}
        </text>
      </g>
    );
  });

  const coverBottom = stackTop + coverH;
  const cubesBottom = coverBottom + cubeCount * cubeH;

  return (
    <div className="rounded-xl overflow-hidden flex flex-col sm:flex-row gap-3 p-3" style={{ background: "var(--color-at-blue-v2)" }}>
      <svg
        viewBox={`0 0 ${w + 88} ${totalH}`}
        className="w-full max-w-[220px] h-auto flex-shrink-0"
        role="img"
        aria-label={`Řez sloupce: ${cubeCount}× Cube`}
      >
        <text x={4} y={11} fill="var(--color-at-blue-v5)" fontSize="9" fontWeight="700">
          Řez sloupce
        </text>
        {rects}
        <line
          x1={w + 18}
          y1={coverBottom}
          x2={w + 18}
          y2={cubesBottom}
          stroke="var(--color-at-blue-v5)"
          strokeWidth={1}
          strokeDasharray="3 2"
        />
        <text x={w + 22} y={(coverBottom + cubesBottom) / 2 + 3} fill="var(--color-at-blue-v5)" fontSize="8">
          {cubeCount}×20 cm
        </text>
      </svg>
      <p className="text-xs leading-relaxed self-center" style={{ color: "var(--color-at-blue-v5)" }}>
        {label}
      </p>
    </div>
  );
}

const ZASADY = [
  "Vždy začněte od rovné podlahy: jako první položte Floor (černá podložka 40×40 cm), pak skládejte Cube shora dolů podle potřebné výšky.",
  "Počet Cube ve sloupci určuje výška plošiny: 1× Cube = 20 cm, 5× Cube = 100 cm. Poslední vrstva je vždy Cover (zakončovací deska).",
  "Sloupce v půdorysu musí odpovídat mřížce 40 cm: šířka a hloubka plošiny = násobky 40 cm (např. 80×120 cm = 2×3 sloupce).",
  "Nepřekračujte uvedenou nosnost (Cube do 50 kg na sloupec; Floor/Cover dle výrobce). Těžší exponáty rozložte na více sloupů nebo střed plošiny.",
  "Před uložením exponátu zkontrolujte stabilitu celé sestavy; Cover srovnejte s horní hranou kostek, aby plocha byla rovná.",
  "Skladujte a přepravujte díly tak, aby se nešpinily a nepoškrábaly bílé kryty; při demontáži skládejte v opačném pořadí (Cover → Cube → Floor).",
];

const EXHIBITS = [
  {
    id: "sedacky",
    name: "Sedačky (2×)",
    exponat: "cca 50 × 40 × 40 cm",
    platform: "80 × 120 × 40 cm",
    grid: { cols: 2, rows: 3 },
    columns: 6,
    cubePerColumn: 2,
    parts: { floor: 6, cube: 12, cover: 6 },
    steps: [
      "Připravte rovnou plochu v zóně exponátu.",
      "Postavte 6 sloupů v mřížce 2 (šířka) × 3 (hloubka): pod každý sloupec 1× Floor.",
      "Na každý Floor naskládejte 2× Cube (výška samotných kostek 40 cm = 2×20 cm), pak navrch 1× Cover.",
      "Vznikne souvislá plocha 80×120 cm v jedné výšce – vhodná pro rozložení sedaček podle plánu stánku.",
      "Osadte exponáty uprostřed plošiny tak, aby nevyčnívaly přes okraj a váha zůstala vyvážená.",
    ],
  },
  {
    id: "g3x",
    name: "G3X + G3X2",
    exponat: "G3X cca 38×44×33 cm · G3X2 cca 38×22×33 cm",
    platform: "40 × 120 × 100 cm",
    grid: { cols: 1, rows: 3 },
    columns: 3,
    cubePerColumn: 5,
    parts: { floor: 3, cube: 15, cover: 3 },
    steps: [
      "Vyhraďte úzký pruh 40 cm × 120 cm ve směru hloubky stánku.",
      "Postavte 3 sloupce v řadě (1×3): pod každý 1× Floor.",
      "Na každý sloupec naskládejte 5× Cube (100 cm výšky) + Cover nahoře.",
      "Na výslednou plošinu umístěte G3X a G3X2 dle rozložení na stánku (vyšší souvislá plocha pro dva kusy vedle sebe v hloubce).",
    ],
  },
  {
    id: "panel",
    name: "Panel (celý)",
    exponat: "cca 120 × 42 × 52 cm",
    platform: "120 × 80 × 100 cm",
    grid: { cols: 3, rows: 2 },
    columns: 6,
    cubePerColumn: 5,
    parts: { floor: 6, cube: 30, cover: 6 },
    steps: [
      "Připravte plochu 120×80 cm (3 sloupce × 2 řady v hloubce).",
      "Pod každý ze 6 sloupů položte Floor, poté 5× Cube a Cover.",
      "Vznikne široká plošina ve výšce 100 cm vhodná pro velký panel – kontrolujte vyvážení kvůli výšce exponátu.",
      "Panel uchytit stabilně; při manipulaci ve dvojici kvůli rozměrům.",
    ],
  },
] as const;

export default function CubeSystemGuide() {
  return (
    <div className="flex flex-col">
      <div className="mb-4 sm:mb-5">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Stánek · Systém CUBE
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          EasyCube – skládání pod exponáty
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          AERO EXPO 2026 · Friedrichshafen · EasyCube Set „Profi“ (VKF Renzel)
        </p>
      </div>

      <section className="rounded-xl px-4 py-3 mb-5" style={PANEL_STYLE}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-at-blue-v5)" }}>
          Komponenty (sada Profi)
        </p>
        <ul className="text-sm space-y-1.5" style={{ color: "var(--color-at-blue-v5)" }}>
          <li>
            <strong style={{ color: "var(--color-at-white)" }}>Floor</strong> – podlahová část 400×400×50 mm, nosnost dle výrobce až 2 000 kg (jako základ sloupce).
          </li>
          <li>
            <strong style={{ color: "var(--color-at-white)" }}>Cube</strong> – kostka 400×400×200 mm (20 cm výšky), do 50 kg na kus při skládání ve sloupci.
          </li>
          <li>
            <strong style={{ color: "var(--color-at-white)" }}>Cover</strong> – zakončovací deska 400×400×10 mm (horní kryt sloupce / plochy).
          </li>
        </ul>
        <p className="text-xs mt-3" style={{ color: "var(--color-at-blue-v4)" }}>
          Jedna „buňka“ půdorysu = 40×40 cm = jeden Floor pod jedním sloupcem kostek.
        </p>
      </section>

      <p
        className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
        style={{ color: "var(--color-at-blue-v5)" }}
      >
        Postup podle exponátu
      </p>

      <div className="flex flex-col gap-8 mb-6">
        {EXHIBITS.map((ex) => (
          <article key={ex.id} className="rounded-xl px-4 py-4" style={PANEL_STYLE}>
            <h3 className="text-lg font-black mb-1" style={{ color: "var(--color-at-white)" }}>
              {ex.name}
            </h3>
            <p className="text-sm mb-3" style={{ color: "var(--color-at-blue-v5)" }}>
              <span className="font-bold" style={{ color: "var(--color-at-blue-a5)" }}>Exponát:</span> {ex.exponat}
              <br />
              <span className="font-bold" style={{ color: "var(--color-at-blue-a5)" }}>Cílová plošina Cube:</span> {ex.platform} ·{" "}
              <span className="font-bold" style={{ color: "var(--color-at-blue-a5)" }}>Sloupce:</span> {ex.columns} ·{" "}
              <span className="font-bold" style={{ color: "var(--color-at-blue-a5)" }}>Výška sloupce:</span> {ex.cubePerColumn}× Cube
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <TopDownGrid
                cols={ex.grid.cols}
                rows={ex.grid.rows}
                title={`Půdorys ${ex.grid.cols}×${ex.grid.rows} sloupců`}
                subtitle={`Celkem ${ex.columns}× Floor · ${ex.parts.cube}× Cube · ${ex.columns}× Cover`}
              />
              <ColumnStack
                cubeCount={ex.cubePerColumn}
                label={`Pořadí ve sloupci: Floor → ${ex.cubePerColumn}× Cube → Cover. Všechny sloupce ve stejné výšce.`}
              />
            </div>

            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-at-blue-v5)" }}>
              Návod montáže
            </p>
            <ol className="list-decimal pl-4 space-y-2 text-sm" style={{ color: "var(--color-at-white)" }}>
              {ex.steps.map((s) => (
                <li key={s}>
                  <span style={{ color: "var(--color-at-blue-v5)" }}>{s}</span>
                </li>
              ))}
            </ol>

            <p className="text-xs mt-4 pt-3" style={{ color: "var(--color-at-blue-v4)", borderTop: "1px solid var(--color-at-blue-v3)" }}>
              Materiál na tuto plošinu: <strong style={{ color: "var(--color-at-white)" }}>{ex.parts.floor}× Floor</strong>,{" "}
              <strong style={{ color: "var(--color-at-white)" }}>{ex.parts.cube}× Cube</strong>,{" "}
              <strong style={{ color: "var(--color-at-white)" }}>{ex.parts.cover}× Cover</strong>.
            </p>
          </article>
        ))}
      </div>

      <section className="rounded-xl px-4 py-3" style={PANEL_STYLE}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-at-blue-v5)" }}>
          Společné zásady
        </p>
        <ul className="list-disc pl-4 space-y-1.5 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          {ZASADY.map((z) => (
            <li key={z}>{z}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
