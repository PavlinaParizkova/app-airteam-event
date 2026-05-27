"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DEAL_CHECKPOINTS,
  PAYMENT_TYPE_LABELS,
  formatCZK,
  type EventData,
  type DealCheckpointKey,
  type DealApproval,
  type PaymentType,
  type NesalesEntry,
  type PrepEntry,
} from "@/data/events";
import { getKpiBonus } from "@/app/lib/calc";
import {
  toggleFinanceCheckpointAction,
  toggleGroupApprovalAction,
} from "@/app/actions/events";

// ── Typy ──────────────────────────────────────────────────────────────────────

type PersonRow = {
  personName: string;
  dealCount: number;
  dealAmount: number;
  kpiBonus: number;
  kpiMaxBonus: number;
  total: number;
  schvaleno: boolean;
  finance: boolean;
  proplaceno: boolean;
  paymentType?: PaymentType;
};

type PhaseState = "empty" | "waiting" | "pending_finance" | "confirmed" | "paid";

type PhaseData = {
  key: DealCheckpointKey;
  label: string;
  persons: PersonRow[];
  totalAmount: number;
  state: PhaseState;
  missingCount: number;
  poolCount: number;
  poolAmount: number;
};

// ── Pomocné funkce ─────────────────────────────────────────────────────────────

function derivePhaseState(persons: PersonRow[]): PhaseState {
  if (persons.length === 0) return "empty";
  if (persons.every((p) => p.proplaceno)) return "paid";
  if (persons.every((p) => p.finance)) return "confirmed";
  if (persons.some((p) => p.schvaleno && !p.finance)) return "pending_finance";
  if (persons.some((p) => p.finance)) return "confirmed";
  return "waiting";
}

function phaseColor(state: PhaseState): string {
  switch (state) {
    case "paid":            return "#16a34a";  // zelená — proplaceno
    case "confirmed":       return "#dc2626";  // červená — k úhradě
    case "pending_finance": return "#f59e0b";  // žlutá — čeká na finance
    case "waiting":         return "rgba(255,255,255,0.18)";
    case "empty":           return "rgba(255,255,255,0.08)";
  }
}

function phaseLabel(state: PhaseState): string {
  switch (state) {
    case "paid":            return "Proplaceno";
    case "confirmed":       return "K úhradě";
    case "pending_finance": return "Ke schválení";
    case "waiting":         return "Čeká";
    case "empty":           return "–";
  }
}

/** Přepočítá celkovou odměnu Nesales osoby z aktuálních sazeb eventu (stejná logika jako S2Card). */
function calcNesalesTotal(p: NesalesEntry, event: EventData): number {
  const rawPoints  = p.kpiTotal ?? 0;
  const kpiPts     = Math.min(100, rawPoints);
  const kpiMaxPts  = Math.max(0, rawPoints - 100);
  const kpiBonus   = getKpiBonus(kpiPts, event.kpiBands);
  const kpiMaxBonus = kpiMaxPts * 100;
  const fix        = p.days * event.dailyRateNesales;
  return fix + kpiBonus + kpiMaxBonus;
}

/** Přepočítá celkovou odměnu Prep osoby z aktuálních sazeb eventu (stejná logika jako S3Card). */
function calcPrepTotal(p: PrepEntry, event: EventData): number {
  const kpiBonus    = getKpiBonus(p.kpiPoints ?? 0, event.kpiBands);
  const kpiMaxBonus = (p.kpiMaxPoints ?? 0) * 100;
  return kpiBonus + kpiMaxBonus;
}

// ── Hlavní komponenta ──────────────────────────────────────────────────────────

export default function FinanceCheckpointPanel({
  event,
  isAdmin,
  isFinance = false,
  showAllPhases = false,
  nesalesTeam: nesalesTeamProp = [],
  prepTeam: prepTeamProp = [],
}: {
  event: EventData;
  isAdmin: boolean;
  isFinance?: boolean;
  showAllPhases?: boolean;
  nesalesTeam?: NesalesEntry[];
  prepTeam?: PrepEntry[];
}) {
  const router = useRouter();
  // Lokální kopie dat pro optimistické updaty.
  // Po každém úspěšném serveru-action zápisu se přes router.refresh() vrátí
  // čerstvá props — useEffect níže synchronizuje stav.
  const [approvals, setApprovals] = useState<DealApproval[]>(
    () => event.dealApprovals ?? [],
  );
  const [nesalesTeam, setNesalesTeam] = useState<NesalesEntry[]>(() => nesalesTeamProp);
  const [prepTeam, setPrepTeam]       = useState<PrepEntry[]>(() => prepTeamProp);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setApprovals(event.dealApprovals ?? []);
  }, [event.dealApprovals]);
  useEffect(() => { setNesalesTeam(nesalesTeamProp); }, [nesalesTeamProp]);
  useEffect(() => { setPrepTeam(prepTeamProp); }, [prepTeamProp]);

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 4500);
  }

  // Agregace dat per fáze
  const phases: PhaseData[] = DEAL_CHECKPOINTS.map((cp) => {
    const cpApprovals = approvals.filter((a) => a.checkpoint === cp.key);
    const approvalMap = new Map(cpApprovals.map((a) => [a.personName, a]));

    // D+7: zobrazit VŠECHNY členy sales týmu (mají KPI hodnocení)
    // Ostatní fáze: jen ti, kdo mají approval záznam nebo dealy
    const basePersons: PersonRow[] = cp.key === "D+7"
      ? event.salesTeam.map((s) => {
          const a = approvalMap.get(s.name);
          const dealAmountPerDeal = s.dealAmountPerDeal ?? 0;
          const dealCount = a?.dealCount ?? 0;
          const dealAmount = dealCount * dealAmountPerDeal;
          const kpiBonus = s.kpiBonus ?? 0;
          const kpiMaxBonus = s.kpiMaxBonus ?? 0;
          return {
            personName: s.name,
            dealCount,
            dealAmount,
            kpiBonus,
            kpiMaxBonus,
            total: dealAmount + kpiBonus + kpiMaxBonus,
            schvaleno: a?.schvaleno ?? false,
            finance: a?.finance ?? false,
            proplaceno: a?.proplaceno ?? false,
            paymentType: a?.paymentType ?? s.paymentType,
          };
        })
      : cpApprovals.map((a) => {
          const salesPerson = event.salesTeam.find((s) => s.name === a.personName);
          const dealAmountPerDeal = salesPerson?.dealAmountPerDeal ?? 0;
          const dealCount = a.dealCount ?? 0;
          const dealAmount = dealCount * dealAmountPerDeal;
          return {
            personName: a.personName,
            dealCount,
            dealAmount,
            kpiBonus: 0,
            kpiMaxBonus: 0,
            total: dealAmount,
            schvaleno: a.schvaleno,
            finance: a.finance,
            proplaceno: a.proplaceno,
            paymentType: a.paymentType,
          };
        });

    // Pro D+7 zobrazit všechny; pro ostatní fáze jen ty s daty nebo nastaveným stavem
    const visible = cp.key === "D+7"
      ? basePersons
      : basePersons.filter((p) => p.total > 0 || p.schvaleno || p.finance || p.proplaceno);

    const totalAmount = visible.reduce((s, p) => s + p.total, 0);
    const state = derivePhaseState(visible);
    const missingCount = cp.key === "D+7" ? 0 : Math.max(0, event.salesTeam.length - visible.length);
    const poolPersons = visible.filter((p) => p.paymentType === "pull");
    const poolCount = poolPersons.length;
    const poolAmount = poolPersons.reduce((s, p) => s + p.total, 0);

    return { key: cp.key, label: cp.label, persons: visible, totalAmount, state, missingCount, poolCount, poolAmount };
  });

  const hasAnyData =
    event.salesTeam.length > 0 ||
    phases.some((ph) => ph.state !== "empty") ||
    nesalesTeam.length > 0 ||
    prepTeam.length > 0;
  if (!hasAnyData && !showAllPhases) return null;

  // Skupina 1 — finance flag
  const toggleFinance = useCallback(
    async (personName: string, checkpoint: DealCheckpointKey, newValue: boolean) => {
      const key = `${personName}|${checkpoint}`;
      setLoading(key);
      setApprovals((prev) => {
        const hit = prev.find((a) => a.personName === personName && a.checkpoint === checkpoint);
        if (hit) {
          return prev.map((a) =>
            a.personName === personName && a.checkpoint === checkpoint
              ? { ...a, finance: newValue }
              : a,
          );
        }
        return [...prev, { personName, checkpoint, schvaleno: false, finance: newValue, proplaceno: false }];
      });

      const res = await toggleFinanceCheckpointAction(event.id, personName, checkpoint, "finance", newValue);
      setLoading(null);
      if (!res.ok) {
        setApprovals((prev) =>
          prev.map((a) =>
            a.personName === personName && a.checkpoint === checkpoint
              ? { ...a, finance: !newValue }
              : a,
          ),
        );
        showError(res.message);
        if (res.reason === "conflict") router.refresh();
      }
    },
    [event.id, router],
  );

  // Skupina 1 — proplaceno
  const togglePaid = useCallback(
    async (personName: string, checkpoint: DealCheckpointKey, newValue: boolean) => {
      const key = `${personName}|${checkpoint}`;
      setLoading(key);
      setApprovals((prev) =>
        prev.some((a) => a.personName === personName && a.checkpoint === checkpoint)
          ? prev.map((a) =>
              a.personName === personName && a.checkpoint === checkpoint
                ? { ...a, proplaceno: newValue }
                : a,
            )
          : [...prev, { personName, checkpoint, schvaleno: false, finance: false, proplaceno: newValue }],
      );

      const res = await toggleFinanceCheckpointAction(event.id, personName, checkpoint, "proplaceno", newValue);
      setLoading(null);
      if (!res.ok) {
        setApprovals((prev) =>
          prev.map((a) =>
            a.personName === personName && a.checkpoint === checkpoint
              ? { ...a, proplaceno: !newValue }
              : a,
          ),
        );
        showError(res.message);
        if (res.reason === "conflict") router.refresh();
      }
    },
    [event.id, router],
  );

  // Skupiny 2 & 3 — proplaceno
  const toggleGroupPaid = useCallback(
    async (group: "nesales" | "prep", personName: string, newValue: boolean) => {
      const key = `paid|${group}|${personName}`;
      setLoading(key);

      const apply = (val: boolean) => (prev: Array<NesalesEntry | PrepEntry>) =>
        prev.map((p) =>
          p.name !== personName
            ? p
            : {
                ...p,
                approval: {
                  schvaleno: p.approval?.schvaleno ?? false,
                  finance: p.approval?.finance ?? false,
                  proplaceno: val,
                },
              },
        );

      if (group === "nesales") setNesalesTeam((prev) => apply(newValue)(prev) as NesalesEntry[]);
      else setPrepTeam((prev) => apply(newValue)(prev) as PrepEntry[]);

      const res = await toggleGroupApprovalAction(event.id, group, personName, "proplaceno", newValue);
      setLoading(null);
      if (!res.ok) {
        if (group === "nesales") setNesalesTeam((prev) => apply(!newValue)(prev) as NesalesEntry[]);
        else setPrepTeam((prev) => apply(!newValue)(prev) as PrepEntry[]);
        showError(res.message);
        if (res.reason === "conflict") router.refresh();
      }
    },
    [event.id, router],
  );

  // Skupiny 2 & 3 — finance
  const toggleGroupFinance = useCallback(
    async (group: "nesales" | "prep", personName: string, newValue: boolean) => {
      const key = `${group}|${personName}`;
      setLoading(key);

      const apply = (val: boolean) => (prev: Array<NesalesEntry | PrepEntry>) =>
        prev.map((p) =>
          p.name !== personName
            ? p
            : {
                ...p,
                approval: {
                  schvaleno: p.approval?.schvaleno ?? false,
                  finance: val,
                  proplaceno: p.approval?.proplaceno ?? false,
                },
              },
        );

      if (group === "nesales") setNesalesTeam((prev) => apply(newValue)(prev) as NesalesEntry[]);
      else setPrepTeam((prev) => apply(newValue)(prev) as PrepEntry[]);

      const res = await toggleGroupApprovalAction(event.id, group, personName, "finance", newValue);
      setLoading(null);
      if (!res.ok) {
        if (group === "nesales") setNesalesTeam((prev) => apply(!newValue)(prev) as NesalesEntry[]);
        else setPrepTeam((prev) => apply(!newValue)(prev) as PrepEntry[]);
        showError(res.message);
        if (res.reason === "conflict") router.refresh();
      }
    },
    [event.id, router],
  );

  return (
    <div style={{ marginBottom: "2.5rem" }}>
      {/* Nadpis sekce + legenda */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "0.5rem",
        marginBottom: "0.875rem", paddingBottom: "0.5rem",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <p style={{
          fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.92)",
        }}>
          Platební plán — Finance
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {(
            [
              { color: "rgba(255,255,255,0.40)", label: "Čeká na schválení" },
              { color: "#f59e0b",                label: "Ke schválení" },
              { color: "#dc2626",                label: "K úhradě" },
              { color: "#16a34a",                label: "Proplaceno" },
            ] as const
          ).map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{
                width: 12, height: 12, borderRadius: "50%",
                background: color, flexShrink: 0,
                boxShadow: color !== "rgba(255,255,255,0.40)" ? `0 0 6px ${color}99` : "none",
              }} />
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          background: "rgba(231,76,60,0.12)", border: "1px solid rgba(231,76,60,0.4)",
          color: "#e74c3c", padding: "0.5rem 0.875rem", borderRadius: 6,
          fontSize: "0.8125rem", marginBottom: "0.875rem",
        }}>
          {error}
        </div>
      )}

      {/* ── Skupina 1 — záhlaví ─────────────────────────────────────────────── */}
      {event.salesTeam.length > 0 && (
        <div style={{
          fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.88)",
          marginBottom: "0.375rem",
          paddingLeft: "0.25rem",
        }}>
          Skupina 1
        </div>
      )}

      {/* Fáze */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {phases.map((phase) => {
          if (phase.state === "empty" && !showAllPhases) return null;

          const isPartialPaid = phase.state === "paid" && phase.missingCount > 0;
          const effectiveState = isPartialPaid ? "pending_finance" : phase.state;
          const color = isPartialPaid ? "#f59e0b" : phaseColor(phase.state);
          const isPaid = phase.state === "paid" && phase.missingCount === 0;
          const isConfirmed = phase.state === "confirmed";
          const hasPendingFinance = phase.state === "pending_finance";

          return (
            <div
              key={phase.key}
              style={{
                background: phase.state === "empty" ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.025)",
                border: `1px solid ${color}44`,
                borderLeft: `3px solid ${color}`,
                borderRadius: 8,
                overflow: "hidden",
                opacity: phase.state === "empty" ? 0.5 : 1,
              }}
            >
              {/* Záhlaví fáze */}
              <div style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.625rem 1rem",
                background: `${color}0a`,
                flexWrap: "wrap",
              }}>
                {/* Indikátor stavu */}
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: color, flexShrink: 0,
                  boxShadow: isPaid || isConfirmed ? `0 0 6px ${color}88` : "none",
                }} />

                <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#ffffff" }}>
                    {phase.key}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.92)" }}>
                    {phase.label}
                  </span>
                </div>

                {/* Stav badge */}
                <span style={{
                  fontSize: "0.625rem", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  color, background: `${color}18`,
                  border: `1px solid ${color}44`,
                  borderRadius: 4, padding: "2px 7px",
                  whiteSpace: "nowrap",
                }}>
                  {isPartialPaid
                    ? `Proplaceno ${phase.persons.length}/${event.salesTeam.length} · chybí ${phase.missingCount}`
                    : phaseLabel(phase.state)}
                </span>

                {/* Pool badge — zobrazí se, pokud někdo má výplatu do poolu */}
                {phase.poolCount > 0 && (
                  <span style={{
                    fontSize: "0.625rem", fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    color: "#fbbf24",
                    background: "#fbbf2418",
                    border: "1px solid #fbbf2444",
                    borderRadius: 4, padding: "2px 7px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}>
                    Pool · {phase.poolCount}× · {formatCZK(phase.poolAmount)}
                  </span>
                )}

                {/* Celková částka */}
                {phase.totalAmount > 0 && (
                  <span style={{
                    marginLeft: "auto", fontSize: "1rem", fontWeight: 700,
                    color: isPaid ? "#16a34a" : isConfirmed ? "#dc2626" : "#93b3cf",
                    flexShrink: 0,
                  }}>
                    {formatCZK(phase.totalAmount)}
                    {isPartialPaid && (
                      <span style={{ fontSize: "0.6875rem", fontWeight: 400, color: "rgba(255,255,255,0.85)", marginLeft: "0.375rem" }}>
                        částečně
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Řádky osob */}
              {phase.persons.length > 0 && (
                <div style={{ padding: "0.5rem 1rem 0.625rem" }}>
                  {phase.persons.map((person) => {
                    const loadKey = `${person.personName}|${phase.key}`;
                    const isLoading = loading === loadKey;
                    const canConfirm =
                      isAdmin && person.schvaleno && !person.finance && !person.proplaceno;
                    const canRevoke =
                      isAdmin && person.finance && !person.proplaceno;
                    const canMarkPaid =
                      (isFinance || isAdmin) && person.finance && !person.proplaceno;
                    const canRevokePaid =
                      isAdmin && person.proplaceno;

                    const personColor = person.proplaceno
                      ? "#16a34a"
                      : person.finance
                      ? "#dc2626"
                      : person.schvaleno
                      ? "#f59e0b"
                      : "rgba(255,255,255,0.40)";

                    return (
                      <div
                        key={person.personName}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.625rem",
                          padding: "0.4rem 0",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Status dot */}
                        <div style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: personColor, flexShrink: 0,
                        }} />

                        {/* Jméno */}
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#ffffff", minWidth: 130 }}>
                          {person.personName}
                        </span>

                        {/* Způsob výplaty */}
                        {person.paymentType && (
                          <PersonPaymentBadge type={person.paymentType} />
                        )}

                        {/* KPI bonus — jen D+7, vždy zobrazit */}
                        {phase.key === "D+7" && (
                          <AmountChip
                            label="KPI bonus"
                            value={person.kpiBonus}
                            color={person.kpiBonus > 0 ? "#93b3cf" : "rgba(255,255,255,0.25)"}
                            dimIfZero
                          />
                        )}

                        {/* KPI MAX — jen D+7, vždy zobrazit */}
                        {phase.key === "D+7" && (
                          <AmountChip
                            label="KPI MAX"
                            value={person.kpiMaxBonus}
                            color={person.kpiMaxBonus > 0 ? "#ffd700" : "rgba(255,255,255,0.25)"}
                            dimIfZero
                          />
                        )}

                        {/* Deal bonus — vždy zobrazit */}
                        <AmountChip
                          label={person.dealCount > 0
                            ? `${person.dealCount} ${person.dealCount === 1 ? "deal" : person.dealCount <= 4 ? "dealy" : "dealů"}`
                            : "Deal bonus"}
                          value={person.dealAmount}
                          color={person.dealAmount > 0 ? "#93b3cf" : "rgba(255,255,255,0.25)"}
                          dimIfZero
                        />

                        {/* Celkem osoby */}
                        {person.total > 0 && (
                          <span style={{
                            fontSize: "0.875rem", fontWeight: 700,
                            color: person.proplaceno ? "#16a34a" : person.finance ? "#dc2626" : "#93b3cf",
                            marginLeft: "auto", flexShrink: 0,
                          }}>
                            {formatCZK(person.total)}
                          </span>
                        )}

                        {/* Stavový label osoby */}
                        <PersonStatusBadge
                          schvaleno={person.schvaleno}
                          finance={person.finance}
                          proplaceno={person.proplaceno}
                        />

                        {/* Akční tlačítko pro finance */}
                        {canConfirm && (
                          <button
                            disabled={isLoading}
                            onClick={() => toggleFinance(person.personName, phase.key, true)}
                            style={{
                              fontSize: "0.6875rem", fontWeight: 700,
                              textTransform: "uppercase", letterSpacing: "0.07em",
                              color: "#fff", background: "#dc2626",
                              border: "none", borderRadius: 5,
                              padding: "3px 10px", cursor: "pointer",
                              opacity: isLoading ? 0.5 : 1,
                              flexShrink: 0,
                            }}
                          >
                            {isLoading ? "…" : "Potvrdit k úhradě"}
                          </button>
                        )}
                        {canRevoke && (
                          <button
                            disabled={isLoading}
                            onClick={() => toggleFinance(person.personName, phase.key, false)}
                            style={{
                              fontSize: "0.6875rem", fontWeight: 600,
                              color: "rgba(255,255,255,0.92)",
                              background: "transparent",
                              border: "1px solid rgba(255,255,255,0.12)",
                              borderRadius: 5, padding: "3px 10px",
                              cursor: "pointer",
                              opacity: isLoading ? 0.5 : 1,
                              flexShrink: 0,
                            }}
                          >
                            {isLoading ? "…" : "Odvolat"}
                          </button>
                        )}
                        {canMarkPaid && (
                          <button
                            disabled={isLoading}
                            onClick={() => togglePaid(person.personName, phase.key, true)}
                            style={{
                              fontSize: "0.6875rem", fontWeight: 700,
                              textTransform: "uppercase", letterSpacing: "0.07em",
                              color: "#fff", background: "#16a34a",
                              border: "none", borderRadius: 5,
                              padding: "3px 10px", cursor: "pointer",
                              opacity: isLoading ? 0.5 : 1,
                              flexShrink: 0,
                            }}
                          >
                            {isLoading ? "…" : "Uhrazeno"}
                          </button>
                        )}
                        {canRevokePaid && (
                          <button
                            disabled={isLoading}
                            onClick={() => togglePaid(person.personName, phase.key, false)}
                            style={{
                              fontSize: "0.6875rem", fontWeight: 600,
                              color: "rgba(255,255,255,0.88)",
                              background: "transparent",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: 5, padding: "3px 10px",
                              cursor: "pointer",
                              opacity: isLoading ? 0.5 : 1,
                              flexShrink: 0,
                            }}
                          >
                            {isLoading ? "…" : "Odvolat proplacení"}
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Hromadné potvrzení fáze */}
                  {isAdmin && hasPendingFinance && (
                    <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "flex-end" }}>
                      <button
                        disabled={loading !== null}
                        onClick={async () => {
                          for (const p of phase.persons) {
                            if (p.schvaleno && !p.finance && !p.proplaceno) {
                              await toggleFinance(p.personName, phase.key, true);
                            }
                          }
                        }}
                        style={{
                          fontSize: "0.6875rem", fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: "0.07em",
                          color: "#fff", background: "#dc2626",
                          border: "none", borderRadius: 6,
                          padding: "5px 14px", cursor: "pointer",
                          opacity: loading !== null ? 0.5 : 1,
                        }}
                      >
                        Potvrdit vše k úhradě ({phase.key})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Skupiny 2 a 3 — jednorázová výplata ─────────────────────────────── */}
      {(nesalesTeam.length > 0 || prepTeam.length > 0) && (
        <div style={{
          fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.88)",
          marginTop: "1rem", marginBottom: "0.375rem",
          paddingLeft: "0.25rem",
        }}>
          Skupina 2 &amp; 3
        </div>
      )}
      {[
        { label: "Skupina 2", group: "nesales" as const, persons: nesalesTeam },
        { label: "Skupina 3", group: "prep" as const, persons: prepTeam },
      ].map(({ label, group, persons }) => {
        if (persons.length === 0) return null;

        const hasPending = persons.some(
          (p) => (p.approval?.schvaleno ?? false) && !(p.approval?.finance ?? false) && !(p.approval?.proplaceno ?? false),
        );
        const allPaid    = persons.every((p) => p.approval?.proplaceno ?? false);
        const allConfirmed = !allPaid && persons.every((p) => p.approval?.finance ?? false);
        const groupColor = allPaid ? "#16a34a" : allConfirmed ? "#dc2626" : hasPending ? "#f59e0b" : "rgba(255,255,255,0.18)";
        const groupTotal = persons.reduce((s, p) =>
          s + (group === "nesales"
            ? calcNesalesTotal(p as NesalesEntry, event)
            : calcPrepTotal(p as PrepEntry, event)),
        0);

        return (
          <div key={group} style={{ marginTop: "0.75rem" }}>
            {/* Záhlaví skupiny */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.625rem",
              padding: "0.5rem 1rem",
              background: `${groupColor}0a`,
              border: `1px solid ${groupColor}44`,
              borderLeft: `3px solid ${groupColor}`,
              borderRadius: "8px 8px 0 0",
              flexWrap: "wrap",
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: groupColor, flexShrink: 0 }} />
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#ffffff" }}>{label}</span>
              <span style={{
                fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", color: groupColor,
                background: `${groupColor}18`, border: `1px solid ${groupColor}44`,
                borderRadius: 4, padding: "2px 7px",
              }}>
                {allPaid ? "Proplaceno" : allConfirmed ? "K úhradě" : hasPending ? "Ke schválení" : "Čeká"}
              </span>
              {groupTotal > 0 && (
                <span style={{ marginLeft: "auto", fontSize: "1rem", fontWeight: 700, color: allPaid ? "#16a34a" : allConfirmed ? "#dc2626" : "#93b3cf" }}>
                  {formatCZK(groupTotal)}
                </span>
              )}
            </div>

            {/* Řádky osob */}
            <div style={{
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${groupColor}44`, borderTop: "none",
              borderRadius: "0 0 8px 8px",
              padding: "0.5rem 1rem 0.625rem",
            }}>
              {persons.map((p) => {
                const schvaleno  = p.approval?.schvaleno  ?? false;
                const finance    = p.approval?.finance    ?? false;
                const proplaceno = p.approval?.proplaceno ?? false;
                const paymentType = p.paymentType;
                const loadKey = `${group}|${p.name}`;
                const paidLoadKey = `paid|${group}|${p.name}`;
                const isLoading = loading === loadKey || loading === paidLoadKey;
                const canConfirm   = isAdmin && schvaleno && !finance && !proplaceno;
                const canRevoke    = isAdmin && finance && !proplaceno;
                const canMarkPaid  = (isFinance || isAdmin) && finance && !proplaceno;
                const canRevokePaid = isAdmin && proplaceno;
                const dotColor = proplaceno ? "#16a34a" : finance ? "#dc2626" : schvaleno ? "#f59e0b" : "rgba(255,255,255,0.40)";

                // Přepočítané detaily pro zobrazení
                let fix = 0, kpiBonus = 0, kpiMaxBonus = 0, total = 0;
                if (group === "nesales") {
                  const np = p as NesalesEntry;
                  const rawPts = np.kpiTotal ?? 0;
                  fix        = np.days * event.dailyRateNesales;
                  kpiBonus   = getKpiBonus(Math.min(100, rawPts), event.kpiBands);
                  kpiMaxBonus = Math.max(0, rawPts - 100) * 100;
                  total      = fix + kpiBonus + kpiMaxBonus;
                } else {
                  const pp = p as PrepEntry;
                  kpiBonus    = getKpiBonus(pp.kpiPoints ?? 0, event.kpiBands);
                  kpiMaxBonus = (pp.kpiMaxPoints ?? 0) * 100;
                  total       = kpiBonus + kpiMaxBonus;
                }

                return (
                  <div key={p.name} style={{
                    display: "flex", alignItems: "center", gap: "0.625rem",
                    padding: "0.4rem 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    flexWrap: "wrap",
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#ffffff", minWidth: 130 }}>{p.name}</span>
                    {paymentType && <PersonPaymentBadge type={paymentType} />}

                    {/* Detailní breakdown — viditelné jen pro finance */}
                    {group === "nesales" && (
                      <AmountChip label="Fix" value={fix} color={fix > 0 ? "#93b3cf" : "rgba(255,255,255,0.25)"} dimIfZero />
                    )}
                    <AmountChip label="KPI bonus" value={kpiBonus} color={kpiBonus > 0 ? "#93b3cf" : "rgba(255,255,255,0.25)"} dimIfZero />
                    <AmountChip label="KPI MAX" value={kpiMaxBonus} color={kpiMaxBonus > 0 ? "#ffd700" : "rgba(255,255,255,0.25)"} dimIfZero />

                    {total > 0 && (
                      <span style={{
                        fontSize: "0.875rem", fontWeight: 700,
                        color: proplaceno ? "#16a34a" : finance ? "#dc2626" : "#93b3cf",
                        marginLeft: "auto", flexShrink: 0,
                      }}>
                        {formatCZK(total)}
                      </span>
                    )}
                    <PersonStatusBadge schvaleno={schvaleno} finance={finance} proplaceno={proplaceno} />
                    {canConfirm && (
                      <button
                        disabled={isLoading}
                        onClick={() => toggleGroupFinance(group, p.name, true)}
                        style={{
                          fontSize: "0.6875rem", fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: "0.07em",
                          color: "#fff", background: "#dc2626",
                          border: "none", borderRadius: 5,
                          padding: "3px 10px", cursor: "pointer",
                          opacity: isLoading ? 0.5 : 1, flexShrink: 0,
                        }}
                      >
                        {isLoading ? "…" : "Potvrdit k úhradě"}
                      </button>
                    )}
                    {canRevoke && (
                      <button
                        disabled={isLoading}
                        onClick={() => toggleGroupFinance(group, p.name, false)}
                        style={{
                          fontSize: "0.6875rem", fontWeight: 600,
                          color: "rgba(255,255,255,0.92)", background: "transparent",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 5, padding: "3px 10px",
                          cursor: "pointer", opacity: isLoading ? 0.5 : 1, flexShrink: 0,
                        }}
                      >
                        {isLoading ? "…" : "Odvolat"}
                      </button>
                    )}
                    {canMarkPaid && (
                      <button
                        disabled={isLoading}
                        onClick={() => toggleGroupPaid(group, p.name, true)}
                        style={{
                          fontSize: "0.6875rem", fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: "0.07em",
                          color: "#fff", background: "#16a34a",
                          border: "none", borderRadius: 5,
                          padding: "3px 10px", cursor: "pointer",
                          opacity: isLoading ? 0.5 : 1, flexShrink: 0,
                        }}
                      >
                        {isLoading ? "…" : "Uhrazeno"}
                      </button>
                    )}
                    {canRevokePaid && (
                      <button
                        disabled={isLoading}
                        onClick={() => toggleGroupPaid(group, p.name, false)}
                        style={{
                          fontSize: "0.6875rem", fontWeight: 600,
                          color: "rgba(255,255,255,0.88)", background: "transparent",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 5, padding: "3px 10px",
                          cursor: "pointer", opacity: isLoading ? 0.5 : 1, flexShrink: 0,
                        }}
                      >
                        {isLoading ? "…" : "Odvolat proplacení"}
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Hromadné potvrzení skupiny */}
              {isAdmin && hasPending && (
                <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    disabled={loading !== null}
                    onClick={async () => {
                      for (const p of persons) {
                        if ((p.approval?.schvaleno ?? false) && !(p.approval?.finance ?? false) && !(p.approval?.proplaceno ?? false)) {
                          await toggleGroupFinance(group, p.name, true);
                        }
                      }
                    }}
                    style={{
                      fontSize: "0.6875rem", fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.07em",
                      color: "#fff", background: "#dc2626",
                      border: "none", borderRadius: 6,
                      padding: "5px 14px", cursor: "pointer",
                      opacity: loading !== null ? 0.5 : 1,
                    }}
                  >
                    Potvrdit vše k úhradě ({label.split("—")[0].trim()})
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Sub-komponenty ─────────────────────────────────────────────────────────────

function PersonStatusBadge({
  schvaleno, finance, proplaceno,
}: {
  schvaleno: boolean; finance: boolean; proplaceno: boolean;
}) {
  if (proplaceno) {
    return (
      <span style={{
        fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.07em", color: "#16a34a",
        background: "#16a34a18", border: "1px solid #16a34a44",
        borderRadius: 4, padding: "1px 6px", flexShrink: 0,
      }}>
        Proplaceno
      </span>
    );
  }
  if (finance) {
    return (
      <span style={{
        fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.07em", color: "#dc2626",
        background: "#dc262618", border: "1px solid #dc262644",
        borderRadius: 4, padding: "1px 6px", flexShrink: 0,
      }}>
        K úhradě
      </span>
    );
  }
  if (schvaleno) {
    return (
      <span style={{
        fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.07em", color: "#f59e0b",
        background: "#f59e0b18", border: "1px solid #f59e0b44",
        borderRadius: 4, padding: "1px 6px", flexShrink: 0,
      }}>
        Schváleno
      </span>
    );
  }
  return null;
}

function AmountChip({
  label, value, color, dimIfZero,
}: {
  label: string; value: number; color: string; dimIfZero?: boolean;
}) {
  const isZero = value === 0;
  return (
    <span style={{
      fontSize: "0.6875rem",
      color: isZero && dimIfZero ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.90)",
      background: isZero && dimIfZero ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
      border: `1px solid ${isZero && dimIfZero ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 4, padding: "1px 7px",
      whiteSpace: "nowrap",
    }}>
      {label}{" "}
      <span style={{ fontWeight: 700, color: isZero && dimIfZero ? "rgba(255,255,255,0.55)" : color }}>
        {isZero ? "–" : formatCZK(value)}
      </span>
    </span>
  );
}

function PersonPaymentBadge({ type }: { type: PaymentType }) {
  const isPull = type === "pull";
  const color = isPull ? "#fbbf24" : "#81c784";
  return (
    <span style={{
      fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.07em", color,
      background: `${color}18`, border: `1px solid ${color}44`,
      borderRadius: 4, padding: "1px 6px", flexShrink: 0,
    }}>
      {PAYMENT_TYPE_LABELS[type]}
    </span>
  );
}
