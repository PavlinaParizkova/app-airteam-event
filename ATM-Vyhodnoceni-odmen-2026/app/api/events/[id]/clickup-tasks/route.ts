import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/app/lib/getAuth";
import { getEventFromKV } from "@/app/lib/kv";

export const dynamic = "force-dynamic";

// Definice deal follow-up úkolů s výpočtem due date
const DEAL_TASKS = [
  { id: "deal-d7",   label: "Deal follow-up D+7 dní",     addMonths: 0, addDays: 7   },
  { id: "deal-d3m",  label: "Deal follow-up D+3 měsíce",  addMonths: 3, addDays: 0   },
  { id: "deal-d6m",  label: "Deal follow-up D+6 měsíců",  addMonths: 6, addDays: 0   },
  { id: "deal-d9m",  label: "Deal follow-up D+9 měsíců",  addMonths: 9, addDays: 0   },
  { id: "deal-d12m", label: "Deal follow-up D+12 měsíců", addMonths: 12, addDays: 0  },
  { id: "kpi-done",  label: "KPI tabulka vyplněna (D+7)", addMonths: 0, addDays: 7   },
];

function calcDueDate(baseDate: string, addMonths: number, addDays: number): number {
  const d = new Date(baseDate);
  d.setMonth(d.getMonth() + addMonths);
  d.setDate(d.getDate() + addDays);
  return d.getTime(); // Unix ms
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAuth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiToken = process.env.CLICKUP_API_TOKEN;
  const listId   = process.env.CLICKUP_LIST_ID;

  if (!apiToken || !listId) {
    return NextResponse.json(
      { error: "ClickUp není nakonfigurován. Přidej CLICKUP_API_TOKEN a CLICKUP_LIST_ID do .env.local." },
      { status: 503 },
    );
  }

  const { id } = await params;
  const event = await getEventFromKV(id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const body = await req.json() as { itemIds?: string[] };
  // Pokud jsou specifikovány itemIds, vytvoř jen pro ty — jinak pro všechny nevyřízené
  const checklist = event.checklist ?? [];
  const doneIds = new Set(checklist.filter((i) => i.done).map((i) => i.id));

  const tasksToCreate = DEAL_TASKS.filter((t) => {
    if (body.itemIds) return body.itemIds.includes(t.id);
    return !doneIds.has(t.id);
  });

  if (tasksToCreate.length === 0) {
    return NextResponse.json({ created: [], message: "Žádné nevyřízené úkoly k vytvoření." });
  }

  const created: { id: string; url: string; name: string }[] = [];
  const errors: string[] = [];

  for (const task of tasksToCreate) {
    const dueTs = calcDueDate(event.dateEnd, task.addMonths, task.addDays);
    const taskName = `${task.label} — ${event.shortName}`;
    const description = `Automaticky vytvořeno z aplikace AIR TEAM Odměny\n\nEvent: ${event.name}\nMísto: ${event.location}\nDatum eventu: ${event.dateStart} – ${event.dateEnd}`;

    try {
      const res = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
        method: "POST",
        headers: {
          "Authorization": apiToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: taskName,
          description,
          due_date: dueTs,
          due_date_time: false,
          notify_all: false,
          tags: ["event", "deal-follow-up"],
        }),
      });

      if (res.ok) {
        const data = await res.json() as { id: string; url: string };
        created.push({ id: task.id, url: data.url, name: taskName });
      } else {
        const err = await res.json().catch(() => ({})) as { err?: string };
        errors.push(`${task.id}: ${err.err ?? res.statusText}`);
      }
    } catch (e) {
      errors.push(`${task.id}: síťová chyba`);
    }
  }

  return NextResponse.json({ created, errors, total: tasksToCreate.length });
}
