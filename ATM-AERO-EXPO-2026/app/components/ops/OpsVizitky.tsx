"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useIsOffline } from "../../hooks/useIsOffline";
import { TEAM } from "../../data/slides-data";
import type { BizCard } from "@/app/api/bizcard/route";

const DIVISIONS = [
  "AIR TEAM",
  "PilotStyle",
  "Aerospec",
  "Jet Concept",
  "Intel",
  "Service",
  "E-shop",
  "Holding",
];

function exportCards(cards: BizCard[]) {
  if (cards.length === 0) return;
  const lines = [
    "AERO EXPO 2026 – Podklady pro tisk vizitek",
    `Exportováno: ${new Date().toLocaleString("cs-CZ")}`,
    "",
    "=".repeat(48),
    "",
  ];
  for (const c of cards) {
    lines.push(c.name);
    lines.push(c.position);
    lines.push(c.division);
    lines.push(c.phone);
    lines.push(c.bizEmail);
    lines.push("");
    lines.push("-".repeat(32));
    lines.push("");
  }
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aero-expo-2026-vizitky-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OpsVizitky() {
  const isOffline = useIsOffline();
  const { data: session } = useSession();
  const sessionEmail = (session?.user?.email ?? "").toLowerCase();
  const sessionName = session?.user?.name ?? "";

  const [cards, setCards] = useState<BizCard[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    position: "",
    division: "",
    phone: "",
    bizEmail: "",
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/bizcard");
      const data: BizCard[] = await res.json();
      setCards(data);
      const own = data.find((c) => c.email === sessionEmail);
      if (own) {
        setForm({
          name: own.name,
          position: own.position,
          division: own.division,
          phone: own.phone,
          bizEmail: own.bizEmail,
        });
        setSavedAt(own.updatedAt);
      } else if (sessionName) {
        setForm((prev) => ({ ...prev, name: sessionName, bizEmail: sessionEmail }));
      }
    } catch {
      // ignore – offline
    }
  }, [sessionEmail, sessionName]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (isOffline || !form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bizcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const saved: BizCard = await res.json();
      setSavedAt(saved.updatedAt);
      setCards((prev) => {
        const filtered = prev.filter((c) => c.email !== saved.email);
        return [...filtered, saved];
      });
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const ownCard = cards.find((c) => c.email === sessionEmail);
  const filledCount = cards.length;
  const totalCount = TEAM.length;

  function formatTs(iso: string) {
    return new Date(iso).toLocaleString("cs-CZ", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header stats */}
      <div
        className="flex items-center gap-4 px-4 py-3 rounded-xl flex-wrap"
        style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v2)" }}
      >
        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: "var(--color-at-white)" }}>
            Vizitky
          </p>
          <p className="text-xs mt-0.5" style={{ color: isOffline ? "#f97316" : "var(--color-at-blue-v5)" }}>
            {isOffline ? "⚡ offline – zobrazuji poslední stav" : `${filledCount} z ${totalCount} členů vyplnilo podklady`}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex-1 min-w-24">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-at-blue-v2)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalCount > 0 ? (filledCount / totalCount) * 100 : 0}%`,
                background: filledCount === totalCount ? "var(--color-at-red)" : "var(--color-at-blue-v4)",
              }}
            />
          </div>
        </div>

        <button
          onClick={() => exportCards(cards)}
          disabled={cards.length === 0}
          className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{
            background: "var(--color-at-blue-v3)",
            color: "var(--color-at-white)",
            border: "1px solid var(--color-at-blue-v3)",
            opacity: cards.length === 0 ? 0.4 : 1,
          }}
        >
          Exportovat pro tisk
        </button>
      </div>

      {/* Own card form */}
      <div
        className="rounded-xl px-4 py-4 flex flex-col gap-3"
        style={{
          background: "var(--color-at-blue-v2)",
          border: `1px solid ${ownCard ? "var(--color-at-blue-v3)" : "rgba(213,28,23,0.35)"}`,
        }}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: "var(--color-at-blue-v5)" }}>
            Moje vizitka
          </p>
          {savedAt && (
            <span className="text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
              Uloženo {formatTs(savedAt)}
            </span>
          )}
          {!ownCard && !isOffline && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{
                background: "rgba(213,28,23,0.12)",
                color: "var(--color-at-red)",
                border: "1px solid rgba(213,28,23,0.25)",
              }}
            >
              Nevyplněno
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold" style={{ color: "var(--color-at-blue-v5)" }}>
              Jméno a příjmení *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              disabled={isOffline}
              placeholder="Jan Novák"
              className="rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background: "var(--color-at-blue-v1)",
                border: "1px solid var(--color-at-blue-v3)",
                color: "var(--color-at-white)",
                opacity: isOffline ? 0.5 : 1,
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold" style={{ color: "var(--color-at-blue-v5)" }}>
              Pracovní pozice
            </label>
            <input
              type="text"
              value={form.position}
              onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
              disabled={isOffline}
              placeholder="Sales Manager"
              className="rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background: "var(--color-at-blue-v1)",
                border: "1px solid var(--color-at-blue-v3)",
                color: "var(--color-at-white)",
                opacity: isOffline ? 0.5 : 1,
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold" style={{ color: "var(--color-at-blue-v5)" }}>
              Divize
            </label>
            <select
              value={form.division}
              onChange={(e) => setForm((p) => ({ ...p, division: e.target.value }))}
              disabled={isOffline}
              className="rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background: "var(--color-at-blue-v1)",
                border: "1px solid var(--color-at-blue-v3)",
                color: form.division ? "var(--color-at-white)" : "var(--color-at-blue-v4)",
                opacity: isOffline ? 0.5 : 1,
              }}
            >
              <option value="">Vybrat divizi…</option>
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold" style={{ color: "var(--color-at-blue-v5)" }}>
              Telefon
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              disabled={isOffline}
              placeholder="+420 600 000 000"
              className="rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background: "var(--color-at-blue-v1)",
                border: "1px solid var(--color-at-blue-v3)",
                color: "var(--color-at-white)",
                opacity: isOffline ? 0.5 : 1,
              }}
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-bold" style={{ color: "var(--color-at-blue-v5)" }}>
              Firemní e-mail
            </label>
            <input
              type="email"
              value={form.bizEmail}
              onChange={(e) => setForm((p) => ({ ...p, bizEmail: e.target.value }))}
              disabled={isOffline}
              placeholder="jan.novak@airteam.eu"
              className="rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                background: "var(--color-at-blue-v1)",
                border: "1px solid var(--color-at-blue-v3)",
                color: "var(--color-at-white)",
                opacity: isOffline ? 0.5 : 1,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
          <span className="text-xs" style={{ color: isOffline ? "#f97316" : "var(--color-at-blue-v4)" }}>
            {isOffline ? "Offline – uložení není dostupné" : "Viditelné pro celý tým"}
          </span>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || saving || isOffline}
            title={isOffline ? "Offline – uložení není dostupné" : undefined}
            className="text-sm font-black px-5 py-1.5 rounded-lg transition-all"
            style={{
              background: "var(--color-at-red)",
              color: "var(--color-at-white)",
              opacity: !form.name.trim() || isOffline ? 0.4 : 1,
              cursor: isOffline ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Ukládám…" : ownCard ? "Aktualizovat" : "Uložit vizitku"}
          </button>
        </div>
      </div>

      {/* Team overview */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: "var(--color-at-blue-v5)" }}>
          Přehled týmu
        </p>

        {TEAM.map((member) => {
          const card = cards.find(
            (c) => c.name.toLowerCase() === member.name.toLowerCase()
          );
          const isMe = member.name === sessionName;

          return (
            <div
              key={member.name}
              className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "var(--color-at-blue-v1)",
                border: `1px solid ${card ? "var(--color-at-blue-v3)" : "var(--color-at-blue-v2)"}`,
              }}
            >
              {/* Initials */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                style={{ background: "var(--color-at-blue-v2)", color: "var(--color-at-white)" }}
              >
                {member.initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-black" style={{ color: "var(--color-at-white)" }}>
                    {member.name}
                    {isMe && (
                      <span className="ml-1.5 text-xs font-bold" style={{ color: "var(--color-at-blue-v4)" }}>
                        (já)
                      </span>
                    )}
                  </p>
                  {card ? (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        background: "rgba(34,197,94,0.1)",
                        color: "#22c55e",
                        border: "1px solid rgba(34,197,94,0.25)",
                      }}
                    >
                      ✓ Vyplněno
                    </span>
                  ) : (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        background: "rgba(107,114,128,0.1)",
                        color: "#6b7280",
                        border: "1px solid rgba(107,114,128,0.2)",
                      }}
                    >
                      Chybí
                    </span>
                  )}
                </div>

                {card && (
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                    <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                      {card.position}
                    </span>
                    {card.division && (
                      <span className="text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
                        {card.division}
                      </span>
                    )}
                    {card.phone && (
                      <span className="text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
                        {card.phone}
                      </span>
                    )}
                    {card.bizEmail && (
                      <span className="text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
                        {card.bizEmail}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {card?.updatedAt && (
                <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: "var(--color-at-blue-v4)" }}>
                  {formatTs(card.updatedAt)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
