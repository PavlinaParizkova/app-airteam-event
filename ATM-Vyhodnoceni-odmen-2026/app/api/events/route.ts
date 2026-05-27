import { NextRequest, NextResponse } from "next/server";
import { listEvents, createEvent } from "@/app/lib/kv";
import { getAuth } from "@/app/lib/getAuth";
import { calcEventTotals } from "@/app/lib/calc";
import { DEFAULT_CHECKLIST, type EventData } from "@/data/events";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await listEvents();
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getAuth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as Omit<EventData, "grandTotal" | "fixTotal" | "variableTotal">;

  if (!body.id || !body.name || !body.dateStart || !body.dateEnd) {
    return NextResponse.json({ error: "Chybí povinná pole: id, name, dateStart, dateEnd." }, { status: 400 });
  }

  const event: EventData = {
    ...body,
    checklist: DEFAULT_CHECKLIST.map((i) => ({ ...i })),
    dealLog: [],
    lastModified: new Date().toISOString().slice(0, 10),
    grandTotal: 0,
    fixTotal: 0,
    variableTotal: 0,
  };

  const totals = calcEventTotals(event);
  event.grandTotal    = totals.grandTotal;
  event.fixTotal      = totals.fixTotal;
  event.variableTotal = totals.variableTotal;

  try {
    await createEvent(event);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Chyba při ukládání.";
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  return NextResponse.json(event, { status: 201 });
}
