import { notFound } from "next/navigation";
import { getAuth, canAccessFinancePlan } from "@/app/lib/getAuth";
import { getEventFromKV } from "@/app/lib/kv";
import EventAccessFallback from "@/app/components/EventAccessFallback";
import EventSubNav from "@/app/components/EventSubNav";
import FinanceCheckpointPanel from "@/app/components/FinanceCheckpointPanel";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventFromKV(id);
  if (!event) return {};
  return { title: `${event.shortName} – Platební plán | AIR TEAM` };
}

export default async function FinancePage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, getAuth()]);
  const event = await getEventFromKV(id);
  if (!event) notFound();

  if (!canAccessFinancePlan(session)) {
    return (
      <EventAccessFallback
        eventId={event.id}
        eventShortName={event.shortName}
        status={event.status}
        reason="Platební plán mohou vidět jen admin marketingu a finance (David, Věra)."
        hint="Pokud bys měla mít přístup, ozvi se Pavlíně."
      />
    );
  }

  const isAdmin   = session?.user?.isAdmin   ?? false;
  const isFinance = session?.user?.isFinance ?? false;

  if (!isAdmin && event.status !== "approved" && event.status !== "paid") {
    return (
      <EventAccessFallback
        eventId={event.id}
        eventShortName={event.shortName}
        status={event.status}
        reason="Platební plán se aktivuje až po schválení veletrhu — finance pak vidí osoby k úhradě."
        hint="Schválení provádí Petr Polák (CEO) po dokončení editace marketingem."
        action={{ label: "Detail veletrhu", href: `/event/${event.id}` }}
      />
    );
  }

  const hasTeams =
    event.salesTeam.length > 0 ||
    event.nesalesTeam.length > 0 ||
    event.prepTeam.length > 0;

  if (!hasTeams) {
    return (
      <EventAccessFallback
        eventId={event.id}
        eventShortName={event.shortName}
        status={event.status}
        reason="Tento veletrh zatím nemá žádný tým — finance plán je prázdný."
        action={{ label: "Editor odměn", href: `/event/${event.id}/odmeny` }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 960 }}>
      <EventSubNav
        eventId={event.id}
        eventShortName={event.shortName}
        active="finance"
        showFinanceLink
      />

      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)", fontWeight: 700, marginBottom: 6 }}>
          Platební plán — {event.shortName}
        </h1>
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.92)", lineHeight: 1.5 }}>
          Přehled plateb po etapách (D+7, D+3M …), Skupina 2 a Skupina 3. Schvalování a stavy pro finance.
        </p>
      </div>

      <FinanceCheckpointPanel
        event={event}
        isAdmin={isAdmin}
        isFinance={isFinance}
        showAllPhases={isAdmin || isFinance}
        nesalesTeam={event.nesalesTeam}
        prepTeam={event.prepTeam}
      />
    </div>
  );
}
