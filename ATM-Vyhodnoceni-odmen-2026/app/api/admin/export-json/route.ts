/**
 * GET /api/admin/export-json
 *
 * Exportuje kompletní snapshot všech eventů z Redis jako JSON soubor.
 * Výsledný soubor lze:
 *   - stáhnout a uložit do Google Drive / lokálně
 *   - importovat zpět přes POST /api/admin/import-json
 *
 * Vyžaduje admin session.
 */

import { NextResponse } from "next/server";
import { getAuth } from "@/app/lib/getAuth";
import { listEventIds, loadEvent } from "@/app/lib/store";

export const dynamic = "force-dynamic";

export type ExportSnapshot = {
  exportedAt: string;
  exportedBy: { email: string; name: string };
  version: "1.0";
  events: ReturnType<typeof Object.assign>[];
};

export async function GET() {
  const session = await getAuth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ids = await listEventIds();
  const events = await Promise.all(ids.map((id) => loadEvent(id)));
  const validEvents = events.filter(Boolean);

  const snapshot: ExportSnapshot = {
    exportedAt: new Date().toISOString(),
    exportedBy: {
      email: session.user.email ?? "unknown",
      name: session.user.name ?? "unknown",
    },
    version: "1.0",
    events: validEvents,
  };

  const filename = `atm-events-backup-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(snapshot, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
