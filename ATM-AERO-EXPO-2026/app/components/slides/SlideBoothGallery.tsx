"use client";

import { useState, useEffect, useCallback } from "react";

type BoothPhoto = {
  src: string;
  label: string;
};

const PHOTOS: BoothPhoto[] = [
  { src: "/01_38_02 Stanek_Aero_2026.jpg",    label: "Čelní pohled" },
  { src: "/01_38_02 Stanek_Aero_2026_02.jpg",  label: "Pohled z boku – Aerospec" },
  { src: "/01_38_02 Stanek_Aero_2026_03.jpg",  label: "Pohled shora" },
  { src: "/01_38_02 Stanek_Aero_2026_10.jpg",  label: "Celkový záběr" },
  { src: "/01_38_02 Stanek_Aero_2026_05.jpg",  label: "Recepce – detail" },
  { src: "/01_38_02 Stanek_Aero_2026_08.jpg",  label: "Pohled shora – recepce" },
  { src: "/01_38_02 Stanek_Aero_2026_04.jpg",  label: "Jednací místnost" },
  { src: "/01_38_02 Stanek_Aero_2026_09.jpg",  label: "Jednací místnost – interiér" },
  { src: "/01_38_02 Stanek_Aero_2026_pudorys.png", label: "Půdorys – rozložení expozic a elektro" },
];

const EXHIBIT_PHOTOS: BoothPhoto[] = [
  { src: "/exponat-kokpit-01.png", label: "Exponát – skleněný kokpit Garmin" },
  { src: "/exponat-kokpit-02.png", label: "Exponát – yoke AIR TEAM detail" },
];

const VISIBLE_BOOTH = 4;

const EASYCUBES_PHOTOS: BoothPhoto[] = [
  { src: "/easycube-profi-01.jpg", label: "EasyCubes Set Profi – hlavní" },
  { src: "/easycube-profi-02.jpg", label: "EasyCubes – varianta sestavení" },
  { src: "/easycube-profi-03.jpg", label: "EasyCubes – detail kostky" },
  { src: "/easycube-profi-04.jpg", label: "EasyCubes – schůdky" },
  { src: "/easycube-profi-05.jpg", label: "EasyCubes – sloupky" },
  { src: "/easycube-profi-06.jpg", label: "EasyCubes – sestava s produkty" },
  { src: "/easycube-profi-07.jpg", label: "EasyCubes – kompaktní varianta" },
  { src: "/easycube-profi-08.jpg", label: "EasyCubes – rozložená sestava" },
  { src: "/easycube-profi-09.jpg", label: "EasyCubes – Floor díl" },
  { src: "/easycube-profi-10.jpg", label: "EasyCubes – Cover díl" },
];

const ALL_PHOTOS = [...PHOTOS, ...EXHIBIT_PHOTOS, ...EASYCUBES_PHOTOS];

const EASYCUBES_SPECS = [
  { label: "Produkt", value: 'EasyCubes Set \u201EProfi\u201C' },
  { label: "Dodavatel", value: "VKF Renzel" },
  { label: "Kód", value: "80.1086.X" },
  { label: "Floor", value: "8 ks · 400 × 400 × 50 mm" },
  { label: "Cube", value: "16 ks · 400 × 400 × 200 mm" },
  { label: "Cover", value: "8 ks · 400 × 400 × 10 mm" },
];

const BOOTH_SPECS = [
  { label: "Rozměr", value: "15 × 4 m" },
  { label: "Plocha", value: "60 m²" },
  { label: "Typ", value: "Rohový stánek" },
  { label: "Dodavatel", value: "MLT expo" },
];

const ZONES = [
  { name: "Levá část – Aerospec / PilotStyle", desc: "Produktová zóna se skleněnými stěnami, backlit grafika letadla a pilotky" },
  { name: "Centrum \u2013 AIR TEAM recepce", desc: 'Hlavn\u00ED pult s logem, TV obrazovka, claim \u201EYOUR MISSION. OUR TECHNOLOGY.\u201C' },
  { name: "Pravá část – kokpit", desc: "Vizualizace skleněného kokpitu, sedačky pro návštěvníky" },
  { name: "Zázemí – jednací místnost", desc: "Uzavřená místnost se stolem pro šest osob, skleněná stěna s grafikou Aerospec" },
];

export default function SlideBoothGallery() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevPhoto = useCallback(
    () => setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i)),
    []
  );
  const nextPhoto = useCallback(
    () => setLightboxIdx((i) => (i !== null && i < ALL_PHOTOS.length - 1 ? i + 1 : i)),
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

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Stánek · Grafika
        </p>
        <h2
          className="text-xl sm:text-3xl font-black"
          style={{ color: "var(--color-at-white)" }}
        >
          Vizualizace stánku AIR TEAM
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          AERO EXPO 2026, Friedrichshafen · Rohový stánek 15 × 4 m (60 m²) · Dodavatel MLT expo
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1">
        {/* Gallery grid */}
        <div className="flex-1 min-w-0">
          {/* Hero image – first photo large */}
          <button
            onClick={() => setLightboxIdx(0)}
            className="w-full rounded-xl overflow-hidden cursor-zoom-in focus:outline-none group mb-3"
            style={{ background: "var(--color-at-blue-v2)" }}
          >
            <div className="relative" style={{ paddingBottom: "45%" }}>
              <img
                src={PHOTOS[0].src}
                alt={PHOTOS[0].label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                style={{ background: "rgba(16,37,62,0.4)" }}
              >
                <span
                  className="px-4 py-2 rounded-lg text-sm font-bold"
                  style={{ background: "rgba(16,37,62,0.8)", color: "var(--color-at-white)" }}
                >
                  Zobrazit detail
                </span>
              </div>
              <span
                className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ background: "rgba(16,37,62,0.75)", color: "var(--color-at-white)", backdropFilter: "blur(4px)" }}
              >
                {PHOTOS[0].label}
              </span>
            </div>
          </button>

          {/* Thumbnail grid – 4 visible + "more" tile */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
            {PHOTOS.slice(1, VISIBLE_BOOTH + 1).map((photo, i) => (
              <button
                key={photo.src}
                onClick={() => setLightboxIdx(i + 1)}
                className="relative rounded-xl overflow-hidden cursor-zoom-in focus:outline-none group"
                style={{ background: "var(--color-at-blue-v2)", aspectRatio: "4/3" }}
              >
                <img
                  src={photo.src}
                  alt={photo.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "rgba(16,37,62,0.4)" }}
                />
                <span
                  className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-1 rounded text-xs font-bold truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "rgba(16,37,62,0.75)", color: "var(--color-at-white)", backdropFilter: "blur(4px)" }}
                >
                  {photo.label}
                </span>
              </button>
            ))}

            {PHOTOS.length > VISIBLE_BOOTH + 1 && (
              <button
                onClick={() => setLightboxIdx(VISIBLE_BOOTH + 1)}
                className="relative rounded-xl overflow-hidden cursor-zoom-in focus:outline-none"
                style={{ background: "var(--color-at-blue-v2)", aspectRatio: "4/3" }}
              >
                <img
                  src={PHOTOS[VISIBLE_BOOTH + 1].src}
                  alt="Další fotky"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-white font-black text-xl">+{PHOTOS.length - VISIBLE_BOOTH - 1}</span>
                  <span className="text-white text-xs font-bold">fotek</span>
                </div>
              </button>
            )}
          </div>

          {/* Exhibit section */}
          <div className="mt-6">
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-1"
              style={{ color: "var(--color-at-blue-v5)" }}
            >
              Exponát
            </p>
            <h3 className="text-lg sm:text-xl font-black mb-1" style={{ color: "var(--color-at-white)" }}>
              Skleněný kokpit Garmin – OK-ATS
            </h3>
            <p className="text-xs mb-3" style={{ color: "var(--color-at-blue-v5)" }}>
              Funkční přístrojová deska s avionickým systémem Garmin G3X Touch, GTN 750 Xi, GFC 500.
              Kožený yoke s logem AIR TEAM. Exponát bude umístěn v pravé části stánku.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {EXHIBIT_PHOTOS.map((photo, i) => (
                <button
                  key={photo.src}
                  onClick={() => setLightboxIdx(PHOTOS.length + i)}
                  className="relative rounded-xl overflow-hidden cursor-zoom-in focus:outline-none group"
                  style={{ background: "var(--color-at-blue-v2)", aspectRatio: "16/10" }}
                >
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "rgba(16,37,62,0.4)" }}
                  />
                  <span
                    className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded text-xs font-bold truncate"
                    style={{ background: "rgba(16,37,62,0.75)", color: "var(--color-at-white)", backdropFilter: "blur(4px)" }}
                  >
                    {photo.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3 text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
            Kliknutím na fotku otevřete detail · šipkami listujete · Esc zavírá
          </p>

          {/* EasyCubes section */}
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-3">
              <div>
                <p
                  className="text-xs font-bold tracking-[0.2em] uppercase mb-1"
                  style={{ color: "var(--color-at-blue-v5)" }}
                >
                  Prezentační systém
                </p>
                <h3 className="text-lg sm:text-xl font-black" style={{ color: "var(--color-at-white)" }}>
                  EasyCubes Set „Profi"
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-at-blue-v5)" }}>
                  32 dílů · 16 kostek Cube + 8 podlah Floor + 8 krycích Cover · variabilní sestavy pro prezentaci produktů
                </p>
              </div>
              <a
                href="https://www.vkf-renzel.cz/easycube-set-profi-15708.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0"
                style={{ background: "var(--color-at-blue-v2)", color: "var(--color-at-white)", border: "1px solid var(--color-at-blue-v4)" }}
              >
                VKF Renzel ↗
              </a>
            </div>

            {/* EasyCubes specs – mobile/tablet horizontal strip */}
            <div className="lg:hidden flex flex-wrap gap-2 mb-3">
              {EASYCUBES_SPECS.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-lg px-3 py-1.5"
                  style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
                >
                  <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>{spec.label}: </span>
                  <span className="text-xs font-bold" style={{ color: "var(--color-at-white)" }}>{spec.value}</span>
                </div>
              ))}
            </div>

            {/* EasyCubes photo grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {EASYCUBES_PHOTOS.map((photo, i) => (
                <button
                  key={photo.src}
                  onClick={() => setLightboxIdx(PHOTOS.length + EXHIBIT_PHOTOS.length + i)}
                  className="relative rounded-lg overflow-hidden cursor-zoom-in focus:outline-none group"
                  style={{ background: "#fff", aspectRatio: "1" }}
                >
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="absolute inset-0 w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "rgba(16,37,62,0.3)" }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel – specs + zones */}
        <div className="flex flex-col gap-4 w-full lg:w-64 flex-shrink-0">
          {/* Booth specs */}
          <div
            className="rounded-xl px-4 py-3 flex flex-col gap-2"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "var(--color-at-blue-v5)" }}
            >
              Parametry stánku
            </p>
            {BOOTH_SPECS.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between pb-1.5"
                style={{ borderBottom: "1px solid var(--color-at-blue-v3)" }}
              >
                <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                  {spec.label}
                </span>
                <span className="text-sm font-black" style={{ color: "var(--color-at-white)" }}>
                  {spec.value}
                </span>
              </div>
            ))}
          </div>

          {/* Zones */}
          <div
            className="rounded-xl px-4 py-3 flex flex-col gap-2"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "var(--color-at-blue-v5)" }}
            >
              Zóny stánku
            </p>
            {ZONES.map((zone) => (
              <div
                key={zone.name}
                className="pb-2 mb-1"
                style={{ borderBottom: "1px solid var(--color-at-blue-v3)" }}
              >
                <p className="text-sm font-black" style={{ color: "var(--color-at-white)" }}>
                  {zone.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-at-blue-v5)" }}>
                  {zone.desc}
                </p>
              </div>
            ))}
          </div>

          {/* EasyCubes specs – desktop */}
          <div
            className="hidden lg:flex rounded-xl px-4 py-3 flex-col gap-2"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "var(--color-at-blue-v5)" }}
            >
              EasyCubes Set „Profi"
            </p>
            {EASYCUBES_SPECS.map((spec) => (
              <div
                key={spec.label}
                className="flex items-start justify-between gap-2 pb-1.5"
                style={{ borderBottom: "1px solid var(--color-at-blue-v3)" }}
              >
                <span className="text-xs flex-shrink-0" style={{ color: "var(--color-at-blue-v5)" }}>
                  {spec.label}
                </span>
                <span className="text-xs font-bold text-right" style={{ color: "var(--color-at-white)" }}>
                  {spec.value}
                </span>
              </div>
            ))}
            <a
              href="https://www.vkf-renzel.cz/easycube-set-profi-15708.html"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 px-3 py-1.5 rounded-lg text-xs font-bold text-center"
              style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
            >
              Katalog VKF Renzel ↗
            </a>
          </div>

          {/* Photo count badge */}
          <div
            className="rounded-lg px-4 py-3 flex items-center gap-3"
            style={{ background: "var(--color-at-blue-a5)", border: "1px solid var(--color-at-blue-v4)" }}
          >
            <span className="text-2xl font-black" style={{ color: "var(--color-at-blue-v1)" }}>
              {ALL_PHOTOS.length}
            </span>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--color-at-blue-v1)" }}>
                vizualizací a fotek
              </p>
              <p className="text-xs" style={{ color: "var(--color-at-blue-v2)" }}>
                Stánek + EasyCubes · AERO 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Náhled vizualizace stánku"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(16,37,62,0.95)", backdropFilter: "blur(6px)" }}
          onClick={closeLightbox}
        >
          <div
            className="relative rounded-2xl overflow-hidden flex flex-col"
            style={{
              maxWidth: "min(960px, 92vw)",
              maxHeight: "92vh",
              background: "var(--color-at-blue-v2)",
              border: "1px solid var(--color-at-blue-v3)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
              animation: "booth-lb-in 200ms cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              aria-label="Zavřít náhled"
              className="absolute top-3 right-3 z-10 rounded-full flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                background: "rgba(16,37,62,0.7)",
                color: "var(--color-at-white)",
                border: "1px solid var(--color-at-blue-v4)",
                backdropFilter: "blur(4px)",
                cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Image */}
            <img
              src={ALL_PHOTOS[lightboxIdx].src}
              alt={ALL_PHOTOS[lightboxIdx].label}
              className="w-full object-contain"
              style={{ maxHeight: "75vh", background: lightboxIdx >= PHOTOS.length + EXHIBIT_PHOTOS.length ? "#fff" : "#000" }}
            />

            {/* Navigation bar */}
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
              <button
                onClick={prevPhoto}
                disabled={lightboxIdx === 0}
                className="px-3 sm:px-4 py-1.5 rounded-lg text-sm font-bold disabled:opacity-30"
                style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
              >
                ← Předchozí
              </button>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold" style={{ color: "var(--color-at-white)" }}>
                  {ALL_PHOTOS[lightboxIdx].label}
                </span>
                <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                  {lightboxIdx + 1} / {ALL_PHOTOS.length}
                </span>
              </div>
              <button
                onClick={nextPhoto}
                disabled={lightboxIdx === ALL_PHOTOS.length - 1}
                className="px-3 sm:px-4 py-1.5 rounded-lg text-sm font-bold disabled:opacity-30"
                style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
              >
                Další →
              </button>
            </div>
          </div>

          {/* Side arrows for desktop */}
          {lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              aria-label="Předchozí fotka"
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                background: "rgba(16,37,62,0.7)",
                color: "var(--color-at-white)",
                border: "1px solid var(--color-at-blue-v4)",
                backdropFilter: "blur(4px)",
                cursor: "pointer",
                fontSize: 20,
              }}
            >
              ‹
            </button>
          )}
          {lightboxIdx < ALL_PHOTOS.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              aria-label="Další fotka"
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                background: "rgba(16,37,62,0.7)",
                color: "var(--color-at-white)",
                border: "1px solid var(--color-at-blue-v4)",
                backdropFilter: "blur(4px)",
                cursor: "pointer",
                fontSize: 20,
              }}
            >
              ›
            </button>
          )}

          <style>{`
            @keyframes booth-lb-in {
              from { transform: scale(0.92); opacity: 0 }
              to { transform: scale(1); opacity: 1 }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
