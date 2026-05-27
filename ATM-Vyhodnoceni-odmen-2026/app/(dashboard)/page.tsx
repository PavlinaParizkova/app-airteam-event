import Link from "next/link";
import { formatCZK, type DealCheckpointKey, type EventData } from "@/data/events";
import { listEvents } from "@/app/lib/kv";
import { getAuth } from "@/app/lib/getAuth";
import EventCard from "@/app/components/EventCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Přehled eventů – Odměny | AIR TEAM" };

export default async function OverviewPage() {
  const [allEvents, session] = await Promise.all([listEvents(), getAuth()]);
  const isAdmin    = session?.user?.isAdmin    ?? false;
  const isApprover = session?.user?.isApprover ?? false;
  const isFinance  = session?.user?.isFinance  ?? false;
  const memberName = session?.user?.name ?? null;

  // Eventy viditelné v hlavním přehledu — všichni vidí schválené/proplacené,
  // admin a tým member vidí navíc svoje submitted.
  const visibleEvents = allEvents.filter((e) => {
    if (isAdmin) return true;
    if (e.status === "approved" || e.status === "paid") return true;
    if (e.status === "submitted" && memberName && isTeamMember(e, memberName)) return true;
    return false;
  });

  // Pro approvera — všechny submitted (i ty, kde není v týmu)
  const approverQueue = isApprover && !isAdmin
    ? allEvents.filter((e) => e.status === "submitted")
    : [];

  // Pro finance — vše s `finance===true && proplaceno===false` napříč eventy
  const financeQueue: FinanceItem[] = isFinance || isAdmin
    ? buildFinanceQueue(allEvents)
    : [];

  const totalGrand    = visibleEvents.reduce((s, e) => s + e.grandTotal, 0);
  const totalFix      = visibleEvents.reduce((s, e) => s + e.fixTotal, 0);
  const totalVariable = visibleEvents.reduce((s, e) => s + e.variableTotal, 0);
  const totalPeople   = visibleEvents.reduce((s, e) => s + e.salesTeam.length + e.nesalesTeam.length + e.prepTeam.length, 0);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{
            fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#93b3cf", marginBottom: "0.375rem",
          }}>
            AIR TEAM – Interní nástroj
          </p>
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.375rem" }}>
            Vyhodnocení odměn z eventů
          </h1>
          <p style={{ color: "rgba(255,255,255,0.92)", fontSize: "0.9375rem" }}>
            Přehled všech zaznamenaných eventů a vyplacených odměn.
          </p>
        </div>
        {isAdmin && (
          <Link href="/admin/new-event" style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            background: "rgba(147,179,207,0.12)", border: "1px solid rgba(147,179,207,0.3)",
            borderRadius: 8, color: "#93b3cf",
            fontSize: "0.9rem", fontWeight: 600,
            padding: "0.5rem 1.125rem",
            textDecoration: "none", whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> Nový event
          </Link>
        )}
      </div>

      {/* APPROVER — Čeká na tvé schválení */}
      {approverQueue.length > 0 && (
        <ApproverQueueSection events={approverQueue} />
      )}

      {/* FINANCE — K úhradě napříč eventy */}
      {financeQueue.length > 0 && (
        <FinanceQueueSection items={financeQueue} isFinance={isFinance} isAdmin={isAdmin} />
      )}

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
        <SummaryCard label="Celkem odměny" value={formatCZK(totalGrand)} highlight />
        <SummaryCard label="Fix (denní sazby)" value={formatCZK(totalFix)} />
        <SummaryCard label="Variabilní bonusy" value={formatCZK(totalVariable)} />
        <SummaryCard label="Eventy" value={String(visibleEvents.length)} suffix="událostí" />
        <SummaryCard label="Celkem lidí" value={String(totalPeople)} suffix="záznamů" />
      </div>

      {/* Section heading */}
      <p style={{
        fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.88)", marginBottom: "0.75rem",
      }}>
        Eventy
      </p>

      {/* Admin info — skryté eventy */}
      {isAdmin && allEvents.length > visibleEvents.length && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem",
          padding: "0.5rem 0.875rem",
          background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)",
          borderRadius: 7, fontSize: "0.8125rem", color: "rgba(255,215,0,0.7)",
        }}>
          <span>🔒</span>
          <span>
            Zobrazuješ všechny eventy (admin). Ostatní uživatelé vidí jen schválené.{" "}
            <strong style={{ color: "#ffd700" }}>
              {allEvents.length - visibleEvents.length} {allEvents.length - visibleEvents.length === 1 ? "event" : "eventy"} skryt{allEvents.length - visibleEvents.length === 1 ? "" : "y"}.
            </strong>
          </span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {visibleEvents.map((event) => <EventCard key={event.id} event={event} />)}
      </div>

      {visibleEvents.length === 0 && (
        <div className="atm-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "rgba(255,255,255,0.92)" }}>
            Zatím žádné eventy.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isTeamMember(e: EventData, name: string): boolean {
  return (
    e.salesTeam.some((p) => p.name === name) ||
    e.nesalesTeam.some((p) => p.name === name) ||
    e.prepTeam.some((p) => p.name === name)
  );
}

type FinanceItem = {
  eventId: string;
  eventShortName: string;
  personName: string;
  group: "skupina1" | "skupina2" | "skupina3";
  checkpoint?: DealCheckpointKey;
  amount: number;
};

function buildFinanceQueue(events: EventData[]): FinanceItem[] {
  const out: FinanceItem[] = [];
  for (const e of events) {
    if (e.status !== "approved" && e.status !== "paid") continue;
    // Skupina 1 — per checkpoint
    for (const a of e.dealApprovals ?? []) {
      if (a.finance && !a.proplaceno) {
        const salesPerson = e.salesTeam.find((p) => p.name === a.personName);
        const dealAmountPerDeal = salesPerson?.dealAmountPerDeal ?? 0;
        const dealAmount = (a.dealCount ?? 0) * dealAmountPerDeal;
        const kpiPortion = a.checkpoint === "D+7"
          ? (salesPerson?.kpiBonus ?? 0) + (salesPerson?.kpiMaxBonus ?? 0)
          : 0;
        const amount = dealAmount + kpiPortion;
        if (amount > 0) {
          out.push({
            eventId: e.id,
            eventShortName: e.shortName,
            personName: a.personName,
            group: "skupina1",
            checkpoint: a.checkpoint,
            amount,
          });
        }
      }
    }
    // Skupina 2
    for (const p of e.nesalesTeam) {
      if (p.approval?.finance && !p.approval?.proplaceno) {
        out.push({
          eventId: e.id,
          eventShortName: e.shortName,
          personName: p.name,
          group: "skupina2",
          amount: p.total,
        });
      }
    }
    // Skupina 3
    for (const p of e.prepTeam) {
      if (p.approval?.finance && !p.approval?.proplaceno) {
        out.push({
          eventId: e.id,
          eventShortName: e.shortName,
          personName: p.name,
          group: "skupina3",
          amount: p.bonus,
        });
      }
    }
  }
  return out;
}

// ── Sub-komponenty ───────────────────────────────────────────────────────────

function ApproverQueueSection({ events }: { events: EventData[] }) {
  return (
    <section style={{
      marginBottom: "2rem",
      background: "rgba(245,158,11,0.05)",
      border: "1px solid rgba(245,158,11,0.25)",
      borderLeft: "4px solid #f59e0b",
      borderRadius: 10, padding: "1rem 1.25rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.625rem" }}>
        <span style={{ fontSize: "1rem" }}>⚠️</span>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#f59e0b", margin: 0 }}>
          Čeká na tvé schválení
        </h2>
        <span style={{
          fontSize: "0.6875rem", fontWeight: 700, color: "#f59e0b",
          background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)",
          borderRadius: 4, padding: "1px 7px",
        }}>
          {events.length}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {events.map((e) => (
          <Link
            key={e.id}
            href={`/event/${e.id}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.625rem 0.875rem",
              background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 7, textDecoration: "none", color: "#ffffff",
              gap: "0.75rem", flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: 2 }}>{e.shortName}</p>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>
                {e.location} · Vlastník: {e.owner}
              </p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.65)" }}>Celkem</p>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#f59e0b" }}>{formatCZK(e.grandTotal)}</p>
            </div>
            <span style={{
              fontSize: "0.75rem", fontWeight: 700,
              color: "#f59e0b", background: "rgba(245,158,11,0.18)",
              border: "1px solid rgba(245,158,11,0.45)",
              borderRadius: 5, padding: "0.375rem 0.75rem",
              flexShrink: 0,
            }}>
              Přejít na schválení →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FinanceQueueSection({ items, isFinance, isAdmin }: {
  items: FinanceItem[]; isFinance: boolean; isAdmin: boolean;
}) {
  const total = items.reduce((s, i) => s + i.amount, 0);
  const groupLabels = { skupina1: "Skupina 1", skupina2: "Skupina 2", skupina3: "Skupina 3" };
  const showFinance = isFinance || isAdmin;
  void showFinance;

  // Sort by event short name + person
  const sorted = [...items].sort((a, b) =>
    a.eventShortName.localeCompare(b.eventShortName) ||
    a.personName.localeCompare(b.personName),
  );

  return (
    <section style={{
      marginBottom: "2rem",
      background: "rgba(220,38,38,0.05)",
      border: "1px solid rgba(220,38,38,0.25)",
      borderLeft: "4px solid #dc2626",
      borderRadius: 10, padding: "1rem 1.25rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "1rem" }}>💸</span>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#dc2626", margin: 0 }}>
          K úhradě napříč eventy
        </h2>
        <span style={{
          fontSize: "0.6875rem", fontWeight: 700, color: "#dc2626",
          background: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.4)",
          borderRadius: 4, padding: "1px 7px",
        }}>
          {items.length} {items.length === 1 ? "položka" : items.length < 5 ? "položky" : "položek"}
        </span>
        <span style={{ marginLeft: "auto", fontSize: "1.125rem", fontWeight: 700, color: "#dc2626" }}>
          {formatCZK(total)}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {sorted.map((item, i) => {
          const key = `${item.eventId}|${item.group}|${item.personName}|${item.checkpoint ?? "-"}`;
          return (
            <Link
              key={key + i}
              href={`/event/${item.eventId}/finance`}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.5rem 0.75rem",
                background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 6, textDecoration: "none", color: "#ffffff",
                fontSize: "0.8125rem", flexWrap: "wrap",
              }}
            >
              <span style={{ fontWeight: 700, minWidth: 130 }}>{item.personName}</span>
              <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem" }}>
                {item.eventShortName}
              </span>
              <span style={{
                fontSize: "0.625rem", fontWeight: 700,
                color: "rgba(255,255,255,0.65)",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 3, padding: "1px 5px",
              }}>
                {groupLabels[item.group]}{item.checkpoint ? ` · ${item.checkpoint}` : ""}
              </span>
              <span style={{ marginLeft: "auto", fontWeight: 700, color: "#dc2626" }}>
                {formatCZK(item.amount)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function SummaryCard({ label, value, highlight, suffix }: {
  label: string; value: string; highlight?: boolean; suffix?: string;
}) {
  return (
    <div
      className="atm-card"
      style={{
        borderColor: highlight ? "rgba(147,179,207,0.3)" : undefined,
        background: highlight ? "rgba(147,179,207,0.06)" : undefined,
      }}
    >
      <p style={{
        fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.1em", color: "rgba(255,255,255,0.92)", marginBottom: "0.5rem",
      }}>
        {label}
      </p>
      <p style={{
        fontSize: "1.375rem", fontWeight: 700,
        color: highlight ? "#93b3cf" : "#ffffff",
        lineHeight: 1.15,
      }}>
        {value}
        {suffix && (
          <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "rgba(255,255,255,0.92)", marginLeft: 5 }}>
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
