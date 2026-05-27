import { DAYS, TEAM } from "../../data/slides-data";

const PERSON_COLORS: Record<string, string> = {
  "Petr Polák":          "var(--color-at-red)",
  "Jan Polák":           "var(--color-at-blue-v3)",
  "Magdaléna Ševčíková": "var(--color-at-blue-v2)",
  "Vratko Kapuš":        "var(--color-at-blue-v4)",
  "Jakub Dryska":        "var(--color-at-blue-a2)",
  "Anna Ivlieva":        "var(--color-at-blue-a3)",
  "Alex Mudrych":        "var(--color-at-blue-a4)",
  "Jirka Franz":         "var(--color-at-blue)",
};

function getInitials(name: string) {
  return TEAM.find((m) => m.name === name)?.initials ?? name.slice(0, 2).toUpperCase();
}

export default function SlideDays() {
  const totalPeople = TEAM.length;

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Slide header */}
      <div className="mb-4 sm:mb-6">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Harmonogram
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Přehled pokrytí po dnech
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          Kdo je přítomen každý den veletrhu
        </p>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 flex-1">
        {DAYS.map((day) => {
          const coverage = Math.round((day.people.length / totalPeople) * 100);
          return (
            <div
              key={day.label}
              className="rounded-lg p-5 flex flex-col"
              style={{ background: "var(--color-at-blue)", border: "1px solid var(--color-at-blue-v2)" }}
            >
              {/* Day header */}
              <div className="mb-4 pb-4" style={{ borderBottom: "1px solid var(--color-at-blue-v2)" }}>
                <div className="flex items-baseline justify-between mb-1">
                  <span
                    className="text-2xl font-black"
                    style={{ color: "var(--color-at-white)" }}
                  >
                    {day.label}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded"
                    style={{ background: "var(--color-at-blue-v2)", color: "var(--color-at-blue-a5)" }}
                  >
                    {day.people.length}/{totalPeople}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                  {day.date}
                </p>
                {/* Coverage bar */}
                <div
                  className="mt-3 h-1 rounded-full overflow-hidden"
                  style={{ background: "var(--color-at-blue-v2)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${coverage}%`,
                      background: coverage === 100 ? "var(--color-at-red)" : "var(--color-at-blue-v4)",
                    }}
                  />
                </div>
              </div>

              {/* People avatars */}
              <div className="flex flex-col gap-2 flex-1">
                {day.people.map((person) => (
                  <div key={person} className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: PERSON_COLORS[person] ?? "var(--color-at-blue-v4)",
                        color: "var(--color-at-white)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      {getInitials(person)}
                    </div>
                    <span
                      className="text-xs leading-tight"
                      style={{ color: "var(--color-at-white)" }}
                    >
                      {person}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6">
        <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
          Denní pokrytí:
        </p>
        {DAYS.map((day) => (
          <div key={day.label} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background:
                  day.people.length === totalPeople ? "var(--color-at-red)" : "var(--color-at-blue-v4)",
              }}
            />
            <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
              {day.label}: {day.people.length} lidí
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
