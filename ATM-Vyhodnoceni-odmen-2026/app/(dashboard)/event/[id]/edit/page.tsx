import { redirect, notFound } from "next/navigation";
import { getAuth } from "@/app/lib/getAuth";
import { getEventWithVersions } from "@/app/lib/kv";
import EventAccessFallback from "@/app/components/EventAccessFallback";
import EditClient from "./EditClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventWithVersions(id);
  if (!event) return {};
  return { title: `${event.shortName} – Výsledky eventu | AIR TEAM` };
}

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAuth();
  if (!session) redirect("/login");

  const { id } = await params;
  const event = await getEventWithVersions(id);
  if (!event) notFound();

  if (!session.user.isAdmin) {
    return (
      <EventAccessFallback
        eventId={event.id}
        eventShortName={event.shortName}
        status={event.status}
        reason="Editace výsledků eventu je vyhrazena admin marketingu (Pavlína Pařízková)."
        hint="Tým si může prohlédnout data v detailu veletrhu."
        action={{ label: "Detail veletrhu", href: `/event/${event.id}` }}
      />
    );
  }

  return <EditClient event={event} />;
}
