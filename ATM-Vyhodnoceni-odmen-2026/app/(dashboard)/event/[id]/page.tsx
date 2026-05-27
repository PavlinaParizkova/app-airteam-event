import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuth, canAccessFinancePlan } from "@/app/lib/getAuth";
import { getEventFromKV } from "@/app/lib/kv";
import ActionBar from "@/app/components/ActionBar";
import EventAccessFallback from "@/app/components/EventAccessFallback";
import {
  STATUS_COLORS, getPaidStatusLabel,
  formatCZK, formatDate,
  DEAL_CHECKPOINTS,
  type SalesEntry, type NesalesEntry, type PrepEntry, type DealApproval,
} from "@/data/events";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventFromKV(id);
  if (!event) return {};
  return { title: `${event.shortName} – Odměny | AIR TEAM` };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, getAuth()]);
  const event = await getEventFromKV(id);
  if (!event) notFound();

  const isAdmin    = session?.user?.isAdmin    ?? false;
  const isApprover = session?.user?.isApprover ?? false;
  const isFinance  = session?.user?.isFinance  ?? false;
  const memberName = session?.user?.name ?? null;
  const isTeamMember = !!memberName && (
    event.salesTeam.some((p) => p.name === memberName) ||
    event.nesalesTeam.some((p) => p.name === memberName) ||
    event.prepTeam.some((p) => p.name === memberName)
  );

  // Role-aware viditelnost stránky:
  //  draft     → jen admin
  //  submitted → admin, approver, team member (jen ti, kdo jsou v eventu)
  //  approved  → všichni přihlášení
  //  paid      → všichni přihlášení
  const canSee =
    isAdmin ||
    event.status === "approved" ||
    event.status === "paid" ||
    (event.status === "submitted" && (isApprover || isTeamMember || isFinance));

  if (!canSee) {
    return (
      <EventAccessFallback
        eventId={event.id}
        eventShortName={event.shortName}
        status={event.status}
        reason={
          event.status === "draft"
            ? "Tento veletrh je ještě v draftu — admin marketingu na něm pracuje."
            : "Tento veletrh ještě nebyl uvolněn k zobrazení tvé roli."
        }
        hint="Jakmile bude veletrh schválen, uvidíš ho automaticky v přehledu."
      />
    );
  }

  const salesTotal   = event.salesTeam.reduce((s, p) => s + p.total, 0);
  const nesalesTotal = event.nesalesTeam.reduce((s, p) => s + p.total, 0);
  const prepTotal    = event.prepTeam.reduce((s, p) => s + p.bonus, 0);

  return (
    <div style={{ maxWidth: 860 }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: "1.25rem", fontSize: "0.8125rem" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.95)" }}>Přehled</Link>
        <span style={{ color: "rgba(255,255,255,0.88)" }}>›</span>
        <span style={{ color: "#ffffff" }}>{event.shortName}</span>
      </div>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(80,116,153,0.2) 0%, rgba(21,49,81,0.55) 100%)",
        border: "1px solid rgba(147,179,207,0.2)",
        borderRadius: 12, padding: "1.5rem 1.75rem", marginBottom: "1.25rem",
        display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: "0.375rem" }}>
            <h1 style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)", fontWeight: 700 }}>{event.name}</h1>
            <span className="status-badge" style={{
              background: STATUS_COLORS[event.status] + "22",
              color: STATUS_COLORS[event.status],
              border: `1px solid ${STATUS_COLORS[event.status]}44`,
            }}>
              {getPaidStatusLabel(event)}
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.95)", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span>{event.location}</span>
            <span style={{ color: "rgba(255,255,255,0.95)" }}>|</span>
            <span>{formatDate(event.dateStart)} – {formatDate(event.dateEnd)}</span>
            <span style={{ color: "rgba(255,255,255,0.95)" }}>|</span>
            <span>Zpracováno: {formatDate(event.processedDate)}</span>
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.88)", marginBottom: 3 }}>
            Celkem odměny
          </p>
          <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#93b3cf", lineHeight: 1 }}>
            {formatCZK(event.grandTotal)}
          </p>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.88)", marginTop: 4 }}>
            Fix {formatCZK(event.fixTotal)} · Var {formatCZK(event.variableTotal)}
          </p>
        </div>
      </div>

      {/* ActionBar */}
      <div style={{ marginBottom: "1.75rem" }}>
        <ActionBar
          eventId={event.id}
          status={event.status}
          isAdmin={isAdmin}
          isApprover={isApprover}
          canViewFinance={canAccessFinancePlan(session)}
        />
      </div>

      {/* Event results (optional) */}
      {event.eventResults && event.eventResults.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <SectionLabel>Výsledky eventu</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.5rem" }}>
            {event.eventResults.map((r) => (
              <div key={r.label} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 7, padding: "0.75rem 0.875rem",
                display: "flex", flexDirection: "column", gap: 4,
              }}>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.95)", lineHeight: 1.3 }}>{r.label}</span>
                <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === CHECKLIST ODMĚN === */}
      <div style={{ marginBottom: "2.5rem" }}>
        <SectionLabel>Odměny týmu</SectionLabel>

        {/* Skupina 1 – Sales */}
        {event.salesTeam.length > 0 && (
          <TableGroup
            label="Skupina 1"
            accent="#6b9cc2"
            total={salesTotal}
            headers={["", "Dny"]}
            cols="38px 1fr auto auto"
          >
            {event.salesTeam.map((p) => (
              <SalesRow
                key={p.name}
                person={p}
                dealApprovals={(event.dealApprovals ?? []).filter((d) => d.personName === p.name)}
              />
            ))}
          </TableGroup>
        )}

        {/* Skupina 2 – Nesales */}
        {event.nesalesTeam.length > 0 && (
          <TableGroup
            label="Skupina 2"
            accent="#4a7fa8"
            total={nesalesTotal}
            headers={["Dny"]}
            cols="38px 1fr auto"
          >
            {event.nesalesTeam.map((p) => (
              <NesalesRow key={p.name} person={p} />
            ))}
          </TableGroup>
        )}

        {/* Skupina 3 – Prep (tabulkový přehled) */}
        {event.prepTeam.length > 0 && (
          <TableGroup
            label={event.prepTeamLabel ?? "Skupina 3"}
            accent="#4a6a84"
            total={prepTotal}
            note={event.prepTeamNote}
            headers={["Hodiny CU"]}
            cols="38px 1fr auto"
          >
            {event.prepTeam.map((p) => (
              <PrepRow key={p.name} person={p} />
            ))}
          </TableGroup>
        )}
      </div>

      {/* === SCHVÁLENÍ === */}
      <div style={{ marginBottom: "2rem" }}>
        <SectionLabel>Schválení</SectionLabel>
        {event.approvalNote && (
          <p style={{
            fontSize: "0.875rem", color: "rgba(255,255,255,0.92)",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderLeft: "3px solid rgba(147,179,207,0.4)",
            borderRadius: 6, padding: "0.625rem 0.875rem", marginBottom: "0.875rem",
          }}>{event.approvalNote}</p>
        )}
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.875rem" }}>
          Deadline schválení:{" "}
          <strong style={{ color: "#ffffff" }}>{formatDate(event.approvalDeadline)}</strong>
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
          {event.approvers.map((a) => (
            <div key={a.name + a.role} style={{
              background: a.signed ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${a.signed ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.09)"}`,
              borderRadius: 8, padding: "0.75rem 1rem",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: "1.125rem" }}>{a.signed ? "✓" : "○"}</span>
              <div>
                <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: a.signed ? "#81c784" : "#ffffff" }}>{a.name}</p>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.92)" }}>{a.role}{a.date ? ` · ${formatDate(a.date)}` : ""}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.75rem", color: "rgba(255,255,255,0.88)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem" }}>
        <span>
          {event.name} · {event.division} · Vlastník: {event.owner} · {event.processedDate}
          {event.lastModified && event.lastModified !== event.processedDate && (
            <> · Naposledy upraveno: {event.lastModified}</>
          )}
        </span>
        {isAdmin && (
          <Link
            href={`/admin/audit/${event.id}`}
            style={{ color: "#93b3cf", textDecoration: "none" }}
          >
            🔍 Audit log
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Skupinový tabulkový kontejner ─────────────────────────────────────────────

function TableGroup({ label, accent, total, note, headers, cols, children }: {
  label: string; accent: string; total: number; note?: string;
  headers: string[]; cols: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* Nadpis skupiny */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "0.5rem", paddingBottom: "0.625rem",
        borderBottom: `2px solid ${accent}66`,
      }}>
        <span style={{ fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ffffff" }}>
          {label}
        </span>
      </div>
      {note && (
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.88)", marginBottom: "0.5rem", fontStyle: "italic" }}>{note}</p>
      )}
      {/* Záhlaví sloupců */}
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: "0.75rem", padding: "0 1rem 0.375rem", alignItems: "center" }}>
        <div /><div />
        {headers.map((h) => (
          <p key={h} style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.92)", textAlign: "center", whiteSpace: "nowrap" }}>{h}</p>
        ))}
      </div>
      {/* Řádky */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {children}
      </div>
    </div>
  );
}

// ── Řádky osob ────────────────────────────────────────────────────────────────

function SalesRow({ person: p, dealApprovals }: { person: SalesEntry; dealApprovals: DealApproval[] }) {
  const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const daysLabel = `${p.days} ${p.days === 1 ? "den" : p.days < 5 ? "dny" : "dní"}`;
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderLeft: "3px solid #507499", borderRadius: 8, padding: "0.75rem 1rem",
      display: "grid", gridTemplateColumns: "38px 1fr auto auto", alignItems: "center", gap: "0.75rem",
    }}>
      <Avatar initials={initials} color="#507499" />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#ffffff", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.92)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.role}</p>
        {p.comment && <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.85)", fontStyle: "italic", marginTop: 2 }}>{p.comment}</p>}
      </div>
      <DealDots checkpoints={DEAL_CHECKPOINTS} dealApprovals={dealApprovals} />
      <StatCell label="Dny" value={daysLabel} />
    </div>
  );
}

// ── Deal semaforové kroužky ────────────────────────────────────────────────────

function DealDots({ checkpoints, dealApprovals }: {
  checkpoints: typeof DEAL_CHECKPOINTS;
  dealApprovals: DealApproval[];
}) {
  if (dealApprovals.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
      {checkpoints.map((cp) => {
        const d = dealApprovals.find((a) => a.checkpoint === cp.key);
        const color = !d || (!d.schvaleno && !d.proplaceno)
          ? "#e74c3c"
          : d.proplaceno
          ? "#22c55e"
          : "#f59e0b";
        const isEvaluated = d && (d.schvaleno || d.proplaceno);
        const title = !isEvaluated
          ? `${cp.key} — nevyhodnoceno`
          : d?.proplaceno
          ? `${cp.key} — vyhodnoceno`
          : `${cp.key} — vyhodnoceno, čeká platbu`;
        return (
          <div key={cp.key} title={title} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: `${color}22`,
              border: `2px solid ${color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {color === "#22c55e" ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: `${color}cc`, letterSpacing: "0.02em", lineHeight: 1 }}>{cp.key}</span>
          </div>
        );
      })}
    </div>
  );
}

function NesalesRow({ person: p }: { person: NesalesEntry }) {
  const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const daysLabel = `${p.days} ${p.days === 1 ? "den" : p.days < 5 ? "dny" : "dní"}`;
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderLeft: "3px solid #23517c", borderRadius: 8, padding: "0.75rem 1rem",
      display: "grid", gridTemplateColumns: "38px 1fr auto", alignItems: "center", gap: "0.75rem",
    }}>
      <Avatar initials={initials} color="#23517c" />
      <NameCell name={p.name} role={p.role} note={p.comment} />
      <StatCell label="Dny" value={daysLabel} />
    </div>
  );
}

function PrepRow({ person: p }: { person: PrepEntry }) {
  const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderLeft: "3px solid #2b4156", borderRadius: 8, padding: "0.75rem 1rem",
      display: "grid", gridTemplateColumns: "38px 1fr auto", alignItems: "center", gap: "0.75rem",
    }}>
      <Avatar initials={initials} color="#2b4156" />
      <NameCell name={p.name} role={p.role} note={p.comment} />
      <StatCell label="Hodiny CU" value={p.hoursNumeric > 0 ? `${p.hoursNumeric} h` : "–"} />
    </div>
  );
}

// ── Sdílené sub-komponenty tabulkových řádků ───────────────────────────────────

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div style={{
      width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
      background: `${color}33`, border: `1px solid ${color}66`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.75rem", fontWeight: 700, color: "#ffffff",
    }}>
      {initials}
    </div>
  );
}

function NameCell({ name, role, note }: {
  name: string; role: string; note?: string;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#ffffff", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
      <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.92)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{role}</p>
      {note && <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.85)", fontStyle: "italic", marginTop: 2 }}>{note}</p>}
    </div>
  );
}

function TotalCell({ value }: { value: string }) {
  return (
    <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: "0.75rem", borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
      <p style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.88)", marginBottom: 2 }}>Celkem</p>
      <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#93b3cf" }}>{value}</p>
    </div>
  );
}

function StatCell({ label, value, accent, gold }: { label: string; value: string; accent?: boolean; gold?: boolean }) {
  const color = gold ? "#ffd700" : accent ? "#93b3cf" : "rgba(255,255,255,0.65)";
  return (
    <div style={{ textAlign: "center", minWidth: 52 }}>
      <p style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: "0.875rem", fontWeight: 700, color, whiteSpace: "nowrap" }}>{value}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.92)",
      marginBottom: "0.875rem", paddingBottom: "0.5rem",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    }}>
      {children}
    </p>
  );
}
