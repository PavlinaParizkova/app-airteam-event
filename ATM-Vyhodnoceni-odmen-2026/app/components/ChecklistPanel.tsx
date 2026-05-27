"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_CHECKLIST, type ChecklistItem, type ApprovalStatus } from "@/data/events";
import { toggleChecklistItemAction } from "@/app/actions/events";

type Props = {
  eventId: string;
  eventName: string;
  eventDateEnd: string;
  checklist: ChecklistItem[] | undefined;
  status: ApprovalStatus;
  isAdmin: boolean;
  clickupConfigured: boolean;
};

const AUTO_ITEMS: { id: string; label: string; minStatus: ApprovalStatus[] }[] = [
  { id: "_submitted", label: "Předáno ke schválení Petru Polákovi", minStatus: ["submitted", "approved", "paid"] },
  { id: "_approved",  label: "Schváleno Petrem Polákem",            minStatus: ["approved", "paid"] },
  { id: "_finance",   label: "Odesláno na finance / Vyplaceno",     minStatus: ["paid"] },
];

type CuResult = { created: { id: string; url: string; name: string }[]; errors: string[]; total: number; message?: string };

export default function ChecklistPanel({ eventId, eventName, checklist: initialChecklist, status, isAdmin, clickupConfigured }: Props) {
  const router = useRouter();
  const [items, setItems]         = useState<ChecklistItem[]>(
    () => initialChecklist ?? DEFAULT_CHECKLIST.map((i) => ({ ...i })),
  );
  const [saving, setSaving]       = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [cuLoading, setCuLoading] = useState(false);
  const [cuResult, setCuResult]   = useState<CuResult | null>(null);
  const [cuError, setCuError]     = useState<string | null>(null);
  void eventName;

  const doneCount  = items.filter((i) => i.done).length;
  const autoDone   = AUTO_ITEMS.filter((a) => a.minStatus.includes(status)).length;
  const totalCount = items.length + AUTO_ITEMS.length;
  const totalDone  = doneCount + autoDone;
  const pendingCount = items.filter((i) => !i.done).length;

  async function toggle(itemId: string, current: boolean) {
    if (!isAdmin) return;
    setSaving(itemId);
    setSaveError(null);
    const newDone = !current;
    const res = await toggleChecklistItemAction(eventId, itemId, newDone);
    if (res.ok && res.data) {
      setItems(res.data.checklist);
    } else if (!res.ok) {
      setSaveError(res.message);
      if (res.reason === "conflict") router.refresh();
    }
    setSaving(null);
  }

  async function createClickUpTasks() {
    setCuLoading(true);
    setCuResult(null);
    setCuError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/clickup-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json() as CuResult & { error?: string };
      if (!res.ok) {
        setCuError(data.error ?? "Chyba při vytváření tasků.");
      } else {
        setCuResult(data);
      }
    } catch {
      setCuError("Síťová chyba. Zkus to znovu.");
    } finally {
      setCuLoading(false);
    }
  }

  const pct = Math.round((totalDone / totalCount) * 100);

  return (
    <div>
      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 6, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#81c784" : "#507499", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: "0.8125rem", color: pct === 100 ? "#81c784" : "#93b3cf", fontWeight: 600, minWidth: 48, textAlign: "right" }}>
          {totalDone}/{totalCount}
        </span>
      </div>

      {/* Auto položky */}
      {AUTO_ITEMS.map((a) => (
        <CheckRow key={a.id} label={a.label} done={a.minStatus.includes(status)} auto />
      ))}

      {/* Manuální položky */}
      {items.map((item) => (
        <CheckRow
          key={item.id}
          label={item.label}
          done={item.done}
          doneDate={item.doneDate}
          loading={saving === item.id}
          onClick={isAdmin ? () => toggle(item.id, item.done) : undefined}
        />
      ))}

      {!isAdmin && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.85)" }}>
          Manuální položky může měnit pouze Marketing Manager.
        </p>
      )}

      {saveError && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#f87171" }}>
          {saveError}
        </p>
      )}

      {/* ── ClickUp tlačítko ─────────────────────────────────────────── */}
      {isAdmin && clickupConfigured && pendingCount > 0 && (
        <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={createClickUpTasks}
            disabled={cuLoading}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "0.5rem 1.125rem",
              background: cuLoading ? "rgba(80,116,153,0.15)" : "rgba(80,116,153,0.18)",
              border: "1px solid rgba(80,116,153,0.45)",
              borderRadius: 7, color: "#93b3cf", fontSize: "0.8125rem", fontWeight: 600,
              cursor: cuLoading ? "not-allowed" : "pointer",
              fontFamily: "inherit", opacity: cuLoading ? 0.7 : 1,
              transition: "background 0.15s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            {cuLoading ? "Vytvářím tasky…" : `Vytvořit ClickUp tasky (${pendingCount} nevyřízených)`}
          </button>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", marginTop: "0.375rem" }}>
            Vytvoří tasky pro deal follow-up s automatickým due date.
          </p>

          {/* Výsledek */}
          {cuResult && (
            <div style={{
              marginTop: "0.75rem", padding: "0.75rem 1rem",
              background: cuResult.errors.length === 0 ? "rgba(129,199,132,0.08)" : "rgba(245,158,11,0.08)",
              border: `1px solid ${cuResult.errors.length === 0 ? "rgba(129,199,132,0.25)" : "rgba(245,158,11,0.25)"}`,
              borderRadius: 7,
            }}>
              {cuResult.message ? (
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.92)" }}>{cuResult.message}</p>
              ) : (
                <>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#81c784", marginBottom: "0.5rem" }}>
                    ✓ Vytvořeno {cuResult.created.length} z {cuResult.total} tasků
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {cuResult.created.map((t) => (
                      <a key={t.id} href={t.url} target="_blank" rel="noreferrer" style={{
                        fontSize: "0.75rem", color: "#93b3cf", textDecoration: "none",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        {t.name}
                      </a>
                    ))}
                  </div>
                  {cuResult.errors.length > 0 && (
                    <p style={{ fontSize: "0.75rem", color: "#f59e0b", marginTop: "0.375rem" }}>
                      Chyby: {cuResult.errors.join(", ")}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {cuError && (
            <p style={{ fontSize: "0.8125rem", color: "#e74c3c", marginTop: "0.5rem" }}>{cuError}</p>
          )}
        </div>
      )}

      {isAdmin && !clickupConfigured && (
        <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.88)", fontStyle: "italic" }}>
          ClickUp integrace: nastav CLICKUP_API_TOKEN a CLICKUP_LIST_ID v .env.local
        </p>
      )}
    </div>
  );
}

function CheckRow({
  label, done, doneDate, auto, loading, onClick,
}: {
  label: string; done: boolean; doneDate?: string;
  auto?: boolean; loading?: boolean; onClick?: () => void;
}) {
  return (
    <div
      onClick={!auto && onClick ? onClick : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "0.5rem 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        cursor: !auto && onClick ? "pointer" : "default",
        opacity: loading ? 0.6 : 1,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
        border: `2px solid ${done ? (auto ? "#81c784" : "#507499") : "rgba(255,255,255,0.2)"}`,
        background: done ? (auto ? "rgba(129,199,132,0.15)" : "rgba(80,116,153,0.2)") : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {done && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={auto ? "#81c784" : "#93b3cf"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      <span style={{
        fontSize: "0.875rem",
        color: done ? "rgba(255,255,255,0.65)" : "#ffffff",
        textDecoration: done ? "line-through" : "none",
        flex: 1,
      }}>
        {label}
        {auto && <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", marginLeft: 6 }}>(automaticky)</span>}
      </span>
      {doneDate && (
        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", flexShrink: 0 }}>{doneDate}</span>
      )}
    </div>
  );
}
