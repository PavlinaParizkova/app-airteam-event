import type { EventData, KpiBand, KpiEntry, PrepBandDef, PrepBand } from "@/data/events";

// ── KPI oblasti dle SOP bod 13 ─────────────────────────────────────────────────

export const KPI_AREAS: { label: string; maxPoints: number }[] = [
  { label: "KPI 1 – Příprava",            maxPoints: 25 },
  { label: "KPI 2 – Výkon na místě",      maxPoints: 35 },
  { label: "KPI 3 – Follow-up do 7 dnů",  maxPoints: 25 },
  { label: "Týmový cíl",                   maxPoints: 15 },
  { label: "Nad rámec zadání",             maxPoints: 50 },
];

/** Doplní KPI oblasti na standardních 5 dle SOP. Přebírá description + awarded z existujících. */
export function normalizeKpiAreas(existing: KpiEntry[]): KpiEntry[] {
  return KPI_AREAS.map((area, i) => ({
    label: area.label,
    description: existing[i]?.description ?? "",
    maxPoints: area.maxPoints,
    awarded: Math.min(existing[i]?.awarded ?? 0, area.maxPoints),
  }));
}

/** Vrátí KPI bonus dle celkového počtu bodů a pásem eventu. 0 bodů = 0 Kč. */
export function getKpiBonus(total: number, kpiBands: KpiBand[]): number {
  if (total <= 0) return 0;
  const band = kpiBands.find((b) => total >= b.minPoints && total <= b.maxPoints);
  return band?.bonus ?? 0;
}

/** Vrátí pásmo přípravného týmu dle odpracovaných hodin. */
export function getPrepBandForHours(
  hours: number,
  prepBands: PrepBandDef[],
): PrepBandDef | null {
  if (prepBands.length === 0) return null;
  return (
    prepBands.find((b) => {
      if (b.hoursMin === null && b.hoursMax === null) return false; // pásmo 0 — jen manuální
      if (b.hoursMax === null) return hours >= (b.hoursMin ?? 0);
      if (b.hoursMin === null) return hours <= b.hoursMax;
      return hours >= b.hoursMin && hours <= b.hoursMax;
    }) ?? null
  );
}

/** Vypočítá bonus pásma přípravného týmu (pro pásmo 0 = hodinová sazba). */
export function calcPrepBonus(hours: number, band: PrepBandDef): number {
  if (band.ratePerHour) return Math.round(hours * band.ratePerHour);
  return band.bonus;
}

/** Přepočítá grandTotal, fixTotal, variableTotal z aktuálního stavu eventData. */
export function calcEventTotals(event: EventData): {
  grandTotal: number;
  fixTotal: number;
  variableTotal: number;
} {
  const salesGrand   = event.salesTeam.reduce((s, p) => s + p.total, 0);
  const nesalesGrand = event.nesalesTeam.reduce((s, p) => s + p.total, 0);
  const prepGrand    = event.prepTeam.reduce((s, p) => s + p.bonus, 0);

  const salesFix   = event.salesTeam.reduce((s, p) => s + p.fixAmount, 0);
  const nesalesFix = event.nesalesTeam.reduce((s, p) => s + p.fixAmount, 0);

  const grandTotal    = salesGrand + nesalesGrand + prepGrand;
  const fixTotal      = salesFix + nesalesFix;
  const variableTotal = grandTotal - fixTotal;

  return { grandTotal, fixTotal, variableTotal };
}

/** Vrátí label pásma pro daný počet bodů. 0 bodů = "—". */
export function getKpiBandLabel(total: number, kpiBands: KpiBand[]): string {
  if (total <= 0) return "—";
  const band = kpiBands.find((b) => total >= b.minPoints && total <= b.maxPoints);
  return band?.label ?? "—";
}

/** Typ pro PrepBand string (re-export pro použití v Client Componentech). */
export type { PrepBand };
