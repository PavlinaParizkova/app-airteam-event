import { notFound } from "next/navigation";
import { getAuth, canAccessFinancePlan } from "@/app/lib/getAuth";
import { getEventWithVersions } from "@/app/lib/kv";
import EventAccessFallback from "@/app/components/EventAccessFallback";
import OdmenyClient from "./OdmenyClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventWithVersions(id);
  if (!event) return {};
  return { title: `${event.shortName} – Editor odměn | AIR TEAM` };
}

export default async function OdmenyPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, getAuth()]);
  const event = await getEventWithVersions(id);
  if (!event) notFound();

  const isAdmin    = session?.user?.isAdmin    ?? false;
  const memberName = session?.user?.name       ?? null;

  // Admini vidí vždy. Členové libovolné skupiny (sales/nesales/prep) vidí vždy —
  // potřebují nastavit způsob výplaty bez ohledu na stav eventu.
  // Ostatní ne-admini vidí pouze approved/paid eventy.
  const isTeamMember = !isAdmin && !!memberName && (
    event.salesTeam.some((p) => p.name === memberName) ||
    event.nesalesTeam.some((p) => p.name === memberName) ||
    event.prepTeam.some((p) => p.name === memberName)
  );

  if (!isAdmin && !isTeamMember && event.status !== "approved" && event.status !== "paid") {
    return (
      <EventAccessFallback
        eventId={event.id}
        eventShortName={event.shortName}
        status={event.status}
        reason="Editor odměn vidí jen admin a členové týmu eventu. Veřejně se zobrazuje až po schválení."
        hint="Pokud bys měl/a být v týmu, ozvi se Pavlíně (admin marketingu)."
        action={{ label: "Detail veletrhu", href: `/event/${event.id}` }}
      />
    );
  }

  return (
    <OdmenyClient
      event={event}
      isAdmin={isAdmin}
      memberName={memberName ?? undefined}
      showFinanceLink={canAccessFinancePlan(session)}
    />
  );
}
