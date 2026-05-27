import Sidebar, { type SidebarEvent } from "@/app/components/Sidebar";
import AccessLogRecorder from "@/app/components/AccessLogRecorder";
import { getAuth } from "@/app/lib/getAuth";
import { listEvents } from "@/app/lib/kv";
import type { EventData } from "@/data/events";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuth();
  const isAdmin    = session?.user?.isAdmin    ?? false;
  const isApprover = session?.user?.isApprover ?? false;
  const isFinance  = session?.user?.isFinance  ?? false;
  const memberName = session?.user?.name ?? null;

  let allEvents: EventData[] = [];
  try {
    allEvents = await listEvents();
  } catch {
    // fallback na prázdný seznam — sidebar bude bez event linků
  }

  // Filtr per role — sidebar nesmí ukazovat odkazy, na které nemá oprávnění.
  const visible: SidebarEvent[] = allEvents
    .filter((e) => {
      if (isAdmin) return true;
      if (e.status === "approved" || e.status === "paid") return true;
      if (e.status === "submitted" && (isApprover || isFinance)) return true;
      // team member vidí svůj event ve všech stavech kromě draftu
      if (e.status !== "draft" && memberName && isTeamMember(e, memberName)) return true;
      return false;
    })
    .map((e) => ({
      id: e.id,
      shortName: e.shortName,
      status: e.status,
    }));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AccessLogRecorder />
      <Sidebar events={visible} showAdminLink={isAdmin} />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "1.75rem 1.5rem",
        }}
      >
        {children}
      </main>
    </div>
  );
}

function isTeamMember(e: EventData, name: string): boolean {
  return (
    e.salesTeam.some((p) => p.name === name) ||
    e.nesalesTeam.some((p) => p.name === name) ||
    e.prepTeam.some((p) => p.name === name)
  );
}
