type ActionItem = {
  owner: string;
  task: string;
  done: boolean;
};

const ACTION_ITEMS: ActionItem[] = [
  { owner: "Pavlína",           task: "Navrhnout nové dárky – skladnější varianty pro zahraniční návštěvníky",                           done: false },
  { owner: "Pavlína",           task: "E-mail Julii (organizátorka AERO): poděkování + žádost o stejné místo u Garmin/Bose pro 2027",     done: true },
  { owner: "Pavlína",           task: "Sestavit PilotStyle stánek, vyfotit, vytvořit montážní manuál, zkontrolovat shodu se skladem",     done: false },
  { owner: "Pavlína",           task: "Objednat brandované šálky na kávu pro příští show",                                               done: false },
  { owner: "Jiří (Franz)",      task: "Sestavit follow-up seznam z vizitek, přidat do HubSpotu",                                          done: false },
  { owner: "Jiří (Franz)",      task: "Dojednat distribuční smlouvu s Midcontinent",                                                      done: false },
  { owner: "Jiří (Franz)",      task: "E-mail David Kark (Lightspeed): zájem o servisní středisko – argumentovat poptávkou z AERO",      done: false },
  { owner: "Jiří (Franz)",      task: "E-mail BitContinent: ohledně distribuce",                                                         done: false },
  { owner: "Jan Polák",         task: "Objednat 2 bezpečnostní kamery z AliExpressu + SD karty; připevnit ke konstrukci stánku pásky",   done: false },
  { owner: "Celý obchodní tým", task: "Zapsat všechny kontakty z AERO do HubSpotu a sledovat pokrok na příští prodejní poradě",          done: false },
  { owner: "Celý obchodní tým", task: "Zarezervovat AERO 2027 do kalendářů",                                                            done: false },
  { owner: "Celý tým",          task: "Odsouhlasit prodeje Revolut + hotovost a nahlásit celkovou částku",                               done: false },
  { owner: "–",                 task: "E-mail BKE: RMA na 10 jednotek + žádost o náhradní kusy",                                        done: false },
];

const CATEGORIES_2027 = [
  {
    title: "Personální obsazení",
    items: [
      "Navýšit tým: středa min. 6 lidí, čtvrtek/pátek min. 7 — stánek nesmí zůstat prázdný.",
      "Jasně rozdělit role předem: demopanel, PilotStyle shop, koordinátor stánku, Sales.",
    ],
  },
  {
    title: "Umístění stánku",
    items: [
      "Zajistit umístění blíže Garmin a BOSE — projednat s organizátorem nejpozději T‑12 měsíců.",
    ],
  },
  {
    title: "Marketing & Sales",
    items: [
      "Voucher 1 000 EUR na Upgrade pro zákazníka, který podepíše objednávku přímo na místě.",
      "Dedikovaný katalog pro Part 21 služby — velký zájem na AERO 2026, pro 2027 povinné.",
      "QR formulář přímo na demo panelu, integrovaný s HubSpot CRM.",
      "Jmenovky posádky s vlaječkou jazyka, kterým mluvíme.",
    ],
  },
  {
    title: "PilotStyle",
    items: [
      "1 člověk výhradně na prodej (nekombinovat s jinou rolí).",
      "Platební terminál – povinný, nahraná PN produktů, ceny v EUR.",
      "Vzít více zboží a mít s sebou katalog.",
    ],
  },
  {
    title: "Bezpečnost",
    items: [
      "Kamery na hlídání zboží — na stánku bylo něco ukradeno.",
      "Krádež zdokumentovat a nahlásit pojišťovně do D+3 od zjištění.",
    ],
  },
];

const OWNER_COLORS: Record<string, string> = {
  "Pavlína": "var(--color-at-red)",
  "Jiří (Franz)": "#3b82f6",
  "Jan Polák": "#8b5cf6",
  "Celý obchodní tým": "#f59e0b",
  "Celý tým": "#22c55e",
  "–": "var(--color-at-blue-v4)",
};

export default function SlidePostActionItems() {
  const done = ACTION_ITEMS.filter((a) => a.done).length;

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 gap-5">

      {/* Header */}
      <div>
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Vyhodnocení · Action Items
        </p>
        <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
          Akční body & plán 2027
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
          Zápis z debriefingu 27. 4. 2026 (63 min) · {done}/{ACTION_ITEMS.length} hotovo
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* Left: action items */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: "var(--color-at-white)" }}>
              Action items z debriefingu
            </p>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
            >
              {done}/{ACTION_ITEMS.length} done
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {ACTION_ITEMS.map((item, i) => (
              <div
                key={i}
                className="rounded-lg px-3 py-2.5 flex items-start gap-3"
                style={{
                  background: item.done ? "rgba(34,197,94,0.06)" : "var(--color-at-blue-v2)",
                  border: item.done ? "1px solid rgba(34,197,94,0.2)" : "1px solid var(--color-at-blue-v3)",
                  opacity: item.done ? 0.7 : 1,
                }}
              >
                {/* Done indicator */}
                <div
                  className="flex-shrink-0 mt-0.5"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: item.done ? "none" : "2px solid var(--color-at-blue-v4)",
                    background: item.done ? "#22c55e" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.done && <span style={{ color: "white", fontSize: 10, lineHeight: 1 }}>✓</span>}
                </div>

                <div className="flex flex-col gap-0.5 flex-1">
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded self-start"
                    style={{
                      background: `${OWNER_COLORS[item.owner] || "var(--color-at-blue-v4)"}22`,
                      color: OWNER_COLORS[item.owner] || "var(--color-at-blue-v4)",
                      border: `1px solid ${OWNER_COLORS[item.owner] || "var(--color-at-blue-v4)"}44`,
                    }}
                  >
                    {item.owner}
                  </span>
                  <span
                    className="text-sm leading-snug"
                    style={{
                      color: item.done ? "var(--color-at-blue-v5)" : "var(--color-at-white)",
                      textDecoration: item.done ? "line-through" : "none",
                    }}
                  >
                    {item.task}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 2027 categories */}
        <div className="flex flex-col gap-3 w-full lg:w-80 flex-shrink-0">
          <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: "var(--color-at-white)" }}>
            Akční plán AERO 2027
          </p>

          {CATEGORIES_2027.map((cat) => (
            <div
              key={cat.title}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--color-at-blue-v3)" }}
            >
              <div
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest"
                style={{ background: "var(--color-at-blue-v2)", color: "var(--color-at-blue-v5)" }}
              >
                {cat.title}
              </div>
              <div className="px-4 py-2.5 flex flex-col gap-1.5" style={{ background: "var(--color-at-blue-v1)" }}>
                {cat.items.map((item, ii) => (
                  <div key={ii} className="flex items-start gap-2">
                    <span
                      className="flex-shrink-0 mt-1.5"
                      style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-at-red)", display: "inline-block" }}
                    />
                    <span className="text-xs leading-relaxed" style={{ color: "var(--color-at-blue-v5)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
