"use client";

import { useState, useEffect, useCallback } from "react";

type GiftCategory = {
  label: string;
  target: string;
  price?: string;
  items: {
    name: string;
    note?: string;
    image?: string;
    status?: "done" | "todo" | "missing";
  }[];
};

const CATEGORIES: GiftCategory[] = [
  {
    label: "Rozdávačky",
    target: "Všichni návštěvníci",
    items: [
      {
        name: "Energetický nápoj AIR TEAM",
        note: "ATM verze · 100 ks · 28,93 Kč / ks · máme ve VB",
        image: "/darky-energy-drink-airteam.png",
        status: "done",
      },
      {
        name: "Energetický nápoj PilotStyle",
        note: "PilotStyle verze · 100 ks · 28,93 Kč / ks · máme ve VB",
        image: "/darky-energy-drink-pilotstyle.png",
        status: "done",
      },
      {
        name: "Karamelky",
        note: "1 766 Kč · máme ve VB",
        image: "/Karamelky.jpeg",
        status: "done",
      },
      {
        name: "Kuličkové pero Connel – AIR TEAM",
        note: "100 ks · 16 Kč / ks · máme ve VB",
        image: "/AIR%20TEAM%20propiska.jpeg",
        status: "done",
      },
      {
        name: "Kuličkové pero Connel – PilotStyle",
        note: "50 ks · 16 Kč / ks · máme ve VB",
        image: "/PilotStyle%20propiska.jpeg",
        status: "done",
      },
      {
        name: "Tašky RAINBOW modrá",
        note: "23×10×32 cm · 150 ks · 8,10 Kč / ks · máme ve VB",
        image: "/taska_na_darky.jpg",
        status: "done",
      },
    ],
  },
  {
    label: "Balíček 1",
    target: "Kvalitnější kontakt / schůzka",
    price: "~299 Kč / sada",
    items: [
      {
        name: "Keramický pohárek 330 ml Qeram",
        note: "Keramický · 126 Kč / ks · 100 ks objednáno · fa 260100283",
        image: "/01_781_04%20ATM_Keramicky_poharek_2026_mockup_v4.jpg",
        status: "done",
      },
      {
        name: "Káva Barahona",
        note: "Dom. republika · černý doypack · 173 Kč · 60 ks · máme ve VB",
        image: "/darky-kava-new.png",
        status: "done",
      },
    ],
  },
];

const STATUS_CONFIG = {
  done:    { label: "Zajištěno", color: "var(--color-at-blue-v1)", bg: "var(--color-at-blue-a5)" },
  todo:    { label: "Objednat",  color: "var(--color-at-blue-v1)", bg: "#f59e0b" },
  missing: { label: "CHYBÍ",     color: "var(--color-at-white)",   bg: "var(--color-at-red)" },
};

export default function SlideGifts() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, closeLightbox]);

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Příprava veletrhu
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Dárkové balíčky pro zákazníky
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          Přehled dárků pro AERO EXPO 2026 · celkový potvrzený náklad 29 246 Kč
        </p>
      </div>

      {/* Categories – stacked columns */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.label}
            className="flex flex-col rounded-xl overflow-hidden"
            style={{
              flex: cat.items.length > 2 ? "1.2" : "1",
              background: "var(--color-at-blue-v1)",
              border: "1px solid var(--color-at-blue-v3)",
            }}
          >
            {/* Category header */}
            <div
              className="px-5 py-3 flex items-center justify-between gap-3 flex-shrink-0"
              style={{
                background: "var(--color-at-blue)",
                borderBottom: "2px solid var(--color-at-blue-v4)",
              }}
            >
              <div>
                <p className="text-sm font-black" style={{ color: "var(--color-at-white)" }}>
                  {cat.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-at-blue-v5)" }}>
                  {cat.target}
                </p>
              </div>
              {cat.price && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: "rgba(213,28,23,0.18)",
                    color: "var(--color-at-white)",
                    border: "1px solid var(--color-at-red)",
                  }}
                >
                  {cat.price}
                </span>
              )}
            </div>

            {/* Items – horizontal rows */}
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-at-blue-v2)" }}>
              {cat.items.map((item) => {
                const sc = item.status ? STATUS_CONFIG[item.status] : null;
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-4 px-4 py-3"
                    style={{ minHeight: 72 }}
                  >
                    {/* Thumbnail */}
                    {item.image ? (
                      <button
                        onClick={() => setLightbox(item.image!)}
                        aria-label={`Zobrazit foto: ${item.name}`}
                        className="flex-shrink-0 rounded-lg overflow-hidden cursor-zoom-in focus:outline-none"
                        style={{
                          width: 80,
                          height: 80,
                          background: "#fff",
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-opacity duration-150 hover:opacity-80"
                        />
                      </button>
                    ) : (
                      <div
                        className="flex-shrink-0 rounded-lg flex items-center justify-center"
                        style={{
                          width: 80,
                          height: 80,
                          background: "var(--color-at-blue-v2)",
                          border: "1px solid var(--color-at-blue-v3)",
                        }}
                      >
                        <span className="text-2xl">🎁</span>
                      </div>
                    )}

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black leading-tight" style={{ color: "var(--color-at-white)" }}>
                        {item.name}
                      </p>
                      {item.note && (
                        <p className="text-xs mt-1 leading-snug" style={{ color: "var(--color-at-blue-v5)" }}>
                          {item.note}
                        </p>
                      )}
                    </div>

                    {/* Status badge */}
                    {sc && (
                      <span
                        className="text-xs font-bold px-2 py-1 rounded flex-shrink-0"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {sc.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox overlay */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Náhled fotografie"
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(16,37,62,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
            animation: "lb-fade-in 180ms ease",
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            aria-label="Zavřít náhled"
            className="btn-transparent"
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>

          {/* Image */}
          <img
            src={lightbox}
            alt="Náhled dárku"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(90vw, 700px)",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: 12,
              boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
              animation: "lb-scale-in 200ms cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />

          {/* Hint */}
          <p
            style={{
              position: "absolute",
              bottom: 20,
              color: "rgba(147,179,207,0.7)",
              fontSize: 12,
              letterSpacing: "0.05em",
            }}
          >
            Kliknutím mimo nebo klávesou Esc zavřeš náhled
          </p>

          <style>{`
            @keyframes lb-fade-in { from { opacity: 0 } to { opacity: 1 } }
            @keyframes lb-scale-in { from { transform: scale(0.88); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          `}</style>
        </div>
      )}
    </div>
  );
}
