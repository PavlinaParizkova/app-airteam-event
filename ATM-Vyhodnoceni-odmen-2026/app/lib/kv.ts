/**
 * KOMPATIBILNÍ SHIM — deleguje na nový `store.ts`.
 *
 * Tento soubor existuje jen kvůli postupné migraci. Veškerá nová logika má
 * používat `app/lib/store.ts` přímo + server actions v `app/actions/events.ts`.
 *
 * VYŘAZENÉ FUNKCE (záměrně):
 *   - `saveEvent(event)` — zapsání celého EventData přepsání → ztracené writes.
 *     Použij místo toho jednu z server actions (`patchTeamAction`, `toggleFinanceAction` …).
 *   - `seedIfEmpty()` — automatický silent re-seed mazal uživatelská data při výpadku
 *     `event:ids`. Použij admin endpoint `/api/admin/seed`.
 *   - `enrichFromSeed(...)` — tiše vracela smazaná pole zpět ze static `EVENTS`.
 *     Žádný runtime fallback na seed.
 */

import {
  loadEvent,
  listEvents as listEventsStore,
  createEventSlices,
  addEventId as addEventIdStore,
  isKvConfigured as isKvConfiguredStore,
  type EventWithVersions,
} from "@/app/lib/store";
import type { EventData } from "@/data/events";

/** Vrací `EventData` (bez `versions`) — pro starý kód, který verze nepoužívá. */
export async function getEventFromKV(id: string): Promise<EventData | null> {
  const event = await loadEvent(id);
  if (!event) return null;
  const { versions: _versions, ...rest } = event;
  void _versions;
  return rest;
}

/** Vrací plnou variantu s `versions` — preferuj v novém kódu. */
export async function getEventWithVersions(
  id: string,
): Promise<EventWithVersions | null> {
  return loadEvent(id);
}

export async function listEvents(): Promise<EventData[]> {
  const events = await listEventsStore();
  return events.map((e) => {
    const { versions: _versions, ...rest } = e;
    void _versions;
    return rest;
  });
}

export async function listEventsWithVersions(): Promise<EventWithVersions[]> {
  return listEventsStore();
}

export async function addEventId(id: string): Promise<void> {
  await addEventIdStore(id);
}

export async function createEvent(event: EventData): Promise<void> {
  const res = await createEventSlices(event);
  if (!res.ok) throw new Error(res.reason);
}

export function isKvConfigured(): boolean {
  return isKvConfiguredStore();
}

/**
 * @deprecated — staré API. Zápisy mají jít přes server actions.
 * Tato funkce je tady jen pro postupnou migraci; ve výchozím stavu hází chybu.
 */
export async function saveEvent(_event: EventData): Promise<never> {
  void _event;
  throw new Error(
    "saveEvent() byl odstraněn. Použij server actions (app/actions/events.ts) — ne whole-object zápis.",
  );
}
