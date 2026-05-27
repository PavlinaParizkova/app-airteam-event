"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-at-blue-v1)",
        padding: "24px",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", width: "100%", maxWidth: 400, textAlign: "center" }}>
        {/* AIR TEAM wordmark */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 3, height: 22, borderRadius: 2, background: "var(--color-at-red)" }} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-at-blue-a5)",
            }}
          >
            AIR TEAM
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--color-at-blue)",
            border: "1px solid var(--color-at-blue-v2)",
            borderRadius: 12,
            padding: "36px 32px",
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "var(--color-at-white)",
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            AIR TEAM × AERO EXPO 2026
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-at-blue-v5)", margin: "0 0 32px" }}>
            Přihlas se firemním Google účtem (povolené domény v Google Workspace, výchozí @airteam.eu).
          </p>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: "10px 14px",
                borderRadius: 6,
                background: "rgba(213,28,23,0.12)",
                border: "1px solid rgba(213,28,23,0.35)",
                fontSize: 13,
                color: "var(--color-at-white)",
                textAlign: "left",
              }}
            >
              {error === "AccessDenied"
                ? "Tento účet není z povolené domény. Použij firemní Google (např. @airteam.eu) nebo kontaktuj organizátora."
                : "Přihlášení se nezdařilo. Zkus to znovu."}
            </div>
          )}

          {/* Google Sign-In button */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              width: "100%",
              padding: "13px 20px",
              background: "#ffffff",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              color: "#1d1d1b",
              cursor: "pointer",
              transition: "opacity 200ms",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {/* Google logo SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Přihlásit se přes Google
          </button>
        </div>

        <p
          style={{
            marginTop: 24,
            fontSize: 11,
            color: "var(--color-at-blue-v4)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Friedrichshafen · 22.–25. 4. 2026
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
