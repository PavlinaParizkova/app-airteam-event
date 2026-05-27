import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuth } from "@/app/lib/getAuth";
import { getEventFromKV } from "@/app/lib/kv";
import { listAudit, type AuditAction, type AuditEntry } from "@/app/lib/audit";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit eventu | AIR TEAM" };

const ACTION_LABELS: Record<AuditAction, { label: string; color: string }> = {
  "create":            { label: "Vytvořen",          color: "#93b3cf" },
  "update-meta":       { label: "Metadata",          color: "#cbd5e1" },
  "update-team":       { label: "Tým",               color: "#a3e635" },
  "update-approvals":  { label: "Souhlasy",          color: "#fbbf24" },
  "update-checklist":  { label: "Checklist",         color: "#60a5fa" },
  "update-results":    { label: "Výsledky",          color: "#c084fc" },
  "update-deallog":    { label: "Deal log",          color: "#34d399" },
  "update-kpitracking":{ label: "KPI tracking",      color: "#f472b6" },
  "submit":            { label: "Odeslán schválit",  color: "#f59e0b" },
  "approve":           { label: "Schválen",          color: "#22c55e" },
  "send-to-finance":   { label: "Na finance",        color: "#3b82f6" },
  "toggle-finance":    { label: "Finance flag",      color: "#fde047" },
  "toggle-paid":       { label: "Proplaceno flag",   color: "#10b981" },
  "set-payment-type":  { label: "Způsob platby",     color: "#f97316" },
  "delete":            { label: "Smazán",            color: "#ef4444" },
};

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("cs-CZ", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "Europe/Prague",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ActionBadge({ action }: { action: AuditAction }) {
  const a = ACTION_LABELS[action] ?? { label: action, color: "#94a3b8" };
  return (
    <span style={{
      fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.04em",
      color: a.color, background: `${a.color}1f`, border: `1px solid ${a.color}55`,
      borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap",
    }}>
      {a.label}
    </span>
  );
}

export default async function AdminAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAuth();
  if (!session?.user?.isAdmin) {
    notFound();
  }

  const { id } = await params;
  const [event, entries] = await Promise.all([
    getEventFromKV(id),
    listAudit(id, 200),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <Link
        href={`/event/${id}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: "0.8125rem", color: "#93b3cf",
          textDecoration: "none", marginBottom: "1rem",
        }}
      >
        ← Zpět na event
      </Link>

      <p style={{
        fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "#93b3cf", marginBottom: "0.375rem",
      }}>
        Pouze admin
      </p>
      <h1 style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", fontWeight: 700, marginBottom: "0.5rem" }}>
        Audit — {event.shortName}
      </h1>
      <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.92)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
        Posledních {entries.length} změn na eventu. Záznam je append-only.
      </p>

      {entries.length === 0 ? (
        <div className="atm-card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "rgba(255,255,255,0.92)" }}>Zatím žádné záznamy.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {entries.map((e: AuditEntry) => (
            <AuditRow key={e.id} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  return (
    <details
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: "0.625rem 0.875rem",
      }}
    >
      <summary
        style={{
          listStyle: "none",
          cursor: "pointer",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", minWidth: 130 }}>
          {formatWhen(entry.at)}
        </span>
        <ActionBadge action={entry.action} />
        <span style={{ fontSize: "0.8125rem", color: "#ffffff", fontWeight: 600 }}>
          {entry.who.name}
        </span>
        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
          {entry.who.email}
        </span>
        {entry.detail && (
          <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.85)", flex: 1, minWidth: 200 }}>
            {entry.detail}
          </span>
        )}
        {(entry.before !== undefined || entry.after !== undefined) && (
          <span style={{ fontSize: "0.6875rem", color: "#93b3cf", marginLeft: "auto" }}>
            Detail ▾
          </span>
        )}
      </summary>
      {(entry.before !== undefined || entry.after !== undefined) && (
        <div style={{ marginTop: "0.625rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <DiffBlock label="Před" data={entry.before} />
          <DiffBlock label="Po" data={entry.after} />
        </div>
      )}
    </details>
  );
}

function DiffBlock({ label, data }: { label: string; data: unknown }) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 6, padding: "0.5rem 0.625rem",
      fontFamily: "monospace", fontSize: "0.75rem",
      maxHeight: 280, overflow: "auto",
    }}>
      <p style={{
        fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 4,
      }}>
        {label}
      </p>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "rgba(255,255,255,0.85)" }}>
        {data === undefined ? "—" : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
