import { notFound } from "next/navigation";
import { getAuth } from "@/app/lib/getAuth";
import NewEventClient from "./NewEventClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nový event | AIR TEAM" };

export default async function NewEventPage() {
  const session = await getAuth();
  if (!session?.user?.isAdmin) notFound();

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{
          fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "#93b3cf", marginBottom: "0.375rem",
        }}>
          Admin — Nový event
        </p>
        <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", marginBottom: "0.375rem" }}>
          Vytvořit nový event
        </h1>
        <p style={{ color: "rgba(255,255,255,0.92)", fontSize: "0.9375rem" }}>
          Po uložení bude event ve stavu <strong style={{ color: "rgba(255,255,255,0.92)" }}>draft</strong>, viditelný pouze pro admina. Ke schválení použij stránku eventu.
        </p>
      </div>

      <NewEventClient />
    </div>
  );
}
