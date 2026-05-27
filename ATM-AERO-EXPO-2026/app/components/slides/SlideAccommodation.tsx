"use client";

import { useState } from "react";

const PHOTOS: string[] = [
  "/ubytovani-01.jpg",
  "/ubytovani-02.jpg",
  "/ubytovani-03.jpg",
  "/ubytovani-04.jpg",
  "/ubytovani-05.jpg",
  "/ubytovani-06.jpg",
  "/ubytovani-07.jpg",
  "/ubytovani-08.jpg",
  "/ubytovani-09.jpg",
  "/ubytovani-10.jpg",
];

const GALLERY_URL = "https://www.airbnb.cz/rooms/1390123804012015568?adults=4&check_in=2026-04-21&check_out=2026-04-26&modal=PHOTO_TOUR_SCROLLABLE";

const HIGHLIGHTS = [
  { icon: "🏡", label: "Typ", value: "Celá nemovitost – nájemní jednotka" },
  { icon: "📍", label: "Místo", value: "Markdorf, Německo" },
  { icon: "👥", label: "Max. hostů", value: "12 hostů" },
  { icon: "🛏️", label: "Ložnice / lůžka", value: "4 ložnice · 7 lůžek" },
  { icon: "🚿", label: "Koupelny", value: "2 koupelny" },
  { icon: "📐", label: "Plocha", value: "160 m²" },
];

const BEDROOMS = [
  {
    name: "Ložnice 1",
    desc: "Manž. postel 1,80 m (dělitelná) · masážní křeslo · křeslo na spaní · 55\" TV (Netflix, Disney+)",
  },
  {
    name: "Ložnice 2",
    desc: "Manž. postel 1,80 m (dělitelná) · 55\" TV (Netflix, Disney+)",
  },
  {
    name: "Ložnice 3",
    desc: "Manž. postel 1,80 m (dělitelná) · 55\" TV (Netflix, Disney+)",
  },
  {
    name: "Obývací pokoj",
    desc: "Rozkládací pohovka Deluxe · prémiová matrace 1,60 m",
  },
];

const PERKS = [
  { icon: "☕", text: "Nespresso + výběr čajů" },
  { icon: "👨‍🍳", text: "Plně vybavená designová kuchyně" },
  { icon: "🚿", text: "Tropická dešťová sprcha s LED" },
  { icon: "🛁", text: "Společná koupelna s vanou" },
  { icon: "💆", text: "Masážní křeslo (krk → telata)" },
  { icon: "🎥", text: "Filmové večery + světelná show" },
  { icon: "🚗", text: "2 parkovací místa v garáži" },
];

const GUESTS = [
  { name: "Petr Polák", initials: "PP", dates: "21.–26. 4." },
  { name: "Jan Polák", initials: "JP", dates: "21.–26. 4." },
  { name: "Magdaléna Ševčíková", initials: "MŠ", dates: "21.–26. 4." },
  { name: "Vratko Kapuš", initials: "VK", dates: "21.–22. 4." },
];

const CHECK_IN   = "21. 4. 2026";
const CHECK_OUT  = "26. 4. 2026";
const NIGHTS     = 5;
const AIRBNB_URL = "https://www.airbnb.cz/rooms/1390123804012015568";
const MAP_URL    = "https://www.airbnb.cz/rooms/1390123804012015568/location?adults=4&check_in=2026-04-21&check_out=2026-04-26";
// OpenStreetMap embed – Markdorf, Baden-Württemberg (47.7167, 9.3833)
const OSM_EMBED  = "https://www.openstreetmap.org/export/embed.html?bbox=9.2833%2C47.6667%2C9.5833%2C47.7667&layer=mapnik&marker=47.7167%2C9.3833";

export default function SlideAccommodation() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const prevPhoto = () => setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i));
  const nextPhoto = () => setLightboxIdx((i) => (i !== null && i < PHOTOS.length - 1 ? i + 1 : i));

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4">
        <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--color-at-white)" }}>
          Logistika · Ubytování
        </p>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
              Exclusive Wood-World Apartment
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
              Markdorf, Německo · {CHECK_IN} – {CHECK_OUT} · {NIGHTS} nocí
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
            >
              📍 Mapa ↗
            </a>
            <a
              href={GALLERY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: "var(--color-at-blue-v2)", color: "var(--color-at-white)", border: "1px solid var(--color-at-blue-v4)" }}
            >
              📷 Galerie ↗
            </a>
            <a
              href={AIRBNB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}
            >
              Airbnb ↗
            </a>
          </div>
        </div>
      </div>

      {/* Mobile guests strip */}
      <div
        className="lg:hidden mb-4 rounded-lg px-4 py-3"
        style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v3)" }}
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-at-blue-v5)" }}>
          Ubytovaní
        </p>
        <div className="flex flex-wrap gap-2">
          {GUESTS.map((g) => (
            <div key={g.name} className="flex items-center gap-1.5">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: g.initials === "PP" ? "var(--color-at-red)" : "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
              >
                {g.initials}
              </span>
              <span className="text-xs font-semibold" style={{ color: "var(--color-at-white)" }}>{g.name}</span>
            </div>
          ))}
        </div>
        <div
          className="mt-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(213,28,23,0.15)", border: "1px solid var(--color-at-red)" }}
        >
          <p className="text-xs font-bold" style={{ color: "var(--color-at-red)" }}>
            Jakub Dryska – přestěhuje se sem od 24. 4. (po skončení ubytování skupiny 2)
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left – gallery or highlights */}
        <div className="flex flex-col gap-4">
          {/* Highlights grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.label}
                className="rounded-xl px-4 py-3 flex flex-col gap-0.5"
                style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
              >
                <span className="text-lg">{h.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-at-blue-v5)" }}>
                  {h.label}
                </span>
                <span className="text-sm font-black" style={{ color: "var(--color-at-white)" }}>
                  {h.value}
                </span>
              </div>
            ))}
          </div>

          {/* Photo gallery + map */}
          <div className="flex gap-3">
            {/* Gallery or placeholder */}
            {PHOTOS.length > 0 ? (
              <div className="flex-1 grid grid-cols-3 gap-2 min-h-0 overflow-hidden">
                {PHOTOS.slice(0, 5).map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setLightboxIdx(i)}
                    className="relative rounded-xl overflow-hidden group cursor-zoom-in focus:outline-none"
                    style={{ background: "var(--color-at-blue-v2)" }}
                  >
                    <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: "rgba(16,37,62,0.5)" }}
                    >
                      <span className="text-white text-2xl">🔍</span>
                    </div>
                  </button>
                ))}
                {/* 6th tile – "more photos" + link to full gallery */}
                <div className="relative rounded-xl overflow-hidden" style={{ background: "var(--color-at-blue-v2)" }}>
                  <button
                    onClick={() => setLightboxIdx(5)}
                    className="absolute inset-0 w-full h-full cursor-zoom-in focus:outline-none"
                  >
                    <img src={PHOTOS[5]} alt="Foto 6" className="w-full h-full object-cover opacity-40" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                      <span className="text-white font-black text-xl">+{PHOTOS.length - 5}</span>
                      <span className="text-white text-xs font-bold">fotek</span>
                    </div>
                  </button>
                  <a
                    href={GALLERY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-bold whitespace-nowrap"
                    style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}
                  >
                    Celá galerie ↗
                  </a>
                </div>
              </div>
            ) : (
              <div
                className="flex-1 flex flex-col items-center justify-center rounded-xl gap-2"
                style={{ border: "2px dashed var(--color-at-blue-v3)" }}
              >
                <span className="text-3xl">📸</span>
                <p className="text-sm font-bold" style={{ color: "var(--color-at-blue-v4)" }}>Fotky z Airbnb</p>
                <p className="text-xs text-center px-6" style={{ color: "var(--color-at-blue-v3)" }}>
                  Uložte do <code className="px-1 rounded" style={{ background: "var(--color-at-blue-v2)" }}>/public/ubytovani-XX.jpg</code> a odkomentujte pole PHOTOS
                </p>
              </div>
            )}

            {/* Map panel */}
            <div className="hidden sm:flex flex-col gap-2 w-56 flex-shrink-0">
              <div
                className="rounded-xl overflow-hidden flex-1"
                style={{ border: "1px solid var(--color-at-blue-v3)", minHeight: 0 }}
              >
                <iframe
                  src={OSM_EMBED}
                  title="Mapa ubytování – Markdorf"
                  className="w-full h-full"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                />
              </div>
              <div
                className="rounded-xl px-3 py-2.5 flex flex-col gap-1"
                style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
              >
                <p className="text-xs font-black" style={{ color: "var(--color-at-white)" }}>📍 Markdorf, Německo</p>
                <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                  ~25 km od výstaviště Friedrichshafen
                </p>
                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold mt-1 px-2 py-1 rounded text-center"
                  style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
                >
                  Zobrazit na Airbnb mapě ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right – guests + bedrooms + perks */}
        <div className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
          {/* Guests */}
          <div
            className="rounded-xl px-4 py-3 flex flex-col gap-2"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-at-blue-v5)" }}>
              Ubytovaní
            </p>
            {GUESTS.map((g) => (
              <div
                key={g.name}
                className="flex items-center gap-2 pb-1.5"
                style={{ borderBottom: "1px solid var(--color-at-blue-v3)" }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: g.initials === "PP" ? "var(--color-at-red)" : "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
                >
                  {g.initials}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold block" style={{ color: "var(--color-at-white)" }}>{g.name}</span>
                  <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>{g.dates}</span>
                </div>
              </div>
            ))}
            {/* Jakub Dryska alert */}
            <div
              className="mt-1 px-3 py-2 rounded-lg"
              style={{ background: "rgba(213,28,23,0.15)", border: "1px solid var(--color-at-red)" }}
            >
              <p className="text-xs font-bold" style={{ color: "var(--color-at-red)" }}>
                Jakub Dryska – přestěhuje se sem od 24. 4. (po skončení ubytování skupiny 2)
              </p>
            </div>
          </div>

          {/* Bedrooms */}
          <div
            className="rounded-xl px-4 py-3 flex flex-col gap-2"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-at-blue-v5)" }}>
              Spaní
            </p>
            {BEDROOMS.map((b) => (
              <div key={b.name} style={{ borderBottom: "1px solid var(--color-at-blue-v3)", paddingBottom: "0.5rem", marginBottom: "0.25rem" }}>
                <p className="text-sm font-black" style={{ color: "var(--color-at-white)" }}>{b.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-at-blue-v5)" }}>{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Perks */}
          <div
            className="rounded-xl px-4 py-3 flex flex-col gap-2"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-at-blue-v5)" }}>
              Vybavení & výhody
            </p>
            {PERKS.map((p) => (
              <div key={p.text} className="flex items-start gap-2">
                <span>{p.icon}</span>
                <span className="text-xs" style={{ color: "var(--color-at-white)" }}>{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && PHOTOS.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(16,37,62,0.95)" }}
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative rounded-2xl overflow-hidden flex flex-col"
            style={{
              maxWidth: "min(860px, 90vw)",
              maxHeight: "90vh",
              background: "var(--color-at-blue-v2)",
              border: "1px solid var(--color-at-blue-v3)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setLightboxIdx(null)}
              aria-label="Zavřít"
              className="btn-transparent absolute top-3 right-3 z-10 rounded-full"
              style={{ width: 32, height: 32 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Image */}
            <img
              src={PHOTOS[lightboxIdx]}
              alt={`Foto ${lightboxIdx + 1}`}
              className="w-full object-contain"
              style={{ maxHeight: "75vh", background: "#000" }}
            />

            {/* Navigation */}
            <div className="px-6 py-3 flex items-center justify-between gap-3">
              <button
                onClick={prevPhoto}
                disabled={lightboxIdx === 0}
                className="px-4 py-1.5 rounded-lg text-sm font-bold disabled:opacity-30"
                style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
              >
                ← Předchozí
              </button>
              <span className="text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
                {lightboxIdx + 1} / {PHOTOS.length}
              </span>
              <button
                onClick={nextPhoto}
                disabled={lightboxIdx === PHOTOS.length - 1}
                className="px-4 py-1.5 rounded-lg text-sm font-bold disabled:opacity-30"
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
