import Link from "next/link";
import type { CSSProperties } from "react";

type Tab = "odmeny" | "finance" | "checklist";

type Props = {
  eventId: string;
  eventShortName: string;
  active: Tab;
  /** Zobrazit záložku Platební plán (admin + finance). */
  showFinanceLink?: boolean;
};

const ACTIVE_LABELS: Record<Tab, string> = {
  odmeny: "Editor odměn",
  finance: "Platební plán",
  checklist: "Checklist eventu",
};

const tabStyle = (isActive: boolean): CSSProperties => ({
  padding: "0.375rem 0.75rem",
  borderRadius: 6,
  fontSize: "0.8125rem",
  fontWeight: 600,
  textDecoration: "none",
  color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)",
  background: isActive ? "rgba(80,116,153,0.25)" : "transparent",
  border: isActive ? "1px solid rgba(80,116,153,0.45)" : "1px solid transparent",
});

export default function EventSubNav({ eventId, eventShortName, active, showFinanceLink = false }: Props) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.8125rem", marginBottom: "0.625rem" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.95)", textDecoration: "none" }}>
          Přehled
        </Link>
        <span style={{ color: "rgba(255,255,255,0.88)" }}>›</span>
        <Link
          href={`/event/${eventId}`}
          style={{ color: "rgba(255,255,255,0.95)", textDecoration: "none" }}
        >
          {eventShortName}
        </Link>
        <span style={{ color: "rgba(255,255,255,0.88)" }}>›</span>
        <span style={{ color: "#ffffff" }}>{ACTIVE_LABELS[active]}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
        <Link href={`/event/${eventId}/odmeny`} style={tabStyle(active === "odmeny")}>
          Editor odměn
        </Link>
        <Link href={`/event/${eventId}/checklist`} style={tabStyle(active === "checklist")}>
          Checklist eventu
        </Link>
        {showFinanceLink && (
          <Link href={`/event/${eventId}/finance`} style={tabStyle(active === "finance")}>
            Platební plán
          </Link>
        )}
      </div>
    </div>
  );
}
