"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AERO_APP_URL,
  AERO_FOOD_MAP_URL,
  EXHIBITOR_BADGE_DRIVE_URL,
  EXHIBITOR_BADGE_DRIVE_URL_2,
} from "../../lib/site";

/** Mapa parkovišť AERO (PDF ve veřejné složce – stejný obsah jako organizer podklad) */
const PARKING_MAP_PDF = "/parkplatzuebersicht-aero-2026.pdf";
/** PNG náhled mapy parkování (rychlejší a spolehlivější než iframe na PDF). */
const PARKING_MAP_IMAGE = "/parkoviste-aero-2026.png";

const PILLARS = [
  {
    number: "01",
    title: "Komplexní upgrade avioniky",
    subtitle: "Engineering · Instalace · Certifikace",
    bullets: [
      "Návrh a engineering modernizace přístrojové desky",
      "Fyzická instalace avioniky ve vlastním hangáru LKKU",
      "Certifikační podpora – EASA Part 145 & DOA (Part 21J)",
      "Kompletní service+ balíčky od návrhu po předání letadla",
    ],
  },
  {
    number: "02",
    title: "AEROSPEC & PilotStyle",
    subtitle: "Technická avionika · Pilotní lifestyle",
    bullets: [
      "Aerospec – antény, letové přístroje, kompasy, osvětlení, pneumatiky a ventily pro GA trh",
      "PilotStyle – funkční pilotní vybavení, příslušenství a produkty s příběhem",
      "Přímá prezentace obou značek na stánku pro GA komunitu",
      "Aerospec claim: 'Our tech, your flight'",
    ],
  },
  {
    number: "03",
    title: "G3X pro experimentální letadla",
    subtitle: "Demo scénáře · Panel na míru · Self-install",
    bullets: [
      "Panelová řešení na míru pro kit-buildery a experimentální typy",
      "Praktická demo scénáře G3X Touch v reálném prostředí",
      "Konzultace self-install varianty pro EMEA trh",
      "AIR TEAM jako EMEA centrum pro G3X homebuilders",
    ],
  },
];

type ContactPerson = {
  name: string;
  detail: string | null;
  phone: string | null;
  /** Jedna položka (ostatní kontakty) */
  linkHref?: string;
  linkLabel?: string;
  /** Více odkazů (např. vystavovatelské průkazy) – má přednost před linkHref */
  links?: { href: string; label: string }[];
};

type ContactGroup = {
  role: string;
  emphasize?: boolean;
  /** Emoji zobrazené v hlavičce „důrazněné" dlaždice (default 🪪). */
  emphasizeIcon?: string;
  /** Červený štítek v hlavičce „důrazněné" dlaždice (default „Důležité"). */
  emphasizeLabel?: string;
  people: ContactPerson[];
};

/** Sekce „APLIKACE A BADGE" – nástroje, které potřebuje každý před vstupem. */
const APPS_AND_BADGES: ContactGroup[] = [
  {
    role: "Vystavovatelské průkazy",
    emphasize: true,
    emphasizeIcon: "🪪",
    emphasizeLabel: "Badge",
    people: [
      {
        name: "",
        detail: null,
        phone: null,
        links: [
          { href: EXHIBITOR_BADGE_DRIVE_URL, label: "Stáhnout badge" },
          { href: EXHIBITOR_BADGE_DRIVE_URL_2, label: "Stáhnout druhý podklad" },
        ],
      },
    ],
  },
  {
    role: "Aplikace do telefonu",
    emphasize: true,
    emphasizeIcon: "📱",
    emphasizeLabel: "Mobilní appka",
    people: [
      {
        name: "",
        detail: "Oficiální aplikace AERO – program, mapa stánků, plánovač návštěvy.",
        phone: null,
        linkHref: AERO_APP_URL,
        linkLabel: "Stáhnout aplikaci AERO",
      },
    ],
  },
];

/** Sekce „KLÍČOVÉ KONTAKTY" – lidé, na které se obrátit při eventu. */
const CONTACTS: ContactGroup[] = [
  {
    role: "Organizátor eventu",
    people: [
      { name: "Julia Albrecht", detail: "Projectmanager exhibitors, AERO Friedrichshafen", phone: "+49 7541 95995-12" },
    ],
  },
  {
    role: "Realizátor stánku – MLT",
    people: [
      { name: "Michal Weiss", detail: "jednatel", phone: "777 074 800" },
      { name: "Leoš Netušil", detail: "technické věci", phone: "+420 732 138 307" },
      { name: "Bartůněk", detail: "stánek", phone: "+420 777 074 808" },
    ],
  },
  {
    role: "Interní eskalace",
    people: [
      { name: "Pavlína Pařízková", detail: "Marketing", phone: "+420 773 902 290" },
      { name: "Petr Polák", detail: "Sales", phone: null },
    ],
  },
  {
    role: "Logistika",
    people: [
      { name: "Jan Zerák", detail: null, phone: null },
    ],
  },
];

function ContactCard({ group }: { group: ContactGroup }) {
  return (
    <div
      className={`rounded-xl min-w-0 ${group.emphasize ? "p-4" : "p-3"}`}
      style={{
        background: group.emphasize ? "var(--color-at-white)" : "var(--color-at-blue-a5)",
        border: group.emphasize
          ? "2px solid var(--color-at-red)"
          : "1px solid var(--color-at-blue-v4)",
        boxShadow: group.emphasize
          ? "0 6px 20px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(220, 38, 38, 0.15)"
          : undefined,
      }}
    >
      {group.emphasize ? (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg leading-none" aria-hidden>
            {group.emphasizeIcon ?? "🪪"}
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded"
            style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}
          >
            {group.emphasizeLabel ?? "Důležité"}
          </span>
        </div>
      ) : null}
      <p
        className={`font-bold uppercase tracking-wide mb-2 ${group.emphasize ? "text-sm" : "text-xs"}`}
        style={{ color: group.emphasize ? "var(--color-at-blue)" : "var(--color-at-blue-v3)" }}
      >
        {group.role}
      </p>
      <div className="space-y-2">
        {group.people.map((person, idx) => {
          const linkItems =
            person.links?.length ?
              person.links
            : person.linkHref ?
              [{ href: person.linkHref, label: person.linkLabel ?? "Odkaz" }]
            : [];

          return (
            <div key={`${group.role}-${idx}`}>
              {person.name ? (
                <p className="text-sm font-semibold" style={{ color: "var(--color-at-blue)" }}>
                  {person.name}
                </p>
              ) : null}
              {person.detail && (
                <p
                  className={
                    person.name ? "text-xs" : group.emphasize ? "text-sm leading-relaxed font-medium" : "text-sm leading-snug"
                  }
                  style={{ color: "var(--color-at-blue)" }}
                >
                  {person.detail}
                </p>
              )}
              {person.phone && (
                <p className="text-xs font-medium" style={{ color: "var(--color-at-blue-v3)" }}>
                  {person.phone}
                </p>
              )}
              {linkItems.length > 0 ? (
                <div className={`flex flex-col ${group.emphasize ? "gap-2.5 mt-3" : "gap-2 mt-2"}`}>
                  {linkItems.map((link, li) => (
                    <a
                      key={`${link.href}-${li}`}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center rounded-lg py-2.5 px-3 text-xs font-bold no-underline transition-opacity hover:opacity-92 active:opacity-85"
                      style={
                        li === 0 ?
                          { background: "var(--color-at-red)", color: "var(--color-at-white)" }
                        : {
                            background: "transparent",
                            color: "var(--color-at-red)",
                            border: "2px solid var(--color-at-red)",
                          }
                      }
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SlideWhatWePresent() {
  const [parkingLightboxOpen, setParkingLightboxOpen] = useState(false);

  const closeParkingLightbox = useCallback(() => setParkingLightboxOpen(false), []);

  useEffect(() => {
    if (!parkingLightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeParkingLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [parkingLightboxOpen, closeParkingLightbox]);

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 overflow-y-auto">
      {/* Slide header */}
      <div className="mb-4 sm:mb-5">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-1"
          style={{ color: "var(--color-at-white)" }}
        >
          Co prezentujeme
        </p>
        <h2
          className="text-xl sm:text-2xl font-black"
          style={{ color: "var(--color-at-white)" }}
        >
          3 hlavní pilíře prezentace
        </h2>
        <p className="mt-0.5 text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
          Zaměření stánku a obchodní priority AERO EXPO 2026
        </p>
      </div>

      {/* Compact pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {PILLARS.map((p) => (
          <div
            key={p.number}
            className="rounded-lg p-4 flex flex-col"
            style={{ background: "var(--color-at-blue-a5)", border: "1px solid var(--color-at-blue-v5)" }}
          >
            <div className="flex items-baseline gap-2 mb-1.5">
              <span
                className="text-2xl font-black leading-none"
                style={{ color: "var(--color-at-blue-v2)" }}
              >
                {p.number}
              </span>
              <h3
                className="text-sm font-bold leading-tight"
                style={{ color: "var(--color-at-blue)" }}
              >
                {p.title}
              </h3>
            </div>
            <p
              className="text-xs font-medium mb-2.5 pb-2.5"
              style={{
                color: "var(--color-at-blue-v2)",
                borderBottom: "1px solid var(--color-at-blue-v4)",
              }}
            >
              {p.subtitle}
            </p>
            <ul className="space-y-1 flex-1">
              {p.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span
                    className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                    style={{ background: "var(--color-at-red)" }}
                  />
                  <span className="text-xs leading-snug" style={{ color: "var(--color-at-blue)" }}>
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Mapy výstaviště – parkování + food */}
      <div className="mb-6">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
          style={{ color: "var(--color-at-white)" }}
        >
          Mapy výstaviště
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Parkování */}
          <div
            className="rounded-lg p-4 flex flex-col sm:flex-row gap-4"
            style={{ background: "var(--color-at-blue-a5)", border: "1px solid var(--color-at-blue-v5)" }}
          >
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg leading-none" aria-hidden>🅿️</span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded"
                  style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}
                >
                  Parkování
                </span>
              </div>
              <h3 className="text-sm font-bold leading-tight mb-1" style={{ color: "var(--color-at-blue)" }}>
                Přehled parkovišť (Ost / West)
              </h3>
              <p className="text-xs leading-snug mb-3 flex-1" style={{ color: "var(--color-at-blue-v2)" }}>
                Oficiální mapa AERO Friedrichshafen – barevně rozlišená parkoviště a vchody. V náhledu klikněte na
                obrázek pro zobrazení na celou obrazovku; PDF si můžete stáhnout offline.
              </p>
              <a
                href={PARKING_MAP_PDF}
                download="Parkplatzuebersicht-AERO-Friedrichshafen.pdf"
                className="self-start inline-flex items-center justify-center rounded-lg py-2.5 px-4 text-xs font-bold no-underline transition-opacity hover:opacity-92 active:opacity-85"
                style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}
              >
                Stáhnout PDF mapy
              </a>
            </div>
            <div className="w-full sm:w-[min(100%,260px)] flex-shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-at-blue-v3)" }}>
                Náhled · kliknutím zvětšit
              </p>
              <button
                type="button"
                onClick={() => setParkingLightboxOpen(true)}
                aria-label="Zvětšit mapu parkování"
                className="block w-full rounded-lg overflow-hidden p-0 border-0 bg-white cursor-zoom-in transition-transform hover:scale-[1.02]"
                style={{ border: "1px solid var(--color-at-blue-v4)", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PARKING_MAP_IMAGE}
                  alt="Mapa parkování AERO Friedrichshafen – parkoviště Ost a West"
                  className="block w-full h-auto"
                />
              </button>
            </div>
          </div>

          {/* Kde se najíst */}
          <div
            className="rounded-lg p-4 flex flex-col sm:flex-row gap-4"
            style={{ background: "var(--color-at-blue-a5)", border: "1px solid var(--color-at-blue-v5)" }}
          >
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg leading-none" aria-hidden>🍽️</span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded"
                  style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}
                >
                  Food mapa
                </span>
              </div>
              <h3 className="text-sm font-bold leading-tight mb-1" style={{ color: "var(--color-at-blue)" }}>
                Kde se najíst
              </h3>
              <p className="text-xs leading-snug mb-3 flex-1" style={{ color: "var(--color-at-blue-v2)" }}>
                Mapa restaurací, bister a stánků s občerstvením přímo na výstavišti AERO Friedrichshafen.
              </p>
              <a
                href={AERO_FOOD_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start inline-flex items-center justify-center rounded-lg py-2.5 px-4 text-xs font-bold no-underline transition-opacity hover:opacity-92 active:opacity-85"
                style={{ background: "var(--color-at-red)", color: "var(--color-at-white)" }}
              >
                Otevřít food mapu
              </a>
            </div>
            <div
              className="w-full sm:w-[min(100%,180px)] flex-shrink-0 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #ffe9d1 0%, #ffd0a0 40%, #ff9d5c 100%)",
                minHeight: 120,
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
              }}
              aria-hidden
            >
              <span style={{ fontSize: "clamp(3rem, 8vw, 5rem)", lineHeight: 1 }}>🍽️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Aplikace a badge */}
      <div className="mb-6">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
          style={{ color: "var(--color-at-white)" }}
        >
          Aplikace a badge
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {APPS_AND_BADGES.map((group) => (
            <ContactCard key={group.role} group={group} />
          ))}
        </div>
      </div>

      {/* Klíčové kontakty */}
      <div>
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
          style={{ color: "var(--color-at-white)" }}
        >
          Klíčové kontakty
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CONTACTS.map((group) => (
            <ContactCard key={group.role} group={group} />
          ))}
        </div>
      </div>

      {/* Lightbox – mapa parkování (PDF) */}
      {parkingLightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="parking-lightbox-title"
          onClick={closeParkingLightbox}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(16,37,62,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backdropFilter: "blur(6px)",
            animation: "parking-lb-fade-in 180ms ease",
          }}
        >
          <button
            type="button"
            onClick={closeParkingLightbox}
            aria-label="Zavřít náhled mapy"
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
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col w-full max-w-[min(1200px,96vw)]"
            style={{ maxHeight: "90vh", animation: "parking-lb-scale-in 200ms cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            <p
              id="parking-lightbox-title"
              className="text-sm font-bold mb-2"
              style={{ color: "var(--color-at-white)" }}
            >
              Mapa parkovišť – AERO Friedrichshafen
            </p>
            <div
              className="w-full flex-1 rounded-xl overflow-auto bg-white flex items-center justify-center"
              style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.7)", maxHeight: "80vh" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PARKING_MAP_IMAGE}
                alt="Mapa parkování AERO Friedrichshafen – plné zobrazení"
                className="block max-w-full h-auto"
              />
            </div>
            <p
              className="mt-3 text-center text-xs"
              style={{ color: "rgba(147,179,207,0.85)" }}
            >
              Kliknutím mimo okno mapy nebo klávesou Esc zavřete náhled
            </p>
          </div>
          <style>{`
            @keyframes parking-lb-fade-in { from { opacity: 0 } to { opacity: 1 } }
            @keyframes parking-lb-scale-in { from { transform: scale(0.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          `}</style>
        </div>
      ) : null}
    </div>
  );
}
