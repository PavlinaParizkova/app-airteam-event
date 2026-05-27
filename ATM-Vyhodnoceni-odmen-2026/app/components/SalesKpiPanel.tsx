"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_FINANCE_STEPS,
  type SalesEntry,
  type SalesPersonTracking,
} from "@/data/events";
import { patchSalesKpiAction } from "@/app/actions/events";

type Props = {
  eventId: string;
  salesTeam: SalesEntry[];
  initialTracking: SalesPersonTracking[];
  isAdmin: boolean;
};

function initLocal(salesTeam: SalesEntry[], tracking: SalesPersonTracking[]): SalesPersonTracking[] {
  return salesTeam.map((person) => {
    const found = tracking.find((t) => t.personName === person.name);
    if (found) return found;
    return {
      personName: person.name,
      leadsCount: null,
      kpiPoints: null,
      ceoApproved: false,
      financeSteps: DEFAULT_FINANCE_STEPS.map((s, i) => ({ ...s, id: `finance-${i}` })),
    };
  });
}

export default function SalesKpiPanel({ eventId, salesTeam, initialTracking, isAdmin }: Props) {
  const router = useRouter();
  const [tracking, setTracking] = useState<SalesPersonTracking[]>(
    () => initLocal(salesTeam, initialTracking),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function patch(body: Parameters<typeof patchSalesKpiAction>[1], key: string) {
    if (!isAdmin) return;
    setSaving(key);
    setSaveError(null);
    const res = await patchSalesKpiAction(eventId, body);
    if (res.ok && res.data) {
      setTracking(initLocal(salesTeam, res.data.tracking));
    } else if (!res.ok) {
      setSaveError(res.message);
      if (res.reason === "conflict") router.refresh();
    }
    setSaving(null);
  }

  function updateLeads(personName: string, value: string) {
    const num = parseInt(value, 10);
    setTracking((prev) =>
      prev.map((t) => t.personName === personName ? { ...t, leadsCount: isNaN(num) ? null : num } : t),
    );
  }

  function updateKpi(personName: string, value: string) {
    const num = parseInt(value, 10);
    setTracking((prev) =>
      prev.map((t) => t.personName === personName ? { ...t, kpiPoints: isNaN(num) ? null : Math.min(100, Math.max(0, num)) } : t),
    );
  }

  async function saveLeads(personName: string, leadsCount: number | null) {
    if (leadsCount === null) return;
    await patch({ action: "set-leads", personName, leadsCount }, `${personName}-leads`);
  }

  async function saveKpi(personName: string, kpiPoints: number | null) {
    if (kpiPoints === null) return;
    await patch({ action: "set-kpi", personName, kpiPoints }, `${personName}-kpi`);
  }

  async function toggleCeo(personName: string, current: boolean) {
    await patch({ action: "ceo-approve", personName, approved: !current }, `${personName}-ceo`);
  }

  async function toggleFinanceStep(personName: string, stepId: string, current: boolean) {
    await patch({ action: "finance-step", personName, stepId, sent: !current }, `${personName}-${stepId}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {tracking.map((t) => {
        const person = salesTeam.find((p) => p.name === t.personName);
        if (!person) return null;
        const isSaving = (key: string) => saving === key;
        const initials = t.personName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

        const kpiPct = t.kpiPoints !== null ? Math.round((t.kpiPoints / 100) * 100) : 0;
        const allFinanceSent = t.financeSteps.every((s) => s.sent);
        const financeCount = t.financeSteps.filter((s) => s.sent).length;

        const overallSteps = [
          t.leadsCount !== null,
          t.kpiPoints !== null,
          t.ceoApproved,
          allFinanceSent,
        ];
        const doneSteps = overallSteps.filter(Boolean).length;

        return (
          <div key={t.personName} style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderLeft: "3px solid #507499",
            borderRadius: 10, overflow: "hidden",
          }}>
            {/* Header osoby */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.875rem",
              padding: "0.875rem 1rem",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexWrap: "wrap",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: "rgba(80,116,153,0.25)", border: "1px solid rgba(80,116,153,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 700, color: "#ffffff",
              }}>
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#ffffff" }}>{t.personName}</p>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.92)" }}>{person.role}</p>
              </div>
              {/* Progress kroků */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {overallSteps.map((done, i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: done ? "#81c784" : "rgba(255,255,255,0.12)",
                    transition: "background 0.2s",
                  }} />
                ))}
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.88)", marginLeft: 4 }}>
                  {doneSteps}/4
                </span>
              </div>
            </div>

            {/* Tělo */}
            <div style={{ padding: "0.875rem 1rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>

              {/* Řádek 1: Leady + KPI body */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {/* Počet leadů */}
                <div style={{ flex: 1, minWidth: 140 }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.92)", marginBottom: 6 }}>
                    Počet leadů (MKT)
                  </p>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      type="number"
                      min={0}
                      value={t.leadsCount ?? ""}
                      onChange={(e) => updateLeads(t.personName, e.target.value)}
                      onBlur={(e) => saveLeads(t.personName, t.leadsCount)}
                      disabled={!isAdmin || isSaving(`${t.personName}-leads`)}
                      placeholder="0"
                      style={{
                        width: 80, padding: "6px 10px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 6, color: "#ffffff", fontSize: "0.9375rem",
                        fontWeight: 700, outline: "none",
                        opacity: !isAdmin ? 0.5 : 1,
                      }}
                    />
                    {t.leadsCount !== null && (
                      <span style={{ fontSize: "0.8125rem", color: "#93b3cf", fontWeight: 600 }}>
                        {t.leadsCount} leadů
                      </span>
                    )}
                  </div>
                </div>

                {/* KPI body */}
                <div style={{ flex: 1, minWidth: 140 }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.92)", marginBottom: 6 }}>
                    KPI body od MKT (0–100)
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={t.kpiPoints ?? ""}
                      onChange={(e) => updateKpi(t.personName, e.target.value)}
                      onBlur={() => saveKpi(t.personName, t.kpiPoints)}
                      disabled={!isAdmin || isSaving(`${t.personName}-kpi`)}
                      placeholder="0–100"
                      style={{
                        width: 80, padding: "6px 10px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 6, color: "#ffffff", fontSize: "0.9375rem",
                        fontWeight: 700, outline: "none",
                        opacity: !isAdmin ? 0.5 : 1,
                      }}
                    />
                    {t.kpiPoints !== null && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
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
              </div>

              {/* Řádek 2: CEO schválení */}
              <TrackRow
                label="Schváleno CEO (Petr Polák)"
                done={t.ceoApproved}
                doneDate={t.ceoApprovedDate}
                loading={isSaving(`${t.personName}-ceo`)}
                color="#22c55e"
                onClick={isAdmin ? () => toggleCeo(t.personName, t.ceoApproved) : undefined}
              />

              {/* Řádek 3+: Finance kroky */}
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.88)", marginBottom: 6 }}>
                  Odesláno na finance — {financeCount}/{t.financeSteps.length} splátek
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {t.financeSteps.map((step) => (
                    <TrackRow
                      key={step.id}
                      label={step.label}
                      done={step.sent}
                      doneDate={step.sentDate}
                      loading={isSaving(`${t.personName}-${step.id}`)}
                      color="#93b3cf"
                      onClick={isAdmin ? () => toggleFinanceStep(t.personName, step.id, step.sent) : undefined}
                    />
                  ))}
                </div>
              </div>

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
  label: string;
  done: boolean;
  doneDate?: string;
  loading?: boolean;
  color: string;
  onClick?: () => void;
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
        opacity: loading ? 0.5 : 1,
        transition: "all 0.15s",
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
      <span style={{
        fontSize: "0.875rem", flex: 1,
        color: done ? "rgba(255,255,255,0.6)" : "#ffffff",
        textDecoration: done ? "line-through" : "none",
      }}>
        {label}
      </span>
      {doneDate && (
        <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.85)", flexShrink: 0 }}>
          {doneDate}
        </span>
      )}
      {loading && (
        <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.85)" }}>…</span>
      )}
    </div>
  );
}
