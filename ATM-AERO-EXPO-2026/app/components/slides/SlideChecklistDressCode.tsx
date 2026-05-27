"use client";

import { useState, useEffect } from "react";
import { CHECKLIST_DRESSCODE } from "../../data/slides-data";

const CHECKLIST_KEY = "dresscode";

export default function SlideChecklistDressCode() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch(`/api/checklist?key=${CHECKLIST_KEY}`)
      .then((r) => r.json())
      .then((data) => { setChecked(data); setMounted(true); })
      .catch(() => setMounted(true));
  }, []);

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: CHECKLIST_KEY, checked: next }),
    }).catch(() => {});
  };

  const doneCount = CHECKLIST_DRESSCODE.filter((item) => checked[item.id]).length;
  const total = CHECKLIST_DRESSCODE.length;
  const allDone = doneCount === total;

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-start justify-between gap-4">
        <div>
          <p
            className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
            style={{ color: "var(--color-at-white)" }}
          >
            Checklist
          </p>
          <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
            Kontrola oblečení
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
            Objednávka, výroba a distribuce firemního oblečení před veletrhem
          </p>
        </div>

        {/* Progress badge */}
        <div
          className="px-5 py-3 rounded-lg text-right flex-shrink-0"
          style={{
            background: allDone ? "var(--color-at-red)" : "var(--color-at-blue-a5)",
            border: `1px solid ${allDone ? "var(--color-at-red)" : "var(--color-at-blue-v5)"}`,
            transition: "background 300ms",
          }}
        >
          <div
            className="text-3xl font-black leading-none"
            style={{ color: allDone ? "var(--color-at-white)" : "var(--color-at-blue)" }}
          >
            {mounted ? doneCount : 0}/{total}
          </div>
          <div
            className="text-xs mt-0.5"
            style={{ color: allDone ? "var(--color-at-white)" : "var(--color-at-blue-v2)" }}
          >
            {allDone ? "Hotovo ✓" : "splněno"}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 rounded-full mb-6 overflow-hidden"
        style={{ background: "var(--color-at-blue-v2)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: mounted ? `${(doneCount / total) * 100}%` : "0%",
            background: allDone ? "var(--color-at-red)" : "var(--color-at-blue-v4)",
            transition: "width 400ms ease, background 300ms",
          }}
        />
      </div>

      {/* Checklist items */}
      <div className="flex flex-col gap-3 flex-1">
        {CHECKLIST_DRESSCODE.map((item) => {
          const isChecked = mounted && checked[item.id];
          return (
            <label
              key={item.id}
              className="flex items-start gap-4 px-5 py-4 rounded-lg cursor-pointer"
              style={{
                background: isChecked ? "var(--color-at-blue-v2)" : "var(--color-at-blue-a5)",
                border: `1px solid ${isChecked ? "var(--color-at-blue-v3)" : "var(--color-at-blue-v4)"}`,
                transition: "background 200ms, border-color 200ms",
              }}
            >
              <input
                type="checkbox"
                className="atm-checkbox mt-0.5"
                checked={isChecked}
                onChange={() => toggle(item.id)}
              />
              <span
                className="text-sm leading-relaxed"
                style={{
                  color: isChecked ? "var(--color-at-blue-v5)" : "var(--color-at-blue)",
                  textDecoration: isChecked ? "line-through" : "none",
                  transition: "color 200ms",
                }}
              >
                {item.label}
              </span>
            </label>
          );
        })}
      </div>

      {/* Note */}
      <div
        className="mt-4 px-5 py-3 rounded-lg"
        style={{ background: "var(--color-at-blue-a5)", border: "1px solid var(--color-at-blue-v5)" }}
      >
        <p className="text-xs" style={{ color: "var(--color-at-blue-v3)" }}>
          <strong style={{ color: "var(--color-at-blue)" }}>Poznámka:</strong> Velikosti každého člena týmu jsou k dispozici na slide{" "}
          <strong style={{ color: "var(--color-at-blue)" }}>Dress Code → záložka Výběr velikostí</strong>.
          Objednávku podej nejpozději <strong style={{ color: "var(--color-at-blue)" }}>4 týdny před veletrhem</strong>.
        </p>
      </div>

      {allDone && mounted && (
        <div
          className="mt-3 px-5 py-3 rounded-lg text-center text-sm font-semibold"
          style={{
            background: "rgba(213,28,23,0.15)",
            color: "var(--color-at-white)",
            border: "1px solid rgba(213,28,23,0.3)",
          }}
        >
          Oblečení zajištěno. Tým AIR TEAM vyrazí na AERO EXPO v perfektní formě.
        </div>
      )}
    </div>
  );
}
