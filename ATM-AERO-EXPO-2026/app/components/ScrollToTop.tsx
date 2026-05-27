"use client";

import { useState, useEffect } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Zpět nahoru"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 30,
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "1px solid var(--color-at-blue-v4)",
        background: "var(--color-at-blue-v2)",
        color: "var(--color-at-white)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 220ms ease, transform 220ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "var(--color-at-blue-v3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "var(--color-at-blue-v2)";
      }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 10 8 5 13 10" />
      </svg>
    </button>
  );
}
