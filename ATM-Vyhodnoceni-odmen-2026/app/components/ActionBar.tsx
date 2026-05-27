"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApprovalStatus } from "@/data/events";
import {
  submitEventAction,
  approveEventAction,
  sendToFinanceAction,
} from "@/app/actions/events";

type Props = {
  eventId: string;
  status: ApprovalStatus;
  isAdmin: boolean;
  isApprover: boolean;
  canViewFinance?: boolean;
};

export default function ActionBar({ eventId, status, isAdmin, isApprover, canViewFinance = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const res = await submitEventAction(eventId);
    if (!res.ok) {
      setError(res.message);
      if (res.reason === "conflict") router.refresh();
    }
    setLoading(false);
  }

  async function handleApprove() {
    setLoading(true);
    setError(null);
    const res = await approveEventAction(eventId);
    if (!res.ok) {
      setError(res.message);
      if (res.reason === "conflict") router.refresh();
    }
    setLoading(false);
  }

  async function handleSendFinance() {
    if (!confirm("Označit event jako odeslaný na finance? Tím potvrzuješ, že odměny byly předány k výplatě.")) return;
    setLoading(true);
    setError(null);
    const res = await sendToFinanceAction(eventId);
    if (!res.ok) {
      setError(res.message);
      if (res.reason === "conflict") router.refresh();
    }
    setLoading(false);
  }

  const canSubmit      = isAdmin    && status === "draft";
  const canApprove     = isApprover && status === "submitted";
  const canSendFinance = isAdmin    && status === "approved";

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", alignItems: "center" }}>
      {/* Editovat KPI / Výsledky — jen admin */}
      {isAdmin && (
        <a
          href={`/event/${eventId}/edit`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "0.5rem 1rem",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 6, color: "rgba(255,255,255,0.8)", fontSize: "0.8125rem", fontWeight: 600,
            textDecoration: "none", cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit event
        </a>
      )}

      {/* Editor odměn — vždy dostupný */}
      <a
        href={`/event/${eventId}/odmeny`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "0.5rem 1rem",
          background: "rgba(80,116,153,0.15)", border: "1px solid rgba(80,116,153,0.4)",
          borderRadius: 6, color: "#93b3cf", fontSize: "0.8125rem", fontWeight: 600,
          textDecoration: "none", cursor: "pointer",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 12h6M9 15h4" />
        </svg>
        Editor odměn
      </a>

      <a
        href={`/event/${eventId}/checklist`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "0.5rem 1rem",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 6, color: "rgba(255,255,255,0.92)", fontSize: "0.8125rem", fontWeight: 600,
          textDecoration: "none", cursor: "pointer",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        Checklist eventu
      </a>

      {canViewFinance && (
        <a
          href={`/event/${eventId}/finance`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "0.5rem 1rem",
            background: "rgba(21,49,81,0.5)", border: "1px solid rgba(147,179,207,0.25)",
            borderRadius: 6, color: "rgba(255,255,255,0.92)", fontSize: "0.8125rem", fontWeight: 600,
            textDecoration: "none", cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          Platební plán
        </a>
      )}

      {canSubmit && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "0.5rem 1rem",
            background: "#507499", border: "1px solid #507499",
            borderRadius: 6, color: "#ffffff", fontSize: "0.8125rem", fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            fontFamily: "inherit",
          }}
        >
          {loading ? "Odesílám…" : "Odeslat ke schválení"}
        </button>
      )}

      {canApprove && (
        <button
          onClick={handleApprove}
          disabled={loading}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "0.5rem 1.25rem",
            background: "#2e7d32", border: "1px solid #2e7d32",
            borderRadius: 6, color: "#ffffff", fontSize: "0.8125rem", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            fontFamily: "inherit",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {loading ? "Schvaluji…" : "Schválit"}
        </button>
      )}

      {canSendFinance && (
        <button
          onClick={handleSendFinance}
          disabled={loading}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "0.5rem 1.25rem",
            background: "#153151", border: "1px solid rgba(147,179,207,0.4)",
            borderRadius: 6, color: "#93b3cf", fontSize: "0.8125rem", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            fontFamily: "inherit",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          {loading ? "Odesílám…" : "Odesláno na finance"}
        </button>
      )}

      {status === "submitted" && !canApprove && isAdmin && (
        <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Čeká na schválení Petra Poláka
        </span>
      )}

      {status === "paid" && (
        <span style={{ fontSize: "0.8125rem", color: "#93b3cf", display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Odesláno na finance · Vyplaceno
        </span>
      )}

      {error && (
        <span style={{ fontSize: "0.8125rem", color: "#e74c3c" }}>{error}</span>
      )}
    </div>
  );
}
