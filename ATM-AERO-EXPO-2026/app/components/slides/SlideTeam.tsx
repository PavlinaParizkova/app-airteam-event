import { TEAM } from "../../data/slides-data";

const INITIALS_COLORS = [
  "var(--color-at-blue-v2)",
  "var(--color-at-blue-v3)",
  "var(--color-at-blue)",
  "var(--color-at-blue-a2)",
  "var(--color-at-blue-v2)",
  "var(--color-at-blue-a3)",
  "var(--color-at-blue-v3)",
  "var(--color-at-blue)",
];

export default function SlideTeam() {
  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Slide header */}
      <div className="mb-4 sm:mb-6">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Tým a role
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Účastníci veletrhu
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          Role, odpovědnosti a počet dní přítomnosti na AERO EXPO 2026
        </p>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden flex flex-col gap-2">
        {TEAM.map((member, i) => (
          <div
            key={member.name}
            className="rounded-lg px-4 py-3 flex flex-col gap-1.5"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v4)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: INITIALS_COLORS[i % INITIALS_COLORS.length],
                    color: "var(--color-at-white)",
                    border: "2px solid var(--color-at-blue-v4)",
                  }}
                >
                  {member.initials}
                </div>
                <span className="font-bold text-base" style={{ color: "var(--color-at-white)" }}>
                  {member.name}
                </span>
              </div>
              <span
                className="text-lg font-black flex-shrink-0"
                style={{ color: member.days === 4 ? "var(--color-at-red)" : "var(--color-at-blue-v5)" }}
              >
                {member.days} dny
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-at-blue-v5)" }}>{member.role}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="px-2 py-0.5 rounded text-xs font-semibold"
                style={{ background: "var(--color-at-blue)", color: "var(--color-at-white)" }}
              >
                {member.dates}
              </span>
            </div>
            <p className="text-sm leading-snug mt-0.5" style={{ color: "var(--color-at-blue-v5)" }}>
              {member.responsibility}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div
        className="hidden md:block overflow-x-auto rounded-lg"
        style={{ border: "1px solid var(--color-at-blue-v2)" }}
      >
        <table className="w-full text-base">
          <thead>
            <tr style={{ background: "var(--color-at-blue)" }}>
              {["Jméno", "Role", "Přítomnost", "Dní", "Primární odpovědnost"].map((h, i) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-bold tracking-wide text-xs uppercase"
                  style={{
                    color: "var(--color-at-white)",
                    borderBottom: "1px solid var(--color-at-blue-v2)",
                    textAlign: i === 2 || i === 3 ? "center" : "left",
                    width: i === 2 ? 100 : i === 3 ? 60 : undefined,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEAM.map((member, i) => (
              <tr
                key={member.name}
                style={{
                  background: i % 2 === 0 ? "#ffffff" : "var(--color-at-black-v4)",
                  borderBottom: "1px solid var(--color-at-blue-v5)",
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: INITIALS_COLORS[i % INITIALS_COLORS.length],
                        color: "var(--color-at-white)",
                        border: "2px solid #ffffff",
                      }}
                    >
                      {member.initials}
                    </div>
                    <span className="font-semibold" style={{ color: "var(--color-at-blue)" }}>
                      {member.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--color-at-blue-v2)" }}>
                  {member.role}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="px-2 py-1 rounded text-xs font-semibold"
                    style={{ background: "var(--color-at-blue)", color: "var(--color-at-white)" }}
                  >
                    {member.dates}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="text-lg font-black"
                    style={{ color: member.days === 4 ? "var(--color-at-red)" : "var(--color-at-blue)" }}
                  >
                    {member.days}
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-base leading-snug"
                  style={{ color: "var(--color-at-blue-v3)", maxWidth: 320 }}
                >
                  {member.responsibility}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 flex gap-6">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: "var(--color-at-red)" }}
          />
          <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
            4 dny přítomnosti
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: "var(--color-at-blue-a5)" }}
          />
          <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
            Celkem 8 účastníků
          </span>
        </div>
      </div>
    </div>
  );
}
