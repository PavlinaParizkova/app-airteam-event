"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calcEventTotals } from "@/app/lib/calc";
import {
  formatCZK,
  type EventData,
  type SalesEntry,
  type NesalesEntry,
  type PrepEntry,
  type Approver,
  type EventResult,
  type KpiBand,
} from "@/data/events";

// ── Výchozí KPI pásma (fixní pro všechny eventy) ─────────────────────────────
const DEFAULT_KPI_BANDS: KpiBand[] = [
  { label: "1–24 b.",  minPoints: 1,   maxPoints: 24,  bonus: 1000 },
  { label: "25–49 b.", minPoints: 25,  maxPoints: 49,  bonus: 2000 },
  { label: "50–74 b.", minPoints: 50,  maxPoints: 74,  bonus: 3000 },
  { label: "75–99 b.", minPoints: 75,  maxPoints: 99,  bonus: 4000 },
  { label: "100 b.",   minPoints: 100, maxPoints: 100, bonus: 5000 },
  { label: "KPI MAX",  minPoints: 101, maxPoints: 150, bonus: 5000 },
];

// ── Slugifikace ID ────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateId(name: string, dateStart: string): string {
  const slug = slugify(name);
  const year = dateStart ? dateStart.slice(0, 4) : new Date().getFullYear();
  return `${slug}-${year}`.replace(/-+/g, "-").replace(/-\d{4}-\d{4}$/, `-${year}`);
}

// ── Prázdné řádky týmu ────────────────────────────────────────────────────────
const emptySales   = (): Omit<SalesEntry, "fixAmount" | "kpiBonus" | "kpiDetails" | "total"> & { days: number } =>
  ({ name: "", role: "", days: 1, dealBonus: 0 });
const emptyNesales = (): Omit<NesalesEntry, "fixAmount" | "kpiBonus" | "total" | "kpiDetails"> & { days: number } =>
  ({ name: "", role: "", days: 1, kpiTotal: 0 });
const emptyPrep    = (): Pick<PrepEntry, "name" | "role" | "hoursRaw" | "hoursNumeric" | "band" | "bonus"> =>
  ({ name: "", role: "", hoursRaw: "0", hoursNumeric: 0, band: "0", bonus: 0 });

// ── Stylové konstanty ─────────────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: "1.25rem 1.5rem",
  marginBottom: "1.5rem",
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: "0.625rem",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.92)",
  marginBottom: "0.875rem",
};

const INPUT: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 7,
  color: "#fff",
  fontSize: "0.9375rem",
  padding: "0.5rem 0.75rem",
  width: "100%",
  boxSizing: "border-box" as const,
};

const LABEL: React.CSSProperties = {
  fontSize: "0.8125rem",
  color: "rgba(255,255,255,0.5)",
  marginBottom: "0.25rem",
  display: "block",
};

const BTN_SECONDARY: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 7,
  color: "rgba(255,255,255,0.7)",
  fontSize: "0.8125rem",
  padding: "0.375rem 0.75rem",
  cursor: "pointer",
};

const BTN_DANGER: React.CSSProperties = {
  ...BTN_SECONDARY,
  color: "rgba(255,100,100,0.7)",
  border: "1px solid rgba(255,100,100,0.2)",
};

// ── Hlavní komponenta ─────────────────────────────────────────────────────────
export default function NewEventClient() {
  const router = useRouter();

  // Základní info
  const [name, setName]                   = useState("");
  const [shortName, setShortName]         = useState("");
  const [location, setLocation]           = useState("");
  const [dateStart, setDateStart]         = useState("");
  const [dateEnd, setDateEnd]             = useState("");
  const [owner, setOwner]                 = useState("Pavlína Pařízková");
  const [division, setDivision]           = useState("AIR TEAM (01)");
  const [approvalDeadline, setApprovalDeadline] = useState("");
  const [dailyRateSales, setDailyRateSales]     = useState(2000);
  const [dailyRateNesales, setDailyRateNesales] = useState(2000);
  const [dealBonusNote, setDealBonusNote]       = useState("");
  const [kpiApprover, setKpiApprover]           = useState("Pavlína Pařízková");
  const [prepTeamNote, setPrepTeamNote]         = useState("");

  // Týmy
  type SalesRowState   = { name: string; role: string; days: number; dealBonus: number };
  type NesalesRowState = { name: string; role: string; days: number; kpiTotal: number };
  type PrepRowState    = { name: string; role: string; hoursRaw: string; hoursNumeric: number; band: PrepEntry["band"]; bonus: number };

  const [salesRows,   setSalesRows]   = useState<SalesRowState[]>([]);
  const [nesalesRows, setNesalesRows] = useState<NesalesRowState[]>([]);
  const [prepRows,    setPrepRows]    = useState<PrepRowState[]>([]);

  // Schvalovatelé
  const [approvers, setApprovers] = useState<Approver[]>([
    { role: "Event lead / Marketing", name: "Pavlína Pařízková", signed: false },
    { role: "CEO",                     name: "Petr Polák",        signed: false },
  ]);

  // Event results
  const [results, setResults] = useState<EventResult[]>([]);

  // Stav odesílání
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // ── Výpočet náhledu ───────────────────────────────────────────────────────
  function buildPreviewEvent(): EventData {
    const sales: SalesEntry[] = salesRows.map((r) => ({
      name: r.name, role: r.role, days: r.days,
      fixAmount: 0,
      dealBonus: r.dealBonus, kpiBonus: 0, kpiDetails: [],
      total: r.dealBonus,
    }));
    const nesales: NesalesEntry[] = nesalesRows.map((r) => ({
      name: r.name, role: r.role, days: r.days,
      fixAmount: r.days * dailyRateNesales,
      kpiBonus: 0, total: r.days * dailyRateNesales,
      kpiTotal: r.kpiTotal, kpiDetails: [],
    }));
    const prep: PrepEntry[] = prepRows.map((r) => ({
      name: r.name, role: r.role,
      hoursRaw: r.hoursRaw, hoursNumeric: r.hoursNumeric,
      band: r.band, bonus: r.bonus,
    }));
    const ev: EventData = {
      id: "", name, shortName, location, dateStart, dateEnd,
      processedDate: new Date().toISOString().slice(0, 10),
      owner, division, approvalDeadline, status: "draft",
      dailyRateSales, dailyRateNesales,
      salesTeam: sales, nesalesTeam: nesales, prepTeam: prep,
      kpiBands: DEFAULT_KPI_BANDS, kpiApprover,
      prepBands: [], approvers,
      dealBonusNote, prepTeamNote,
      eventResults: results.filter((r) => r.label && r.value),
      grandTotal: 0, fixTotal: 0, variableTotal: 0,
    };
    const t = calcEventTotals(ev);
    ev.grandTotal = t.grandTotal; ev.fixTotal = t.fixTotal; ev.variableTotal = t.variableTotal;
    return ev;
  }

  // ── Uložení ───────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setError(null);
    if (!name || !dateStart || !dateEnd) {
      setError("Vyplň povinná pole: Název, Datum od, Datum do."); return;
    }
    const ev = buildPreviewEvent();
    ev.id = generateId(name, dateStart);
    setSaving(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ev),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Chyba při ukládání.");
      }
      const saved: EventData = await res.json();
      router.push(`/event/${saved.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Neznámá chyba.");
      setSaving(false);
    }
  }

  const preview = buildPreviewEvent();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 860 }}>

      {/* ── Základní informace ── */}
      <div style={CARD}>
        <p style={SECTION_LABEL}>Základní informace</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
          <Field label="Název eventu *" style={{ gridColumn: "1 / -1" }}>
            <input style={INPUT} value={name} onChange={(e) => setName(e.target.value)}
              placeholder="např. AERO EXPO 2027 – Friedrichshafen" />
          </Field>
          <Field label="Zkrácený název">
            <input style={INPUT} value={shortName} onChange={(e) => setShortName(e.target.value)}
              placeholder="např. AERO EXPO 2027" />
          </Field>
          <Field label="Místo konání">
            <input style={INPUT} value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="např. Friedrichshafen, Německo" />
          </Field>
          <Field label="Datum od *">
            <input style={INPUT} type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
          </Field>
          <Field label="Datum do *">
            <input style={INPUT} type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          </Field>
          <Field label="Deadline schválení">
            <input style={INPUT} type="date" value={approvalDeadline}
              onChange={(e) => setApprovalDeadline(e.target.value)} />
          </Field>
          <Field label="Owner">
            <input style={INPUT} value={owner} onChange={(e) => setOwner(e.target.value)} />
          </Field>
          <Field label="Divize">
            <select style={{ ...INPUT, appearance: "none" }} value={division}
              onChange={(e) => setDivision(e.target.value)}>
              {[
                "AIR TEAM (01)", "Smart Supply (02)", "Upgrade (03)", "ATS Servis (04)",
                "Intel (05)", "PilotStyle (06)", "Aerospec (07)", "ATH Holding (08)",
                "HR (09)", "Jet Concept (10)",
              ].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {/* ── Denní sazby ── */}
      <div style={CARD}>
        <p style={SECTION_LABEL}>Denní sazby</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
          <Field label="Denní sazba — Obchodník (Kč)">
            <input style={INPUT} type="number" min={0} step={500} value={dailyRateSales}
              onChange={(e) => setDailyRateSales(Number(e.target.value))} />
          </Field>
          <Field label="Denní sazba — Podpůrná role (Kč)">
            <input style={INPUT} type="number" min={0} step={500} value={dailyRateNesales}
              onChange={(e) => setDailyRateNesales(Number(e.target.value))} />
          </Field>
        </div>
      </div>

      {/* ── Sales tým ── */}
      <div style={CARD}>
        <p style={SECTION_LABEL}>Obchodníci — Skupina 1</p>
        {salesRows.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 80px 120px 28px", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "end" }}>
            <Field label={i === 0 ? "Jméno" : undefined}>
              <input style={INPUT} value={row.name} placeholder="Jméno"
                onChange={(e) => { const r = [...salesRows]; r[i] = { ...r[i], name: e.target.value }; setSalesRows(r); }} />
            </Field>
            <Field label={i === 0 ? "Role" : undefined}>
              <input style={INPUT} value={row.role} placeholder="Pozice"
                onChange={(e) => { const r = [...salesRows]; r[i] = { ...r[i], role: e.target.value }; setSalesRows(r); }} />
            </Field>
            <Field label={i === 0 ? "Dny" : undefined}>
              <input style={INPUT} type="number" min={1} value={row.days}
                onChange={(e) => { const r = [...salesRows]; r[i] = { ...r[i], days: Number(e.target.value) }; setSalesRows(r); }} />
            </Field>
            <Field label={i === 0 ? "Deal bonus (Kč)" : undefined}>
              <input style={INPUT} type="number" min={0} step={1000} value={row.dealBonus}
                onChange={(e) => { const r = [...salesRows]; r[i] = { ...r[i], dealBonus: Number(e.target.value) }; setSalesRows(r); }} />
            </Field>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 1 }}>
              <button style={BTN_DANGER} onClick={() => setSalesRows(salesRows.filter((_, j) => j !== i))}>×</button>
            </div>
          </div>
        ))}
        <button style={BTN_SECONDARY} onClick={() => setSalesRows([...salesRows, emptySales()])}>
          + Přidat obchodníka
        </button>
        {salesRows.length > 0 && (
          <Field label="Poznámka k deal bonusu" style={{ marginTop: "0.75rem" }}>
            <input style={INPUT} value={dealBonusNote} onChange={(e) => setDealBonusNote(e.target.value)}
              placeholder="Volitelný komentář k deal bonusu" />
          </Field>
        )}
      </div>

      {/* ── Podpůrné role ── */}
      <div style={CARD}>
        <p style={SECTION_LABEL}>Podpůrné role — Skupina 2</p>
        {nesalesRows.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 80px 80px 28px", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "end" }}>
            <Field label={i === 0 ? "Jméno" : undefined}>
              <input style={INPUT} value={row.name} placeholder="Jméno"
                onChange={(e) => { const r = [...nesalesRows]; r[i] = { ...r[i], name: e.target.value }; setNesalesRows(r); }} />
            </Field>
            <Field label={i === 0 ? "Role" : undefined}>
              <input style={INPUT} value={row.role} placeholder="Pozice"
                onChange={(e) => { const r = [...nesalesRows]; r[i] = { ...r[i], role: e.target.value }; setNesalesRows(r); }} />
            </Field>
            <Field label={i === 0 ? "Dny" : undefined}>
              <input style={INPUT} type="number" min={1} value={row.days}
                onChange={(e) => { const r = [...nesalesRows]; r[i] = { ...r[i], days: Number(e.target.value) }; setNesalesRows(r); }} />
            </Field>
            <Field label={i === 0 ? "KPI body" : undefined}>
              <input style={INPUT} type="number" min={0} max={150} value={row.kpiTotal}
                onChange={(e) => { const r = [...nesalesRows]; r[i] = { ...r[i], kpiTotal: Number(e.target.value) }; setNesalesRows(r); }} />
            </Field>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 1 }}>
              <button style={BTN_DANGER} onClick={() => setNesalesRows(nesalesRows.filter((_, j) => j !== i))}>×</button>
            </div>
          </div>
        ))}
        <button style={BTN_SECONDARY} onClick={() => setNesalesRows([...nesalesRows, emptyNesales()])}>
          + Přidat podpůrnou roli
        </button>
        {nesalesRows.length > 0 && (
          <Field label="KPI approver" style={{ marginTop: "0.75rem" }}>
            <input style={INPUT} value={kpiApprover} onChange={(e) => setKpiApprover(e.target.value)} />
          </Field>
        )}
      </div>

      {/* ── Přípravný tým ── */}
      <div style={CARD}>
        <p style={SECTION_LABEL}>Přípravný tým — Skupina 3</p>
        {prepRows.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 80px 80px 28px", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "end" }}>
            <Field label={i === 0 ? "Jméno" : undefined}>
              <input style={INPUT} value={row.name} placeholder="Jméno"
                onChange={(e) => { const r = [...prepRows]; r[i] = { ...r[i], name: e.target.value }; setPrepRows(r); }} />
            </Field>
            <Field label={i === 0 ? "Role" : undefined}>
              <input style={INPUT} value={row.role} placeholder="Pozice"
                onChange={(e) => { const r = [...prepRows]; r[i] = { ...r[i], role: e.target.value }; setPrepRows(r); }} />
            </Field>
            <Field label={i === 0 ? "Hodiny" : undefined}>
              <input style={INPUT} type="number" min={0} value={row.hoursNumeric}
                onChange={(e) => {
                  const h = Number(e.target.value);
                  const r = [...prepRows];
                  r[i] = { ...r[i], hoursNumeric: h, hoursRaw: String(h) };
                  setPrepRows(r);
                }} />
            </Field>
            <Field label={i === 0 ? "Bonus (Kč)" : undefined}>
              <input style={INPUT} type="number" min={0} step={500} value={row.bonus}
                onChange={(e) => { const r = [...prepRows]; r[i] = { ...r[i], bonus: Number(e.target.value) }; setPrepRows(r); }} />
            </Field>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 1 }}>
              <button style={BTN_DANGER} onClick={() => setPrepRows(prepRows.filter((_, j) => j !== i))}>×</button>
            </div>
          </div>
        ))}
        <button style={BTN_SECONDARY} onClick={() => setPrepRows([...prepRows, emptyPrep()])}>
          + Přidat člen přípravy
        </button>
        {prepRows.length > 0 && (
          <Field label="Poznámka k přípravě" style={{ marginTop: "0.75rem" }}>
            <input style={INPUT} value={prepTeamNote} onChange={(e) => setPrepTeamNote(e.target.value)}
              placeholder="Volitelný komentář k přípravnému týmu" />
          </Field>
        )}
      </div>

      {/* ── Schvalovatelé ── */}
      <div style={CARD}>
        <p style={SECTION_LABEL}>Schvalovatelé</p>
        {approvers.map((a, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 28px", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "end" }}>
            <Field label={i === 0 ? "Role" : undefined}>
              <input style={INPUT} value={a.role} onChange={(e) => { const arr = [...approvers]; arr[i] = { ...arr[i], role: e.target.value }; setApprovers(arr); }} />
            </Field>
            <Field label={i === 0 ? "Jméno" : undefined}>
              <input style={INPUT} value={a.name} onChange={(e) => { const arr = [...approvers]; arr[i] = { ...arr[i], name: e.target.value }; setApprovers(arr); }} />
            </Field>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 1 }}>
              <button style={BTN_DANGER} onClick={() => setApprovers(approvers.filter((_, j) => j !== i))}>×</button>
            </div>
          </div>
        ))}
        <button style={BTN_SECONDARY} onClick={() => setApprovers([...approvers, { role: "", name: "", signed: false }])}>
          + Přidat schvalovatele
        </button>
      </div>

      {/* ── Výsledky eventu ── */}
      <div style={CARD}>
        <p style={SECTION_LABEL}>Výsledky eventu (volitelné)</p>
        {results.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "end" }}>
            <Field label={i === 0 ? "Ukazatel" : undefined}>
              <input style={INPUT} value={r.label} placeholder="např. Uskutečněné schůzky"
                onChange={(e) => { const arr = [...results]; arr[i] = { ...arr[i], label: e.target.value }; setResults(arr); }} />
            </Field>
            <Field label={i === 0 ? "Hodnota" : undefined}>
              <input style={INPUT} value={r.value} placeholder="např. 67"
                onChange={(e) => { const arr = [...results]; arr[i] = { ...arr[i], value: e.target.value }; setResults(arr); }} />
            </Field>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 1 }}>
              <button style={BTN_DANGER} onClick={() => setResults(results.filter((_, j) => j !== i))}>×</button>
            </div>
          </div>
        ))}
        <button style={BTN_SECONDARY} onClick={() => setResults([...results, { label: "", value: "" }])}>
          + Přidat ukazatel
        </button>
      </div>

      {/* ── Náhled součtů ── */}
      {(salesRows.length + nesalesRows.length + prepRows.length) > 0 && (
        <div style={{ ...CARD, background: "rgba(147,179,207,0.05)", borderColor: "rgba(147,179,207,0.2)" }}>
          <p style={SECTION_LABEL}>Náhled odměn</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
            {[
              { label: "Celkem",     value: preview.grandTotal },
              { label: "Fix",        value: preview.fixTotal },
              { label: "Variabilní", value: preview.variableTotal },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ ...SECTION_LABEL, marginBottom: "0.25rem" }}>{label}</p>
                <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#93b3cf" }}>{formatCZK(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ID náhled ── */}
      {name && dateStart && (
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.88)", marginBottom: "1rem" }}>
          ID eventu: <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4 }}>
            {generateId(name, dateStart)}
          </code>
        </p>
      )}

      {/* ── Chybová zpráva ── */}
      {error && (
        <div style={{ padding: "0.75rem 1rem", background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 8, color: "#ff8080", fontSize: "0.9rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* ── Akce ── */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            background: saving ? "rgba(147,179,207,0.2)" : "rgba(147,179,207,0.15)",
            border: "1px solid rgba(147,179,207,0.4)",
            borderRadius: 8, color: "#93b3cf",
            fontSize: "0.9375rem", fontWeight: 600,
            padding: "0.625rem 1.5rem", cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Ukládám…" : "Vytvořit event"}
        </button>
        <button
          onClick={() => router.push("/")}
          style={{ ...BTN_SECONDARY, fontSize: "0.9375rem" }}
        >
          Zrušit
        </button>
      </div>
    </div>
  );
}

// ── Pomocný wrapper pro field ─────────────────────────────────────────────────
function Field({ label, children, style }: { label?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      {label && <span style={LABEL}>{label}</span>}
      {children}
    </div>
  );
}
