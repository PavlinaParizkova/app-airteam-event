"use server";

/**
 * Server actions pro EventData — nahrazují všechny `/api/events/[id]/*` route handlery.
 *
 * Každá akce:
 *   1. Ověří roli (admin / approver / finance / team member)
 *   2. Načte aktuální slice + verzi
 *   3. Provede CAS update přes `casWriteSlice`
 *   4. Zapíše audit záznam
 *   5. Zavolá `revalidatePath` — žádný `router.refresh()` v klientu už nepotřebujeme
 *
 * Návratová hodnota je vždy `ActionResult` — UI rozliší ok / conflict / forbidden / error.
 */

import { revalidatePath } from "next/cache";
import { getAuth, canAccessFinancePlan } from "@/app/lib/getAuth";
import {
  casWriteSlice,
  loadEvent,
  readSlice,
  type ApprovalsSlice,
  type CasResult,
  type ChecklistSlice,
  type DealLogSlice,
  type EventWithVersions,
  type KpiTrackingSlice,
  type MetaSlice,
  type OemDealsSlice,
  type ResultsSlice,
  type SliceName,
  type TeamSlice,
} from "@/app/lib/store";
import { recordAudit, type AuditAction } from "@/app/lib/audit";
import { calcEventTotals } from "@/app/lib/calc";
import {
  DEFAULT_CHECKLIST,
  DEFAULT_FINANCE_STEPS,
  type ApprovalFlags,
  type ChecklistItem,
  type DealApproval,
  type DealCheckpointKey,
  type DealEntry,
  type EventResult,
  type NesalesEntry,
  type OemDeal,
  type PaymentType,
  type PrepEntry,
  type PrepPersonTracking,
  type SalesEntry,
  type SalesPersonTracking,
} from "@/data/events";

// ── ActionResult ─────────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { ok: true; data?: T; version?: number }
  | { ok: false; reason: "forbidden"; message: string }
  | { ok: false; reason: "conflict"; currentVersion: number; message: string }
  | { ok: false; reason: "not-found"; message: string }
  | { ok: false; reason: "invalid"; message: string }
  | { ok: false; reason: "error"; message: string };

function forbidden<T = void>(msg = "Nemáš oprávnění k této akci."): ActionResult<T> {
  return { ok: false, reason: "forbidden", message: msg };
}
function notFound<T = void>(msg = "Event nenalezen."): ActionResult<T> {
  return { ok: false, reason: "not-found", message: msg };
}
function invalid<T = void>(msg: string): ActionResult<T> {
  return { ok: false, reason: "invalid", message: msg };
}
function conflict<T = void>(currentVersion: number): ActionResult<T> {
  return {
    ok: false,
    reason: "conflict",
    currentVersion,
    message: "Event byl mezitím změněn jiným uživatelem. Načti stránku znovu.",
  };
}

function casToResult<T>(r: CasResult, data?: T): ActionResult<T> {
  if (r.status === "ok") return { ok: true, data, version: r.version };
  if (r.status === "conflict") return conflict<T>(r.currentVersion);
  if (r.status === "missing")
    return { ok: false, reason: "not-found", message: "Slice neexistuje." };
  return {
    ok: false,
    reason: "error",
    message: "Data v KV jsou poškozená (corrupted JSON).",
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type AuthOk = {
  ok: true;
  session: NonNullable<Awaited<ReturnType<typeof getAuth>>>;
  who: { email: string; name: string };
};
type AuthFail = { ok: false; message: string };

async function requireAuth(): Promise<AuthOk | AuthFail> {
  const session = await getAuth();
  if (!session?.user) {
    return { ok: false, message: "Nejsi přihlášen." };
  }
  return {
    ok: true,
    session,
    who: {
      email: session.user.email ?? "unknown",
      name: session.user.name ?? "unknown",
    },
  };
}

function isTeamMember(event: EventWithVersions, name: string | null): boolean {
  if (!name) return false;
  return (
    event.salesTeam.some((p) => p.name === name) ||
    event.nesalesTeam.some((p) => p.name === name) ||
    event.prepTeam.some((p) => p.name === name)
  );
}

function revalidateEvent(id: string): void {
  revalidatePath("/");
  revalidatePath(`/event/${id}`);
  revalidatePath(`/event/${id}/odmeny`);
  revalidatePath(`/event/${id}/finance`);
  revalidatePath(`/event/${id}/checklist`);
  revalidatePath(`/event/${id}/edit`);
}

async function readAndCheck(
  id: string,
  slice: SliceName,
  expectedVersion: number,
): Promise<{ ok: true } | { ok: false; result: ActionResult }> {
  const cur = await readSlice<{ version: number }>(id, slice);
  if (!cur) {
    if (expectedVersion !== 0) {
      return {
        ok: false,
        result: { ok: false, reason: "not-found", message: "Slice neexistuje." },
      };
    }
    return { ok: true };
  }
  if ((cur.version ?? 0) !== expectedVersion) {
    return { ok: false, result: conflict(cur.version ?? 0) };
  }
  return { ok: true };
}

async function recomputeAndSaveMeta(
  id: string,
  who: { email: string; name: string },
  action: AuditAction,
  detail: string,
): Promise<void> {
  // Po každé změně týmu nebo dealApprovals přepočítáme totals v meta slice.
  // Děláme retry loop s krátkým limitem; pokud nedojde k souhlasu, log warning
  // a pokračujeme — totals nejsou kritická perzistovaná hodnota (lze přepočítat).
  for (let attempt = 0; attempt < 3; attempt++) {
    const meta = await readSlice<MetaSlice>(id, "meta");
    if (!meta) return;
    const event = await loadEvent(id);
    if (!event) return;
    const totals = calcEventTotals(event);
    if (
      meta.grandTotal === totals.grandTotal &&
      meta.fixTotal === totals.fixTotal &&
      meta.variableTotal === totals.variableTotal
    ) {
      return;
    }
    const { version: _v, ...metaNoVersion } = meta;
    void _v;
    const res = await casWriteSlice<MetaSlice>(id, "meta", meta.version, {
      ...metaNoVersion,
      grandTotal: totals.grandTotal,
      fixTotal: totals.fixTotal,
      variableTotal: totals.variableTotal,
      lastModified: new Date().toISOString().slice(0, 10),
    });
    if (res.status === "ok") {
      await recordAudit(id, who, action, detail);
      return;
    }
    // conflict — krátký backoff, zkus znovu
    await new Promise((r) => setTimeout(r, 50));
  }
  console.warn(
    "[actions] recomputeAndSaveMeta: 3 attempts failed for",
    id,
    "— totals možná nesedí; UI je při dalším read přepočte.",
  );
}

// ── Team patch (admin only) ──────────────────────────────────────────────────

export async function patchTeamAction(
  id: string,
  expectedVersion: number,
  payload: {
    salesTeam?: SalesEntry[];
    nesalesTeam?: NesalesEntry[];
    prepTeam?: PrepEntry[];
  },
): Promise<ActionResult<{ version: number }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  if (!auth.session.user.isAdmin) return forbidden("Edit týmu může jen admin.");

  const current = await readSlice<TeamSlice>(id, "team");
  if (!current) return notFound("Team slice neexistuje.");
  if ((current.version ?? 0) !== expectedVersion) {
    return conflict(current.version ?? 0);
  }

  const next: Omit<TeamSlice, "version"> = {
    salesTeam: payload.salesTeam ?? current.salesTeam,
    nesalesTeam: payload.nesalesTeam ?? current.nesalesTeam,
    prepTeam: payload.prepTeam ?? current.prepTeam,
  };

  const result = await casWriteSlice<TeamSlice>(id, "team", expectedVersion, next);
  if (result.status !== "ok") return casToResult(result);

  await recordAudit(
    id,
    auth.who,
    "update-team",
    `Admin edit — sales=${next.salesTeam.length}, nesales=${next.nesalesTeam.length}, prep=${next.prepTeam.length}`,
    current,
    { ...next, version: result.version },
  );

  // Přepočítej totals v meta
  await recomputeAndSaveMeta(id, auth.who, "update-meta", "Totals přepočítány po update-team");

  revalidateEvent(id);
  return { ok: true, version: result.version, data: { version: result.version } };
}

// ── Approvals patch (admin only — bulk replace from OdmenyClient) ────────────

export async function patchApprovalsAction(
  id: string,
  expectedVersion: number,
  dealApprovals: DealApproval[],
): Promise<ActionResult<{ version: number }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  if (!auth.session.user.isAdmin)
    return forbidden("Hromadný edit approvals může jen admin.");

  const cur = await readSlice<ApprovalsSlice>(id, "approvals");
  if (cur && (cur.version ?? 0) !== expectedVersion) {
    return conflict(cur.version ?? 0);
  }

  const result = await casWriteSlice<ApprovalsSlice>(
    id,
    "approvals",
    expectedVersion,
    { dealApprovals },
  );
  if (result.status !== "ok") return casToResult(result);

  await recordAudit(
    id,
    auth.who,
    "update-approvals",
    `Bulk update dealApprovals (${dealApprovals.length} entries)`,
    cur,
    { dealApprovals, version: result.version },
  );

  revalidateEvent(id);
  return { ok: true, version: result.version, data: { version: result.version } };
}

// ── Toggle finance flag — admin only, jen jeden field ────────────────────────

export async function toggleFinanceCheckpointAction(
  id: string,
  personName: string,
  checkpoint: DealCheckpointKey,
  field: "finance" | "proplaceno",
  value: boolean,
): Promise<ActionResult<{ version: number }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  const { isAdmin, isFinance } = auth.session.user;

  // Toggle finance: admin only.
  // Toggle proplaceno=true: admin nebo finance.
  // Toggle proplaceno=false (odvolat proplacení): admin only.
  if (field === "finance" && !isAdmin) {
    return forbidden("Potvrdit/odvolat finance může jen admin.");
  }
  if (field === "proplaceno") {
    if (!isAdmin && !isFinance) return forbidden("Označit proplacení může jen finance nebo admin.");
    if (value === false && !isAdmin)
      return forbidden("Odvolat proplacení může jen admin.");
  }

  // Read-modify-write s retry loopem pro CAS
  for (let attempt = 0; attempt < 5; attempt++) {
    const cur = await readSlice<ApprovalsSlice>(id, "approvals");
    const list = cur?.dealApprovals ?? [];
    const existingIdx = list.findIndex(
      (a) => a.personName === personName && a.checkpoint === checkpoint,
    );
    const existing = existingIdx >= 0 ? list[existingIdx] : null;

    // Guard: proplaceno=true vyžaduje finance===true
    if (field === "proplaceno" && value === true) {
      const finOK = existing?.finance ?? false;
      if (!finOK) {
        return invalid(
          "Proplacení lze označit jen pokud je platba potvrzena (finance=true).",
        );
      }
    }

    const updatedEntry: DealApproval = existing
      ? { ...existing, [field]: value }
      : {
          personName,
          checkpoint,
          schvaleno: false,
          finance: field === "finance" ? value : false,
          proplaceno: field === "proplaceno" ? value : false,
        };

    const newList =
      existingIdx >= 0
        ? list.map((a, i) => (i === existingIdx ? updatedEntry : a))
        : [...list, updatedEntry];

    const expectedVersion = cur?.version ?? 0;
    const result = await casWriteSlice<ApprovalsSlice>(
      id,
      "approvals",
      expectedVersion,
      { dealApprovals: newList },
    );

    if (result.status === "ok") {
      await recordAudit(
        id,
        auth.who,
        field === "finance" ? "toggle-finance" : "toggle-paid",
        `${personName} · ${checkpoint} · ${field}=${value}`,
        existing,
        updatedEntry,
      );
      revalidateEvent(id);
      return { ok: true, version: result.version, data: { version: result.version } };
    }

    if (result.status === "conflict") {
      // Krátká pauza a zkus znovu (jiný uživatel právě zapsal)
      await new Promise((r) => setTimeout(r, 30 + attempt * 30));
      continue;
    }
    return casToResult(result);
  }
  return {
    ok: false,
    reason: "conflict",
    currentVersion: -1,
    message: "5× po sobě konflikt verze — někdo jiný intenzivně edituje. Zkus za chvíli.",
  };
}

// ── Toggle finance flag pro Skupinu 2/3 ──────────────────────────────────────

export async function toggleGroupApprovalAction(
  id: string,
  group: "nesales" | "prep",
  personName: string,
  field: "finance" | "proplaceno",
  value: boolean,
): Promise<ActionResult<{ version: number }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  const { isAdmin, isFinance } = auth.session.user;

  if (field === "finance" && !isAdmin) {
    return forbidden("Potvrdit/odvolat finance může jen admin.");
  }
  if (field === "proplaceno") {
    if (!isAdmin && !isFinance) return forbidden("Označit proplacení může jen finance nebo admin.");
    if (value === false && !isAdmin) return forbidden("Odvolat proplacení může jen admin.");
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const cur = await readSlice<TeamSlice>(id, "team");
    if (!cur) return notFound("Team slice neexistuje.");

    const teamKey: "nesalesTeam" | "prepTeam" =
      group === "nesales" ? "nesalesTeam" : "prepTeam";

    const persons = cur[teamKey];
    const idx = persons.findIndex((p) => p.name === personName);
    if (idx < 0) return notFound(`Osoba "${personName}" není v ${teamKey}.`);

    const person = persons[idx];

    if (field === "proplaceno" && value === true) {
      const finOK = person.approval?.finance ?? false;
      if (!finOK) {
        return invalid("Proplacení lze označit jen pokud je platba potvrzena (finance=true).");
      }
    }

    const newApproval: ApprovalFlags = {
      schvaleno: person.approval?.schvaleno ?? false,
      finance: field === "finance" ? value : (person.approval?.finance ?? false),
      proplaceno:
        field === "proplaceno" ? value : (person.approval?.proplaceno ?? false),
    };

    const newPerson = { ...person, approval: newApproval };
    const newTeam = persons.map((p, i) => (i === idx ? newPerson : p));

    const next: Omit<TeamSlice, "version"> = {
      salesTeam: cur.salesTeam,
      nesalesTeam: cur.nesalesTeam,
      prepTeam: cur.prepTeam,
      [teamKey]: newTeam,
    };

    const expectedVersion = cur.version;
    const result = await casWriteSlice<TeamSlice>(id, "team", expectedVersion, next);

    if (result.status === "ok") {
      await recordAudit(
        id,
        auth.who,
        field === "finance" ? "toggle-finance" : "toggle-paid",
        `${group}/${personName} · ${field}=${value}`,
        { approval: person.approval },
        { approval: newApproval },
      );
      revalidateEvent(id);
      return { ok: true, version: result.version, data: { version: result.version } };
    }
    if (result.status === "conflict") {
      await new Promise((r) => setTimeout(r, 30 + attempt * 30));
      continue;
    }
    return casToResult(result);
  }
  return {
    ok: false,
    reason: "conflict",
    currentVersion: -1,
    message: "5× konflikt — zkus znovu za chvíli.",
  };
}

// ── Self-service: člen sales týmu mění svůj paymentType per checkpoint ───────

export async function setPaymentTypeAction(
  id: string,
  checkpoints: Partial<Record<DealCheckpointKey, PaymentType>>,
): Promise<ActionResult<{ version: number }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  const memberName = auth.session.user.name;
  if (!memberName) return forbidden("Chybí jméno v session.");

  for (let attempt = 0; attempt < 5; attempt++) {
    const [team, approvals] = await Promise.all([
      readSlice<TeamSlice>(id, "team"),
      readSlice<ApprovalsSlice>(id, "approvals"),
    ]);
    if (!team) return notFound("Team slice neexistuje.");

    const isSalesMember = team.salesTeam.some((p) => p.name === memberName);
    if (!isSalesMember) return forbidden("Tuto akci může jen člen Skupiny 1 (sales).");

    const list = approvals?.dealApprovals ?? [];
    const updated: DealApproval[] = [];
    const seen = new Set<string>();

    for (const a of list) {
      if (a.personName === memberName) {
        const newType = checkpoints[a.checkpoint];
        updated.push(newType ? { ...a, paymentType: newType } : a);
        seen.add(a.checkpoint);
      } else {
        updated.push(a);
      }
    }
    for (const [cp, type] of Object.entries(checkpoints) as Array<
      [DealCheckpointKey, PaymentType]
    >) {
      if (!seen.has(cp) && type) {
        updated.push({
          personName: memberName,
          checkpoint: cp,
          schvaleno: false,
          finance: false,
          proplaceno: false,
          paymentType: type,
        });
      }
    }

    const expectedVersion = approvals?.version ?? 0;
    const result = await casWriteSlice<ApprovalsSlice>(
      id,
      "approvals",
      expectedVersion,
      { dealApprovals: updated },
    );

    if (result.status === "ok") {
      await recordAudit(
        id,
        auth.who,
        "set-payment-type",
        `${memberName} self-service paymentType update`,
        list.filter((a) => a.personName === memberName),
        updated.filter((a) => a.personName === memberName),
      );
      revalidateEvent(id);
      return { ok: true, version: result.version, data: { version: result.version } };
    }
    if (result.status === "conflict") {
      await new Promise((r) => setTimeout(r, 30 + attempt * 30));
      continue;
    }
    return casToResult(result);
  }
  return {
    ok: false,
    reason: "conflict",
    currentVersion: -1,
    message: "5× konflikt — zkus znovu.",
  };
}

// ── Status transitions ──────────────────────────────────────────────────────

async function transitionStatus(
  id: string,
  expectedFrom: MetaSlice["status"][],
  to: MetaSlice["status"],
  who: { email: string; name: string },
  action: AuditAction,
  approverMatcher?: (a: { name: string; role: string }) => boolean,
): Promise<ActionResult<{ version: number }>> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const cur = await readSlice<MetaSlice>(id, "meta");
    if (!cur) return notFound();
    if (!expectedFrom.includes(cur.status)) {
      return invalid(
        `Status "${cur.status}" nelze přechodit na "${to}" (povoleno: ${expectedFrom.join(", ")}).`,
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    const { version: _v, ...rest } = cur;
    void _v;
    const newApprovers = approverMatcher
      ? cur.approvers.map((a) =>
          approverMatcher({ name: a.name, role: a.role })
            ? { ...a, signed: true, date: today }
            : a,
        )
      : cur.approvers;

    const next: Omit<MetaSlice, "version"> = {
      ...rest,
      status: to,
      approvers: newApprovers,
      lastModified: today,
    };

    const result = await casWriteSlice<MetaSlice>(id, "meta", cur.version, next);
    if (result.status === "ok") {
      await recordAudit(
        id,
        who,
        action,
        `Status: ${cur.status} → ${to}`,
        { status: cur.status, approvers: cur.approvers },
        { status: to, approvers: newApprovers },
      );
      revalidateEvent(id);
      return { ok: true, version: result.version, data: { version: result.version } };
    }
    if (result.status === "conflict") {
      await new Promise((r) => setTimeout(r, 30 + attempt * 30));
      continue;
    }
    return casToResult(result);
  }
  return {
    ok: false,
    reason: "conflict",
    currentVersion: -1,
    message: "5× konflikt — zkus znovu.",
  };
}

export async function submitEventAction(id: string): Promise<ActionResult<{ version: number }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  if (!auth.session.user.isAdmin) return forbidden("Odeslat ke schválení může jen admin.");

  return transitionStatus(
    id,
    ["draft"],
    "submitted",
    auth.who,
    "submit",
    (a) =>
      a.name === auth.session.user.name || a.role.toLowerCase().includes("marketing"),
  );
}

export async function approveEventAction(id: string): Promise<ActionResult<{ version: number }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  if (!auth.session.user.isApprover) return forbidden("Schválit může jen approver.");

  return transitionStatus(
    id,
    ["submitted"],
    "approved",
    auth.who,
    "approve",
    (a) => a.name === "Petr Polák" || a.role.toLowerCase().includes("ceo"),
  );
}

export async function sendToFinanceAction(id: string): Promise<ActionResult<{ version: number }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  if (!auth.session.user.isAdmin) return forbidden("Odeslat na finance může jen admin.");

  return transitionStatus(id, ["approved"], "paid", auth.who, "send-to-finance");
}

// ── Checklist ────────────────────────────────────────────────────────────────

export async function toggleChecklistItemAction(
  id: string,
  itemId: string,
  done: boolean,
): Promise<ActionResult<{ version: number; checklist: ChecklistItem[] }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  if (!auth.session.user.isAdmin) return forbidden("Checklist mění jen admin.");

  for (let attempt = 0; attempt < 5; attempt++) {
    const cur = await readSlice<ChecklistSlice>(id, "checklist");
    const baseList: ChecklistItem[] =
      cur?.checklist && cur.checklist.length > 0
        ? cur.checklist
        : DEFAULT_CHECKLIST.map((i) => ({ ...i }));

    const today = new Date().toISOString().slice(0, 10);
    const newList = baseList.map((it) =>
      it.id === itemId
        ? { ...it, done, doneDate: done ? today : undefined }
        : it,
    );

    const expectedVersion = cur?.version ?? 0;
    const result = await casWriteSlice<ChecklistSlice>(
      id,
      "checklist",
      expectedVersion,
      { checklist: newList },
    );

    if (result.status === "ok") {
      await recordAudit(
        id,
        auth.who,
        "update-checklist",
        `Checklist item "${itemId}" → done=${done}`,
        baseList.find((i) => i.id === itemId),
        newList.find((i) => i.id === itemId),
      );
      revalidateEvent(id);
      return {
        ok: true,
        version: result.version,
        data: { version: result.version, checklist: newList },
      };
    }
    if (result.status === "conflict") {
      await new Promise((r) => setTimeout(r, 30 + attempt * 30));
      continue;
    }
    return casToResult(result);
  }
  return {
    ok: false,
    reason: "conflict",
    currentVersion: -1,
    message: "5× konflikt — zkus znovu.",
  };
}

// ── Results ──────────────────────────────────────────────────────────────────

export async function patchResultsAction(
  id: string,
  expectedVersion: number,
  eventResults: EventResult[],
): Promise<ActionResult<{ version: number }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  if (!auth.session.user.isAdmin) return forbidden("Edit výsledků může jen admin.");

  for (const r of eventResults) {
    if (typeof r.label !== "string" || typeof r.value !== "string") {
      return invalid("Každý výsledek musí mít label a value (string).");
    }
  }

  const cur = await readSlice<ResultsSlice>(id, "results");
  if (cur && (cur.version ?? 0) !== expectedVersion) {
    return conflict(cur.version ?? 0);
  }

  const result = await casWriteSlice<ResultsSlice>(id, "results", expectedVersion, {
    eventResults,
  });
  if (result.status !== "ok") return casToResult(result);

  await recordAudit(
    id,
    auth.who,
    "update-results",
    `Update výsledků eventu (${eventResults.length} polí)`,
    cur,
    { eventResults, version: result.version },
  );

  revalidateEvent(id);
  return { ok: true, version: result.version, data: { version: result.version } };
}

// ── Deal log ─────────────────────────────────────────────────────────────────

export async function addDealAction(
  id: string,
  deal: Omit<DealEntry, "id" | "addedDate" | "bonus"> & { bonus?: number },
): Promise<ActionResult<{ version: number; deal: DealEntry }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  if (!auth.session.user.isAdmin) return forbidden("Přidat deal může jen admin.");

  const newDeal: DealEntry = {
    ...deal,
    id: `deal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    addedDate: new Date().toISOString().slice(0, 10),
    bonus: deal.bonus ?? 3000,
  };

  for (let attempt = 0; attempt < 5; attempt++) {
    const cur = await readSlice<DealLogSlice>(id, "deallog");
    const list = cur?.dealLog ?? [];
    const expectedVersion = cur?.version ?? 0;
    const result = await casWriteSlice<DealLogSlice>(id, "deallog", expectedVersion, {
      dealLog: [...list, newDeal],
    });
    if (result.status === "ok") {
      await recordAudit(
        id,
        auth.who,
        "update-deallog",
        `Přidán deal pro ${deal.personName} (${deal.checkpoint})`,
        undefined,
        newDeal,
      );
      revalidateEvent(id);
      return {
        ok: true,
        version: result.version,
        data: { version: result.version, deal: newDeal },
      };
    }
    if (result.status === "conflict") {
      await new Promise((r) => setTimeout(r, 30 + attempt * 30));
      continue;
    }
    return casToResult(result);
  }
  return {
    ok: false,
    reason: "conflict",
    currentVersion: -1,
    message: "5× konflikt — zkus znovu.",
  };
}

export async function removeDealAction(
  id: string,
  dealId: string,
): Promise<ActionResult<{ version: number }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  if (!auth.session.user.isAdmin) return forbidden("Smazat deal může jen admin.");

  for (let attempt = 0; attempt < 5; attempt++) {
    const cur = await readSlice<DealLogSlice>(id, "deallog");
    if (!cur) return notFound("Žádný dealLog neexistuje.");
    const removed = cur.dealLog.find((d) => d.id === dealId);
    if (!removed) return notFound(`Deal ${dealId} nenalezen.`);

    const newList = cur.dealLog.filter((d) => d.id !== dealId);
    const result = await casWriteSlice<DealLogSlice>(id, "deallog", cur.version, {
      dealLog: newList,
    });
    if (result.status === "ok") {
      await recordAudit(
        id,
        auth.who,
        "update-deallog",
        `Smazán deal ${dealId}`,
        removed,
        undefined,
      );
      revalidateEvent(id);
      return { ok: true, version: result.version, data: { version: result.version } };
    }
    if (result.status === "conflict") {
      await new Promise((r) => setTimeout(r, 30 + attempt * 30));
      continue;
    }
    return casToResult(result);
  }
  return {
    ok: false,
    reason: "conflict",
    currentVersion: -1,
    message: "5× konflikt — zkus znovu.",
  };
}

// ── Sales KPI tracking ───────────────────────────────────────────────────────

export type SalesKpiPatchBody =
  | { action: "set-leads"; personName: string; leadsCount: number }
  | { action: "set-kpi"; personName: string; kpiPoints: number }
  | { action: "ceo-approve"; personName: string; approved: boolean }
  | {
      action: "finance-step";
      personName: string;
      stepId: string;
      sent: boolean;
    };

function initSalesTracking(
  salesTeam: SalesEntry[],
  existing: SalesPersonTracking[],
): SalesPersonTracking[] {
  return salesTeam.map((p) => {
    const found = existing.find((t) => t.personName === p.name);
    if (found) return found;
    return {
      personName: p.name,
      leadsCount: null,
      kpiPoints: null,
      ceoApproved: false,
      financeSteps: DEFAULT_FINANCE_STEPS.map((s, i) => ({
        ...s,
        id: `finance-${i}`,
      })),
    };
  });
}

export async function patchSalesKpiAction(
  id: string,
  body: SalesKpiPatchBody,
): Promise<ActionResult<{ version: number; tracking: SalesPersonTracking[] }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  if (!auth.session.user.isAdmin) return forbidden("KPI tracking edit jen admin.");

  for (let attempt = 0; attempt < 5; attempt++) {
    const [team, cur] = await Promise.all([
      readSlice<TeamSlice>(id, "team"),
      readSlice<KpiTrackingSlice>(id, "kpitracking"),
    ]);
    if (!team) return notFound("Team slice neexistuje.");

    let tracking = initSalesTracking(team.salesTeam, cur?.salesKpiTracking ?? []);
    const today = new Date().toISOString().slice(0, 10);

    tracking = tracking.map((t) => {
      if (t.personName !== body.personName) return t;
      switch (body.action) {
        case "set-leads":
          return { ...t, leadsCount: body.leadsCount };
        case "set-kpi":
          return { ...t, kpiPoints: body.kpiPoints };
        case "ceo-approve":
          return {
            ...t,
            ceoApproved: body.approved,
            ceoApprovedDate: body.approved ? today : undefined,
          };
        case "finance-step": {
          const steps = t.financeSteps.map((s) =>
            s.id === body.stepId
              ? { ...s, sent: body.sent, sentDate: body.sent ? today : undefined }
              : s,
          );
          return { ...t, financeSteps: steps };
        }
      }
    });

    const expectedVersion = cur?.version ?? 0;
    const result = await casWriteSlice<KpiTrackingSlice>(
      id,
      "kpitracking",
      expectedVersion,
      {
        salesKpiTracking: tracking,
        prepKpiTracking: cur?.prepKpiTracking ?? [],
      },
    );

    if (result.status === "ok") {
      await recordAudit(
        id,
        auth.who,
        "update-kpitracking",
        `Sales KPI ${body.action} pro ${body.personName}`,
        cur?.salesKpiTracking?.find((t) => t.personName === body.personName),
        tracking.find((t) => t.personName === body.personName),
      );
      revalidateEvent(id);
      return {
        ok: true,
        version: result.version,
        data: { version: result.version, tracking },
      };
    }
    if (result.status === "conflict") {
      await new Promise((r) => setTimeout(r, 30 + attempt * 30));
      continue;
    }
    return casToResult(result);
  }
  return {
    ok: false,
    reason: "conflict",
    currentVersion: -1,
    message: "5× konflikt — zkus znovu.",
  };
}

// ── Prep KPI tracking ────────────────────────────────────────────────────────

export type PrepKpiPatchBody =
  | { action: "set-kpi"; personName: string; kpiPoints: number }
  | { action: "ceo-approve"; personName: string; approved: boolean }
  | { action: "finance-step"; personName: string; sent: boolean };

function initPrepTracking(
  prepTeam: PrepEntry[],
  existing: PrepPersonTracking[],
): PrepPersonTracking[] {
  return prepTeam.map((p) => {
    const found = existing.find((t) => t.personName === p.name);
    if (found) return found;
    return {
      personName: p.name,
      kpiPoints: null,
      ceoApproved: false,
      financeStep: { id: "finance-0", label: "Jednorázová odměna", sent: false },
    };
  });
}

export async function patchPrepKpiAction(
  id: string,
  body: PrepKpiPatchBody,
): Promise<ActionResult<{ version: number; tracking: PrepPersonTracking[] }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  if (!auth.session.user.isAdmin) return forbidden("KPI tracking edit jen admin.");

  for (let attempt = 0; attempt < 5; attempt++) {
    const [team, cur] = await Promise.all([
      readSlice<TeamSlice>(id, "team"),
      readSlice<KpiTrackingSlice>(id, "kpitracking"),
    ]);
    if (!team) return notFound("Team slice neexistuje.");

    let tracking = initPrepTracking(team.prepTeam, cur?.prepKpiTracking ?? []);
    const today = new Date().toISOString().slice(0, 10);

    tracking = tracking.map((t) => {
      if (t.personName !== body.personName) return t;
      switch (body.action) {
        case "set-kpi":
          return { ...t, kpiPoints: body.kpiPoints };
        case "ceo-approve":
          return {
            ...t,
            ceoApproved: body.approved,
            ceoApprovedDate: body.approved ? today : undefined,
          };
        case "finance-step":
          return {
            ...t,
            financeStep: {
              ...t.financeStep,
              sent: body.sent,
              sentDate: body.sent ? today : undefined,
            },
          };
      }
    });

    const expectedVersion = cur?.version ?? 0;
    const result = await casWriteSlice<KpiTrackingSlice>(
      id,
      "kpitracking",
      expectedVersion,
      {
        salesKpiTracking: cur?.salesKpiTracking ?? [],
        prepKpiTracking: tracking,
      },
    );

    if (result.status === "ok") {
      await recordAudit(
        id,
        auth.who,
        "update-kpitracking",
        `Prep KPI ${body.action} pro ${body.personName}`,
        cur?.prepKpiTracking?.find((t) => t.personName === body.personName),
        tracking.find((t) => t.personName === body.personName),
      );
      revalidateEvent(id);
      return {
        ok: true,
        version: result.version,
        data: { version: result.version, tracking },
      };
    }
    if (result.status === "conflict") {
      await new Promise((r) => setTimeout(r, 30 + attempt * 30));
      continue;
    }
    return casToResult(result);
  }
  return {
    ok: false,
    reason: "conflict",
    currentVersion: -1,
    message: "5× konflikt — zkus znovu.",
  };
}

// ── OEM Deals patch (admin only) ──────────────────────────────────────────────

export async function patchOemDealsAction(
  id: string,
  expectedVersion: number,
  oemDeals: OemDeal[],
): Promise<ActionResult<{ version: number }>> {
  const auth = await requireAuth();
  if (!auth.ok) return forbidden(auth.message);
  if (!auth.session.user.isAdmin)
    return forbidden("Edit OEM dealů může jen admin.");

  const cur = await readSlice<OemDealsSlice>(id, "oemdeals");
  if (cur && (cur.version ?? 0) !== expectedVersion) {
    return conflict(cur.version ?? 0);
  }

  const result = await casWriteSlice<OemDealsSlice>(
    id,
    "oemdeals",
    expectedVersion,
    { oemDeals },
  );
  if (result.status !== "ok") return casToResult(result);

  await recordAudit(
    id,
    auth.who,
    "update-approvals",
    `Bulk update oemDeals (${oemDeals.length} entries)`,
    cur,
    { oemDeals, version: result.version },
  );

  revalidateEvent(id);
  return { ok: true, version: result.version, data: { version: result.version } };
}

// ── Re-export helperů pro UI ────────────────────────────────────────────────

export { canAccessFinancePlan };

// Re-export typu pro pohodlí (UI nemusí importovat ze store.ts)
export type { EventWithVersions };
