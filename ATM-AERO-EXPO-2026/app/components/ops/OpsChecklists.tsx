"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CHECKLIST_TRANSPORT,
  CHECKLIST_ATTENDANCE,
  CHECKLIST_DRESSCODE,
  CHECKLIST_PACKED,
} from "../../data/slides-data";
import { useIsOffline } from "../../hooks/useIsOffline";

type ChecklistState = Record<string, boolean>;

const LISTS = [
  {
    key: "transport",
    label: "Doprava",
    subtitle: "Potvrzení logistiky před odjezdem",
    items: CHECKLIST_TRANSPORT,
    doneMsg: "Doprava je plně potvrzena. Tým je připraven k odjezdu.",
  },
  {
    key: "attendance",
    label: "Účast",
    subtitle: "Registrace, ubytování a příprava schůzek",
    items: CHECKLIST_ATTENDANCE,
    doneMsg: "Tým je plně připraven na AERO EXPO 2026. Letíme!",
  },
  {
    key: "dresscode",
    label: "Oblečení",
    subtitle: "Objednávka, výroba a distribuce firemního oblečení",
    items: CHECKLIST_DRESSCODE,
    doneMsg: "Oblečení zajištěno. Tým AIR TEAM vyrazí na veletrh v perfektní formě.",
  },
  {
    key: "packed",
    label: "S sebou",
    subtitle: "Dárky, samolepky, vzorníky, stojan, rozdávačky, balení zpět, elektronika",
    items: CHECKLIST_PACKED,
    doneMsg: "Kompletní výbava stánku je naložena. Nic nechybí.",
  },
] as const;

type ListKey = (typeof LISTS)[number]["key"];

const LIST_KEYS = new Set<string>(LISTS.map((l) => l.key));

export default function OpsChecklists() {
  const isOffline = useIsOffline();
  const [activeKey, setActiveKey] = useState<ListKey>("transport");
  const [states, setStates] = useState<Record<string, ChecklistState>>({});

  const selectList = useCallback((key: ListKey) => {
    setActiveKey(key);
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    u.searchParams.set("cl", key);
    window.history.replaceState({}, "", u);
  }, []);

  const load = useCallback(async (key: string) => {
    try {
      const res = await fetch(`/api/checklist?key=${key}`);
      const data = await res.json();
      setStates((prev) => ({ ...prev, [key]: data }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cl = params.get("cl");
    if (cl && LIST_KEYS.has(cl)) setActiveKey(cl as ListKey);
  }, []);

  useEffect(() => {
    LISTS.forEach((l) => load(l.key));
    const interval = setInterval(() => LISTS.forEach((l) => load(l.key)), 10000);
    return () => clearInterval(interval);
  }, [load]);

  const toggle = async (listKey: string, id: string) => {
    if (isOffline) return;
    const current = states[listKey] ?? {};
    const next = { ...current, [id]: !current[id] };
    setStates((prev) => ({ ...prev, [listKey]: next }));
    try {
      await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: listKey, checked: next }),
      });
    } catch {
      // ignore
    }
  };

  const active = LISTS.find((l) => l.key === activeKey)!;
  const checked = states[activeKey] ?? {};
  const doneCount = active.items.filter((i) => checked[i.id]).length;
  const total = active.items.length;
  const allDone = doneCount === total;

  return (
    <div className="flex flex-col gap-4">
      {/* Čtyři checklisty – mřížka 2×2 na úzkém displeji, vždy všechny vidět (žádná skrytá 4. záložka). */}
      <div className="-mx-1 px-1">
        <div
          className="grid grid-cols-2 min-[520px]:grid-cols-4 gap-1 p-1 rounded-lg w-full"
          style={{ background: "var(--color-at-blue-v1)" }}
        >
          {LISTS.map((l) => {
            const s = states[l.key] ?? {};
            const done = l.items.filter((i) => s[i.id]).length;
            const isActive = l.key === activeKey;
            return (
              <button
                key={l.key}
                type="button"
                onClick={() => selectList(l.key)}
                className="flex min-w-0 items-center justify-center gap-1.5 rounded-md px-2 sm:px-3 py-1.5 text-sm font-bold transition-all"
                style={{
                  background: isActive ? "var(--color-at-blue-v3)" : "transparent",
                  color: isActive ? "var(--color-at-white)" : "var(--color-at-blue-v5)",
                }}
              >
                {l.label}
                <span
                  className="text-xs font-black px-1.5 py-0.5 rounded"
                  style={{
                    background: done === l.items.length
                      ? "rgba(34,197,94,0.2)"
                      : "var(--color-at-blue-v2)",
                    color: done === l.items.length ? "#22c55e" : "var(--color-at-blue-v5)",
                  }}
                >
                  {done}/{l.items.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs leading-snug px-0.5" style={{ color: "var(--color-at-blue-v4)" }}>
        Doprava a účast odpovídají checklistu v dokumentu Role týmu (AERO EXPO 2026). „S sebou“ je jen zde v Operativě (expedice na stánek).
        {" "}
        <span style={{ color: "var(--color-at-blue-v5)" }}>
          Přímý odkaz na expedici: přidejte do URL <strong className="font-mono">?cl=packed</strong> (např. <strong className="font-mono">/ops?tab=checklists&amp;cl=packed</strong>).
        </span>
      </p>

      {/* Active checklist */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: "var(--color-at-white)" }}>
                Checklist
              </p>
              {isOffline && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(249,115,22,0.15)",
                    color: "#f97316",
                    border: "1px solid rgba(249,115,22,0.3)",
                  }}
                >
                  Offline – pouze čtení
                </span>
              )}
            </div>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-at-blue-v5)" }}>
              {active.subtitle}
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-lg text-right flex-shrink-0"
            style={{
              background: allDone ? "var(--color-at-red)" : "var(--color-at-blue-v1)",
              border: `1px solid ${allDone ? "var(--color-at-red)" : "var(--color-at-blue-v3)"}`,
              transition: "background 300ms",
            }}
          >
            <div
              className="text-2xl font-black leading-none"
              style={{ color: "var(--color-at-white)" }}
            >
              {doneCount}/{total}
            </div>
            <div className="text-xs mt-0.5" style={{ color: allDone ? "var(--color-at-white)" : "var(--color-at-blue-v5)" }}>
              {allDone ? "Hotovo ✓" : "splněno"}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="h-1 rounded-full mb-4 overflow-hidden"
          style={{ background: "var(--color-at-blue-v2)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-400"
            style={{
              width: `${(doneCount / total) * 100}%`,
              background: allDone ? "var(--color-at-red)" : "var(--color-at-blue-v4)",
            }}
          />
        </div>

        {/* Items */}
        <div className="flex flex-col gap-2">
          {active.items.map((item) => {
            const isChecked = !!checked[item.id];
            return (
              <label
                key={item.id}
                className="flex items-start gap-3 px-4 py-3 rounded-lg cursor-pointer"
                style={{
                  background: isChecked ? "var(--color-at-blue-v2)" : "var(--color-at-blue-v1)",
                  border: `1px solid ${isChecked ? "var(--color-at-blue-v3)" : "var(--color-at-blue-v2)"}`,
                  transition: "background 200ms",
                }}
              >
                <input
                  type="checkbox"
                  className="atm-checkbox mt-0.5 flex-shrink-0"
                  checked={isChecked}
                  onChange={() => toggle(activeKey, item.id)}
                  disabled={isOffline}
                  title={isOffline ? "Offline – změny se neukládají" : undefined}
                />
                <span
                  className="text-sm leading-relaxed"
                  style={{
                    color: isChecked ? "var(--color-at-blue-v5)" : "var(--color-at-white)",
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

        {allDone && (
          <div
            className="mt-3 px-4 py-3 rounded-lg text-center text-sm font-semibold"
            style={{
              background: "rgba(213,28,23,0.12)",
              color: "var(--color-at-white)",
              border: "1px solid rgba(213,28,23,0.3)",
            }}
          >
            {active.doneMsg}
          </div>
        )}
      </div>
    </div>
  );
}
