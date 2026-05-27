"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OpsChecklists from "../components/ops/OpsChecklists";
import OpsBooth from "../components/ops/OpsBooth";
import OpsNotes from "../components/ops/OpsNotes";
import OpsChat from "../components/ops/OpsChat";
import OpsVizitky from "../components/ops/OpsVizitky";
import PilotStyleStandGuide from "../components/PilotStyleStandGuide";
import CubeSystemGuide from "../components/CubeSystemGuide";

type Panel = "checklists" | "booth" | "notes" | "chat" | "vizitky" | "pilotstyle" | "cube";

const PANEL_KEYS: Panel[] = ["checklists", "booth", "pilotstyle", "cube", "notes", "chat", "vizitky"];

const PANELS: { key: Panel; label: string; icon: string; desc: string }[] = [
  { key: "checklists", label: "Checklisty",     icon: "✓",  desc: "Doprava · Účast · Oblečení · S sebou" },
  { key: "booth",      label: "Status stánku",  icon: "📍", desc: "Kdo je kde právě teď" },
  { key: "pilotstyle", label: "Stojan PilotStyle", icon: "🛩", desc: "Skládání stojanů, rozložení zboží, fotky" },
  { key: "cube",       label: "Systém CUBE",    icon: "⬜", desc: "EasyCube pod exponáty – půdorys, výška, montáž" },
  { key: "notes",      label: "Poznámky",        icon: "📝", desc: "Sdílené zápisky týmu" },
  { key: "chat",       label: "Chat",            icon: "💬", desc: "Týmová komunikace s exportem" },
  { key: "vizitky",    label: "Vizitky",         icon: "🪪", desc: "Podklady pro tisk vizitek" },
];

export default function OpsPage() {
  const [active, setActive] = useState<Panel>("checklists");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && PANEL_KEYS.includes(tab as Panel)) {
      setActive(tab as Panel);
    }
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-at-blue-v1)" }}
    >
      {/* Header */}
      <nav
        className="flex items-center justify-between px-4 md:px-8 flex-shrink-0 sticky top-0 z-50"
        style={{
          background: "var(--color-at-blue-v1)",
          borderBottom: "1px solid var(--color-at-blue-v2)",
          height: 52,
        }}
      >
        {/* Left: brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-1 h-5 rounded-sm" style={{ background: "var(--color-at-red)" }} />
          <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "var(--color-at-blue-a5)" }}>
            AIR TEAM
          </span>
          <span className="hidden sm:inline" style={{ color: "var(--color-at-blue-v2)" }}>·</span>
          <span className="hidden sm:inline text-xs font-bold tracking-wider uppercase" style={{ color: "var(--color-at-blue-v5)" }}>
            AERO EXPO 2026
          </span>
          <span
            className="text-xs font-black tracking-widest uppercase px-2 py-1 rounded"
            style={{
              background: "var(--color-at-red)",
              color: "var(--color-at-white)",
              letterSpacing: "0.1em",
            }}
          >
            Operativa
          </span>
        </div>

        {/* Right: back to presentation */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded transition-all hover:opacity-80"
          style={{
            background: "var(--color-at-blue-v2)",
            color: "var(--color-at-white)",
            border: "1px solid var(--color-at-blue-v3)",
          }}
        >
          ← Prezentace
        </Link>
      </nav>

      {/* Panel tabs */}
      <div
        className="flex gap-0 overflow-x-auto flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-at-blue-v2)" }}
      >
        {PANELS.map((p) => (
          <button
            key={p.key}
            onClick={() => setActive(p.key)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold flex-shrink-0 transition-all relative"
            style={{
              color: active === p.key ? "var(--color-at-white)" : "var(--color-at-blue-v4)",
              background: "transparent",
              borderBottom: active === p.key ? "2px solid var(--color-at-red)" : "2px solid transparent",
            }}
          >
            <span>{p.icon}</span>
            <span className="hidden sm:inline">{p.label}</span>
            <span className="sm:hidden">{p.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Panel description */}
      <div
        className="px-4 md:px-8 py-2 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-at-blue-v2)", background: "var(--color-at-blue-v1)" }}
      >
        <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
          {PANELS.find((p) => p.key === active)?.desc}
          {active !== "pilotstyle" && active !== "cube" && (
            <span className="ml-2 text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
              · synchronizováno s celým týmem v reálném čase
            </span>
          )}
        </p>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className={active === "pilotstyle" || active === "cube" ? "max-w-4xl mx-auto" : "max-w-3xl mx-auto"}>
          {active === "checklists" && <OpsChecklists />}
          {active === "booth"      && <OpsBooth />}
          {active === "pilotstyle" && <PilotStyleStandGuide layout="ops" />}
          {active === "cube"       && <CubeSystemGuide />}
          {active === "notes"      && <OpsNotes />}
          {active === "chat"       && <OpsChat />}
          {active === "vizitky"    && <OpsVizitky />}
        </div>
      </main>
    </div>
  );
}
