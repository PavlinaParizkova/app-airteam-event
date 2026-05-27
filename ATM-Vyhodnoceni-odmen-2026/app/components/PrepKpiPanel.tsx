"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type PrepEntry, type PrepPersonTracking } from "@/data/events";
import { patchPrepKpiAction } from "@/app/actions/events";

type Props = {
  eventId: string;
  prepTeam: PrepEntry[];
  initialTracking: PrepPersonTracking[];
  isAdmin: boolean;
};

function initLocal(prepTeam: PrepEntry[], tracking: PrepPersonTracking[]): PrepPersonTracking[] {
  return prepTeam.map((person) => {
    const found = tracking.find((t) => t.personName === person.name);
    if (found) return found;
    return {
      personName: person.name,
      kpiPoints: null,
      ceoApproved: false,
      financeStep: { id: "finance-0", label: "Odesláno na finance", sent: false },
    };
  });
}

export default function PrepKpiPanel({ eventId, prepTeam, initialTracking, isAdmin }: Props) {
  const router = useRouter();
  const [tracking, setTracking] = useState<PrepPersonTracking[]>(
    () => initLocal(prepTeam, initialTracking),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function patch(body: Parameters<typeof patchPrepKpiAction>[1], key: string) {
    if (!isAdmin) return;
    setSaving(key);
    setSaveError(null);
    const res = await patchPrepKpiAction(eventId, body);
    if (res.ok && res.data) {
      setTracking(initLocal(prepTeam, res.data.tracking));
    } else if (!res.ok) {
      setSaveError(res.message);
      if (res.reason === "conflict") router.refresh();
    }
    setSaving(null);
  }

  function updateKpi(personName: string, value: string) {
    const num = parseInt(value, 10);
    setTracking((prev) =>
      prev.map((t) => t.personName === personName
        ? { ...t, kpiPoints: isNaN(num) ? null : Math.min(100, Math.max(0, num)) }
        : t),
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {tracking.map((t) => {
        const person = prepTeam.find((p) => p.name === t.personName);
        if (!person) return null;
        const initials = t.personName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
        const kpiPct = t.kpiPoints !== null ? t.kpiPoints : 0;
        const doneSteps = [t.kpiPoints !== null, t.ceoApproved, t.financeStep.sent].filter(Boolean).length;

        return (
          <div key={t.personName} style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderLeft: "3px solid #2b4156",
            borderRadius: 10, overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.875rem",
              padding: "0.75rem 1rem",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexWrap: "wrap",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: "rgba(43,65,86,0.5)", border: "1px solid rgba(43,65,86,0.8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 700, color: "#ffffff",
              }}>
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#ffffff" }}>{t.personName}</p>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.92)" }}>{person.role}</p>
              </div>
              {/* Odměna */}
              <div style={{ textAlign: "right", flexShrink: 0, paddingRight: 4 }}>
                <p style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.85)", marginBottom: 1 }}>Odměna</p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "#93b3cf" }}>
                  {person.bonus > 0
                    ? new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(person.bonus)
                    : person.hoursRaw !== "—" ? `${person.hoursRaw} h × sazba` : "—"}
                </p>
              </div>
              {/* Progress tečky */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                {[t.kpiPoints !== null, t.ceoApproved, t.financeStep.sent].map((done, i) => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: done ? "#81c784" : "rgba(255,255,255,0.12)",
                  }} />
                ))}
                <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.85)", marginLeft: 2 }}>{doneSteps}/3</span>
              </div>
            </div>

            {/* Tělo */}
            <div style={{ padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>

              {/* KPI body */}
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.88)", marginBottom: 6 }}>
                  KPI body od MKT (0–100)
                </p>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={t.kpiPoints ?? ""}
                    onChange={(e) => updateKpi(t.personName, e.target.value)}
                    onBlur={() => {
                      if (t.kpiPoints !== null) {
                        patch({ action: "set-kpi", personName: t.personName, kpiPoints: t.kpiPoints }, `${t.personName}-kpi`);
                      }
                    }}
                    disabled={!isAdmin || saving === `${t.personName}-kpi`}
                    placeholder="0–100"
                    style={{
                      width: 80, padding: "6px 10px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 6, color: "#ffffff",
                      fontSize: "0.9375rem", fontWeight: 700, outline: "none",
                      opacity: !isAdmin ? 0.5 : 1,
                    }}
                  />
                  {t.kpiPoints !== null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 100, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
                        <div style={{
                          width: `${kpiPct}%`, height: "100%",
                          background: kpiPct >= 80 ? "#81c784" : kpiPct >= 55 ? "#93b3cf" : "#507499",
                          borderRadius: 3, transition: "width 0.3s",
                        }} />
                      </div>
                      <span style={{ fontSize: "0.8125rem", color: "#93b3cf", fontWeight: 600 }}>
                        {t.kpiPoints} b.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CEO schválení */}
              <TrackRow
                label="Schváleno CEO (Petr Polák)"
                done={t.ceoApproved}
                doneDate={t.ceoApprovedDate}
                loading={saving === `${t.personName}-ceo`}
                color="#22c55e"
                onClick={isAdmin ? () => {
                  patch({ action: "ceo-approve", personName: t.personName, approved: !t.ceoApproved }, `${t.personName}-ceo`);
                } : undefined}
              />

              {/* Finance */}
              <TrackRow
                label={t.financeStep.label}
                done={t.financeStep.sent}
                doneDate={t.financeStep.sentDate}
                loading={saving === `${t.personName}-finance`}
                color="#93b3cf"
                onClick={isAdmin ? () => {
                  patch({ action: "finance-step", personName: t.personName, sent: !t.financeStep.sent }, `${t.personName}-finance`);
                } : undefined}
              />

            </div>
          </div>
        );
      })}

      {!isAdmin && (
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", marginTop: 4 }}>
          Upravovat může pouze Marketing Manager.
        </p>
      )}
      {saveError && (
        <p style={{ fontSize: "0.75rem", color: "#f87171", marginTop: 4 }}>
          {saveError}
        </p>
      )}
    </div>
  );
}

function TrackRow({ label, done, doneDate, loading, color, onClick }: {
  label: string; done: boolean; doneDate?: string;
  loading?: boolean; color: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "0.4375rem 0.625rem", borderRadius: 6,
        background: done ? `${color}10` : "rgba(255,255,255,0.02)",
        border: `1px solid ${done ? color + "30" : "rgba(255,255,255,0.06)"}`,
        cursor: onClick ? "pointer" : "default",
        opacity: loading ? 0.5 : 1, transition: "all 0.15s",
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
        border: `2px solid ${done ? color : "rgba(255,255,255,0.2)"}`,
        background: done ? `${color}25` : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {done && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: "0.875rem", flex: 1, color: done ? "rgba(255,255,255,0.55)" : "#ffffff", textDecoration: done ? "line-through" : "none" }}>
        {label}
      </span>
      {doneDate && <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.85)", flexShrink: 0 }}>{doneDate}</span>}
      {loading && <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.85)" }}>…</span>}
    </div>
  );
}
