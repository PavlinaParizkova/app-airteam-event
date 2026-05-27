"use client";

import { useEffect } from "react";

type SlideItem = { label: string; section: string; updated?: boolean };
type SectionItem = { label: string; slideIndex: number };

type SlideDrawerProps = {
  open: boolean;
  current: number;
  slides: SlideItem[];
  sections: SectionItem[];
  onGoTo: (index: number) => void;
  onClose: () => void;
};

export default function SlideDrawer({
  open,
  current,
  slides,
  sections,
  onGoTo,
  onClose,
}: SlideDrawerProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  // Build section → slides map
  const sectionSlides = sections.map((sec, secIdx) => {
    const nextSec = sections[secIdx + 1];
    const endIndex = nextSec ? nextSec.slideIndex : slides.length;
    const items = slides
      .map((s, i) => ({ ...s, index: i }))
      .filter((s) => s.index >= sec.slideIndex && s.index < endIndex);
    return { section: sec, items };
  });

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
        }}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Přehled slidů"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          width: "min(320px, 90vw)",
          background: "var(--color-at-blue-v1)",
          borderLeft: "1px solid var(--color-at-blue-v2)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            height: 52,
            flexShrink: 0,
            borderBottom: "1px solid var(--color-at-blue-v2)",
            background: "var(--color-at-blue-v1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 3, height: 16, borderRadius: 2, background: "var(--color-at-red)" }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-at-blue-a5)",
              }}
            >
              Přehled slidů
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Zavřít přehled"
            className="btn-transparent rounded"
            style={{ width: 32, height: 32 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Slide list */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 0",
          }}
        >
          {sectionSlides.map(({ section, items }) => (
            <div key={section.label}>
              {/* Section header */}
              <div
                style={{
                  padding: "10px 16px 4px",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-at-blue-v4)",
                }}
              >
                {section.label}
              </div>

              {/* Slides in section */}
              {items.map((item) => {
                const isActive = item.index === current;
                return (
                  <button
                    key={item.index}
                    onClick={() => onGoTo(item.index)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 16px",
                      background: isActive ? "var(--color-at-blue-v2)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 150ms",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(27,63,103,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    {/* Active indicator */}
                    <span
                      style={{
                        width: 3,
                        height: 16,
                        borderRadius: 2,
                        flexShrink: 0,
                        background: isActive ? "var(--color-at-red)" : "transparent",
                        transition: "background 150ms",
                      }}
                    />
                    {/* Slide number */}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: "monospace",
                        color: isActive ? "var(--color-at-blue-v5)" : "var(--color-at-blue-v4)",
                        flexShrink: 0,
                        minWidth: 20,
                      }}
                    >
                      {String(item.index + 1).padStart(2, "0")}
                    </span>
                    {/* Slide label */}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? "var(--color-at-white)" : "var(--color-at-blue-v5)",
                        lineHeight: 1.3,
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </span>
                    {/* Updated badge */}
                    {item.updated && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--color-at-white)",
                          background: "var(--color-at-red)",
                          padding: "1px 5px",
                          borderRadius: 3,
                          flexShrink: 0,
                        }}
                      >
                        NOVÉ
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--color-at-blue-v2)",
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontSize: 10,
              color: "var(--color-at-blue-v4)",
              margin: 0,
            }}
          >
            {current + 1} / {slides.length} · AIR TEAM · AERO EXPO 2026
          </p>
        </div>
      </aside>
    </>
  );
}
