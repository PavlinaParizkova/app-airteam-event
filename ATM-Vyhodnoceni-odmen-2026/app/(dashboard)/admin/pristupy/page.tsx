import { notFound } from "next/navigation";
import { getAuth } from "@/app/lib/getAuth";
import { listAccessLogs, type AccessLogEntry } from "@/app/lib/access-log";
import AdminTools from "./AdminTools";

export const dynamic = "force-dynamic";
export const metadata = { title: "Přístupy do aplikace | AIR TEAM" };

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("cs-CZ", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "Europe/Prague",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function AdminPristupyPage() {
  const session = await getAuth();
  if (!session?.user?.isAdmin) {
    notFound();
  }

  const entries = await listAccessLogs(1000);

  const byUser = new Map<string, { name: string; email: string; count: number; lastAt: string; lastPath: string }>();
  for (const e of entries) {
    const cur = byUser.get(e.email);
    if (!cur) {
      byUser.set(e.email, {
        name: e.name,
        email: e.email,
        count: 1,
        lastAt: e.at,
        lastPath: e.path,
      });
    } else {
      cur.count += 1;
      if (e.at > cur.lastAt) {
        cur.lastAt = e.at;
        cur.lastPath = e.path;
      }
    }
  }
  const summary = [...byUser.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));

  return (
    <div style={{ maxWidth: 1100 }}>
      <p style={{
        fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "#93b3cf", marginBottom: "0.375rem",
      }}>
        Pouze admin
      </p>
      <h1 style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", fontWeight: 700, marginBottom: "0.5rem" }}>
        Kdo otevřel aplikaci
      </h1>
      <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.95)", marginBottom: "1.75rem", lineHeight: 1.5 }}>
        Záznam každé navštívené stránky po přihlášení. Stránka není v menu pro ostatní uživatele.
      </p>

      <AdminTools />

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: "0.75rem" }}>
          Přehled podle uživatele
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {summary.length === 0 && (
            <p style={{ color: "rgba(255,255,255,0.92)", fontSize: "0.875rem" }}>Zatím žádné záznamy.</p>
          )}
          {summary.map((u) => (
            <div
              key={u.email}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "0.25rem 1rem",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
              }}
            >
              <div>
                <p style={{ fontWeight: 600, color: "#ffffff" }}>{u.name}</p>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.92)" }}>{u.email}</p>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.8125rem", color: "rgba(255,255,255,0.92)" }}>
                <p>{formatWhen(u.lastAt)}</p>
                <p style={{ color: "rgba(255,255,255,0.88)", marginTop: 2 }}>{u.lastPath}</p>
                <p style={{ marginTop: 4, color: "#93b3cf" }}>{u.count}× celkem</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: "0.75rem" }}>
          Poslední návštěvy ({entries.length})
        </h2>
        <div style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ background: "rgba(80,116,153,0.15)", textAlign: "left" }}>
                <th style={{ padding: "0.625rem 0.875rem", color: "rgba(255,255,255,0.7)" }}>Kdy</th>
                <th style={{ padding: "0.625rem 0.875rem", color: "rgba(255,255,255,0.7)" }}>Kdo</th>
                <th style={{ padding: "0.625rem 0.875rem", color: "rgba(255,255,255,0.7)" }}>Stránka</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e: AccessLogEntry) => (
                <tr key={e.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <td style={{ padding: "0.5rem 0.875rem", color: "rgba(255,255,255,0.92)", whiteSpace: "nowrap" }}>
                    {formatWhen(e.at)}
                  </td>
                  <td style={{ padding: "0.5rem 0.875rem" }}>
                    <span style={{ color: "#ffffff", fontWeight: 500 }}>{e.name}</span>
                    <br />
                    <span style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.75rem" }}>{e.email}</span>
                  </td>
                  <td style={{ padding: "0.5rem 0.875rem", color: "#93b3cf", fontFamily: "monospace", fontSize: "0.75rem" }}>
                    {e.path}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
