"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DEAL_CHECKPOINTS,
  PAYMENT_TYPE_LABELS,
  type SalesEntry, type NesalesEntry, type PrepEntry,
  type DealCheckpointKey, type ApprovalFlags, type DealApproval, type KpiBand,
  type PaymentType,
  formatCZK,
} from "@/data/events";
import type { EventWithVersions } from "@/app/lib/store";
import { getKpiBonus } from "@/app/lib/calc";
import EventSubNav from "@/app/components/EventSubNav";
import {
  patchTeamAction,
  patchApprovalsAction,
  setPaymentTypeAction,
} from "@/app/actions/events";

// ── Lokální typy editoru ────────────────────────────────────────────────────────

type S1CheckpointData = ApprovalFlags & { paymentType: PaymentType; dealCount: number };
type CheckpointFlags = Record<DealCheckpointKey, S1CheckpointData>;

type S1Person = {
  _id: string;
  name: string;
  role: string;
  days: number;
  kpiPoints: number;
  kpiMaxPoints: number;
  dealAmountPerDeal: number;
  checkpoints: CheckpointFlags;
  comment: string;
};

type S2Person = {
  _id: string;
  name: string;
  role: string;
  days: number;
  kpiPoints: number;
  kpiMaxPoints: number;
  approval: ApprovalFlags;
  paymentType: PaymentType;
  comment: string;
};

type S3Person = {
  _id: string;
  name: string;
  role: string;
  days: number;
  kpiPoints: number;
  kpiMaxPoints: number;
  clickupHours: number;
  approval: ApprovalFlags;
  paymentType: PaymentType;
  comment: string;
};

// ── Helpers ─────────────────────────────────────────────────────────────────────

const EMPTY_FLAGS: ApprovalFlags = { schvaleno: false, finance: false, proplaceno: false };

function emptyCheckpoints(): CheckpointFlags {
  return Object.fromEntries(
    DEAL_CHECKPOINTS.map((c) => [c.key, { ...EMPTY_FLAGS, paymentType: "vyplata" as PaymentType, dealCount: 0 }])
  ) as CheckpointFlags;
}

let _counter = 0;
function uid() { return `r${++_counter}`; }

function initS1(event: EventWithVersions): S1Person[] {
  const approvalMap = new Map<string, CheckpointFlags>();
  (event.dealApprovals ?? []).forEach((d) => {
    if (!approvalMap.has(d.personName)) approvalMap.set(d.personName, emptyCheckpoints());
    const m = approvalMap.get(d.personName)!;
    m[d.checkpoint] = {
      schvaleno: d.schvaleno,
      finance: d.finance,
      proplaceno: d.proplaceno,
      paymentType: d.paymentType ?? "vyplata",
      dealCount: d.dealCount ?? 0,
    };
  });
  return event.salesTeam.map((p) => {
    const kpiDetailsSum = p.kpiDetails.reduce((s, k) => s + k.awarded, 0);
    const kpiRaw = p.kpiPoints ?? kpiDetailsSum;
    return {
      _id: uid(),
      name: p.name,
      role: p.role,
      days: p.days,
      kpiPoints: Math.min(100, kpiRaw),
      kpiMaxPoints: Math.max(0, (p.kpiMaxPoints ?? Math.max(0, kpiRaw - 100))),
      dealAmountPerDeal: p.dealAmountPerDeal ?? 3000,
      checkpoints: approvalMap.get(p.name) ?? emptyCheckpoints(),
      comment: p.comment ?? "",
    };
  });
}

function initS2(event: EventWithVersions): S2Person[] {
  return event.nesalesTeam.map((p) => {
    const kpiDetailsSum = p.kpiDetails.reduce((s, k) => s + k.awarded, 0);
    const kpiRaw = (p.kpiTotal > 0 ? p.kpiTotal : kpiDetailsSum) || 0;
    return {
      _id: uid(),
      name: p.name,
      role: p.role,
      days: p.days,
      kpiPoints: Math.min(100, kpiRaw),
      kpiMaxPoints: Math.max(0, kpiRaw - 100),
      approval: (p as NesalesEntry & { approval?: ApprovalFlags }).approval ?? { ...EMPTY_FLAGS },
      paymentType: p.paymentType ?? "vyplata",
      comment: p.comment ?? "",
    };
  });
}

function initS3(event: EventWithVersions): S3Person[] {
  return event.prepTeam.map((p) => ({
    _id: uid(),
    name: p.name,
    role: p.role,
    days: p.days ?? 0,
    kpiPoints: p.kpiPoints ?? 0,
    kpiMaxPoints: p.kpiMaxPoints ?? 0,
    clickupHours: p.hoursNumeric,
    approval: (p as PrepEntry & { approval?: ApprovalFlags }).approval ?? { ...EMPTY_FLAGS },
    paymentType: p.paymentType ?? "vyplata",
    comment: p.comment ?? "",
  }));
}

// ── Hlavní komponenta ───────────────────────────────────────────────────────────

export default function OdmenyClient({
  event, isAdmin, memberName, showFinanceLink = false,
}: {
  event: EventWithVersions;
  isAdmin: boolean;
  memberName?: string;
  showFinanceLink?: boolean;
}) {
  const router = useRouter();

  // Verze, které byly aktuální při posledním server-renderu nebo posledním úspěšném save.
  // Pokud do props přijde event s vyšší verzí, znamená to, že server data zmutoval
  // a my musíme zahodit lokální stav a reinicializovat.
  const [syncedTeamVersion, setSyncedTeamVersion] = useState<number>(event.versions.team);
  const [syncedApprovalsVersion, setSyncedApprovalsVersion] = useState<number>(event.versions.approvals);

  const [s1, setS1] = useState<S1Person[]>(() => initS1(event));
  const [s2, setS2] = useState<S2Person[]>(() => initS2(event));
  const [s3, setS3] = useState<S3Person[]>(() => initS3(event));
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "conflict">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);

  // Reset state when server delivers a fresh version (jiný uživatel zapsal,
  // nebo se po vlastním uložení vrátila nová verze z revalidatePath).
  useEffect(() => {
    if (event.versions.team !== syncedTeamVersion || event.versions.approvals !== syncedApprovalsVersion) {
      setS1(initS1(event));
      setS2(initS2(event));
      setS3(initS3(event));
      setSyncedTeamVersion(event.versions.team);
      setSyncedApprovalsVersion(event.versions.approvals);
      // pokud zrovna nebylo nic rozjeté, ukaž jen kratký "Načteno" indikátor
      firstRender.current = true;
    }
  }, [event, syncedTeamVersion, syncedApprovalsVersion]);

  // Self-service: každý člen týmu vidí pouze svůj vlastní záznam
  const isInSales   = !!memberName && event.salesTeam.some((p) => p.name === memberName);
  const isInNesales = !!memberName && event.nesalesTeam.some((p) => p.name === memberName);
  const isInPrep    = !!memberName && event.prepTeam.some((p) => p.name === memberName);
  const isSelfService = !isAdmin && (isInSales || isInNesales || isInPrep);

  const buildTeamPayload = useCallback((
    s1d: S1Person[], s2d: S2Person[], s3d: S3Person[]
  ) => {
    const salesTeam: SalesEntry[] = s1d.map((p) => {
      const existing = event.salesTeam.find((e) => e.name === p.name);
      const kpiBonus    = getKpiBonus(p.kpiPoints, event.kpiBands);
      const kpiMaxBonus = p.kpiMaxPoints * 100;
      const totalKpi    = kpiBonus + kpiMaxBonus;
      const dealCount = DEAL_CHECKPOINTS
        .filter((cp) => cp.key !== "D+7")
        .reduce((s, cp) => s + p.checkpoints[cp.key].dealCount, 0);
      const dealBonus = dealCount * p.dealAmountPerDeal;
      return {
        name: p.name,
        role: p.role,
        days: p.days,
        fixAmount: 0,
        dealBonus,
        dealCount,
        dealAmountPerDeal: p.dealAmountPerDeal,
        kpiBonus,
        kpiMaxBonus,
        kpiPoints: p.kpiPoints,
        kpiMaxPoints: p.kpiMaxPoints,
        kpiDetails: existing?.kpiDetails ?? [],
        total: dealBonus + totalKpi,
        comment: p.comment || undefined,
      };
    });

    const nesalesTeam = s2d.map((p) => {
      const existing = event.nesalesTeam.find((e) => e.name === p.name);
      const kpiBonus    = getKpiBonus(p.kpiPoints, event.kpiBands);
      const kpiMaxBonus = p.kpiMaxPoints * 100;
      const totalKpi    = kpiBonus + kpiMaxBonus;
      const fix         = p.days * event.dailyRateNesales;
      return {
        name: p.name,
        role: p.role,
        days: p.days,
        fixAmount: fix,
        kpiBonus,
        kpiMaxBonus,
        total: fix + totalKpi,
        kpiTotal: p.kpiPoints + p.kpiMaxPoints,
        kpiDetails: existing?.kpiDetails ?? [],
        approval: p.approval,
        paymentType: p.paymentType,
        comment: p.comment || undefined,
      } as NesalesEntry & { approval: ApprovalFlags };
    });

    const prepTeam = s3d.map((p) => {
      const existing    = event.prepTeam.find((e) => e.name === p.name);
      const kpiBonus    = getKpiBonus(p.kpiPoints, event.kpiBands);
      const kpiMaxBonus = p.kpiMaxPoints * 100;
      const totalKpi    = kpiBonus + kpiMaxBonus;
      return {
        name: p.name,
        role: p.role,
        days: p.days,
        hoursRaw: String(p.clickupHours),
        hoursNumeric: p.clickupHours,
        band: existing?.band ?? "0",
        bonus: totalKpi,
        kpiPoints: p.kpiPoints,
        kpiMaxPoints: p.kpiMaxPoints,
        kpiMaxBonus,
        approval: p.approval,
        paymentType: p.paymentType,
        comment: p.comment || undefined,
      } as PrepEntry & { days: number; approval: ApprovalFlags };
    });

    const dealApprovals: DealApproval[] = [];
    s1d.forEach((p) => {
      DEAL_CHECKPOINTS.forEach((cp) => {
        const flags = p.checkpoints[cp.key];
        dealApprovals.push({
          personName: p.name,
          checkpoint: cp.key,
          schvaleno: flags.schvaleno,
          finance: flags.finance,
          proplaceno: flags.proplaceno,
          paymentType: flags.paymentType,
          dealCount: cp.key !== "D+7" ? flags.dealCount : undefined,
        });
      });
    });

    return { salesTeam, nesalesTeam, prepTeam, dealApprovals };
  }, [event]);

  // Admin save — patche team i approvals slice. Při conflict zobrazí toast a refresh.
  const save = useCallback(async (s1d: S1Person[], s2d: S2Person[], s3d: S3Person[]) => {
    setSaveStatus("saving");
    setErrorMsg("");
    const { salesTeam, nesalesTeam, prepTeam, dealApprovals } = buildTeamPayload(s1d, s2d, s3d);

    // Krok 1 — team slice
    const teamRes = await patchTeamAction(event.id, syncedTeamVersion, {
      salesTeam,
      nesalesTeam,
      prepTeam,
    });

    if (!teamRes.ok) {
      if (teamRes.reason === "conflict") {
        setSaveStatus("conflict");
        setErrorMsg(teamRes.message);
        router.refresh();
        return;
      }
      setSaveStatus("error");
      setErrorMsg(teamRes.message);
      return;
    }
    setSyncedTeamVersion(teamRes.version!);

    // Krok 2 — approvals slice
    const apprRes = await patchApprovalsAction(event.id, syncedApprovalsVersion, dealApprovals);
    if (!apprRes.ok) {
      if (apprRes.reason === "conflict") {
        setSaveStatus("conflict");
        setErrorMsg(apprRes.message);
        router.refresh();
        return;
      }
      setSaveStatus("error");
      setErrorMsg(apprRes.message);
      return;
    }
    setSyncedApprovalsVersion(apprRes.version!);

    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2500);
  }, [event.id, buildTeamPayload, syncedTeamVersion, syncedApprovalsVersion, router]);

  // Self-service save — pouze paymentType per checkpoint pro přihlášeného obchodníka
  const savePaymentType = useCallback(async (s1d: S1Person[]) => {
    const own = s1d.find((p) => p.name === memberName);
    if (!own) return;
    setSaveStatus("saving");
    setErrorMsg("");
    const checkpoints: Partial<Record<DealCheckpointKey, PaymentType>> = {};
    DEAL_CHECKPOINTS.forEach((cp) => {
      checkpoints[cp.key] = own.checkpoints[cp.key].paymentType;
    });

    const res = await setPaymentTypeAction(event.id, checkpoints);
    if (!res.ok) {
      if (res.reason === "conflict") {
        setSaveStatus("conflict");
        setErrorMsg(res.message);
        router.refresh();
        return;
      }
      setSaveStatus("error");
      setErrorMsg(res.message);
      return;
    }
    setSyncedApprovalsVersion(res.version!);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2500);
  }, [event.id, memberName, router]);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (isSelfService) {
      debounceRef.current = setTimeout(() => savePaymentType(s1), 800);
    } else {
      debounceRef.current = setTimeout(() => save(s1, s2, s3), 800);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [s1, s2, s3, save, savePaymentType, isSelfService]);

  // ── Součty ─────────────────────────────────────────────────────────────────
  const s1Total = s1.reduce((sum, p) => {
    const dealBonus = DEAL_CHECKPOINTS
      .filter((cp) => cp.key !== "D+7")
      .reduce((s, cp) => s + p.checkpoints[cp.key].dealCount * p.dealAmountPerDeal, 0);
    return sum + dealBonus + getKpiBonus(p.kpiPoints, event.kpiBands) + p.kpiMaxPoints * 100;
  }, 0);
  const s2Total = s2.reduce((sum, p) => {
    const fix = p.days * event.dailyRateNesales;
    return sum + fix + getKpiBonus(p.kpiPoints, event.kpiBands) + p.kpiMaxPoints * 100;
  }, 0);
  const s3Total = s3.reduce((sum, p) =>
    sum + getKpiBonus(p.kpiPoints, event.kpiBands) + p.kpiMaxPoints * 100, 0);

  return (
    <div style={{ maxWidth: 960 }}>

      <EventSubNav
        eventId={event.id}
        eventShortName={event.shortName}
        active="odmeny"
        showFinanceLink={showFinanceLink}
      />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)", fontWeight: 700, marginBottom: 6 }}>
            {isSelfService ? `Způsob výplaty — ${event.shortName}` : `Editor odměn — ${event.shortName}`}
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.92)", lineHeight: 1.5 }}>
            {isSelfService
              ? "Zvol způsob výplaty pro každou etapu. Změny se ukládají automaticky."
              : "Přidávej lidi, vyplňuj hodnoty a zaškrtávej stav schválení. Data se ukládají automaticky."}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
          <SaveIndicator status={saveStatus} message={errorMsg} />
          <button
            onClick={() => {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              if (isSelfService) savePaymentType(s1); else save(s1, s2, s3);
            }}
            disabled={saveStatus === "saving"}
            style={{
              padding: "0.375rem 0.875rem", borderRadius: 6, border: "1px solid rgba(147,179,207,0.35)",
              background: saveStatus === "saving" ? "rgba(147,179,207,0.08)" : "rgba(147,179,207,0.14)",
              color: saveStatus === "saving" ? "rgba(255,255,255,0.65)" : "#93b3cf",
              fontSize: "0.8125rem", fontWeight: 600, cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            Uložit
          </button>
          <a
            href={`/event/${event.id}`}
            style={{
              padding: "0.375rem 0.875rem", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.85)",
              fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none",
              display: "inline-block",
            }}
          >
            ← Veletrh
          </a>
        </div>
      </div>

      {saveStatus === "conflict" && (
        <div style={{
          background: "rgba(231,76,60,0.12)", border: "1px solid rgba(231,76,60,0.4)",
          color: "#e74c3c", padding: "0.625rem 0.875rem", borderRadius: 7,
          fontSize: "0.8125rem", marginBottom: "1rem",
        }}>
          <strong>Konflikt verzí.</strong> {errorMsg}
        </div>
      )}

      {/* SKUPINA 1 */}
      {(!isSelfService || isInSales) && (
      <GroupSection
        title="Skupina 1"
        subtitle="Deal bonus 3 000 Kč za každý kvalifikující obchod. KPI bonus dle pásem."
        accent="#507499"
        total={isSelfService ? undefined : s1Total}
      >
        {(isInSales ? s1.filter((p) => p.name === memberName) : s1).map((p) => {
          const globalPi = s1.findIndex((r) => r._id === p._id);
          return (
            <S1Card
              key={p._id}
              person={p}
              kpiBands={event.kpiBands}
              readOnly={!isAdmin}
              paymentOnly={isSelfService}
              onChange={(updated) => setS1((prev) => prev.map((r, i) => i === globalPi ? updated : r))}
              onDelete={() => setS1((prev) => prev.filter((_, i) => i !== globalPi))}
            />
          );
        })}
        {isAdmin && (
          <AddPersonButton onClick={() => setS1((prev) => [...prev, {
            _id: uid(), name: "", role: "", days: 0, kpiPoints: 0, kpiMaxPoints: 0, dealAmountPerDeal: 3000, checkpoints: emptyCheckpoints(), comment: "",
          }])} />
        )}
      </GroupSection>
      )}

      {/* SKUPINA 2 */}
      {(!isSelfService || isInNesales) && (
        <GroupSection
          title="Skupina 2"
          subtitle={`Fix ${formatCZK(event.dailyRateNesales)} / den + KPI bonus dle pásem.`}
          accent="#23517c"
          total={isSelfService ? undefined : s2Total}
        >
          {(isInNesales ? s2.filter((p) => p.name === memberName) : s2).map((p) => {
            const globalPi = s2.findIndex((r) => r._id === p._id);
            return (
              <S2Card
                key={p._id}
                person={p}
                kpiBands={event.kpiBands}
                dailyRate={event.dailyRateNesales}
                readOnly={!isAdmin}
                onChange={(updated) => setS2((prev) => prev.map((r, i) => i === globalPi ? updated : r))}
                onDelete={() => setS2((prev) => prev.filter((_, i) => i !== globalPi))}
              />
            );
          })}
          {isAdmin && (
            <AddPersonButton onClick={() => setS2((prev) => [...prev, {
              _id: uid(), name: "", role: "", days: 0, kpiPoints: 0, kpiMaxPoints: 0, approval: { ...EMPTY_FLAGS }, paymentType: "vyplata" as PaymentType, comment: "",
            }])} />
          )}
        </GroupSection>
      )}

      {/* SKUPINA 3 */}
      {(!isSelfService || isInPrep) && (
        <GroupSection
          title="Skupina 3"
          subtitle="KPI bonus dle bodového hodnocení (0–150 b.) + hodiny evidované v ClickUp."
          accent="#2b4156"
          total={isSelfService ? undefined : s3Total}
        >
          {(isInPrep ? s3.filter((p) => p.name === memberName) : s3).map((p) => {
            const globalPi = s3.findIndex((r) => r._id === p._id);
            return (
              <S3Card
                key={p._id}
                person={p}
                kpiBands={event.kpiBands}
                readOnly={!isAdmin}
                onChange={(updated) => setS3((prev) => prev.map((r, i) => i === globalPi ? updated : r))}
                onDelete={() => setS3((prev) => prev.filter((_, i) => i !== globalPi))}
              />
            );
          })}
          {isAdmin && (
            <AddPersonButton onClick={() => setS3((prev) => [...prev, {
              _id: uid(), name: "", role: "", days: 0, kpiPoints: 0, kpiMaxPoints: 0, clickupHours: 0, approval: { ...EMPTY_FLAGS }, paymentType: "vyplata" as PaymentType, comment: "",
            }])} />
          )}
        </GroupSection>
      )}

      {/* Celkový součet — pouze pro admina */}
      {!isSelfService && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "1rem",
          padding: "0.875rem 1.25rem",
          background: "rgba(147,179,207,0.07)", border: "1px solid rgba(147,179,207,0.18)",
          borderRadius: 8, marginBottom: "2rem",
        }}>
          <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>Celkem všechny skupiny:</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#93b3cf" }}>{formatCZK(s1Total + s2Total + s3Total)}</span>
        </div>
      )}

      {!isSelfService && <KpiBandsRef kpiBands={event.kpiBands} />}
    </div>
  );
}

// ── Skupina 1 karta ────────────────────────────────────────────────────────────

function S1Card({ person: p, kpiBands, readOnly, paymentOnly = false, onChange, onDelete }: {
  person: S1Person; kpiBands: KpiBand[]; readOnly: boolean; paymentOnly?: boolean;
  onChange: (p: S1Person) => void; onDelete: () => void;
}) {
  const fieldsReadOnly = paymentOnly ? true : readOnly;
  const canEditPayment = paymentOnly || !readOnly;

  const kpiBonus    = getKpiBonus(p.kpiPoints, kpiBands);
  const kpiMaxBonus = p.kpiMaxPoints * 100;
  const kpiTotal    = kpiBonus + kpiMaxBonus;
  const dealBonus   = DEAL_CHECKPOINTS
    .reduce((s, cp) => s + p.checkpoints[cp.key].dealCount * p.dealAmountPerDeal, 0);
  const total = dealBonus + kpiTotal;

  const D7_CHECKPOINTS  = DEAL_CHECKPOINTS.filter((cp) => cp.key === "D+7");
  const DEAL_CP_KEYS    = DEAL_CHECKPOINTS.filter((cp) => cp.key !== "D+7");

  function set<K extends keyof S1Person>(key: K, val: S1Person[K]) {
    onChange({ ...p, [key]: val });
  }

  function setCheckpoint(cp: DealCheckpointKey, field: keyof ApprovalFlags, val: boolean) {
    onChange({
      ...p,
      checkpoints: { ...p.checkpoints, [cp]: { ...p.checkpoints[cp], [field]: val } },
    });
  }

  function setCheckpointPayment(cp: DealCheckpointKey, val: PaymentType) {
    onChange({
      ...p,
      checkpoints: { ...p.checkpoints, [cp]: { ...p.checkpoints[cp], paymentType: val } },
    });
  }

  function setCheckpointDealCount(cp: DealCheckpointKey, val: number) {
    onChange({
      ...p,
      checkpoints: { ...p.checkpoints, [cp]: { ...p.checkpoints[cp], dealCount: val } },
    });
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.1em", color: "rgba(255,255,255,0.85)",
    marginBottom: "0.375rem", marginTop: "0.25rem",
  };

  return (
    <div style={cardStyle("#507499")}>
      <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <Avatar name={p.name} color="#507499" />
        <TextInput value={p.name} placeholder="Jméno příjmení" width={190}
          onChange={(v) => set("name", v)} readOnly={fieldsReadOnly} />
        <TextInput value={p.role} placeholder="Role / pozice" width={220}
          onChange={(v) => set("role", v)} readOnly={fieldsReadOnly} />
        <div style={{ flex: 1 }} />
        <KpiMaxBadge kpiPoints={p.kpiPoints} kpiMaxPoints={p.kpiMaxPoints} kpiBands={kpiBands} />
        <TotalBadge label="Celkem" value={total} primary />
        {!fieldsReadOnly && <DeleteButton onClick={onDelete} />}
      </div>

      <div style={{
        display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end",
        paddingBottom: "0.875rem", marginBottom: "1rem",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <FieldGroup label="Dny">
          <NumInput value={p.days} min={0} max={30} onChange={(v) => set("days", v)} readOnly={fieldsReadOnly} />
        </FieldGroup>
        <FieldGroup label="KPI body (0–100)">
          <NumInput value={p.kpiPoints} min={0} max={100} onChange={(v) => set("kpiPoints", v)} readOnly={fieldsReadOnly} />
        </FieldGroup>
        <FieldGroup label="KPI MAX (0–50)">
          <NumInput value={p.kpiMaxPoints} min={0} max={50} onChange={(v) => set("kpiMaxPoints", v)} readOnly={fieldsReadOnly} />
        </FieldGroup>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <FieldGroup label="Kč / deal">
          <NumInput value={p.dealAmountPerDeal} min={0} step={500} onChange={(v) => set("dealAmountPerDeal", v)} readOnly={fieldsReadOnly} width={80} />
        </FieldGroup>
        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", paddingTop: "1rem" }}>
          platí pro všechny checkpointy
        </span>
      </div>

      <p style={sectionLabel}>D+7 — okamžitá výplata (KPI bonus + KPI MAX)</p>
      <div style={{ overflowX: "auto", marginBottom: "1.25rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
          <thead>
            <tr>
              <th style={thS}>Etapa</th>
              <th style={{ ...thS, color: "rgba(255,255,255,0.6)" }}>Počet dealů</th>
              <th style={{ ...thS, color: "#93b3cf" }}>KPI bonus</th>
              <th style={{ ...thS, color: "#93b3cf" }}>Deal bonus</th>
              <th style={{ ...thS, color: "#81c784" }}>Schváleno</th>
              <th style={{ ...thS, color: "#93b3cf" }}>Finance</th>
              <th style={{ ...thS, color: "#fbbf24" }}>Proplaceno</th>
              <th style={{ ...thS, color: "rgba(255,255,255,0.5)" }}>Způsob výplaty</th>
            </tr>
          </thead>
          <tbody>
            {D7_CHECKPOINTS.map((cp) => {
              const flags    = p.checkpoints[cp.key];
              const d7Deal   = flags.dealCount * p.dealAmountPerDeal;
              return (
                <tr key={cp.key} style={{ background: "rgba(147,179,207,0.04)" }}>
                  <td style={tdS}>
                    <span style={{ fontWeight: 600, color: "#93b3cf" }}>{cp.key}</span>
                    <span style={{ color: "rgba(255,255,255,0.92)", marginLeft: 6, fontSize: "0.75rem" }}>{cp.label}</span>
                  </td>
                  <td style={tdS}>
                    <NumInput value={flags.dealCount} min={0} max={99} width={56}
                      onChange={(v) => setCheckpointDealCount(cp.key, v)} readOnly={fieldsReadOnly} />
                  </td>
                  <td style={tdS}>
                    <span style={{ fontWeight: 700, color: kpiTotal > 0 ? "#93b3cf" : "rgba(255,255,255,0.55)" }}>
                      {kpiTotal > 0 ? formatCZK(kpiTotal) : "–"}
                    </span>
                  </td>
                  <td style={tdS}>
                    <span style={{ fontWeight: 700, color: d7Deal > 0 ? "#93b3cf" : "rgba(255,255,255,0.55)" }}>
                      {d7Deal > 0 ? formatCZK(d7Deal) : "–"}
                    </span>
                  </td>
                  <td style={{ ...tdS, textAlign: "center" }}>
                    <CheckBox checked={flags.schvaleno} color="#81c784"
                      onChange={(v) => setCheckpoint(cp.key, "schvaleno", v)} readOnly={fieldsReadOnly} />
                  </td>
                  <td style={{ ...tdS, textAlign: "center" }}>
                    <CheckBox checked={flags.finance} color="#93b3cf"
                      onChange={(v) => setCheckpoint(cp.key, "finance", v)} readOnly={fieldsReadOnly} />
                  </td>
                  <td style={{ ...tdS, textAlign: "center" }}>
                    <CheckBox checked={flags.proplaceno} color="#fbbf24"
                      onChange={(v) => setCheckpoint(cp.key, "proplaceno", v)} readOnly={fieldsReadOnly} />
                  </td>
                  <td style={{ ...tdS, paddingLeft: "0.75rem" }}>
                    <PaymentToggle value={flags.paymentType} readOnly={!canEditPayment}
                      onChange={(v) => setCheckpointPayment(cp.key, v)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={sectionLabel}>Obchodní checkpointy — výplata dle uzavřených dealů</p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
          <thead>
            <tr>
              <th style={thS}>Etapa</th>
              <th style={{ ...thS, color: "rgba(255,255,255,0.6)" }}>Počet dealů</th>
              <th style={{ ...thS, color: "#93b3cf" }}>Deal bonus</th>
              <th style={{ ...thS, color: "#81c784" }}>Schváleno</th>
              <th style={{ ...thS, color: "#93b3cf" }}>Finance</th>
              <th style={{ ...thS, color: "#fbbf24" }}>Proplaceno</th>
              <th style={{ ...thS, color: "rgba(255,255,255,0.5)" }}>Způsob výplaty</th>
            </tr>
          </thead>
          <tbody>
            {DEAL_CP_KEYS.map((cp, ci) => {
              const flags     = p.checkpoints[cp.key];
              const cpBonus   = flags.dealCount * p.dealAmountPerDeal;
              return (
                <tr key={cp.key} style={{ background: ci % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                  <td style={tdS}>
                    <span style={{ fontWeight: 600, color: "#93b3cf" }}>{cp.key}</span>
                    <span style={{ color: "rgba(255,255,255,0.92)", marginLeft: 6, fontSize: "0.75rem" }}>{cp.label}</span>
                  </td>
                  <td style={{ ...tdS }}>
                    <NumInput value={flags.dealCount} min={0} max={99} width={56}
                      onChange={(v) => setCheckpointDealCount(cp.key, v)} readOnly={fieldsReadOnly} />
                  </td>
                  <td style={tdS}>
                    <span style={{ fontWeight: 700, color: cpBonus > 0 ? "#93b3cf" : "rgba(255,255,255,0.55)" }}>
                      {cpBonus > 0 ? formatCZK(cpBonus) : "–"}
                    </span>
                  </td>
                  <td style={{ ...tdS, textAlign: "center" }}>
                    <CheckBox checked={flags.schvaleno} color="#81c784"
                      onChange={(v) => setCheckpoint(cp.key, "schvaleno", v)} readOnly={fieldsReadOnly} />
                  </td>
                  <td style={{ ...tdS, textAlign: "center" }}>
                    <CheckBox checked={flags.finance} color="#93b3cf"
                      onChange={(v) => setCheckpoint(cp.key, "finance", v)} readOnly={fieldsReadOnly} />
                  </td>
                  <td style={{ ...tdS, textAlign: "center" }}>
                    <CheckBox checked={flags.proplaceno} color="#fbbf24"
                      onChange={(v) => setCheckpoint(cp.key, "proplaceno", v)} readOnly={fieldsReadOnly} />
                  </td>
                  <td style={{ ...tdS, paddingLeft: "0.75rem" }}>
                    <PaymentToggle value={flags.paymentType} readOnly={!canEditPayment}
                      onChange={(v) => setCheckpointPayment(cp.key, v)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CommentField value={p.comment} readOnly={fieldsReadOnly} onChange={(v) => set("comment", v)} />
    </div>
  );
}

// ── Skupina 2 karta ────────────────────────────────────────────────────────────

function S2Card({ person: p, kpiBands, dailyRate, readOnly, onChange, onDelete }: {
  person: S2Person; kpiBands: KpiBand[]; dailyRate: number; readOnly: boolean;
  onChange: (p: S2Person) => void; onDelete: () => void;
}) {
  const fix         = p.days * dailyRate;
  const kpiBonus    = getKpiBonus(p.kpiPoints, kpiBands);
  const kpiMaxBonus = p.kpiMaxPoints * 100;
  const total       = fix + kpiBonus + kpiMaxBonus;

  function set<K extends keyof S2Person>(key: K, val: S2Person[K]) {
    onChange({ ...p, [key]: val });
  }

  function setApproval(field: keyof ApprovalFlags, val: boolean) {
    onChange({ ...p, approval: { ...p.approval, [field]: val } });
  }

  return (
    <div style={cardStyle("#23517c")}>
      <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <Avatar name={p.name} color="#23517c" />
        <TextInput value={p.name} placeholder="Jméno příjmení" width={190}
          onChange={(v) => set("name", v)} readOnly={readOnly} />
        <TextInput value={p.role} placeholder="Role / pozice" width={220}
          onChange={(v) => set("role", v)} readOnly={readOnly} />
        <div style={{ flex: 1 }} />
        <KpiMaxBadge kpiPoints={p.kpiPoints} kpiMaxPoints={p.kpiMaxPoints} kpiBands={kpiBands} />
        <TotalBadge label="Celkem" value={total} primary />
        {!readOnly && <DeleteButton onClick={onDelete} />}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <FieldGroup label="Dny">
          <NumInput value={p.days} min={0} max={30} onChange={(v) => set("days", v)} readOnly={readOnly} />
        </FieldGroup>
        <FieldGroup label={`Fix (${formatCZK(dailyRate)}/den)`}>
          <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: fix > 0 ? "#93b3cf" : "rgba(255,255,255,0.55)" }}>
            {fix > 0 ? formatCZK(fix) : "–"}
          </span>
        </FieldGroup>
        <FieldGroup label="KPI body (0–100)">
          <NumInput value={p.kpiPoints} min={0} max={100} onChange={(v) => set("kpiPoints", v)} readOnly={readOnly} />
        </FieldGroup>
        <FieldGroup label="KPI MAX (0–50)">
          <NumInput value={p.kpiMaxPoints} min={0} max={50} onChange={(v) => set("kpiMaxPoints", v)} readOnly={readOnly} />
        </FieldGroup>
        <div style={{ width: "1px", height: 32, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
        <ApprovalCheck label="Schváleno" checked={p.approval.schvaleno} color="#81c784"
          onChange={(v) => setApproval("schvaleno", v)} readOnly={readOnly} />
        <ApprovalCheck label="Finance" checked={p.approval.finance} color="#93b3cf"
          onChange={(v) => setApproval("finance", v)} readOnly={readOnly} />
        <ApprovalCheck label="Proplaceno" checked={p.approval.proplaceno} color="#fbbf24"
          onChange={(v) => setApproval("proplaceno", v)} readOnly={readOnly} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.88)" }}>Způsob výplaty</span>
          <PaymentToggle value={p.paymentType} readOnly={readOnly} onChange={(v) => set("paymentType", v)} />
        </div>
      </div>

      <CommentField value={p.comment} readOnly={readOnly} onChange={(v) => set("comment", v)} />
    </div>
  );
}

// ── Skupina 3 karta ────────────────────────────────────────────────────────────

function S3Card({ person: p, kpiBands, readOnly, onChange, onDelete }: {
  person: S3Person; kpiBands: KpiBand[]; readOnly: boolean;
  onChange: (p: S3Person) => void; onDelete: () => void;
}) {
  const kpiBonus    = getKpiBonus(p.kpiPoints, kpiBands);
  const kpiMaxBonus = p.kpiMaxPoints * 100;
  const total       = kpiBonus + kpiMaxBonus;

  function set<K extends keyof S3Person>(key: K, val: S3Person[K]) {
    onChange({ ...p, [key]: val });
  }

  function setApproval(field: keyof ApprovalFlags, val: boolean) {
    onChange({ ...p, approval: { ...p.approval, [field]: val } });
  }

  return (
    <div style={cardStyle("#2b4156")}>
      <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <Avatar name={p.name} color="#2b4156" />
        <TextInput value={p.name} placeholder="Jméno příjmení" width={190}
          onChange={(v) => set("name", v)} readOnly={readOnly} />
        <TextInput value={p.role} placeholder="Role / pozice" width={220}
          onChange={(v) => set("role", v)} readOnly={readOnly} />
        <div style={{ flex: 1 }} />
        <KpiMaxBadge kpiPoints={p.kpiPoints} kpiMaxPoints={p.kpiMaxPoints} kpiBands={kpiBands} />
        <TotalBadge label="Celkem" value={total} primary />
        {!readOnly && <DeleteButton onClick={onDelete} />}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <FieldGroup label="KPI body (0–100)">
          <NumInput value={p.kpiPoints} min={0} max={100} onChange={(v) => set("kpiPoints", v)} readOnly={readOnly} />
        </FieldGroup>
        <FieldGroup label="KPI MAX (0–50)">
          <NumInput value={p.kpiMaxPoints} min={0} max={50} onChange={(v) => set("kpiMaxPoints", v)} readOnly={readOnly} />
        </FieldGroup>
        <FieldGroup label="Hodiny ClickUp">
          <NumInput value={p.clickupHours} min={0} step={0.5} onChange={(v) => set("clickupHours", v)} readOnly={readOnly} width={64} />
        </FieldGroup>
        <div style={{ width: "1px", height: 32, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
        <ApprovalCheck label="Schváleno" checked={p.approval.schvaleno} color="#81c784"
          onChange={(v) => setApproval("schvaleno", v)} readOnly={readOnly} />
        <ApprovalCheck label="Finance" checked={p.approval.finance} color="#93b3cf"
          onChange={(v) => setApproval("finance", v)} readOnly={readOnly} />
        <ApprovalCheck label="Proplaceno" checked={p.approval.proplaceno} color="#fbbf24"
          onChange={(v) => setApproval("proplaceno", v)} readOnly={readOnly} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.88)" }}>Způsob výplaty</span>
          <PaymentToggle value={p.paymentType} readOnly={readOnly} onChange={(v) => set("paymentType", v)} />
        </div>
      </div>

      <CommentField value={p.comment} readOnly={readOnly} onChange={(v) => set("comment", v)} />
    </div>
  );
}

// ── Sdílené UI komponenty ───────────────────────────────────────────────────────

function GroupSection({ title, subtitle, accent, total, children }: {
  title: string; subtitle: string; accent: string; total?: number; children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        marginBottom: "0.875rem", paddingBottom: "0.5rem",
        borderBottom: `2px solid ${accent}55`,
      }}>
        <div>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: accent, marginBottom: 3 }}>
            {title}
          </p>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.88)" }}>{subtitle}</p>
        </div>
        {total !== undefined && (
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#93b3cf", flexShrink: 0 }}>{formatCZK(total)}</span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {children}
      </div>
    </section>
  );
}

function SaveIndicator({ status, message }: { status: "idle" | "saving" | "saved" | "error" | "conflict"; message?: string }) {
  if (status === "idle") return null;
  const map = {
    saving:   { text: "Ukládám…",       color: "rgba(255,255,255,0.95)" },
    saved:    { text: "✓ Uloženo",       color: "#81c784" },
    error:    { text: "✗ Chyba ukládání", color: "#e74c3c" },
    conflict: { text: "⚠ Konflikt verzí — načítám", color: "#fbbf24" },
  } as const;
  const s = map[status];
  return (
    <span title={message} style={{ fontSize: "0.8125rem", fontWeight: 600, color: s.color, alignSelf: "flex-start", paddingTop: 4 }}>
      {s.text}
    </span>
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";
  return (
    <div style={{
      width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
      background: `${color}33`, border: `1px solid ${color}66`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.75rem", fontWeight: 700, color: "#ffffff",
    }}>
      {initials}
    </div>
  );
}

function TextInput({ value, placeholder, width, onChange, readOnly }: {
  value: string; placeholder: string; width?: number; onChange: (v: string) => void; readOnly: boolean;
}) {
  if (readOnly) {
    return (
      <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#ffffff", minWidth: width }}>
        {value || <span style={{ color: "rgba(255,255,255,0.92)" }}>{placeholder}</span>}
      </span>
    );
  }
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: width ?? 160, background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.15)", borderRadius: 5,
        color: "#ffffff", fontSize: "0.875rem", padding: "5px 9px",
        fontFamily: "inherit", outline: "none",
      }}
    />
  );
}

function NumInput({ value, min, max, step, width, onChange, readOnly }: {
  value: number; min?: number; max?: number; step?: number; width?: number;
  onChange: (v: number) => void; readOnly: boolean;
}) {
  if (readOnly) {
    return <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#ffffff" }}>{value}</span>;
  }
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step ?? 1}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        const clamped = max !== undefined ? Math.min(max, Math.max(min ?? 0, isNaN(v) ? 0 : v)) : (isNaN(v) ? 0 : Math.max(min ?? 0, v));
        onChange(clamped);
      }}
      style={{
        width: width ?? 56, textAlign: "center",
        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 5, color: "#ffffff", fontSize: "0.875rem",
        padding: "5px 6px", fontFamily: "inherit", outline: "none",
      }}
    />
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.88)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function TotalBadge({ label, value, primary }: { label: string; value: number; primary?: boolean }) {
  return (
    <div style={{ textAlign: "right" }}>
      <p style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.88)", marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontSize: primary ? "1.0625rem" : "0.875rem", fontWeight: 700, color: primary ? "#93b3cf" : "rgba(147,179,207,0.7)", lineHeight: 1 }}>
        {formatCZK(value)}
      </p>
    </div>
  );
}

function CheckBox({ checked, color, onChange, readOnly }: {
  checked: boolean; color: string; onChange: (v: boolean) => void; readOnly: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !readOnly && onChange(!checked)}
      style={{
        width: 26, height: 26, borderRadius: 5, border: `2px solid ${checked ? color : "rgba(255,255,255,0.2)"}`,
        background: checked ? `${color}22` : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: readOnly ? "default" : "pointer",
        transition: "all 0.15s", flexShrink: 0,
      }}
    >
      {checked && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

function ApprovalCheck({ label, checked, color, onChange, readOnly }: {
  label: string; checked: boolean; color: string; onChange: (v: boolean) => void; readOnly: boolean;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: readOnly ? "default" : "pointer" }}>
      <CheckBox checked={checked} color={color} onChange={onChange} readOnly={readOnly} />
      <span style={{ fontSize: "0.8125rem", fontWeight: checked ? 700 : 400, color: checked ? color : "rgba(255,255,255,0.5)" }}>
        {label}
      </span>
    </label>
  );
}

function KpiMaxBadge({ kpiPoints, kpiMaxPoints, kpiBands }: { kpiPoints: number; kpiMaxPoints: number; kpiBands: KpiBand[] }) {
  const kpiBonus    = getKpiBonus(kpiPoints, kpiBands);
  const kpiMaxBonus = kpiMaxPoints * 100;
  const isStdMax    = kpiPoints >= 100;
  const hasMax      = kpiMaxPoints > 0;

  if (hasMax) {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "4px 10px",
        background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.55)",
        borderRadius: 20, flexShrink: 0,
      }}>
        <span style={{ fontSize: "0.75rem" }}>⭐</span>
        <div>
          <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "rgba(255,215,0,0.7)", letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1, marginBottom: 1 }}>KPI MAX</p>
          <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#ffd700", lineHeight: 1 }}>{formatCZK(kpiMaxBonus)}</p>
        </div>
      </div>
    );
  }

  if (isStdMax) {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "4px 10px",
        background: "rgba(147,179,207,0.18)", border: "1px solid rgba(147,179,207,0.55)",
        borderRadius: 20, flexShrink: 0,
      }}>
        <div>
          <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "#93b3cf", letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1, marginBottom: 1 }}>Standard MAX</p>
          <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#cddce8", lineHeight: 1 }}>{formatCZK(kpiBonus)}</p>
        </div>
      </div>
    );
  }

  if (kpiPoints === 0 && kpiBonus === 0) return null;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 10px",
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 20, flexShrink: 0,
    }}>
      <div>
        <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1, marginBottom: 1 }}>KPI bonus</p>
        <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#93b3cf", lineHeight: 1 }}>{formatCZK(kpiBonus)}</p>
      </div>
    </div>
  );
}

function CommentField({ value, readOnly, onChange }: { value: string; readOnly: boolean; onChange: (v: string) => void }) {
  if (readOnly && !value) return null;
  return (
    <div style={{ marginTop: "0.75rem", paddingTop: "0.625rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <p style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.85)", marginBottom: "0.375rem" }}>
        Komentář
      </p>
      {readOnly ? (
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.92)", lineHeight: 1.5, fontStyle: "italic" }}>{value}</p>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Proč takto? Doplňte poznámku k odměně…"
          rows={2}
          style={{
            width: "100%", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
            color: "#ffffff", fontSize: "0.8125rem", padding: "0.5rem 0.625rem",
            resize: "vertical", fontFamily: "inherit", lineHeight: 1.5,
            outline: "none", boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}

function AddPersonButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "0.5rem 0.875rem",
        background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.2)",
        borderRadius: 7, color: "rgba(255,255,255,0.92)", fontSize: "0.8125rem",
        cursor: "pointer", fontFamily: "inherit", marginTop: "0.25rem",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)";
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Přidat osobu
    </button>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Odstranit"
      style={{
        width: 28, height: 28, borderRadius: 5, border: "1px solid rgba(231,76,60,0.3)",
        background: "rgba(231,76,60,0.08)", color: "rgba(231,76,60,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(231,76,60,0.2)";
        (e.currentTarget as HTMLButtonElement).style.color = "#e74c3c";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(231,76,60,0.08)";
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(231,76,60,0.7)";
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
      </svg>
    </button>
  );
}

function KpiBandsRef({ kpiBands }: { kpiBands: KpiBand[] }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 7, padding: "0.75rem 1rem", marginBottom: "2rem",
    }}>
      <p style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.88)", marginBottom: "0.5rem" }}>
        KPI pásma — všechny skupiny
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
        {kpiBands.map((b) => (
          <span key={b.label} style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)" }}>
            {b.label} → <strong style={{ color: b.bonus >= 10000 ? "#ffd700" : "#93b3cf" }}>{formatCZK(b.bonus)}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Sdílené styly ───────────────────────────────────────────────────────────────

function PaymentToggle({ value, readOnly, onChange }: {
  value: PaymentType; readOnly: boolean; onChange: (v: PaymentType) => void;
}) {
  const options: PaymentType[] = ["vyplata", "pull"];
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {options.map((opt) => {
        const active = value === opt;
        const accent = opt === "vyplata" ? "#81c784" : "#fbbf24";
        return (
          <button
            key={opt}
            type="button"
            onClick={() => !readOnly && onChange(opt)}
            style={{
              padding: "4px 10px", borderRadius: 5, fontSize: "0.75rem", fontWeight: active ? 700 : 400,
              border: `1px solid ${active ? accent : "rgba(255,255,255,0.15)"}`,
              background: active ? `${accent}22` : "transparent",
              color: active ? accent : "rgba(255,255,255,0.80)",
              cursor: readOnly ? "default" : "pointer",
              transition: "all 0.15s", fontFamily: "inherit",
            }}
          >
            {PAYMENT_TYPE_LABELS[opt]}
          </button>
        );
      })}
    </div>
  );
}

function cardStyle(accent: string): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderLeft: `3px solid ${accent}`,
    borderRadius: 8,
    padding: "1rem 1.125rem",
  };
}

const thS: React.CSSProperties = {
  padding: "6px 10px", textAlign: "left",
  fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
  color: "rgba(255,255,255,0.92)", background: "rgba(21,49,81,0.5)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const tdS: React.CSSProperties = {
  padding: "7px 10px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  color: "#ffffff",
};
