import type { ReactNode } from "react";

/** Žádný statický prerender / dlouhé CDN cachování – vždy aktuální checklist po deployi. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Zobrazí zkrácený Git SHA z buildu na Vercelu → ověření, že produkce běží na očekávaném commitu.
 * (Na lokálu bez Vercel env proměnných se nevykreslí.)
 */
export default function OpsLayout({ children }: { children: ReactNode }) {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  const dpl = process.env.VERCEL_DEPLOYMENT_ID;
  const label =
    sha && sha.length >= 7
      ? `git ${sha.slice(0, 7)}`
      : dpl
        ? `dpl ${dpl.replace(/^dpl_/, "").slice(0, 8)}`
        : null;

  return (
    <>
      {children}
      {label ? (
        <div
          className="pointer-events-none fixed bottom-1 right-2 z-[100] font-mono text-[10px] tabular-nums"
          style={{ color: "var(--color-at-blue-v4)", opacity: 0.55 }}
          title={[sha && `VERCEL_GIT_COMMIT_SHA=${sha}`, dpl && `VERCEL_DEPLOYMENT_ID=${dpl}`]
            .filter(Boolean)
            .join("\n")}
        >
          build {label}
        </div>
      ) : null}
    </>
  );
}
