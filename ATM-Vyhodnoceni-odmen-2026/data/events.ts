// Datový model pro vyhodnocení odměn z eventů AIR TEAM
// Zdroj: AIR-TEAM/ATM-procesy-sop-2026/10-eventy/10-eventy-PROCES-2026.md

export type ApprovalStatus = "draft" | "submitted" | "approved" | "paid";

export type PaymentType = "vyplata" | "pull";
export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  vyplata: "výplata",
  pull:    "pool",
};

export type ApprovalFlags = {
  schvaleno:  boolean;
  finance:    boolean;
  proplaceno: boolean;
};

export type KpiEntry = {
  label: string;
  description: string;
  maxPoints: number;
  awarded: number;
};

export type SalesEntry = {
  name: string;
  role: string;
  days: number;
  fixAmount: number;
  dealBonus: number;
  dealCount?: number;
  dealAmountPerDeal?: number;
  kpiBonus: number;
  kpiMaxBonus?: number;
  kpiPoints?: number;
  kpiMaxPoints?: number;
  kpiDetails: KpiEntry[];
  total: number;
  paymentType?: PaymentType;
  comment?: string;
};

export type NesalesEntry = {
  name: string;
  role: string;
  days: number;
  fixAmount: number;
  kpiBonus: number;
  kpiMaxBonus?: number;
  total: number;
  kpiDetails: KpiEntry[];
  kpiTotal: number;
  note?: string;
  approval?: ApprovalFlags;
  paymentType?: PaymentType;
  comment?: string;
};

export type PrepBand = "0" | "A" | "B" | "C" | "D" | "E";

export type PrepEntry = {
  name: string;
  role: string;
  days?: number;
  hoursRaw: string;
  hoursNumeric: number;
  band: PrepBand;
  bonus: number;
  kpiPoints?: number;
  kpiMaxPoints?: number;
  kpiMaxBonus?: number;
  approval?: ApprovalFlags;
  paymentType?: PaymentType;
  comment?: string;
};

export type KpiBand = {
  label: string;
  minPoints: number;
  maxPoints: number;
  bonus: number;
};

export type PrepBandDef = {
  band: PrepBand;
  label: string;
  hoursMin: number | null;
  hoursMax: number | null;
  bonus: number;
  ratePerHour?: number;
};

export type Approver = {
  role: string;
  name: string;
  signed: boolean;
  date?: string;
};

export type EventResult = {
  label: string;
  value: string;
};

// ── Checklist ──────────────────────────────────────────────────────────────────

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  doneDate?: string;
};

/** Výchozí checklist dle SOP bod 13 — deal follow-up termíny */
export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "kpi-done",  label: "KPI tabulka vyplněna (deadline D+7)",  done: false },
  { id: "deal-d7",   label: "Deal follow-up D+7 dní",               done: false },
  { id: "deal-d3m",  label: "Deal follow-up D+3 měsíce",            done: false },
  { id: "deal-d6m",  label: "Deal follow-up D+6 měsíců",            done: false },
  { id: "deal-d9m",  label: "Deal follow-up D+9 měsíců",            done: false },
  { id: "deal-d12m", label: "Deal follow-up D+12 měsíců",           done: false },
];

// ── Sales KPI tracking (leady + schválení + finance kroky) ────────────────────

export type FinanceStep = {
  id: string;
  label: string;      // např. "D+7 splátka", "D+3M splátka", "Finální doplatek"
  sent: boolean;
  sentDate?: string;
};

export type SalesPersonTracking = {
  personName: string;
  leadsCount: number | null;    // počet leadů zadaný MKT
  kpiPoints: number | null;     // KPI body od MKT (0–100)
  ceoApproved: boolean;
  ceoApprovedDate?: string;
  financeSteps: FinanceStep[];
};

export const DEFAULT_FINANCE_STEPS: Omit<FinanceStep, "id">[] = [
  { label: "Splátka 1 (po D+7)",    sent: false },
  { label: "Splátka 2 (po D+3M)",   sent: false },
  { label: "Finální doplatek",       sent: false },
];

// ── Prep team KPI tracking (nahrazuje pásma) ───────────────────────────────────

export type PrepPersonTracking = {
  personName: string;
  kpiPoints: number | null;     // KPI body od MKT (0–100)
  ceoApproved: boolean;
  ceoApprovedDate?: string;
  financeStep: FinanceStep;     // přípravný tým dostává jednorázovou odměnu
};

// ── Deal tracking pro Sales ────────────────────────────────────────────────────

export const DEAL_CHECKPOINTS = [
  { key: "D+7",   label: "D+7 dní" },
  { key: "D+3M",  label: "D+3 měsíce" },
  { key: "D+6M",  label: "D+6 měsíců" },
  { key: "D+9M",  label: "D+9 měsíců" },
  { key: "D+12M", label: "D+12 měsíců" },
] as const;

export type DealCheckpointKey = (typeof DEAL_CHECKPOINTS)[number]["key"];

// ── B2B / OEM deal bonus ────────────────────────────────────────────────────

export const OEM_CHECKPOINTS = [
  { key: "D+7",   label: "D+7 dní" },
  { key: "D+3M",  label: "D+3 měsíce" },
  { key: "D+6M",  label: "D+6 měsíců" },
  { key: "D+9M",  label: "D+9 měsíců" },
  { key: "D+12M", label: "D+12 měsíců" },
  { key: "D+18M", label: "D+18 měsíců" },
  { key: "D+24M", label: "D+24 měsíců" },
] as const;

export type OemCheckpointKey = (typeof OEM_CHECKPOINTS)[number]["key"];

export type OemStage = 1 | 2;
export type OemTier = 1 | 2 | 3;

/** Stage 1: fixed OEM lead qualification bonus. */
export const OEM_LEAD_BONUS = 2000;

/** Stage 2: contract bonus per tier (annual contract value). */
export const OEM_TIER_BONUS: Record<OemTier, number> = {
  1: 5000,    // do 100 000 USD/rok
  2: 10000,   // 100 001–500 000 USD/rok
  3: 20000,   // 500 000+ USD/rok
};

export type OemDeal = {
  id: string;
  personName: string;
  company: string;           // název OEM zákazníka
  contactType: string;       // "výrobce letadel" | "integrační partner" | "MRO holding" | jiný
  milestone: string;         // popis milníku (NDA, procurement vstup, tech. jednání)
  stage: OemStage;
  tier?: OemTier;            // pouze pro stage 2
  annualValueUSD?: number;   // pouze pro stage 2
  bonus: number;             // 2 000 pro stage 1; OEM_TIER_BONUS[tier] pro stage 2
  checkpoint: OemCheckpointKey;
  addedDate: string;
  schvaleno: boolean;
  finance: boolean;
  proplaceno: boolean;
  paymentType?: PaymentType;
  ceoApproved?: boolean;     // stage 2 vyžaduje CEO schválení
  ceoApprovedDate?: string;
};

export type DealApproval = {
  personName: string;
  checkpoint: DealCheckpointKey;
  schvaleno:  boolean;
  finance:    boolean;
  proplaceno: boolean;
  paymentType?: PaymentType;
  dealCount?: number;   // počet dealů uzavřených v tomto checkpointu (relevatní D+3M až D+12M)
};

export type DealEntry = {
  id: string;
  personName: string;
  checkpoint: DealCheckpointKey;
  description: string;
  type: "order" | "aircraft";
  amountUSD: number;        // výše objednávky v USD (>10 000 USD = kvalifikující)
  bonus: number;            // standardně 3 000 Kč dle SOP
  addedDate: string;
};

export type EventData = {
  id: string;
  name: string;
  shortName: string;
  location: string;
  dateStart: string;
  dateEnd: string;
  processedDate: string;
  owner: string;
  division: string;
  approvalDeadline: string;
  status: ApprovalStatus;

  // Volitelné shrnutí výsledků eventu
  eventResults?: EventResult[];

  dailyRateSales: number;
  dealBonusNote?: string;
  salesTeam: SalesEntry[];           // prázdné pole = žádný sales tým

  dailyRateNesales: number;
  nesalesTeam: NesalesEntry[];

  kpiBands: KpiBand[];
  kpiApprover: string;

  prepTeam: PrepEntry[];             // prázdné pole = žádný přípravný tým
  prepTeamNote?: string;
  prepTeamLabel?: string;            // override názvu skupiny (default: "ATS příprava")
  prepBands: PrepBandDef[];

  approvers: Approver[];
  approvalNote?: string;             // např. "Schváleno a vyplaceno — březen 2026"

  grandTotal: number;
  fixTotal: number;
  variableTotal: number;

  // ── Checklist & deal tracking (přidáno po zavedení KV databáze) ───────────
  checklist?: ChecklistItem[];
  dealLog?: DealEntry[];
  lastModified?: string;

  // ── Sales KPI tracking — leady, schválení CEO, finance kroky ────────────
  salesKpiTracking?: SalesPersonTracking[];

  // ── Prep team KPI tracking — nahrazuje pásma ─────────────────────────────
  prepKpiTracking?: PrepPersonTracking[];

  // ── Odmeny editor — per-person deal approvals ─────────────────────────────
  dealApprovals?: DealApproval[];

  // ── B2B / OEM deal bonus (Stage 1 leads + Stage 2 contracts) ──────────────
  oemDeals?: OemDeal[];
};

export const EVENTS: EventData[] = [
  {
    id: "aero-expo-2026",
    name: "AERO EXPO 2026 – Friedrichshafen",
    shortName: "AERO EXPO 2026",
    location: "Friedrichshafen, Německo",
    dateStart: "2026-04-22",
    dateEnd: "2026-04-25",
    processedDate: "2026-05-06",
    owner: "Pavlína Pařízková",
    division: "AIR TEAM (01)",
    approvalDeadline: "2026-05-02",
    status: "submitted",

    eventResults: [
      { label: "Plánované schůzky",            value: "43 unikátních (51 v Google Kalendáři)" },
      { label: "Uskutečněné schůzky",           value: "67" },
      { label: "Náklady celkem",                value: "484 563 Kč" },
      { label: "Provozní náklady (bez aktiv)",  value: "367 263 Kč" },
      { label: "Dlouhodobá aktiva (Cube + panel)", value: "117 300 Kč" },
      { label: "LinkedIn – zobrazení (AERO)",   value: "4 523" },
      { label: "LinkedIn – kliků",              value: "795" },
      { label: "LinkedIn – reakcí",             value: "121" },
      { label: "Cíle účasti splněny",           value: "Ano" },
    ],

    dailyRateSales: 2000,
    dealBonusNote:
      "Navrhnuje Pavlína Pařízková (Marketing Manager). Deadline: D+7 od skončení eventu (do 2. 5. 2026). Petr Polák (CEO) byl přítomen 4 dny — odměna CEO se neřeší přes tento proces.",

    salesTeam: [
      {
        name: "Jan Polák",
        role: "Part 145 Manager (AIR TEAM service)",
        days: 4,
        fixAmount: 8000,
        dealBonus: 7000,
        kpiBonus: 0,
        kpiDetails: [],
        total: 15000,
      },
      {
        name: "Magdaléna Ševčíková",
        role: "MRO Sales Manager",
        days: 4,
        fixAmount: 8000,
        dealBonus: 12000,
        kpiBonus: 0,
        kpiDetails: [],
        total: 20000,
      },
      {
        name: "Jakub Dryska",
        role: "Key Account Manager",
        days: 3,
        fixAmount: 6000,
        dealBonus: 0,
        kpiBonus: 0,
        kpiDetails: [],
        total: 6000,
      },
      {
        name: "Alex Mudrych",
        role: "Business Development",
        days: 2,
        fixAmount: 4000,
        dealBonus: 4000,
        kpiBonus: 0,
        kpiDetails: [],
        total: 8000,
      },
      {
        name: "Vratko Kapuš",
        role: "Account Manager",
        days: 1,
        fixAmount: 2000,
        dealBonus: 0,
        kpiBonus: 0,
        kpiDetails: [],
        total: 2000,
      },
    ],

    dailyRateNesales: 2000,

    nesalesTeam: [
      {
        name: "Lucie Kysučanová",
        role: "People & Culture Partner",
        days: 2,
        fixAmount: 4000,
        kpiBonus: 5000,
        total: 9000,
        kpiTotal: 100,
        kpiDetails: [
          {
            label: "KPI 1 – Příprava",
            description:
              "Fyzická pomoc při přípravách reklamních předmětů. Koordinace týmu na schůzky, aktivní přístup ke zpracování produkčních věcí.",
            maxPoints: 25,
            awarded: 25,
          },
          {
            label: "KPI 2 – Výkon na místě",
            description:
              "Koordinace meeting slotů na eventu, podpora celého týmu na stánku po celou dobu přítomnosti. Marketingové výstupy, natáčení videí. Kompletní organizace marketingových materiálů na místě.",
            maxPoints: 35,
            awarded: 35,
          },
          {
            label: "KPI 3 – Follow-up do 7 dnů",
            description:
              "Vyhodnocení eventu.",
            maxPoints: 25,
            awarded: 25,
          },
          {
            label: "Týmový cíl",
            description:
              "Podpora týmu na místě.",
            maxPoints: 15,
            awarded: 15,
          },
        ],
      },
      {
        name: "Jirka Franz",
        role: "Procurement Manager",
        days: 2,
        fixAmount: 4000,
        kpiBonus: 4000,
        total: 8000,
        kpiTotal: 80,
        kpiDetails: [
          {
            label: "KPI 1 – Příprava",
            description:
              "Příprava seznamu cílových dodavatelů a partnerů k oslovení, briefing od procurement týmu.",
            maxPoints: 25,
            awarded: 5,
          },
          {
            label: "KPI 2 – Výkon na místě",
            description:
              "Počet navázaných kontaktů s dodavateli, zmapování nabídky klíčových technologických partnerů, záznamy z jednání.",
            maxPoints: 35,
            awarded: 35,
          },
          {
            label: "KPI 3 – Follow-up do 7 dnů",
            description:
              "Zapsané kontakty v CRM / sdílené tabulce, shrnutí postřehů z nabídky trhu předané purchasing týmu.",
            maxPoints: 25,
            awarded: 25,
          },
          {
            label: "Týmový cíl",
            description:
              "Celkový tým splnil leadový cíl eventu (počet leadů / schůzek dle plánu).",
            maxPoints: 15,
            awarded: 15,
          },
        ],
      },
    ],

    kpiBands: [
      { label: "1–24 b.",       minPoints: 1,   maxPoints: 24,  bonus: 1000 },
      { label: "25–49 b.",      minPoints: 25,  maxPoints: 49,  bonus: 2000 },
      { label: "50–74 b.",      minPoints: 50,  maxPoints: 74,  bonus: 3000 },
      { label: "75–99 b.",      minPoints: 75,  maxPoints: 99,  bonus: 4000 },
      { label: "100 b.",        minPoints: 100, maxPoints: 100, bonus: 5000 },
      { label: "KPI MAX",       minPoints: 101, maxPoints: 150, bonus: 5000 },
    ],
    kpiApprover: "Pavlína Pařízková (Marketing Manager / event lead)",

    prepTeamNote:
      "Technická příprava exponátů, dokumentace, logistická podpora — evidované v ClickUp (task ATS-2049).",

    prepTeam: [
      {
        name: "Oleksiy Panchenko",
        role: "Senior Avionics (CRO)",
        hoursRaw: "100",
        hoursNumeric: 100,
        band: "E",
        bonus: 15000,
      },
      {
        name: "Viktor Kaliakin",
        role: "Avionics Engineer (MRO)",
        hoursRaw: "80",
        hoursNumeric: 80,
        band: "D",
        bonus: 10000,
      },
      {
        name: "Petr Moravčík",
        role: "Maintenance Manager (MRO)",
        hoursRaw: "70",
        hoursNumeric: 70,
        band: "C",
        bonus: 7500,
      },
      {
        name: "Jakub Štefánik",
        role: "Mechanical Engineer (MRO)",
        hoursRaw: "40",
        hoursNumeric: 40,
        band: "B",
        bonus: 5000,
      },
      {
        name: "Ondřej Fryauf",
        role: "Avionics Technician (CRO)",
        hoursRaw: "8h 30 min",
        hoursNumeric: 8.5,
        band: "0",
        bonus: 4250,
      },
    ],

    prepBands: [],

    approvers: [
      { role: "Event lead / Marketing Manager", name: "Pavlína Pařízková", signed: false },
      { role: "CEO",                             name: "Petr Polák",        signed: false },
    ],

    grandTotal: 109750,
    fixTotal: 36000,
    variableTotal: 73750,
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "pilot-expo-2026",
    name: "Pilot Expo 2026 – Brusel",
    shortName: "Pilot Expo 2026",
    location: "Brusel, Belgie",
    dateStart: "2026-02-20",
    dateEnd: "2026-02-21",
    processedDate: "2026-05-10",
    owner: "Pavlína Pařízková",
    division: "PilotStyle (06)",
    approvalDeadline: "2026-02-28",
    status: "paid",

    eventResults: [
      { label: "Plánované schůzky",       value: "4" },
      { label: "Uskutečněné schůzky",     value: "35" },
      { label: "Získané kontakty (leady)", value: "40+" },
      { label: "Tržby na místě",           value: "17 000 Kč" },
      { label: "Vynaložené náklady",       value: "77 784 Kč (rozpočet: 120 000 Kč)" },
      { label: "Cíle účasti splněny",      value: "Ano" },
    ],

    dailyRateSales: 2000,
    salesTeam: [],

    dailyRateNesales: 2000,
    nesalesTeam: [
      {
        name: "Šimon Navrátil",
        role: "Customer Service Manager",
        days: 2,
        fixAmount: 4000,
        kpiBonus: 2000,
        total: 6000,
        kpiTotal: 0,
        kpiDetails: [],
      },
      {
        name: "Alex Mudrych",
        role: "Business Development",
        days: 2,
        fixAmount: 4000,
        kpiBonus: 6000,
        total: 10000,
        kpiTotal: 0,
        kpiDetails: [],
        note: "Celková odměna 10 000 Kč schválena event leadem. Navýšení o 1 000 Kč za mimořádný výsledek — 35 schůzek z plánovaných 4, 40+ leadů.",
      },
    ],

    kpiBands: [
      { label: "1–24 b.",       minPoints: 1,   maxPoints: 24,  bonus: 1000 },
      { label: "25–49 b.",      minPoints: 25,  maxPoints: 49,  bonus: 2000 },
      { label: "50–74 b.",      minPoints: 50,  maxPoints: 74,  bonus: 3000 },
      { label: "75–99 b.",      minPoints: 75,  maxPoints: 99,  bonus: 4000 },
      { label: "100 b.",        minPoints: 100, maxPoints: 100, bonus: 5000 },
      { label: "KPI MAX",       minPoints: 101, maxPoints: 150, bonus: 5000 },
    ],
    kpiApprover: "Pavlína Pařízková (Marketing Manager / event lead)",

    prepTeamNote:
      "Pavlína Pařízková nebyla fyzicky přítomna na eventu. Flat bonus za marketingovou přípravu, koordinaci, komunikaci a post-event zpracování výstupů. Standardní denní sazba se nevztahuje.",
    prepTeam: [
      {
        name: "Pavlína Pařízková",
        role: "Marketing Manager",
        hoursRaw: "—",
        hoursNumeric: 0,
        band: "0",
        bonus: 10000,
      },
    ],
    prepBands: [],

    approvers: [
      { role: "Event lead / Marketing Manager", name: "Pavlína Pařízková", signed: true, date: "2026-03-01" },
      { role: "CEO",                             name: "Petr Polák",        signed: true, date: "2026-03-01" },
    ],
    approvalNote: "Schváleno a vyplaceno — březen 2026.",

    grandTotal: 26000,
    fixTotal: 8000,
    variableTotal: 18000,
  },
];

export function getEvent(id: string): EventData | undefined {
  return EVENTS.find((e) => e.id === id);
}

export function formatCZK(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const STATUS_LABELS: Record<ApprovalStatus, string> = {
  draft:     "Čeká na schválení",
  submitted: "Ke schválení",
  approved:  "K úhradě",
  paid:      "Vyhodnoceno",
};

/**
 * Vrátí dynamický label pro stav `paid` eventu s ohledem na dokončené deal checkpointy.
 * Pokud event nemá sales tým nebo jsou všechny checkpointy hotové, vrátí "Vyhodnoceno".
 * Jinak vrátí "Probíhá (X/5)" kde X = počet dokončených checkpointů.
 */
export function getPaidStatusLabel(event: EventData): string {
  if (event.status !== "paid") return STATUS_LABELS[event.status];
  if (event.salesTeam.length === 0) return "Vyhodnoceno";
  const total = DEAL_CHECKPOINTS.length;
  const approvals = event.dealApprovals ?? [];
  const doneKeys = new Set(
    approvals
      .filter((a) => a.schvaleno || a.proplaceno)
      .map((a) => a.checkpoint),
  );
  if (doneKeys.size >= total) return "Vyhodnoceno";
  return `Probíhá (${doneKeys.size}/${total})`;
}

export const STATUS_COLORS: Record<ApprovalStatus, string> = {
  draft:     "#878787",
  submitted: "#d4a017",
  approved:  "#dc2626",
  paid:      "#16a34a",
};
