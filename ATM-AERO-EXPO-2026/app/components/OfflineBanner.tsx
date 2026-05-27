"use client";

import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };
    const handleOnline = () => {
      setIsOffline(false);
    };

    setIsOffline(!navigator.onLine);
    if (!navigator.onLine) setWasOffline(true);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !wasOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        borderRadius: "0.5rem",
        fontSize: "0.8125rem",
        fontWeight: 500,
        whiteSpace: "nowrap",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        transition: "all 0.3s ease",
        backgroundColor: isOffline ? "#10253e" : "#153151",
        color: "#ffffff",
        border: isOffline
          ? "1px solid rgba(255,255,255,0.15)"
          : "1px solid rgba(255,255,255,0.2)",
      }}
    >
      {isOffline ? (
        <>
          <span style={{ fontSize: "1rem" }}>⚡</span>
          Offline – zobrazuji poslední uložená data. Změny se neukládají.
        </>
      ) : (
        <>
          <span style={{ fontSize: "1rem" }}>✓</span>
          Připojení obnoveno.
        </>
      )}
    </div>
  );
}
