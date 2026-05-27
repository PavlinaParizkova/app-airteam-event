"use client";

import { useState, useEffect, useCallback } from "react";
import { TEAM } from "../../data/slides-data";
import { useIsOffline } from "../../hooks/useIsOffline";

type BoothStatus = "booth" | "customer" | "offsite" | "away";
type BoothEntry = { status: BoothStatus; since: string };
type BoothState = Record<string, BoothEntry>;

const STATUS_CONFIG: Record<BoothStatus, { label: string; color: string; dot: string; bg: string; border: string }> = {
  booth:    { label: "Na stánku",      color: "#3b82f6", dot: "🔵", bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.4)" },
  customer: { label: "U zákazníka",    color: "#06b6d4", dot: "🩵", bg: "rgba(6,182,212,0.15)",   border: "rgba(6,182,212,0.4)" },
  offsite:  { label: "Mimo areál",     color: "#f97316", dot: "🟠", bg: "rgba(249,115,22,0.15)",  border: "rgba(249,115,22,0.4)" },
  away:     { label: "Nepřítomen",     color: "#6b7280", dot: "⚫", bg: "rgba(107,114,128,0.10)", border: "rgba(107,114,128,0.3)" },
};

const CALENDAR_URL =
  "https://calendar.google.com/calendar/u/0/embed?src=c_89915be148ebd2d3a73ae78d2eae369071354935859cc328cc249671df9d802a@group.calendar.google.com&ctz=Europe/Prague&mode=AGENDA&showTitle=0&showNav=1&showPrint=0&showTabs=0&showCalendars=0";

function formatSince(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
}

export default function OpsBooth() {
  const isOffline = useIsOffline();
  const [booth, setBooth] = useState<BoothState>({});
  const [showCal, setShowCal] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/booth");
      const data = await res.json();
      setBooth(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const setStatus = async (name: string, status: BoothStatus) => {
    setBooth((prev) => ({
      ...prev,
      [name]: { status, since: new Date().toISOString() },
    }));
    try {
      await fetch("/api/booth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status }),
      });
    } catch {
      // ignore
    }
  };

  const atBooth = TEAM.filter((m) => booth[m.name]?.status === "booth").length;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
        style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v2)" }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{
            background: atBooth > 0 ? "#3b82f6" : "#6b7280",
            boxShadow: atBooth > 0 ? "0 0 8px rgba(59,130,246,0.5)" : "none",
          }}
        />
        <span className="text-sm font-bold" style={{ color: "var(--color-at-white)" }}>
          {atBooth} {atBooth === 1 ? "člen" : atBooth >= 2 && atBooth <= 4 ? "členové" : "členů"} na stánku právě teď
        </span>
        <span className="text-xs ml-auto" style={{ color: isOffline ? "#f97316" : "var(--color-at-blue-v4)" }}>
          {isOffline ? "⚡ offline – poslední stav" : "sync každých 10 s"}
        </span>
      </div>

      {/* Team status grid */}
      <div className="flex flex-col gap-2">
        {TEAM.map((member) => {
          const entry = booth[member.name];
          const current = entry?.status ?? "away";
          const cfg = STATUS_CONFIG[current];

          return (
            <div
              key={member.name}
              className="rounded-xl px-4 py-3"
              style={{
                background: "var(--color-at-blue-v1)",
                border: `1px solid ${cfg.border}`,
                transition: "border-color 0.2s",
              }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                {/* Initials + name */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: "var(--color-at-blue-v2)", color: "var(--color-at-white)" }}
                >
                  {member.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black" style={{ color: "var(--color-at-white)" }}>
                    {member.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
                    {member.role}
                  </p>
                </div>

                {/* Current status badge */}
                {entry && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                  >
                    {cfg.dot} {cfg.label}
                    {entry.since && (
                      <span className="ml-1 font-normal opacity-70">od {formatSince(entry.since)}</span>
                    )}
                  </span>
                )}
              </div>

              {/* Status buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {(Object.entries(STATUS_CONFIG) as [BoothStatus, typeof STATUS_CONFIG[BoothStatus]][]).map(
                  ([key, s]) => (
                    <button
                      key={key}
                      onClick={() => setStatus(member.name, key)}
                      disabled={isOffline}
                      title={isOffline ? "Offline – změny se neukládají" : undefined}
                      className="text-xs font-bold px-2.5 py-1 rounded transition-all"
                      style={{
                        background: current === key ? s.bg : "var(--color-at-blue-v2)",
                        color: current === key ? s.color : "var(--color-at-blue-v5)",
                        border: `1px solid ${current === key ? s.border : "var(--color-at-blue-v3)"}`,
                        transform: current === key ? "scale(1.05)" : "scale(1)",
                        opacity: isOffline ? 0.5 : 1,
                        cursor: isOffline ? "not-allowed" : "pointer",
                      }}
                    >
                      {s.dot} {s.label}
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Google Calendar embed toggle */}
      <div>
        <button
          onClick={() => setShowCal((v) => !v)}
          className="flex items-center gap-2 text-sm font-bold mb-3"
          style={{ color: "var(--color-at-blue-v5)" }}
        >
          <span
            style={{
              display: "inline-block",
              transform: showCal ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
            }}
          >
            ▶
          </span>
          {showCal ? "Skrýt kalendář AERO EXPO 2026" : "Zobrazit kalendář AERO EXPO 2026"}
        </button>

        {showCal && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--color-at-blue-v2)", height: 480 }}
          >
            <iframe
              src={CALENDAR_URL}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              title="AERO EXPO 2026 – Google Kalendář"
            />
          </div>
        )}
      </div>
    </div>
  );
}
