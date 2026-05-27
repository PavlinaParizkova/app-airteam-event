"use client";

import { useState } from "react";

const PHOTOS: string[] = [
  "/Ubytovani_druha_skupina_01.jpg",
  "/Ubytovani_druha_skupina_02.jpg",
  "/Ubytovani_druha_skupina_03.jpg",
  "/Ubytovani_druha_skupina_04.jpg",
  "/Ubytovani_druha_skupina_05.jpg",
  "/Ubytovani_druha_skupina_06.jpg",
  "/Ubytovani_druha_skupina_07.jpg",
  "/Ubytovani_druha_skupina_08.jpg",
];

const BOOKING_URL = "https://www.booking.com/hotel/de/apfelhof-bodensee-rohrenbach.cs.html";
const BOOKING_MAP_URL = "https://www.booking.com/hotel/de/apfelhof-bodensee-rohrenbach.cs.html?label=gen173nr-10CCsoggI46AdIBVgEaDqIAQGYATO4ARfIAQzYAQPoAQH4AQGIAgGoAgG4AtmFgs8GwAIB0gIkNWZkNTIyYzItN2YyOC00MzVhLWJjNTQtZTFjNzM4NjE1MWZl2AIB4AIB&sid=2e1dbfc038caa73eed6d2b29b05b8dcc&aid=304142&map=1";
const OSM_EMBED = "https://www.openstreetmap.org/export/embed.html?bbox=9.30%2C47.70%2C9.50%2C47.78&layer=mapnik&marker=47.7405%2C9.3964";

const HIGHLIGHTS = [
  { icon: "🏡", label: "Typ", value: "Celý apartmán" },
  { icon: "📍", label: "Místo", value: "Kippenhausen, Německo" },
  { icon: "👥", label: "Hosté", value: "3 dospělí (max. 6)" },
  { icon: "🛏️", label: "Ložnice", value: "3 ložnice · balkon" },
  { icon: "📅", label: "Check-in", value: "22. 4. 2026, 16:00–20:00" },
  { icon: "📅", label: "Check-out", value: "24. 4. 2026, do 10:00" },
];

const GUESTS = [
  "Jakub Dryska",
  "Lucie Kysučanová",
  "Jirka Franz",
  "Alex Mudrych",
];

const PERKS = [
  { icon: "🛁", text: "Vlastní koupelna, vana, sprcha" },
  { icon: "🏔️", text: "Výhled na jezero, zahrady a hory" },
  { icon: "🍳", text: "Plně vybavená kuchyně" },
  { icon: "📺", text: "TV, satelitní programy" },
  { icon: "☕", text: "Kávovar, rychlovarná konvice" },
  { icon: "🚭", text: "Nekuřácký pokoj" },
  { icon: "🅿️", text: "Parkování u objektu" },
];

const CHECK_IN = "22. 4. 2026";
const CHECK_OUT = "24. 4. 2026";
const NIGHTS = 2;
const ADDRESS = "Altenbergstr. 2, 88090 Kippenhausen, Německo";
const CONTACT_PHONE = "+4975456233";
const CONTACT_EMAIL = "info@apfelhof-bodensee.de";
const KEY_SAFE_CODE = "0202";
const KEY_SAFE_NUMBER = "2";
const ONSITE_CONTACT_NAME = "Lisa Röhrenbach";
const ONSITE_CONTACT_PHONE = "+49 151 64935540";
const APARTMENT_NUMBER = "6";

export default function SlideAccommodation2() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const prevPhoto = () => setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i));
  const nextPhoto = () => setLightboxIdx((i) => (i !== null && i < PHOTOS.length - 1 ? i + 1 : i));

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4">
        <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--color-at-white)" }}>
          Logistika · Ubytování – skupina 2
        </p>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
              Ferienwohnungen Apfelhof-Bodensee
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
              Apartmán Premium se 3 ložnicemi a balkonem · {CHECK_IN} – {CHECK_OUT} · {NIGHTS} noci
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <a
              href={BOOKING_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
            >
              📍 Mapa ↗
            </a>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}
            >
              Booking.com ↗
            </a>
          </div>
        </div>
        {/* Check-in alert + reservation info */}
        <div className="mt-3 flex flex-wrap gap-3">
          <div
            className="px-4 py-2.5 rounded-lg flex items-center gap-3"
            style={{ background: "rgba(213,28,23,0.15)", border: "1px solid var(--color-at-red)" }}
          >
            <span className="text-lg">⏰</span>
            <p className="text-sm font-bold" style={{ color: "var(--color-at-red)" }}>
              Požadavek: Check-in 20:00 – 21:00
            </p>
          </div>
          <div
            className="px-4 py-2.5 rounded-lg flex items-center gap-3"
            style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <span className="text-lg">🔑</span>
            <div>
              <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                Č. rezervace: <span className="font-black" style={{ color: "var(--color-at-white)" }}>6385143502</span>
              </p>
              <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                Safe č. <span className="font-black" style={{ color: "var(--color-at-white)" }}>{KEY_SAFE_NUMBER}</span>
                {" · "}kód <span className="font-black" style={{ color: "var(--color-at-white)" }}>{KEY_SAFE_CODE}</span>
              </p>
            </div>
          </div>
          <div
            className="px-4 py-2.5 rounded-lg flex items-center gap-3"
            style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <span className="text-lg">📞</span>
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--color-at-white)" }}>
                Kontakt na místě: {ONSITE_CONTACT_NAME}
              </p>
              <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                {ONSITE_CONTACT_PHONE} · {CONTACT_EMAIL}
              </p>
            </div>
          </div>
        </div>

        {/* Check-in instrukce – klíče, vchod, kontakt */}
        <div
          className="mt-3 rounded-xl p-4 sm:p-5"
          style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
        >
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--color-at-blue-v5)" }}>
            Check-in instrukce · příjezd 20:00–21:00
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔐</span>
                <p className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--color-at-white)" }}>
                  Klíčový safe
                </p>
              </div>
              <p className="text-xs leading-snug" style={{ color: "var(--color-at-blue-v5)" }}>
                Safe č. <span className="font-black" style={{ color: "var(--color-at-white)" }}>{KEY_SAFE_NUMBER}</span>
                {" "}· kód{" "}
                <span className="font-black px-1.5 py-0.5 rounded" style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}>
                  {KEY_SAFE_CODE}
                </span>
              </p>
              <p className="text-xs leading-snug" style={{ color: "var(--color-at-blue-v5)" }}>
                Po zadání kódu stlačit malou černou páčku vlevo dolů – safe se otevře.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <p className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--color-at-white)" }}>
                  Umístění safe
                </p>
              </div>
              <p className="text-xs leading-snug" style={{ color: "var(--color-at-blue-v5)" }}>
                Vchod <span className="font-black" style={{ color: "var(--color-at-white)" }}>soukromého domu</span>, vlevo od palírny.
              </p>
              <p className="text-xs leading-snug" style={{ color: "var(--color-at-blue-v5)" }}>
                Stojí tam bílá dřevěná lavice – vpravo od ní, na bílém sloupku, visí dva klíčové safe.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚪</span>
                <p className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--color-at-white)" }}>
                  Vchod · apartmán č. {APARTMENT_NUMBER}
                </p>
              </div>
              <p className="text-xs leading-snug" style={{ color: "var(--color-at-blue-v5)" }}>
                Vchod do hostinského domu je <span className="font-black" style={{ color: "var(--color-at-white)" }}>vpravo od palírny</span>, kolem zelené lavice.
              </p>
              <p className="text-xs leading-snug" style={{ color: "var(--color-at-blue-v5)" }}>
                Schody úplně nahoru – apartmán <span className="font-black" style={{ color: "var(--color-at-white)" }}>č. {APARTMENT_NUMBER}</span> v podkroví vpravo. Druhý klíč je na jídelním stole.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">📞</span>
                <p className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--color-at-white)" }}>
                  Kontakt na místě
                </p>
              </div>
              <p className="text-xs leading-snug" style={{ color: "var(--color-at-blue-v5)" }}>
                <span className="font-black" style={{ color: "var(--color-at-white)" }}>{ONSITE_CONTACT_NAME}</span> (dcera majitelů)
              </p>
              <a
                href={`tel:${ONSITE_CONTACT_PHONE.replace(/\s/g, "")}`}
                className="text-xs font-black px-2 py-1 rounded text-center"
                style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}
              >
                {ONSITE_CONTACT_PHONE}
              </a>
              <p className="text-xs leading-snug" style={{ color: "var(--color-at-blue-v5)" }}>
                Při odjezdu (do 10:00) nechte oba klíče ležet na jídelním stole.
              </p>
            </div>
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
          {GUESTS.map((name) => (
            <div key={name} className="flex items-center gap-1.5">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
              >
                {name.split(" ").map((n) => n[0]).join("")}
              </span>
              <span className="text-xs font-semibold" style={{ color: "var(--color-at-white)" }}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left – highlights + gallery */}
        <div className="flex flex-col gap-4 flex-1">
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

          {/* Photo gallery or placeholder */}
          {PHOTOS.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 min-h-0 overflow-hidden">
              {PHOTOS.slice(0, 6).map((src, i) => (
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
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center rounded-xl gap-2 py-10"
              style={{ border: "2px dashed var(--color-at-blue-v3)" }}
            >
              <span className="text-3xl">📸</span>
              <p className="text-sm font-bold" style={{ color: "var(--color-at-blue-v4)" }}>Fotky z Booking.com</p>
              <p className="text-xs text-center px-6" style={{ color: "var(--color-at-blue-v3)" }}>
                Uložte do <code className="px-1 rounded" style={{ background: "var(--color-at-blue-v2)" }}>/public/ubytovani2-XX.jpg</code> a doplňte pole PHOTOS
              </p>
            </div>
          )}
        </div>

        {/* Right – guests + perks + map */}
        <div className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
          {/* Guests */}
          <div
            className="rounded-xl px-4 py-3 flex flex-col gap-2"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-at-blue-v5)" }}>
              Ubytovaní
            </p>
            {GUESTS.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2 pb-2"
                style={{ borderBottom: "1px solid var(--color-at-blue-v3)" }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
                >
                  {name.split(" ").map((n) => n[0]).join("")}
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--color-at-white)" }}>
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* Perks */}
          <div
            className="rounded-xl px-4 py-3 flex flex-col gap-2"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v3)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-at-blue-v5)" }}>
              Vybavení
            </p>
            {PERKS.map((p) => (
              <div key={p.text} className="flex items-start gap-2">
                <span>{p.icon}</span>
                <span className="text-xs" style={{ color: "var(--color-at-white)" }}>{p.text}</span>
              </div>
            ))}
          </div>

          {/* Map + address */}
          <div className="flex flex-col gap-2">
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--color-at-blue-v3)", height: 140 }}
            >
              <iframe
                src={OSM_EMBED}
                title="Mapa ubytování – Kippenhausen"
                className="w-full h-full"
                style={{ border: 0, display: "block" }}
                loading="lazy"
              />
            </div>
            <div
              className="rounded-xl px-3 py-2.5 flex flex-col gap-1"
              style={{ background: "var(--color-at-blue-v2)", border: "1px solid var(--color-at-blue-v3)" }}
            >
              <p className="text-xs font-black" style={{ color: "var(--color-at-white)" }}>📍 {ADDRESS}</p>
              <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                Tel: {CONTACT_PHONE} · {CONTACT_EMAIL}
              </p>
              <a
                href={BOOKING_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold mt-1 px-2 py-1 rounded text-center"
                style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
              >
                Zobrazit na mapě ↗
              </a>
            </div>
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

            <img
              src={PHOTOS[lightboxIdx]}
              alt={`Foto ${lightboxIdx + 1}`}
              className="w-full object-contain"
              style={{ maxHeight: "75vh", background: "#000" }}
            />

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
