"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (DEV_BYPASS) {
      router.replace("/");
    }
  }, [router]);

  if (DEV_BYPASS) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--color-at-blue-v1)",
      }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>
          Dev mode — přesměrovávám…
        </p>
      </div>
    );
  }

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-at-blue-v1)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--color-at-blue-a2)",
          border: "1px solid var(--color-at-blue-v3)",
          borderRadius: 12,
          padding: "2.5rem 2rem",
          textAlign: "center",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            background: "var(--color-at-red)",
            borderRadius: 12,
            marginBottom: "1.5rem",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "1.375rem",
            fontWeight: 700,
            color: "var(--color-at-white)",
            marginBottom: "0.375rem",
          }}
        >
          Vyhodnocení odměn
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-at-blue-v5)",
            marginBottom: "2rem",
          }}
        >
          AIR&nbsp;TEAM – interní nástroj
        </p>

        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            padding: "0.75rem 1.25rem",
            background: loading
              ? "var(--color-at-blue-v3)"
              : "var(--color-at-white)",
            color: loading
              ? "var(--color-at-blue-v5)"
              : "var(--color-at-black)",
            border: "none",
            borderRadius: 8,
            fontSize: "0.9375rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            fontFamily: "inherit",
          }}
        >
          {!loading && (
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
          )}
          {loading ? "Přihlašuji…" : "Přihlásit se přes Google"}
        </button>

        <p
          style={{
            marginTop: "1.25rem",
            fontSize: "0.75rem",
            color: "var(--color-at-blue-v4)",
          }}
        >
          Přístup pouze pro @airteam.eu účty
        </p>
      </div>
    </div>
  );
}
