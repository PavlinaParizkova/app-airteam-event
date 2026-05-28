/**
 * POST /api/admin/import-json
 *
 * Importuje JSON zálohu vytvořenou přes GET /api/admin/export-json.
 * Pro každý event v záloze:
 *   - pokud v Redis neexistuje → vytvoří ho
 *   - pokud existuje → smaže a nahradí daty ze zálohy
 *
 * Body: multipart/form-data s polem "file" (JSON soubor)
 *    nebo application/json přímo jako ExportSnapshot objekt
 *
 * Vyžaduje admin session.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/app/lib/getAuth";
import {
  createEventSlices,
  deleteEventSlices,
  readSlice,
  type MetaSlice,
} from "@/app/lib/store";
import { recordAudit } from "@/app/lib/audit";
import type { ExportSnapshot } from "../export-json/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAuth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const who = {
    email: session.user.email ?? "unknown",
    name: session.user.name ?? "unknown",
  };

  let snapshot: ExportSnapshot;

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Chybí pole 'file' ve formuláři." }, { status: 400 });
    }
    const text = await (file as Blob).text();
    try {
      snapshot = JSON.parse(text) as ExportSnapshot;
    } catch {
      return NextResponse.json({ error: "Soubor není validní JSON." }, { status: 400 });
    }
  } else {
    try {
      snapshot = (await req.json()) as ExportSnapshot;
    } catch {
      return NextResponse.json({ error: "Tělo požadavku není validní JSON." }, { status: 400 });
    }
  }

  if (!snapshot.events || !Array.isArray(snapshot.events)) {
    return NextResponse.json({ error: "Záloha neobsahuje pole 'events'." }, { status: 400 });
  }

  const restored: string[] = [];
  const errors: string[] = [];

  for (const ev of snapshot.events) {
    if (!ev?.id) {
      errors.push("Event bez ID přeskočen.");
      continue;
    }
    try {
      // Smaž stávající data (pokud existují)
      const existingMeta = await readSlice<MetaSlice>(ev.id, "meta");
      if (existingMeta) {
        await recordAudit(ev.id, who, "delete", `Import JSON zálohy — přepsání eventu ${ev.id}`, existingMeta, undefined);
        await deleteEventSlices(ev.id);
      }

      // Vytvoř z dat zálohy
      const result = await createEventSlices(ev);
      if (result.ok) {
        restored.push(ev.id);
        await recordAudit(ev.id, who, "create", `Import JSON zálohy ze ${snapshot.exportedAt}`, undefined, ev);
      } else {
        errors.push(`${ev.id}: ${result.reason}`);
      }
    } catch (err) {
      errors.push(`${ev.id}: ${err instanceof Error ? err.message : "Neznámá chyba"}`);
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    restoredCount: restored.length,
    restored,
    errors,
    sourceExportedAt: snapshot.exportedAt,
    by: who,
  });
}
