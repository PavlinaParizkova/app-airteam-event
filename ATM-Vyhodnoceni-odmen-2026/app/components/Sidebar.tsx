"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ApprovalStatus } from "@/data/events";

export type SidebarEvent = {
  id: string;
  shortName: string;
  status: ApprovalStatus;
};

const STATUS_BADGES: Record<ApprovalStatus, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "#cbd5e1" },
  submitted: { label: "Schválit",  color: "#f59e0b" },
  approved:  { label: "OK",        color: "#81c784" },
  paid:      { label: "Hotovo",    color: "#16a34a" },
};

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const b = STATUS_BADGES[status];
  return (
    <span
      style={{
        fontSize: "0.5625rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: b.color,
        background: `${b.color}1f`,
        border: `1px solid ${b.color}55`,
        borderRadius: 3,
        padding: "1px 5px",
        marginLeft: "auto",
        flexShrink: 0,
        lineHeight: 1.2,
      }}
    >
      {b.label}
    </span>
  );
}

// ── Sdílený obsah navigace ──────────────────────────────────────────────────────

function NavContent({
  events,
  pathname,
  session,
  showAdminLink,
  onLinkClick,
}: {
  events: SidebarEvent[];
  pathname: string;
  session: ReturnType<typeof useSession>["data"];
  showAdminLink?: boolean;
  onLinkClick?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "1.125rem 1rem",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        marginBottom: "0.5rem",
      }}>
        <div style={{
          width: 30, height: 30, background: "#d51c17", borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#ffffff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            AIR TEAM
          </p>
          <p style={{ fontSize: "0.625rem", color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
            Odměny z eventů
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: "0 0.5rem", flex: 1 }}>
        <Link href="/" onClick={onLinkClick} className={`sidebar-link${pathname === "/" ? " active" : ""}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Přehled eventů
        </Link>

        <Link href="/manual" onClick={onLinkClick} className={`sidebar-link${pathname === "/manual" ? " active" : ""}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Jak fungují odměny
        </Link>

        {showAdminLink && (
          <Link
            href="/admin/pristupy"
            onClick={onLinkClick}
            className={`sidebar-link${pathname === "/admin/pristupy" ? " active" : ""}`}
            style={{ marginTop: "0.25rem", opacity: 0.85 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Přístupy (admin)
          </Link>
        )}

        {events.length > 0 && (
          <>
            <p style={{
              fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.88)",
              padding: "0.875rem 12px 0.25rem",
            }}>
              Eventy
            </p>
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                onClick={onLinkClick}
                className={`sidebar-link${pathname === `/event/${event.id}` ? " active" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                  {event.shortName}
                </span>
                <StatusBadge status={event.status} />
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      {session?.user && (
        <div style={{ padding: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" width={26} height={26} style={{ borderRadius: "50%", flexShrink: 0 }} />
            )}
            <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.72)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session.user.name}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              width: "100%", padding: "5px 10px",
              background: "transparent", border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 5, color: "rgba(255,255,255,0.92)", fontSize: "0.75rem",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Odhlásit se
          </button>
        </div>
      )}
    </>
  );
}

// ── Hlavní Sidebar komponenta ──────────────────────────────────────────────────

export default function Sidebar({
  events,
  showAdminLink = false,
}: {
  events: SidebarEvent[];
  showAdminLink?: boolean;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Zavři drawer při navigaci nebo Escape
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Zamkni scroll body když je drawer otevřený
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── DESKTOP sidebar (lg+) ─────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex"
        style={{
          width: 232, minWidth: 232,
          background: "#10253e",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          height: "100vh", position: "sticky", top: 0,
          flexDirection: "column",
          padding: "0 0 1rem",
          overflowY: "auto", overflowX: "hidden", flexShrink: 0,
        }}
      >
        <NavContent events={events} pathname={pathname} session={session} showAdminLink={showAdminLink} />
      </aside>

      {/* ── MOBILE top bar (< lg) ─────────────────────────────────────────── */}
      <header
        className="flex items-center lg:hidden"
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "#10253e",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "0 1rem",
          height: 52,
          gap: 10,
        }}
      >
        {/* Logo ikona */}
        <div style={{ width: 26, height: 26, background: "#d51c17", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff", flex: 1 }}>
          AIR TEAM – Odměny
        </span>

        {/* Hamburger tlačítko */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Zavřít menu" : "Otevřít menu"}
          style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 6, padding: "6px 8px", cursor: "pointer",
            display: "flex", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center",
            width: 36, height: 36,
          }}
        >
          {mobileOpen ? (
            /* X ikona */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            /* Hamburger ikona */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </header>

      {/* ── MOBILE drawer overlay ─────────────────────────────────────────── */}
      {mobileOpen && (
        /* Backdrop */
        <div
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 48,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Drawer panel */}
      <div
        className="lg:hidden"
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 49,
          width: 260, height: "100dvh",
          background: "#10253e",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          display: "flex", flexDirection: "column",
          padding: "0 0 1rem",
          overflowY: "auto",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: mobileOpen ? "4px 0 24px rgba(0,0,0,0.5)" : "none",
        }}
      >
        <NavContent
          events={events}
          pathname={pathname}
          session={session}
          showAdminLink={showAdminLink}
          onLinkClick={() => setMobileOpen(false)}
        />
      </div>
    </>
  );
}
