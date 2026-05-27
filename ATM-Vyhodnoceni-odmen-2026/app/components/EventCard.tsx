"use client";

import Link from "next/link";
import { type EventData, STATUS_COLORS, getPaidStatusLabel, formatCZK, formatDate, DEFAULT_CHECKLIST, DEAL_CHECKPOINTS } from "@/data/events";

const DEAL_IDS = new Set(["deal-d7", "deal-d3m", "deal-d6m", "deal-d9m", "deal-d12m"]);

export default function EventCard({ event }: { event: EventData }) {
  const items = event.checklist ?? DEFAULT_CHECKLIST;

  // Auto položky odvozené ze statusu eventu
  const autoChecks = [
    { id: "auto-submitted", label: "Odesláno ke schválení",             done: ["submitted","approved","paid"].includes(event.status) },
    { id: "auto-approved",  label: "Schváleno Petrem Polákem",          done: ["approved","paid"].includes(event.status) },
    { id: "auto-paid",      label: "Vyhodnoceno a odesláno na finance", done: event.status === "paid" },
  ];

  // Non-deal checklist items (kpi-done apod.)
  const nonDealItems = items.filter((i) => !DEAL_IDS.has(i.id));

  // Deal checkpointů stav z dealApprovals (zdroj pravdy)
  const hasSales = event.salesTeam.length > 0;
  const dealApprovals = event.dealApprovals ?? [];
  const dealDone = hasSales
    ? DEAL_CHECKPOINTS.filter((cp) => {
        const d = dealApprovals.find((a) => a.checkpoint === cp.key);
        return d && (d.schvaleno || d.proplaceno);
      }).length
    : DEAL_CHECKPOINTS.length;

  // Celkový progress: auto (3) + nonDeal + deal (5 pokud sales)
  const allItemsForProgress = [...autoChecks, ...nonDealItems];
  const nonDealDone = allItemsForProgress.filter((i) => i.done).length;
  const totalCount = allItemsForProgress.length + (hasSales ? DEAL_CHECKPOINTS.length : 0);
  const doneCount  = nonDealDone + dealDone;
  const pct = Math.round((doneCount / totalCount) * 100);

  return (
    <Link href={`/event/${event.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="atm-card" style={{ cursor: "pointer" }}>
        {/* Top row: name + status + total + groups */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
          {/* Left */}
          <div style={{ minWidth: 200, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: "0.25rem" }}>
              <h3 style={{ fontSize: "1rem", color: "#ffffff", fontWeight: 600 }}>
                {event.name}
              </h3>
              <span
                className="status-badge"
                style={{
                  background: STATUS_COLORS[event.status] + "22",
                  color: STATUS_COLORS[event.status],
                  border: `1px solid ${STATUS_COLORS[event.status]}44`,
                }}
              >
                {getPaidStatusLabel(event)}
              </span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.95)" }}>
              {event.location}&nbsp;·&nbsp;{formatDate(event.dateStart)} – {formatDate(event.dateEnd)}
            </p>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", marginTop: 3 }}>
              {event.lastModified
                ? `Naposledy upraveno: ${event.lastModified}`
                : `Vyhodnoceno: ${event.processedDate}`}
            </p>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexShrink: 0, flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.625rem", color: "rgba(255,255,255,0.92)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                Celkem odměny
              </p>
              <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#93b3cf" }}>
                {formatCZK(event.grandTotal)}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.875rem" }}>
              <MiniStat label="Skupina 1" count={event.salesTeam.length}   amount={event.salesTeam.reduce((s, p) => s + p.total, 0)} />
              <MiniStat label="Skupina 2" count={event.nesalesTeam.length} amount={event.nesalesTeam.reduce((s, p) => s + p.total, 0)} />
              <MiniStat label="Skupina 3" count={event.prepTeam.length}    amount={event.prepTeam.reduce((s, p) => s + p.bonus, 0)} />
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        {/* Checklist row */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "0.625rem",
          display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap",
        }}>
          {/* Progress bar + count */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div style={{ width: 40, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#81c784" : "#507499", borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: "0.6875rem", color: pct === 100 ? "#81c784" : "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
              {doneCount}/{totalCount}
            </span>
          </div>

          {/* Nedokončené non-deal položky jako chipy */}
          {pct === 100 ? (
            <span style={{ fontSize: "0.6875rem", color: "#81c784", fontWeight: 600 }}>✓ Vše dokončeno</span>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              {allItemsForProgress.filter((i) => !i.done).map((item) => (
                <span
                  key={item.id}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: "0.6875rem", fontWeight: 700,
                    color: "#f59e0b",
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.35)",
                    borderRadius: 4, padding: "3px 8px",
                  }}
                >
                  <span style={{ fontSize: "0.625rem" }}>⚠</span>
                  {item.label}
                </span>
              ))}

              {/* Deal checkpoint kruhy */}
              {hasSales && (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  {DEAL_CHECKPOINTS.map((cp) => {
                    const d = dealApprovals.find((a) => a.checkpoint === cp.key);
                    const done = d && (d.schvaleno || d.proplaceno);
                    const color = done
                      ? (d?.proplaceno ? "#22c55e" : "#f59e0b")
                      : "#e74c3c";
                    return (
                      <div
                        key={cp.key}
                        title={done ? `${cp.key} — vyhodnoceno` : `${cp.key} — čeká`}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
                      >
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: `${color}22`,
                          border: `2px solid ${color}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {done ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          )}
                        </div>
                        <span style={{ fontSize: "0.5rem", fontWeight: 700, color: `${color}cc`, letterSpacing: "0.02em", lineHeight: 1 }}>{cp.key}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function MiniStat({ label, count, amount }: { label: string; count: number; amount: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: "0.625rem", color: "rgba(255,255,255,0.88)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#ffffff" }}>{count} os.</p>
      <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.92)" }}>{formatCZK(amount)}</p>
    </div>
  );
}
