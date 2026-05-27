"use client";

import Link from "next/link";
import { INTERNAL_APP_OPS_URL } from "../lib/site";

type SlideNavProps = {
  current: number;
  total: number;
  sections: { label: string; slideIndex: number; hasUpdate?: boolean }[];
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  onOpenDrawer: () => void;
};

function getActiveSection(
  current: number,
  sections: { label: string; slideIndex: number }[]
): number {
  let active = 0;
  for (let i = 0; i < sections.length; i++) {
    if (current >= sections[i].slideIndex) active = i;
  }
  return active;
}

export default function SlideNav({
  current,
  total,
  sections,
  onPrev,
  onNext,
  onGoTo,
  onOpenDrawer,
}: SlideNavProps) {
  const activeSection = getActiveSection(current, sections);

  return (
    <nav
      className="flex items-center justify-between px-4 md:px-8 py-0 flex-shrink-0 sticky top-0 z-50"
      style={{
        background: "var(--color-at-blue-v1)",
        borderBottom: "1px solid var(--color-at-blue-v2)",
        height: 52,
      }}
    >
      {/* Left: AIR TEAM wordmark */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="w-1 h-5 rounded-sm"
          style={{ background: "var(--color-at-red)" }}
        />
        <span
          className="text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: "var(--color-at-blue-a5)" }}
        >
          AIR TEAM
        </span>
        <span className="hidden sm:inline" style={{ color: "var(--color-at-blue-v2)" }}>·</span>
        <span
          className="hidden sm:inline text-xs font-bold tracking-wider uppercase"
          style={{ color: "var(--color-at-blue-v4)" }}
        >
          AERO EXPO 2026
        </span>
        <span
          className="text-xs font-black tracking-widest uppercase px-2 py-1 rounded"
          style={{
            background: "var(--color-at-red)",
            color: "var(--color-at-white)",
            letterSpacing: "0.1em",
            boxShadow: "0 0 0 1px rgba(213,28,23,0.4)",
          }}
        >
          A6-102
        </span>
      </div>

      {/* Center: Mobile – current section name | Tablet+ – scrollable tabs */}
      <div className="flex-1 flex items-center justify-center min-w-0 px-2 md:px-4">
        {/* Mobile: only active section label */}
        <span
          className="md:hidden text-xs font-semibold tracking-wide truncate"
          style={{ color: "var(--color-at-blue-a5)" }}
        >
          {String(activeSection + 1).padStart(2, "0")} {sections[activeSection].label}
        </span>

        {/* Tablet+: horizontally scrollable tabs */}
        <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none">
          {sections.map((section, i) => {
            const isActive = i === activeSection;
            return (
              <button
                key={section.label}
                onClick={() => onGoTo(section.slideIndex)}
                className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wide flex-shrink-0 flex items-center gap-1.5 ${
                  isActive ? "btn-secondary" : "btn-nav-ghost"
                }`}
              >
                {String(i + 1).padStart(2, "0")} {section.label}
                {section.hasUpdate && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--color-at-red)",
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: counter + arrows + hamburger */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <span
          className="hidden sm:inline text-xs font-mono"
          style={{ color: "var(--color-at-blue-v4)" }}
        >
          {String(current + 1).padStart(2, "0")}{" "}
          <span style={{ color: "var(--color-at-blue-v2)" }}>/</span>{" "}
          {String(total).padStart(2, "0")}
        </span>

        <button
          onClick={onPrev}
          disabled={current === 0}
          className="btn-secondary w-8 h-8 rounded flex items-center justify-center"
          aria-label="Předchozí slide"
        >
          ←
        </button>
        <button
          onClick={onNext}
          disabled={current === total - 1}
          className="btn-secondary w-8 h-8 rounded flex items-center justify-center"
          aria-label="Další slide"
        >
          →
        </button>

        {/* Operativa – kanonická URL nasazení na Vercelu */}
        <a
          href={INTERNAL_APP_OPS_URL}
          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded transition-all hover:opacity-80"
          style={{
            background: "var(--color-at-blue-v2)",
            color: "var(--color-at-blue-v5)",
            border: "1px solid var(--color-at-blue-v3)",
          }}
        >
          <span className="hidden sm:inline">Operativa</span>
          <span className="sm:hidden">OPS</span>
          <span>→</span>
        </a>

        {/* Hamburger / menu button */}
        <button
          onClick={onOpenDrawer}
          className="btn-secondary w-8 h-8 rounded flex items-center justify-center"
          aria-label="Otevřít přehled slidů"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <rect y="2" width="16" height="1.5" rx="0.75" />
            <rect y="7.25" width="16" height="1.5" rx="0.75" />
            <rect y="12.5" width="16" height="1.5" rx="0.75" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
