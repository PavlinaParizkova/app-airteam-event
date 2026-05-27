import { notFound } from "next/navigation";
import { getAuth, canAccessFinancePlan } from "@/app/lib/getAuth";
import { getEventFromKV } from "@/app/lib/kv";
import EventAccessFallback from "@/app/components/EventAccessFallback";
import EventSubNav from "@/app/components/EventSubNav";
import ChecklistPanel from "@/app/components/ChecklistPanel";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventFromKV(id);
  if (!event) return {};
  return { title: `${event.shortName} – Checklist eventu | AIR TEAM` };
}

export default async function ChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, getAuth()]);
  const event = await getEventFromKV(id);
  if (!event) notFound();

  const isAdmin = session?.user?.isAdmin ?? false;

  if (!isAdmin && event.status !== "approved" && event.status !== "paid") {
    return (
      <EventAccessFallback
        eventId={event.id}
        eventShortName={event.shortName}
        status={event.status}
        reason="Checklist eventu vidí jen admin marketingu. Tým ho uvidí, jakmile bude veletrh schválen."
        action={{ label: "Detail veletrhu", href: `/event/${event.id}` }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <EventSubNav
        eventId={event.id}
        eventShortName={event.shortName}
        active="checklist"
        showFinanceLink={canAccessFinancePlan(session)}
      />

      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)", fontWeight: 700, marginBottom: 6 }}>
          Checklist eventu — {event.shortName}
        </h1>
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.92)", lineHeight: 1.5 }}>
          Postup po eventu: schválení, finance, KPI a deal follow-up. Položky může měnit admin.
        </p>
      </div>

      <ChecklistPanel
        eventId={event.id}
        eventName={event.name}
        eventDateEnd={event.dateEnd}
        checklist={event.checklist}
        status={event.status}
        isAdmin={isAdmin}
        clickupConfigured={!!(process.env.NEXT_PUBLIC_CLICKUP_CONFIGURED)}
      />
    </div>
  );
}
