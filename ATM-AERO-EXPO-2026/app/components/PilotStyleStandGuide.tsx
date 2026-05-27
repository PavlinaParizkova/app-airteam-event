"use client";

import { useState, useEffect, useCallback } from "react";

/** Pořadí: 1 sluchátka, 2–3 stojan na produkty (vedle sebe). ?v= obejde starou cache obrázků. */
const V = "ps-layout-3";

const PHOTOS = [
  {
    src: `/Stojan_PilotStyle2.PNG?v=${V}`,
    label: "Sluchátka – stojan na headset PilotStyle",
  },
  {
    src: `/Stojan_PilotStyle3.PNG?v=${V}`,
    label: "Stojan na produkty – čelní pohled",
  },
  {
    src: `/Stojan_PilotStyle.PNG?v=${V}`,
    label: "Stojan na produkty – logbook, organizér, velké formáty",
  },
] as const;

const ZASADY = [
  "Logo PilotStyle na výrobku směřuje k divákovi.",
  "Černá, zlatá a bílá drží vizuální řád; využijte všech čtyř stran stojanu.",
  "Velké obaly a hlavní kusy držte přehledně ve středu čelní plochy; menší zboží a ploché formáty na háčcích po stranách.",
  "Kabely u headsetu svěsit dolů, přebytek svázat u paty stojanu.",
  "U drobného zboží dejte cenovku k danému produktu, ať je čitelná z běžné vzdálenosti.",
];

export type PilotStyleStandGuideLayout = "slide" | "ops";

type Props = { layout?: PilotStyleStandGuideLayout };

export default function PilotStyleStandGuide({ layout = "slide" }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevPhoto = useCallback(
    () => setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i)),
    []
  );
  const nextPhoto = useCallback(
    () => setLightboxIdx((i) => (i !== null && i < PHOTOS.length - 1 ? i + 1 : i)),
    []
  );

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIdx, closeLightbox, prevPhoto, nextPhoto]);

  const panelStyle = {
    background: "var(--color-at-blue-v1)",
    border: "1px solid var(--color-at-blue-v3)",
  } as const;

  const rootClass =
    layout === "slide"
      ? "flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8"
      : "flex flex-col";

  return (
    <div className={rootClass}>
      <div className="mb-4 sm:mb-5">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Stánek · PilotStyle
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Rozložení a skládání stojanů PilotStyle
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          AERO EXPO 2026 · Friedrichshafen
        </p>
      </div>

      <div className="mb-5 sm:mb-6">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-blue-v5)" }}
        >
          Referenční fotky
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-at-blue-v5)" }}
            >
              Stojan na sluchátka
            </p>
            <div className="max-w-lg">
              <button
                type="button"
                onClick={() => setLightboxIdx(0)}
                className="w-full relative rounded-xl overflow-hidden text-left cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-at-blue-v1)] focus-visible:ring-[var(--color-at-red)] group"
                style={{ background: "var(--color-at-blue-v2)" }}
              >
                <div className="relative aspect-[4/3] sm:aspect-[4/3]">
                  <img
                    src={PHOTOS[0].src}
                    alt={PHOTOS[0].label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ background: "rgba(16,37,62,0.45)" }}
                  >
                    <span
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: "rgba(16,37,62,0.85)", color: "var(--color-at-white)" }}
                    >
                      Zvětšit
                    </span>
                  </div>
                </div>
                <p
                  className="p-2.5 text-xs font-bold leading-snug"
                  style={{ color: "var(--color-at-white)", background: "var(--color-at-blue-v1)" }}
                >
                  {PHOTOS[0].label}
                </p>
              </button>
            </div>
          </div>

          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-at-blue-v5)" }}
            >
              Stojan na produkty
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PHOTOS.slice(1).map((photo, j) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => setLightboxIdx(j + 1)}
                  className="relative rounded-xl overflow-hidden text-left cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-at-blue-v1)] focus-visible:ring-[var(--color-at-red)] group"
                  style={{ background: "var(--color-at-blue-v2)" }}
                >
                  <div className="relative aspect-[4/3] sm:aspect-[3/4]">
                    <img
                      src={photo.src}
                      alt={photo.label}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      style={{ background: "rgba(16,37,62,0.45)" }}
                    >
                      <span
                        className="px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: "rgba(16,37,62,0.85)", color: "var(--color-at-white)" }}
                      >
                        Zvětšit
                      </span>
                    </div>
                  </div>
                  <p
                    className="p-2.5 text-xs font-bold leading-snug"
                    style={{ color: "var(--color-at-white)", background: "var(--color-at-blue-v1)" }}
                  >
                    {photo.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
          Kliknutím otevřete detail · šipkami listujete · Esc zavře
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-4xl">
        <section className="rounded-xl px-4 py-3" style={panelStyle}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-at-blue-v5)" }}>
            Společné zásady
          </p>
          <ul className="list-disc pl-4 space-y-1.5 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
            {ZASADY.map((z) => (
              <li key={z}>{z}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl px-4 py-3" style={panelStyle}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-at-blue-v5)" }}>
            Typ 1 – pultový stojan na headset
          </p>
          <p className="text-sm mb-3" style={{ color: "var(--color-at-blue-v5)" }}>
            Vertikální stojan s plochou podstavou, horní výřez pro hlavový most a boční držák na inline ovládání.
          </p>
          <ol className="list-decimal pl-4 space-y-2 text-sm" style={{ color: "var(--color-at-white)" }}>
            <li>
              <span style={{ color: "var(--color-at-blue-v5)" }}>Podstava:</span> postavit na rovnou plochu.
            </li>
            <li>
              <span style={{ color: "var(--color-at-blue-v5)" }}>Hlavový most:</span> osadit doprostřed horního výřezu; mušle visí po stranách sloupku. Logo PilotStyle na mušli k divákovi.
            </li>
            <li>
              <span style={{ color: "var(--color-at-blue-v5)" }}>Inline box:</span> zasunout do bočního držáku (z pohledu diváka typicky vpravo), ovládání čelem ven.
            </li>
            <li>
              <span style={{ color: "var(--color-at-blue-v5)" }}>Kabely:</span> vést k ovladači, přebytek u paty srovnat nebo svázat – nesvírat v držáku.
            </li>
            <li>
              <span style={{ color: "var(--color-at-blue-v5)" }}>Krabička u stojanu (volitelně):</span> „Aviation Headset“ se stejným brandingem jako výstava.
            </li>
          </ol>
        </section>

        <section className="rounded-xl px-4 py-3" style={panelStyle}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-at-blue-v5)" }}>
            Stojan na produkty – čtyřboký slatwall
          </p>
          <p className="text-sm mb-3" style={{ color: "var(--color-at-blue-v5)" }}>
            Jedna výstavní sestava: černá slatwallová věž na kulaté šedé podstavě (typicky otočná). Konstrukci složte z dodaných dílů, postavte na rovnou podlahu a rozložení zboží veďte podle referenčních fotek níže – ty jsou hlavní předlohou; text jen doplňuje společná pravidla.
          </p>
          <ul className="list-disc pl-4 space-y-1.5 text-sm mb-4" style={{ color: "var(--color-at-blue-v5)" }}>
            <li>
              <strong style={{ color: "var(--color-at-white)" }}>Vrchol:</strong> volitelně univerzální držáky (tablet / telefon), symetricky dle montáže.
            </li>
            <li>
              <strong style={{ color: "var(--color-at-white)" }}>Hlavička:</strong> bílá cedule s logem PilotStyle, je-li součástí sady.
            </li>
            <li>
              <strong style={{ color: "var(--color-at-white)" }}>Čelní plocha a řádky:</strong> držte přehlednou osu (velké obaly, hlavní kusy uprostřed); drobnější položky a cenovky podle fotek.
            </li>
            <li>
              <strong style={{ color: "var(--color-at-white)" }}>Zbývající tři boky:</strong> ploché výrobky a checklisty na háčcích vyváženě vlevo i vpravo; větší sáčky nebo tašky zvažte svisle na bok, aby nepřekrývaly hlavní výstavní stranu.
            </li>
          </ul>
          <p className="text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
            Konkrétní pořadí řádků a mix produktů (logbook, navigace, kneeboard, flight bagy, drobnosti) vezměte z fotek – cílem je, aby kdokoli ze týmu stojan složil a zboží rozložil stejně čitelně jako na předloze.
          </p>
        </section>
      </div>

      {lightboxIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fotka stojanu PilotStyle"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(16,37,62,0.95)", backdropFilter: "blur(6px)" }}
          onClick={closeLightbox}
        >
          <div
            className="relative rounded-2xl overflow-hidden flex flex-col w-full"
            style={{
              maxWidth: "min(960px, 96vw)",
              maxHeight: "92vh",
              background: "var(--color-at-blue-v2)",
              border: "1px solid var(--color-at-blue-v3)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Zavřít"
              className="absolute top-3 right-3 z-10 rounded-full flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                background: "rgba(16,37,62,0.7)",
                color: "var(--color-at-white)",
                border: "1px solid var(--color-at-blue-v4)",
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <img
              src={PHOTOS[lightboxIdx].src}
              alt={PHOTOS[lightboxIdx].label}
              className="w-full object-contain"
              style={{ maxHeight: "72vh", background: "#0a1520" }}
            />
            <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={prevPhoto}
                disabled={lightboxIdx === 0}
                className="px-3 py-1.5 rounded-lg text-sm font-bold disabled:opacity-30"
                style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
              >
                ← Předchozí
              </button>
              <div className="flex flex-col items-center text-center flex-1 min-w-[12rem]">
                <span className="text-sm font-bold" style={{ color: "var(--color-at-white)" }}>
                  {PHOTOS[lightboxIdx].label}
                </span>
                <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                  {lightboxIdx + 1} / {PHOTOS.length}
                </span>
              </div>
              <button
                type="button"
                onClick={nextPhoto}
                disabled={lightboxIdx === PHOTOS.length - 1}
                className="px-3 py-1.5 rounded-lg text-sm font-bold disabled:opacity-30"
                style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
              >
                Další →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
