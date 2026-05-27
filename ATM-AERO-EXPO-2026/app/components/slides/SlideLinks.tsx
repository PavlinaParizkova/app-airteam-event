import { LINKS } from "../../data/slides-data";

export default function SlideLinks() {
  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Slide header */}
      <div className="mb-5 sm:mb-8">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Zdroje
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Odkazy a dokumenty
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          Klíčové dokumenty a šablony pro přípravu a vyhodnocení veletrhu
        </p>
      </div>

      {/* Links grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.external ? link.href : undefined}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="block rounded-lg p-5 group"
            style={{
              background: "var(--color-at-blue-a5)",
              border: "1px solid var(--color-at-blue-v5)",
              cursor: link.external ? "pointer" : "default",
              textDecoration: "none",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-1.5 h-4 rounded-sm flex-shrink-0"
                    style={{ background: "var(--color-at-red)" }}
                  />
                  <h3
                    className="font-bold text-sm"
                    style={{ color: "var(--color-at-blue)" }}
                  >
                    {link.label}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-at-blue-v3)" }}>
                  {link.description}
                </p>
              </div>
              {link.external && (
                <span className="text-xs mt-0.5" style={{ color: "var(--color-at-blue-v3)" }}>
                  ↗
                </span>
              )}
            </div>
            <div
              className="mt-3 pt-3 font-mono text-xs truncate"
              style={{
                color: "var(--color-at-blue-v3)",
                borderTop: "1px solid var(--color-at-blue-v4)",
              }}
            >
              {link.href}
            </div>
          </a>
        ))}
      </div>

      {/* Footer info */}
      <div className="mt-auto pt-8">
        <div
          className="rounded-lg px-6 py-5 flex items-center justify-between"
          style={{ background: "var(--color-at-blue-a5)", border: "1px solid var(--color-at-blue-v5)" }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--color-at-blue-v2)" }}>
              AIR TEAM · AERO EXPO 2026
            </p>
            <p className="text-xs" style={{ color: "var(--color-at-blue-v3)" }}>
              Interní briefing · Friedrichshafen · 22.–25. 4. 2026
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: "var(--color-at-blue-v3)" }}>
              Vlastník dokumentu
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--color-at-blue)" }}>
              Pavlína Pařízková
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
