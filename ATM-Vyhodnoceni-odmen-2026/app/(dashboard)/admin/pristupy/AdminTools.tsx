"use client";
import { useRef, useState } from "react";

type RepairResult = {
  ok: boolean;
  restored?: string[];
  alreadyPresent?: string[];
  missing?: string[];
  note?: string;
  error?: string;
};

type SeedResult = {
  ok: boolean;
  created?: string[];
  skipped?: string[];
  recreated?: string[];
  error?: string;
};

type ImportResult = {
  ok: boolean;
  restoredCount?: number;
  restored?: string[];
  errors?: string[];
  sourceExportedAt?: string;
  error?: string;
};

type BackupEntry = { url: string; pathname: string; uploadedAt: string };
type ListBackupsResult = { ok: boolean; count?: number; backups?: BackupEntry[]; error?: string };
type RestoreResult = { ok: boolean; takenAt?: string; restored?: string[]; errors?: string[]; error?: string };

const CARD: React.CSSProperties = {
  padding: "1.25rem", borderRadius: 8,
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
  display: "flex", flexDirection: "column", gap: "1rem",
};

const LABEL: React.CSSProperties = {
  fontSize: "0.875rem", color: "#ffffff", fontWeight: 600, marginBottom: 2,
};

const DESC: React.CSSProperties = {
  fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.625rem",
};

function Pre({ data, ok }: { data: unknown; ok: boolean }) {
  return (
    <pre style={{
      marginTop: "0.625rem", padding: "0.625rem 0.875rem", borderRadius: 6,
      background: "rgba(0,0,0,0.3)", fontSize: "0.75rem",
      color: ok ? "#86efac" : "#fca5a5",
      whiteSpace: "pre-wrap", wordBreak: "break-word",
    }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function AdminTools() {
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [forceSeedResult, setForceSeedResult] = useState<SeedResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [backupsResult, setBackupsResult] = useState<ListBackupsResult | null>(null);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const [loading, setLoading] = useState<
    "repair" | "seed" | "forceseed" | "import" | "backups" | "restore" | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleExport() {
    // Otevře URL v nové záložce → prohlížeč stáhne soubor
    window.open("/api/admin/export-json", "_blank");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm(`Importovat zálohu: ${file.name}?\n\nStávající data budou přepsána daty ze souboru.`)) {
      e.target.value = "";
      return;
    }
    setLoading("import");
    setImportResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/admin/import-json", { method: "POST", body: form });
      const d = await r.json() as ImportResult;
      setImportResult(d);
    } catch {
      setImportResult({ ok: false, error: "Síťová chyba" });
    } finally {
      setLoading(null);
      e.target.value = "";
    }
  }

  async function handleRepair() {
    setLoading("repair");
    setRepairResult(null);
    try {
      const r = await fetch("/api/admin/repair-ids", { method: "POST" });
      setRepairResult(await r.json() as RepairResult);
    } catch {
      setRepairResult({ ok: false, error: "Síťová chyba" });
    } finally {
      setLoading(null);
    }
  }

  async function handleSeed() {
    setLoading("seed");
    setSeedResult(null);
    try {
      const r = await fetch("/api/admin/seed", { method: "POST" });
      setSeedResult(await r.json() as SeedResult);
    } catch {
      setSeedResult({ ok: false, error: "Síťová chyba" });
    } finally {
      setLoading(null);
    }
  }

  async function handleForceSeed() {
    if (!confirm(
      "POZOR: Force seed smaže stávající záznamy a vytvoří eventy znovu ze statických dat.\n\n" +
      "Veškerá data (KPI, schválení, dealy) budou resetována na výchozí hodnoty.\n\n" +
      "Pokračovat?"
    )) return;
    setLoading("forceseed");
    setForceSeedResult(null);
    try {
      const r = await fetch("/api/admin/seed?force=true", { method: "POST" });
      setForceSeedResult(await r.json() as SeedResult);
    } catch {
      setForceSeedResult({ ok: false, error: "Síťová chyba" });
    } finally {
      setLoading(null);
    }
  }

  async function handleListBackups() {
    setLoading("backups");
    setBackupsResult(null);
    setRestoreResult(null);
    try {
      const r = await fetch("/api/admin/list-backups");
      setBackupsResult(await r.json() as ListBackupsResult);
    } catch {
      setBackupsResult({ ok: false, error: "Síťová chyba" });
    } finally {
      setLoading(null);
    }
  }

  async function handleRestore(url: string) {
    if (!confirm(`Obnovit data ze zálohy?\n${url}\n\nStávající data v Redis budou přepsána.`)) return;
    setLoading("restore");
    setRestoreResult(null);
    try {
      const r = await fetch("/api/admin/restore-backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      setRestoreResult(await r.json() as RestoreResult);
    } catch {
      setRestoreResult({ ok: false, error: "Síťová chyba" });
    } finally {
      setLoading(null);
    }
  }

  const btn = (label: string, onClick: () => void, danger = false) => (
    <button
      onClick={onClick}
      disabled={loading !== null}
      style={{
        padding: "0.5rem 1.125rem", borderRadius: 7,
        border: `1px solid ${danger ? "rgba(239,68,68,0.5)" : "rgba(147,179,207,0.35)"}`,
        background: danger ? "rgba(239,68,68,0.12)" : "rgba(147,179,207,0.10)",
        color: danger ? "#fca5a5" : "#93b3cf",
        fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
        opacity: loading !== null ? 0.5 : 1,
      }}
    >
      {loading !== null ? "…" : label}
    </button>
  );

  const greenBtn = (label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      disabled={loading !== null}
      style={{
        padding: "0.5rem 1.125rem", borderRadius: 7,
        border: "1px solid rgba(34,197,94,0.5)",
        background: "rgba(34,197,94,0.12)",
        color: "#86efac",
        fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
        opacity: loading !== null ? 0.5 : 1,
      }}
    >
      {loading !== null ? "…" : label}
    </button>
  );

  const hr = <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)" }} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Záloha JSON (doporučeno) ── */}
      <section>
        <h2 style={{
          fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: "0.75rem",
        }}>
          Záloha JSON — Google Drive / lokální disk
        </h2>
        <div style={CARD}>
          <div>
            <p style={LABEL}>📥 Stáhnout zálohu (doporučeno)</p>
            <p style={DESC}>
              Exportuje kompletní snapshot všech eventů jako JSON soubor.
              Soubor ulož do Google Drive — slouží jako záloha při výpadku Redis.
              <br />
              <strong style={{ color: "#86efac" }}>
                Zálohovat alespoň 1× týdně, ideálně před každým veletrhem.
              </strong>
            </p>
            {greenBtn("📥 Stáhnout zálohu (.json)", handleExport)}
          </div>

          {hr}

          <div>
            <p style={LABEL}>📤 Importovat zálohu ze souboru</p>
            <p style={DESC}>
              Nahraje JSON zálohu a obnoví všechna data do Redis.
              Stávající data budou přepsána obsahem souboru.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              style={{ display: "none" }}
            />
            {btn("📤 Vybrat soubor a importovat", () => fileInputRef.current?.click())}
            {importResult && <Pre data={importResult} ok={importResult.ok} />}
          </div>
        </div>
      </section>

      {/* ── Diagnostika a opravy ── */}
      <section>
        <h2 style={{
          fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: "0.75rem",
        }}>
          Diagnostika a opravy Redis
        </h2>
        <div style={CARD}>

          {/* Repair IDs */}
          <div>
            <p style={LABEL}>Opravit seznam eventů (event:ids)</p>
            <p style={DESC}>
              Obnoví <code>event:ids</code> ze stávajících dat v Redis. Bezpečné — nic nepřepisuje.
            </p>
            {btn("Spustit opravu", handleRepair)}
            {repairResult && <Pre data={repairResult} ok={repairResult.ok} />}
          </div>

          {hr}

          {/* Zálohy Vercel Blob */}
          <div>
            <p style={LABEL}>Obnovit ze zálohy Vercel Blob</p>
            <p style={DESC}>
              Denní automatická záloha do Vercel Blob (cron 3:00 UTC).
              {" "}
              <strong style={{ color: "#fca5a5" }}>
                Vyžaduje nastavení BLOB_READ_WRITE_TOKEN v Vercel dashboardu.
              </strong>
            </p>
            {btn("Zobrazit zálohy", handleListBackups)}
            {backupsResult && (
              <div style={{ marginTop: "0.625rem" }}>
                {!backupsResult.ok && (
                  <p style={{ color: "#fca5a5", fontSize: "0.8125rem" }}>{backupsResult.error}</p>
                )}
                {backupsResult.ok && backupsResult.count === 0 && (
                  <p style={{ color: "#fca5a5", fontSize: "0.8125rem" }}>
                    Žádné zálohy — BLOB_READ_WRITE_TOKEN není nastaven.
                  </p>
                )}
                {backupsResult.ok && (backupsResult.backups ?? []).length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                    {(backupsResult.backups ?? []).slice(0, 5).map((b) => (
                      <div key={b.url} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0.5rem 0.75rem", borderRadius: 6,
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        gap: "1rem", flexWrap: "wrap",
                      }}>
                        <span style={{ fontSize: "0.8125rem", color: "#93b3cf", fontFamily: "monospace" }}>
                          {b.pathname.replace("backups/", "")}
                        </span>
                        <button
                          onClick={() => handleRestore(b.url)}
                          disabled={loading !== null}
                          style={{
                            padding: "0.25rem 0.75rem", borderRadius: 5,
                            border: "1px solid rgba(34,197,94,0.4)",
                            background: "rgba(34,197,94,0.12)",
                            color: "#86efac", fontSize: "0.8125rem", fontWeight: 600,
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          Obnovit tuto zálohu
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {restoreResult && <Pre data={restoreResult} ok={restoreResult.ok} />}
              </div>
            )}
          </div>

          {hr}

          {/* Seed chybějící */}
          <div>
            <p style={LABEL}>Seedovat chybějící eventy</p>
            <p style={DESC}>
              Vytvoří pouze eventy, které v Redis vůbec neexistují. Existující nepřepíše.
            </p>
            {btn("Spustit seed", handleSeed)}
            {seedResult && <Pre data={seedResult} ok={seedResult.ok} />}
          </div>

          {hr}

          {/* Force seed */}
          <div>
            <p style={{ ...LABEL, color: "#fca5a5" }}>⚠️ Force seed — reset na výchozí data</p>
            <p style={DESC}>
              Smaže stávající záznamy a vytvoří eventy znovu ze statických seed dat.
              Použij pouze pokud zálohy neexistují a data jsou ztracena.{" "}
              <strong style={{ color: "#fca5a5" }}>Resetuje KPI, schválení a všechny změny.</strong>
            </p>
            {btn("⚠️ Force seed (reset dat)", handleForceSeed, true)}
            {forceSeedResult && <Pre data={forceSeedResult} ok={forceSeedResult.ok} />}
          </div>

        </div>
      </section>
    </div>
  );
}
