import { TRANSPORT } from "../../data/slides-data";

const TYPE_BADGE: Record<string, { bg: string; text: string }> = {
  Auto:            { bg: "var(--color-at-blue-a4)", text: "var(--color-at-white)" },
  "řeší si sám":  { bg: "var(--color-at-blue-v3)", text: "var(--color-at-white)" },
};

function StatusBadge({ status }: { status: string }) {
  const isConfirmed = status === "potvrzeno";
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-semibold"
      style={{
        background: isConfirmed ? "var(--color-at-blue-a3)" : "var(--color-at-blue-v3)",
        color: "var(--color-at-white)",
      }}
    >
      {status}
    </span>
  );
}

export default function SlideTransport() {
  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Slide header */}
      <div className="mb-4 sm:mb-6">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Logistika
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Doprava na veletrh
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          Plán přepravy celého týmu do Friedrichshafenu
        </p>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div
          className="px-5 py-3 rounded-lg flex items-center gap-3"
          style={{ background: "var(--color-at-blue-a5)", border: "1px solid var(--color-at-blue-v5)" }}
        >
          <span className="text-2xl font-black" style={{ color: "var(--color-at-blue)" }}>
            2
          </span>
          <span className="text-sm" style={{ color: "var(--color-at-blue-v2)" }}>
            auta
          </span>
        </div>
        <div
          className="px-5 py-3 rounded-lg flex items-center gap-3"
          style={{ background: "var(--color-at-blue-a5)", border: "1px solid var(--color-at-blue-v5)" }}
        >
          <span className="text-2xl font-black" style={{ color: "var(--color-at-blue)" }}>
            2
          </span>
          <span className="text-sm" style={{ color: "var(--color-at-blue-v2)" }}>
            skupiny
          </span>
        </div>
        <div
          className="px-5 py-3 rounded-lg flex items-center gap-3"
          style={{ background: "var(--color-at-blue-a5)", border: "1px solid var(--color-at-blue-v5)" }}
        >
          <span className="text-2xl font-black" style={{ color: "var(--color-at-blue)" }}>
            21. 4.
          </span>
          <span className="text-sm" style={{ color: "var(--color-at-blue-v2)" }}>
            první odjezd
          </span>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden flex flex-col gap-2">
        {TRANSPORT.map((row) => (
          <div
            key={row.name}
            className="rounded-lg px-4 py-3 flex flex-col gap-1.5"
            style={{ background: "var(--color-at-blue-v1)", border: "1px solid var(--color-at-blue-v4)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm" style={{ color: "var(--color-at-white)" }}>{row.name}</span>
              <span
                className="px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0"
                style={{
                  background: TYPE_BADGE[row.type]?.bg ?? "var(--color-at-blue-v3)",
                  color: TYPE_BADGE[row.type]?.text ?? "var(--color-at-white)",
                }}
              >
                {row.type}
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>{row.route}</p>
            <div className="flex gap-4 text-xs font-semibold" style={{ color: "var(--color-at-blue-v5)" }}>
              <span>Odjezd: <span style={{ color: "var(--color-at-white)" }}>{row.departure}</span></span>
              <span>Návrat: <span style={{ color: "var(--color-at-white)" }}>{row.returnDate}</span></span>
            </div>
            <StatusBadge status={row.status} />
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div
        className="hidden md:block overflow-x-auto rounded-lg"
        style={{ border: "1px solid var(--color-at-blue-v3)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--color-at-blue)" }}>
              {["Jméno", "Trasa (odkud-kam)", "Typ dopravy", "Odjezd (datum/čas)", "Návrat (datum)", "Stav"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-bold tracking-wide text-xs uppercase"
                    style={{
                      color: "var(--color-at-white)",
                      borderBottom: "1px solid var(--color-at-blue-v2)",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {TRANSPORT.map((row, i) => {
              const rowBg = i % 2 === 0 ? "var(--color-at-blue-v1)" : "var(--color-at-blue-v2)";
              const tdStyle = { background: rowBg, borderBottom: "1px solid var(--color-at-blue-v2)" };
              return (
                <tr key={row.name}>
                  <td
                    className="px-4 py-2.5 font-semibold"
                    style={{ ...tdStyle, color: "var(--color-at-white)" }}
                  >
                    {row.name}
                  </td>
                  <td className="px-4 py-2.5" style={{ ...tdStyle, color: "var(--color-at-blue-v5)" }}>
                    {row.route}
                  </td>
                  <td className="px-4 py-2.5" style={tdStyle}>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        background: TYPE_BADGE[row.type]?.bg ?? "var(--color-at-blue-v3)",
                        color: TYPE_BADGE[row.type]?.text ?? "var(--color-at-white)",
                      }}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-semibold" style={{ ...tdStyle, color: "var(--color-at-white)" }}>
                    {row.departure}
                  </td>
                  <td className="px-4 py-2.5 font-semibold" style={{ ...tdStyle, color: "var(--color-at-white)" }}>
                    {row.returnDate}
                  </td>
                  <td className="px-4 py-2.5" style={tdStyle}>
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
