import Link from "next/link";
import type { ApprovalStatus } from "@/data/events";

/**
 * Role-aware fallback místo Next.js 404.
 *
 * Když přihlášený uživatel nemá oprávnění vidět nějakou stránku eventu (např.
 * approver chce na editor odměn draft eventu), ukážeme mu kontextový panel
 * místo „Stránka neexistuje". Vysvětlíme proč, navrhneme akci.
 */
export default function EventAccessFallback({
  eventId,
  eventShortName,
  status,
  reason,
  hint,
  action,
}: {
  eventId: string;
  eventShortName: string;
  status: ApprovalStatus;
  reason: string;
  hint?: string;
  action?: { label: string; href: string };
}) {
  const statusBadge = STATUS_BADGE[status];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 0" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderLeft: `4px solid ${statusBadge.color}`,
          borderRadius: 10,
          padding: "1.5rem 1.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            {eventShortName}
          </h1>
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: statusBadge.color,
              background: `${statusBadge.color}18`,
              border: `1px solid ${statusBadge.color}44`,
              borderRadius: 4,
              padding: "2px 8px",
            }}
          >
            {statusBadge.label}
          </span>
        </div>

        <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.92)", lineHeight: 1.55, marginBottom: hint ? "0.625rem" : "1rem" }}>
          {reason}
        </p>

        {hint && (
          <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.5, marginBottom: "1rem" }}>
            {hint}
          </p>
        )}

        <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
          <Link
            href={`/event/${eventId}`}
            style={{
              padding: "0.4rem 0.875rem",
              borderRadius: 6,
              border: "1px solid rgba(147,179,207,0.35)",
              background: "rgba(147,179,207,0.14)",
              color: "#93b3cf",
              fontSize: "0.8125rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Zpět na přehled veletrhu
          </Link>
          <Link
            href="/"
            style={{
              padding: "0.4rem 0.875rem",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
          {action && (
            <Link
              href={action.href}
              style={{
                padding: "0.4rem 0.875rem",
                borderRadius: 6,
                border: "1px solid rgba(129,199,132,0.45)",
                background: "rgba(129,199,132,0.18)",
                color: "#81c784",
                fontSize: "0.8125rem",
                fontWeight: 700,
                textDecoration: "none",
                marginLeft: "auto",
              }}
            >
              {action.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_BADGE: Record<ApprovalStatus, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "rgba(255,255,255,0.5)" },
  submitted: { label: "Ke schválení", color: "#f59e0b" },
  approved:  { label: "Schváleno",  color: "#81c784" },
  paid:      { label: "Proplaceno", color: "#16a34a" },
};
