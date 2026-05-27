"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type EventResult } from "@/data/events";
import type { EventWithVersions } from "@/app/lib/store";
import { patchResultsAction } from "@/app/actions/events";

export default function EditClient({ event }: { event: EventWithVersions }) {
  const router = useRouter();

  const [version, setVersion] = useState<number>(event.versions.results);
  const [resultRows, setResultRows] = useState<EventResult[]>(
    event.eventResults && event.eventResults.length > 0
      ? event.eventResults
      : [{ label: "", value: "" }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // Když server odešle nová data, syncni
  useEffect(() => {
    if (event.versions.results !== version) {
      setResultRows(
        event.eventResults && event.eventResults.length > 0
          ? event.eventResults
          : [{ label: "", value: "" }],
      );
      setVersion(event.versions.results);
    }
  }, [event.eventResults, event.versions.results, version]);

  async function handleSave() {
    setSaving(true); setError(null); setOk(false);
    const rows = resultRows.filter((r) => r.label.trim() !== "");
    const res = await patchResultsAction(event.id, version, rows);
    if (!res.ok) {
      setError(res.message);
      if (res.reason === "conflict") router.refresh();
    } else {
      setOk(true);
      setVersion(res.version!);
    }
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: "1.25rem", fontSize: "0.8125rem" }}>
        <a href="/" style={{ color: "rgba(255,255,255,0.95)", textDecoration: "none" }}>Přehled</a>
        <span style={{ color: "rgba(255,255,255,0.88)" }}>›</span>
        <a href={`/event/${event.id}`} style={{ color: "rgba(255,255,255,0.95)", textDecoration: "none" }}>{event.shortName}</a>
        <span style={{ color: "rgba(255,255,255,0.88)" }}>›</span>
        <span style={{ color: "#ffffff" }}>Výsledky eventu</span>
      </div>

      <h1 style={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)", marginBottom: "0.25rem" }}>
        Výsledky eventu — {event.shortName}
      </h1>
      <p style={{ color: "rgba(255,255,255,0.92)", fontSize: "0.8125rem", marginBottom: "2rem" }}>
        Statistiky a metriky eventu (např. počty schůzek, náklady, leady). Editovatelné i po schválení.
      </p>

      {/* Řádky výsledků */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.875rem" }}>
        {resultRows.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Název (např. Uskutečněné schůzky)"
              value={row.label}
              onChange={(e) => setResultRows((prev) => prev.map((r, i) => i !== ri ? r : { ...r, label: e.target.value }))}
              style={{ ...inputStyle, flex: "1 1 200px" }}
            />
            <input
              type="text"
              placeholder="Hodnota (např. 67)"
              value={row.value}
              onChange={(e) => setResultRows((prev) => prev.map((r, i) => i !== ri ? r : { ...r, value: e.target.value }))}
              style={{ ...inputStyle, flex: "1 1 160px" }}
            />
            <button
              onClick={() => setResultRows((prev) => prev.filter((_, i) => i !== ri))}
              title="Odebrat řádek"
              style={{
                padding: "4px 8px", background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4,
                color: "rgba(255,255,255,0.88)", cursor: "pointer", fontFamily: "inherit",
                fontSize: "0.875rem", flexShrink: 0,
              }}
            >×</button>
          </div>
        ))}
      </div>

      {/* Akce */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => setResultRows((prev) => [...prev, { label: "", value: "" }])}
          style={{
            padding: "0.375rem 0.75rem",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 5, color: "rgba(255,255,255,0.85)", fontSize: "0.8125rem",
            cursor: "pointer", fontFamily: "inherit",
          }}
        >+ Přidat řádek</button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "0.375rem 1rem",
            background: saving ? "rgba(80,116,153,0.5)" : "#507499",
            border: "1px solid #507499", borderRadius: 5,
            color: "#ffffff", fontWeight: 600, fontSize: "0.8125rem",
            cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}
        >{saving ? "Ukládám…" : "Uložit výsledky"}</button>
        {ok    && <span style={{ color: "#81c784", fontWeight: 600, fontSize: "0.8125rem" }}>✓ Uloženo</span>}
        {error && <span style={{ color: "#e74c3c", fontSize: "0.8125rem" }}>{error}</span>}
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <a href={`/event/${event.id}`} style={{
          padding: "0.625rem 1.25rem",
          background: "transparent", border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 6, color: "rgba(255,255,255,0.85)", fontSize: "0.9375rem",
          textDecoration: "none", display: "inline-block",
        }}>
          ← Zpět na přehled eventu
        </a>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 5, color: "#ffffff", fontSize: "0.875rem",
  padding: "0.375rem 0.625rem", fontFamily: "inherit", outline: "none",
  boxSizing: "border-box",
};
