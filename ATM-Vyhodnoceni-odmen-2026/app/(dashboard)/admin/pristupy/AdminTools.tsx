"use client";
import { useState } from "react";

type RepairResult = {
  ok: boolean;
  restored?: string[];
  alreadyPresent?: string[];
  missing?: string[];
  note?: string;
  error?: string;
};

type SeedResult = {
  ok: boolean;
  created?: string[];
  skipped?: string[];
  recreated?: string[];
  error?: string;
};

export default function AdminTools() {
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [loading, setLoading] = useState<"repair" | "seed" | null>(null);

  async function handleRepair() {
    setLoading("repair");
    setRepairResult(null);
    try {
      const r = await fetch("/api/admin/repair-ids", { method: "POST" });
      const d = await r.json() as RepairResult;
      setRepairResult(d);
    } catch {
      setRepairResult({ ok: false, error: "Síťová chyba" });
    } finally {
      setLoading(null);
    }
  }

  async function handleSeed() {
    setLoading("seed");
    setSeedResult(null);
    try {
      const r = await fetch("/api/admin/seed", { method: "POST" });
      const d = await r.json() as SeedResult;
      setSeedResult(d);
    } catch {
      setSeedResult({ ok: false, error: "Síťová chyba" });
    } finally {
      setLoading(null);
    }
  }

  const btn = (label: string, onClick: () => void, danger = false) => (
    <button
      onClick={onClick}
      disabled={loading !== null}
      style={{
        padding: "0.5rem 1.125rem", borderRadius: 7,
        border: `1px solid ${danger ? "rgba(239,68,68,0.5)" : "rgba(147,179,207,0.35)"}`,
        background: danger ? "rgba(239,68,68,0.12)" : "rgba(147,179,207,0.10)",
        color: danger ? "#fca5a5" : "#93b3cf",
        fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
        opacity: loading !== null ? 0.5 : 1,
      }}
    >
      {loading !== null ? "…" : label}
    </button>
  );

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2 style={{
        fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: "0.75rem",
      }}>
        Nástroje obnovení dat
      </h2>

      <div style={{
        padding: "1.25rem", borderRadius: 8,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", flexDirection: "column", gap: "1rem",
      }}>
        {/* Repair IDs */}
        <div>
          <p style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: 600, marginBottom: 4 }}>
            Opravit seznam eventů
          </p>
          <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.625rem" }}>
            Obnoví <code>event:ids</code> ze stávajících dat v Redis. Bezpečné — nic nepřepisuje.
          </p>
          {btn("Spustit opravu", handleRepair)}
          {repairResult && (
            <pre style={{
              marginTop: "0.625rem", padding: "0.625rem 0.875rem", borderRadius: 6,
              background: "rgba(0,0,0,0.3)", fontSize: "0.75rem",
              color: repairResult.ok ? "#86efac" : "#fca5a5",
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {JSON.stringify(repairResult, null, 2)}
            </pre>
          )}
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)" }} />

        {/* Seed chybějící */}
        <div>
          <p style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: 600, marginBottom: 4 }}>
            Seedovat chybějící eventy
          </p>
          <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.625rem" }}>
            Vytvoří eventy ze statických dat, které v Redis vůbec neexistují. Existující data nepřepíše.
          </p>
          {btn("Spustit seed", handleSeed, false)}
          {seedResult && (
            <pre style={{
              marginTop: "0.625rem", padding: "0.625rem 0.875rem", borderRadius: 6,
              background: "rgba(0,0,0,0.3)", fontSize: "0.75rem",
              color: seedResult.ok ? "#86efac" : "#fca5a5",
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {JSON.stringify(seedResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </section>
  );
}
