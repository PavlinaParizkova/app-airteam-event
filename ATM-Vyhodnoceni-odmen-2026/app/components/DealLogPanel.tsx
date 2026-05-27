"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEAL_CHECKPOINTS, type DealEntry, type DealCheckpointKey, type SalesEntry } from "@/data/events";
import { addDealAction, removeDealAction } from "@/app/actions/events";

const DEAL_BONUS = 3000;

type Props = {
  eventId: string;
  salesTeam: SalesEntry[];
  dealLog: DealEntry[] | undefined;
  isAdmin: boolean;
};

type FormState = {
  personName: string;
  checkpoint: DealCheckpointKey;
  type: "order" | "aircraft";
  amountUSD: string;
  description: string;
};

const DEFAULT_FORM: FormState = {
  personName: "",
  checkpoint: "D+7",
  type: "order",
  amountUSD: "",
  description: "",
};

function formatCZK(n: number) {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(n);
}

export default function DealLogPanel({ eventId, salesTeam, dealLog: initialLog, isAdmin }: Props) {
  const router = useRouter();
  const [deals, setDeals] = useState<DealEntry[]>(initialLog ?? []);
  const [sales, setSales] = useState<SalesEntry[]>(salesTeam);
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM, personName: salesTeam[0]?.name ?? "" });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setDeals(initialLog ?? []);
  }, [initialLog]);

  useEffect(() => {
    setSales(salesTeam);
  }, [salesTeam]);

  const amountUSD = parseFloat(form.amountUSD) || 0;
  const qualifies = form.type === "aircraft" || amountUSD > 10000;

  async function addDeal() {
    if (!form.personName || !form.description) {
      setError("Vyplň jméno obchodníka a popis dealu.");
      return;
    }
    if (form.type === "order" && amountUSD <= 10000) {
      setError("Objednávka musí být nad 10 000 USD pro kvalifikaci na bonus.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await addDealAction(eventId, {
      personName: form.personName,
      checkpoint: form.checkpoint,
      type: form.type,
      amountUSD,
      description: form.description,
      bonus: qualifies ? DEAL_BONUS : 0,
    });
    if (res.ok && res.data) {
      setDeals((prev) => [...prev, res.data!.deal]);
      setForm({ ...DEFAULT_FORM, personName: form.personName });
      setShowForm(false);
      router.refresh();
    } else if (!res.ok) {
      setError(res.message);
      if (res.reason === "conflict") router.refresh();
    }
    setSaving(false);
  }

  async function removeDeal(dealId: string) {
    setDeleting(dealId);
    const res = await removeDealAction(eventId, dealId);
    if (res.ok) {
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
      router.refresh();
    } else if (res.reason === "conflict") {
      router.refresh();
    }
    setDeleting(null);
  }

  if (salesTeam.length === 0) {
    return (
      <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.875rem" }}>
        Tento event nemá Sales tým — deal tracking není relevantní.
      </p>
    );
  }

  return (
    <div>
      {/* Per-person souhrn */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.625rem", marginBottom: "1.5rem" }}>
        {sales.map((p) => {
          const personDeals = deals.filter((d) => d.personName === p.name);
          const loggedBonus = personDeals.reduce((s, d) => s + d.bonus, 0);
          return (
            <div key={p.name} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 7, padding: "0.75rem 1rem",
            }}>
              <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#ffffff", marginBottom: 3 }}>{p.name}</p>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.95)", marginBottom: 6 }}>{p.role}</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Dealy v logu:</span>
                <span style={{ fontWeight: 600, color: "#ffffff" }}>{personDeals.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Deal bonus (log):</span>
                <span style={{ fontWeight: 700, color: "#93b3cf" }}>{formatCZK(loggedBonus)}</span>
              </div>
              {p.dealBonus !== loggedBonus && (
                <div style={{ marginTop: 4, fontSize: "0.75rem", color: "rgba(255,180,80,0.8)" }}>
                  ⚠ V záznamu: {formatCZK(p.dealBonus)} (liší se, ulož KPI edit pro sync)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Deal log seřazený podle checkpointů */}
      {DEAL_CHECKPOINTS.map(({ key, label }) => {
        const cpDeals = deals.filter((d) => d.checkpoint === key);
        if (cpDeals.length === 0 && !showForm) return null;
        return (
          <div key={key} style={{ marginBottom: "1.25rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.88)", marginBottom: "0.5rem" }}>
              {label}
            </p>
            {cpDeals.length === 0 && (
              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.92)", paddingLeft: 8 }}>Zatím žádné dealy.</p>
            )}
            {cpDeals.map((deal) => (
              <DealRow
                key={deal.id}
                deal={deal}
                onDelete={isAdmin ? () => removeDeal(deal.id) : undefined}
                deleting={deleting === deal.id}
              />
            ))}
          </div>
        );
      })}

      {deals.length === 0 && !showForm && (
        <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.85)", marginBottom: "1rem" }}>
          Žádné dealy zatím nezaznamenány. Dealy se zapisují průběžně, nejprve D+7, pak každé 3 měsíce.
        </p>
      )}

      {/* Přidat deal tlačítko + formulář */}
      {isAdmin && (
        <div>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "0.5rem 1rem",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 6, color: "#ffffff", fontSize: "0.8125rem", fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Přidat deal
            </button>
          ) : (
            <DealForm
              form={form}
              onChange={setForm}
              salesNames={salesTeam.map((p) => p.name)}
              qualifies={qualifies}
              amountUSD={amountUSD}
              saving={saving}
              error={error}
              onSubmit={addDeal}
              onCancel={() => { setShowForm(false); setError(null); }}
            />
          )}
        </div>
      )}

      <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.85)" }}>
        Dle SOP: Deal bonus = 3 000 Kč za každou zaplacenou objednávku nad 10 000 USD nebo za letadlo vzniklou z kontaktu navázaného na eventu.
        Obchodník musí deal nahlásit MKT. Termíny: D+7, D+3M, D+6M, D+9M, D+12M.
      </p>
    </div>
  );
}

function DealRow({
  deal, onDelete, deleting,
}: {
  deal: DealEntry;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "0.5rem 0.75rem",
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 6, marginBottom: "0.375rem",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#ffffff" }}>{deal.personName}</span>
          <span style={{
            fontSize: "0.75rem", padding: "1px 6px",
            background: deal.type === "aircraft" ? "rgba(147,179,207,0.12)" : "rgba(255,255,255,0.07)",
            border: `1px solid ${deal.type === "aircraft" ? "rgba(147,179,207,0.25)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 3, color: deal.type === "aircraft" ? "#93b3cf" : "rgba(255,255,255,0.6)",
          }}>
            {deal.type === "aircraft" ? "Letadlo" : "Objednávka"}
          </span>
          {deal.amountUSD > 0 && (
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.92)" }}>
              ${deal.amountUSD.toLocaleString("cs-CZ")} USD
            </span>
          )}
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#93b3cf" }}>
            {formatCZK(deal.bonus)}
          </span>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.92)" }}>{deal.description}</p>
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", marginTop: 2 }}>Zaznamenáno: {deal.addedDate}</p>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          disabled={deleting}
          title="Odebrat deal"
          style={{
            padding: "3px 6px", background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4,
            color: "rgba(255,255,255,0.88)", cursor: "pointer", fontFamily: "inherit",
            fontSize: "0.75rem", flexShrink: 0, opacity: deleting ? 0.5 : 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

function DealForm({
  form, onChange, salesNames, qualifies, amountUSD,
  saving, error, onSubmit, onCancel,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
  salesNames: string[];
  qualifies: boolean;
  amountUSD: number;
  saving: boolean;
  error: string | null;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange({ ...form, [key]: e.target.value });

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8, padding: "1rem",
    }}>
      <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#ffffff", marginBottom: "0.75rem" }}>
        Nový deal
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem", marginBottom: "0.625rem" }}>
        {/* Obchodník */}
        <div>
          <label style={labelStyle}>Obchodník</label>
          <select value={form.personName} onChange={set("personName")} style={selectStyle}>
            {salesNames.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        {/* Checkpoint */}
        <div>
          <label style={labelStyle}>Termín follow-up</label>
          <select value={form.checkpoint} onChange={set("checkpoint")} style={selectStyle}>
            {DEAL_CHECKPOINTS.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        {/* Typ dealu */}
        <div>
          <label style={labelStyle}>Typ dealu</label>
          <select value={form.type} onChange={set("type")} style={selectStyle}>
            <option value="order">Objednávka (&gt;10 000 USD)</option>
            <option value="aircraft">Letadlo</option>
          </select>
        </div>
        {/* Výše v USD */}
        <div>
          <label style={labelStyle}>Výše objednávky (USD)</label>
          <input
            type="number" min={0} placeholder="např. 25000"
            value={form.amountUSD}
            onChange={set("amountUSD")}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Popis */}
      <div style={{ marginBottom: "0.75rem" }}>
        <label style={labelStyle}>Popis dealu (klient, produkt, kontext)</label>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={2}
          placeholder="Např. XY Aviation — avionika pro C172, kontakt z D+7 meetingu"
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* Kvalifikace + bonus preview */}
      <div style={{
        padding: "0.5rem 0.75rem", borderRadius: 6, marginBottom: "0.75rem",
        background: qualifies ? "rgba(129,199,132,0.08)" : "rgba(255,100,100,0.08)",
        border: `1px solid ${qualifies ? "rgba(129,199,132,0.2)" : "rgba(255,100,100,0.15)"}`,
        fontSize: "0.8125rem",
        color: qualifies ? "#81c784" : "rgba(255,150,150,0.8)",
      }}>
        {form.type === "aircraft"
          ? `Letadlo — kvalifikuje automaticky → Bonus: 3 000 Kč`
          : amountUSD > 10000
            ? `Objednávka $${amountUSD.toLocaleString()} USD → kvalifikuje → Bonus: 3 000 Kč`
            : `Objednávka musí být nad 10 000 USD (aktuálně $${amountUSD.toLocaleString() || "0"}) → nekvalifikuje`
        }
      </div>

      {error && <p style={{ fontSize: "0.8125rem", color: "#e74c3c", marginBottom: "0.625rem" }}>{error}</p>}

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={onSubmit}
          disabled={saving}
          style={{
            padding: "0.4375rem 1rem",
            background: "#507499", border: "1px solid #507499",
            borderRadius: 5, color: "#ffffff", fontSize: "0.8125rem", fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Ukládám…" : "Přidat deal"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "0.4375rem 0.875rem",
            background: "transparent", border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 5, color: "rgba(255,255,255,0.85)", fontSize: "0.8125rem",
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Zrušit
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)",
  marginBottom: "0.2rem", fontWeight: 500,
};
const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)", borderRadius: 5,
  color: "#ffffff", fontSize: "0.875rem", padding: "0.375rem 0.625rem",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};
const selectStyle: React.CSSProperties = {
  ...inputStyle,
} as React.CSSProperties;
