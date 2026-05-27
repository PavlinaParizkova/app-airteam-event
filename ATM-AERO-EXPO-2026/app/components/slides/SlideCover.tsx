import { INTERNAL_APP_OPS_URL } from "../../lib/site";

export default function SlideCover() {
  return (
    <div
      className="flex flex-col items-center flex-1 text-center px-8 relative overflow-hidden"
      style={{ background: "var(--color-at-blue-v1)" }}
    >
      {/* Background decorative elements */}
      <div
        className="absolute inset-0 opacity-6"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.25) 39px, rgba(255,255,255,0.25) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.25) 39px, rgba(255,255,255,0.25) 40px)",
        }}
      />
      <div
        className="absolute -bottom-32 -right-32 rounded-full opacity-15"
        style={{
          width: 600,
          height: 600,
          background: "radial-gradient(circle, var(--color-at-blue-v4) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute -top-24 -left-24 rounded-full opacity-10"
        style={{
          width: 450,
          height: 450,
          background: "radial-gradient(circle, var(--color-at-blue-v5) 0%, transparent 65%)",
        }}
      />

      {/* Main content – centered */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">

      {/* AIR TEAM wordmark */}
      <div className="mb-10 flex items-center gap-3">
        <div
          className="w-2 h-10 rounded-sm"
          style={{ background: "var(--color-at-red)" }}
        />
        <span
          className="text-xl font-bold tracking-[0.25em] uppercase"
          style={{ color: "var(--color-at-blue-a5)" }}
        >
          AIR TEAM
        </span>
      </div>

      {/* Main heading */}
      <h1
        className="font-black tracking-tight leading-none mb-2"
        style={{ color: "var(--color-at-white)", fontSize: "clamp(2.8rem, 6vw, 4.5rem)" }}
      >
        AIR TEAM
        <span style={{ color: "var(--color-at-white)" }}> ×</span>
      </h1>
      <h2
        className="font-black tracking-tight leading-none mb-2"
        style={{ color: "var(--color-at-white)", fontSize: "clamp(2.4rem, 5vw, 4rem)" }}
      >
        AERO EXPO
      </h2>
      <h3
        className="font-black tracking-tight leading-none mb-8"
        style={{ color: "var(--color-at-white)", fontSize: "clamp(3rem, 6.5vw, 5rem)" }}
      >
        2026
      </h3>

      {/* Divider */}
      <div
        className="w-24 h-0.5 mb-8"
        style={{ background: "var(--color-at-red)" }}
      />

      {/* Subtitle */}
      <p
        className="text-xl font-medium mb-3"
        style={{ color: "var(--color-at-blue-a5)" }}
      >
        Kompletní informace o veletrhu
      </p>

      {/* Event info */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
        <span
          className="px-4 py-2 rounded text-sm font-semibold tracking-wide"
          style={{ background: "rgba(16,37,62,0.55)", color: "var(--color-at-white)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          22.–25. 4. 2026
        </span>
        <span style={{ color: "var(--color-at-blue-v5)" }}>·</span>
        <span
          className="px-4 py-2 rounded text-sm font-semibold tracking-wide"
          style={{ background: "rgba(16,37,62,0.55)", color: "var(--color-at-white)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          Friedrichshafen, Německo
        </span>
        <span style={{ color: "var(--color-at-blue-v5)" }}>·</span>
        <span
          className="px-4 py-2 rounded text-sm font-black tracking-widest uppercase"
          style={{ background: "var(--color-at-red)", color: "var(--color-at-white)", letterSpacing: "0.12em" }}
        >
          Stánek A6-102
        </span>
      </div>

      </div>{/* end main content */}

      {/* Footer note */}
      <div className="relative z-10 pb-6 flex flex-col items-center gap-2">
        <a
          href={INTERNAL_APP_OPS_URL}
          className="text-xs font-bold tracking-wide px-3 py-1.5 rounded transition-opacity hover:opacity-90"
          style={{
            color: "var(--color-at-white)",
            background: "var(--color-at-blue-v2)",
            border: "1px solid var(--color-at-blue-v4)",
          }}
        >
          Operativa (checklisty, stánku, PilotStyle…) →
        </a>
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--color-at-blue-a5)", opacity: 0.6 }}
        >
          Dokument: Pavlína Pařízková · AIR TEAM · 2026-03-23
        </p>
      </div>
    </div>
  );
}
