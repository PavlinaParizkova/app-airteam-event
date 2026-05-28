"use client";

import { useState, useEffect } from "react";
import {
  MANUAL_WHY_TITLE,
  MANUAL_WHY_PARAGRAPHS,
  MANUAL_HERO_INTRO,
  SALES_ROLE_TAGLINE,
} from "@/data/manual-why";

export default function ManualPage() {
  return (
    <div style={{ maxWidth: 920 }}>

      {/* HERO */}
      <div style={{
        background: "linear-gradient(135deg, rgba(80,116,153,0.25) 0%, rgba(21,49,81,0.6) 100%)",
        border: "1px solid rgba(147,179,207,0.25)",
        borderRadius: 12, padding: "2.25rem 2rem 2rem", marginBottom: "3rem",
      }}>
        <p style={{ fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#93b3cf", marginBottom: "0.75rem" }}>
          AIR TEAM — Odměny z eventů a akcí
        </p>
        <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.65, marginBottom: "0.75rem" }}>
          {MANUAL_HERO_INTRO}
        </p>
      </div>

      {/* SUBMENU */}
      <SubNav />

      <div id="proc" />
      <WhyRewardsSection />

      <div id="odmeny" />
      <SectionLabel>Odměny</SectionLabel>
      <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.68)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
        Odměny jsou rozdělené podle skupin, do kterých jednotliví členové týmu spadají.
        Každý tak vidí, za co mu vzniká nárok na zaslouženou odměnu.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "3.5rem" }}>
        <BigStat label="KPI bonus (max 100 b.)" value="5 000 Kč" sub="5 pásem po 1 000 Kč" forAll />
        <BigStat label="KPI MAX (0–50 b.)" value="až 5 000 Kč" sub="každý bod navíc = 100 Kč" forAll gold />
        <BigStat label="Deal bonus" value="až 3 000 Kč" sub="B2C deal · OEM viz sekce níže" deal badgeLabel="Skupina 1" />
        <BigStat label="Fix skupiny 2" value="2 000 Kč" sub="za každý den účasti na eventu" fix badgeLabel="Skupina 2" />
      </div>

      {/* ROLE */}
      <div id="role" />
      <SectionLabel>Vyber svoji roli</SectionLabel>
      <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.68)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
        Vážíme si každého, kdo se aktivně zapojí do příprav našich společných akcí s marketingem.
        Díky tomu má tým na místě zázemí, materiály a jasný plán pro práci se zákazníkem.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "3.5rem", alignItems: "stretch" }}>

        <RoleCard
          badge="Skupina 1"
          title="Obchodník"
          tagline={SALES_ROLE_TAGLINE}
          color="#507499"
          items={[
            { icon: "🏆", text: "3 000 Kč za každý kvalifikující B2C deal, otevřený potenciál" },
            { icon: "✈️", text: "B2B/OEM: 2 000 Kč lead bonus + až 20 000 Kč kontrakt bonus" },
            { icon: "⭐", text: "KPI bonus až 5 000 Kč" },
            { icon: "🚀", text: "KPI MAX až 5 000 Kč za výkon" },
            { icon: "🧾", text: "Nárokovaná částka za služební cestu" },
          ]}
          highlight="Otevřený potenciál výdělku."
        />

        <RoleCard
          badge="Skupina 2"
          title="Podpůrná role"
          tagline=""
          color="#23517c"
          items={[
            { icon: "📅", text: "2 000 Kč za každý den fyzické přítomnosti" },
            { icon: "⭐", text: "KPI bonus až 5 000 Kč" },
            { icon: "🚀", text: "KPI MAX až 5 000 Kč za výkon" },
            { icon: "🧾", text: "Nárokovaná částka za služební cestu" },
            { icon: "✅", text: "Příklad: 4 dny = 8 000 Kč fix garantovaně" },
          ]}
          highlight="Fix + KPI bonus za výkon."
        />

        <RoleCard
          badge="Skupina 3"
          title="Přípravný tým"
          tagline=""
          color="#1b3f67"
          items={[
            { icon: "⏱", text: "Přesčasové hodiny proplaceny přes mzdu / fakturu" },
            { icon: "⭐", text: "KPI bonus až 5 000 Kč" },
            { icon: "🚀", text: "KPI MAX až 5 000 Kč za výkon" },
            { icon: "📌", text: "Hodiny evidované v ClickUpu" },
          ]}
          highlight="Každá hodina přípravy je ohodnocena."
        />

      </div>

      {/* KPI TIERS */}
      <div id="kpi" />
      <SectionLabel>KPI bonus</SectionLabel>
      <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.85)", marginBottom: "1.25rem" }}>
        Marketing hodnotí výkon ve čtyřech oblastech. Maximum je 100 bodů, výjimečné nasazení může přinést až 150 b.
      </p>
      <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {KPI_TIERS.map((tier, i) => (
          <div key={i} style={{
            flex: "1 1 120px", minWidth: 110,
            background: tier.bg,
            border: `1px solid ${tier.border}`,
            borderRadius: 8, padding: "1rem 0.875rem",
            textAlign: "center", position: "relative",
          }}>
            {tier.top && (
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: "#93b3cf", color: "#153151",
                fontSize: "0.75rem", fontWeight: 700,
                padding: "2px 10px", borderRadius: 10, letterSpacing: "0.06em",
                textTransform: "uppercase", whiteSpace: "nowrap",
              }}>
                {tier.top}
              </div>
            )}
            <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>{tier.range}</p>
            <p style={{ fontSize: tier.big ? "1.5rem" : "1.25rem", fontWeight: 700, color: tier.color, lineHeight: 1 }}>
              {tier.big ? (
                <>
                  <span style={{ fontSize: "0.9rem", verticalAlign: "baseline", marginRight: 4 }}>až</span>
                  <span style={{ whiteSpace: "nowrap" }}>5 000 Kč</span>
                </>
              ) : tier.bonus}
            </p>
          </div>
        ))}
      </div>
      {/* KPI OBLASTI */}
      <SectionLabel>Co se hodnotí — KPI oblasti</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
        {KPI_AREAS.map((k) => (
          <KpiPieCard key={k.area} area={k.area} desc={k.desc} max={k.max} color={k.color} />
        ))}
      </div>

      {/* KPI MAX — zlatá full-width karta */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0.03) 100%)",
        border: "1px solid rgba(255,215,0,0.35)",
        borderRadius: 10, padding: "1.25rem 1.5rem",
        display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap",
        marginBottom: "3.5rem",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.4)",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>⭐</span>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{
            fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#ffd700", marginBottom: "0.25rem",
          }}>
            Nad rámec zadání — KPI MAX
          </p>
          <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
            Výjimečné nasazení, iniciativa a přínos nad rámec přidělené role. Marketing přiznává bonusové body individuálně — max 50 b. Každý bod = 100 Kč.
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: "0.8125rem", color: "rgba(255,215,0,0.65)", marginBottom: 2 }}>1 bod = 100 Kč · max 50 bodů</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ffd700", lineHeight: 1 }}>až 5 000 Kč</p>
        </div>
      </div>
      {/* DEAL BONUS */}
      <div id="deal" />
      <SectionLabel>🏆 Deal bonus — Skupina 1</SectionLabel>
      <div style={{
        background: "linear-gradient(135deg, rgba(251,146,60,0.12) 0%, rgba(251,146,60,0.04) 100%)",
        border: "1px solid rgba(251,146,60,0.35)", borderRadius: 10,
        padding: "1.75rem 1.75rem", marginBottom: "3.5rem",
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.4)",
              flexShrink: 0, marginTop: 4,
            }}>
              <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>🏆</span>
            </div>
            <div>
              <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.92)", marginBottom: 6 }}>za každý B2C deal</p>
              <p style={{ fontSize: "3.5rem", fontWeight: 700, color: "#fb923c", lineHeight: 1 }}>3 000 Kč</p>
              <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.95)", marginTop: 6 }}>otevřený potenciál · B2B / OEM viz sekce níže</p>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.8)", marginBottom: "0.75rem", lineHeight: 1.6 }}>
              <strong style={{ color: "#ffffff" }}>Kvalifikuje:</strong>{" "}
              zaplacená objednávka nad 10 000 USD nebo prodej letadla vzniklý z kontaktu navázaného na eventu.
            </p>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.85)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
              <strong style={{ color: "#ffffff" }}>Povinnost:</strong>{" "}
              nahlásit deal MKT. Bez nahlášení nelze bonus přiznat.
            </p>
            <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.625rem" }}>Termíny vyhodnocení:</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["D+7", "D+3M", "D+6M", "D+9M", "D+12M"].map((t) => (
                <span key={t} style={{
                  padding: "5px 14px",
                  background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.3)",
                  borderRadius: 20, fontSize: "0.9375rem", fontWeight: 700, color: "#fb923c",
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* B2B / OEM DEAL BONUS */}
      <div id="oem" />
      <SectionLabel>B2B / OEM deal bonus — Skupina 1</SectionLabel>
      <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.68)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        B2B a OEM zákazníci (výrobci letadel, integrační partneři, MRO holdingy) uzavírají obchody jinak než B2C.
        Místo jednorázové objednávky jde o rámcové smlouvy a sériové integrace s procurement cyklem 12–24 měsíců.
        Proto platí paralelní bonusové pravidla vedle standardního deal bonusu 3 000 Kč.
      </p>

      {/* Stage 1 */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.03) 100%)",
        border: "1px solid rgba(255,215,0,0.3)", borderRadius: 10,
        padding: "1.5rem 1.75rem", marginBottom: "1rem",
        display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-start",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.4)",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: "1.375rem", lineHeight: 1 }}>🎯</span>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,215,0,0.8)", marginBottom: 3 }}>
              Stupeň 1 — OEM lead bonus
            </p>
            <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "#ffd700", lineHeight: 1 }}>2 000 Kč</p>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>vyplácí se při D+7</p>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
            <strong style={{ color: "#ffffff" }}>Co musí proběhnout před D+7:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {[
              "Zákazník je výrobce letadel, integrační partner nebo MRO holding.",
              "Proběhlo první technické nebo obchodní jednání (NDA, specifikace nebo vstup do procurement procesu).",
              "Obchodník zaregistruje kontakt jako OEM typ v aplikaci.",
            ].map((item, i) => (
              <li key={i} style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.78)", lineHeight: 1.5 }}>{item}</li>
            ))}
          </ul>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,215,0,0.6)", marginTop: "0.75rem", lineHeight: 1.5 }}>
            Bonus se přiznává nezávisle na výsledku obchodu — odměňuje kvalifikaci kontaktu.
          </p>
        </div>
      </div>

      {/* Stage 2 */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,215,0,0.07) 0%, rgba(255,215,0,0.02) 100%)",
        border: "1px solid rgba(255,215,0,0.22)", borderRadius: 10,
        padding: "1.5rem 1.75rem", marginBottom: "3.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.35)",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: "1.375rem", lineHeight: 1 }}>📄</span>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,215,0,0.75)", marginBottom: 3 }}>
              Stupeň 2 — OEM kontrakt bonus
            </p>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
              Přiznává se při podpisu rámcové smlouvy nebo potvrzení prvního sériového odběru. Schvaluje CEO.
              Časové okno <strong style={{ color: "#ffd700" }}>D+7 až D+24M</strong>.
            </p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "0.75rem" }}>
          {[
            { tier: "Tier 1", range: "do 100 000 USD/rok", bonus: "5 000 Kč" },
            { tier: "Tier 2", range: "100 001–500 000 USD/rok", bonus: "10 000 Kč" },
            { tier: "Tier 3", range: "500 000+ USD/rok", bonus: "20 000 Kč" },
          ].map((t) => (
            <div key={t.tier} style={{
              background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)",
              borderRadius: 8, padding: "0.875rem 1rem", textAlign: "center",
            }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,215,0,0.7)", marginBottom: 4 }}>{t.tier}</p>
              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)", marginBottom: 6, lineHeight: 1.3 }}>{t.range}</p>
              <p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#ffd700", lineHeight: 1 }}>{t.bonus}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", marginTop: "1rem", lineHeight: 1.5 }}>
          Etapy D+18M a D+24M jsou dostupné pouze pro dealy označené jako OEM typ.
          Obchodník nahlásí Marketing Managerovi — bez hlášení bonus nelze přiznat.
        </p>
      </div>

      {/* PŘÍKLADY */}
      <div id="priklady" />
      <SectionLabel>Příklady z praxe</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.875rem", marginBottom: "2rem" }}>
        <ExampleCard
          title="Obchodník — dobrý event"
          emoji="🤝"
          lines={[
            { label: "3 zavřené dealy", value: "9 000 Kč" },
            { label: "Docházka 8 h/den", value: "zaplacena" },
            { label: "Služební cesta", value: "nárokováno" },
          ]}
          total="9 000 Kč + 🚗 💰"
        />
        <ExampleCard
          title="Obchodník — skvělý event"
          emoji="🚀"
          lines={[
            { label: "6 dealů", value: "18 000 Kč" },
            { label: "KPI MAX", value: "5 000 Kč" },
            { label: "Docházka 8 h/den", value: "zaplacena" },
            { label: "Služební cesta", value: "nárokováno" },
          ]}
          total="23 000 Kč + 🚗 💰"
          highlight
        />
        <ExampleCard
          title="Podpůrná role, 4 dny"
          emoji="🎯"
          lines={[
            { label: "Fix 4 × 2 000 Kč", value: "8 000 Kč" },
            { label: "KPI 90 b.", value: "4 000 Kč" },
            { label: "Docházka 8 h/den", value: "zaplacena" },
            { label: "Služební cesta", value: "nárokováno" },
          ]}
          total="12 000 Kč + 🚗 💰"
        />
        <ExampleCard
          title="Přípravný tým"
          emoji="🛠️"
          lines={[
            { label: "Přesčasy", value: "proplaceny zvlášť" },
            { label: "KPI 80 b.", value: "4 000 Kč" },
          ]}
          total="4 000 Kč + 💰"
        />
        <ExampleCard
          title="Obchodník — OEM zákazník"
          emoji="✈️"
          lines={[
            { label: "OEM lead bonus", value: "2 000 Kč" },
            { label: "OEM kontrakt Tier 2 (D+6M)", value: "10 000 Kč" },
            { label: "KPI 95 b.", value: "4 000 Kč" },
          ]}
          total="16 000 Kč"
          oem
        />
      </div>

      {/* PRAKTICKÉ POKYNY */}
      <div id="pokyny" />
      <SectionLabel>Praktické pokyny</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>

        {/* Služební cesta */}
        <div style={{
          background: "rgba(213,28,23,0.07)",
          border: "1px solid rgba(213,28,23,0.25)",
          borderLeft: "4px solid #d51c17",
          borderRadius: 10, padding: "1.5rem 1.5rem 1.25rem",
          position: "relative", marginTop: 14,
        }}>
          <span style={{
            position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
            background: "#d51c17", color: "#ffffff",
            fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "3px 12px", borderRadius: 20,
            whiteSpace: "nowrap",
          }}>Skupiny 1 + 2</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: "1.5rem" }}>📋</span>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "#ffffff" }}>Služební cesta — povinné pro všechny</span>
          </div>
          <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: "0.875rem" }}>
            Každý, kdo na event pojede, musí mít <strong style={{ color: "#ffffff" }}>schválenou služební cestu</strong> od nadřízeného. Postup najdeš ve wiki.
          </p>
          <a
            href="https://app.clickup.com/9015288316/v/dc/8cnmrfw-40735/8cnmrfw-35775"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(213,28,23,0.15)", border: "1px solid rgba(213,28,23,0.4)",
              borderRadius: 6, padding: "6px 14px",
              fontSize: "0.875rem", fontWeight: 700, color: "#f87171",
              textDecoration: "none",
            }}
          >
            Otevřít wiki →
          </a>
        </div>

        {/* Docházka */}
        <div style={{
          background: "rgba(80,116,153,0.07)",
          border: "1px solid rgba(80,116,153,0.2)",
          borderLeft: "4px solid #507499",
          borderRadius: 10, padding: "1.5rem 1.5rem 1.25rem",
          position: "relative", marginTop: 14,
        }}>
          <span style={{
            position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.15)", color: "#ffffff",
            fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "3px 12px", borderRadius: 20,
            whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.2)",
          }}>Skupiny 1 + 2</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: "1.5rem" }}>🕗</span>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "#ffffff" }}>Docházka v době eventu</span>
          </div>
          <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: 0 }}>
            Standardní pracovní den na eventu = <strong style={{ color: "#ffffff" }}>8 hodin</strong>. Zadáš v ClickUp jako běžnou docházku.
          </p>
        </div>

        {/* Trackování v ClickUp */}
        <div style={{
          background: "rgba(251,146,60,0.06)",
          border: "1px solid rgba(251,146,60,0.25)",
          borderLeft: "4px solid #fb923c",
          borderRadius: 10, padding: "1.5rem 1.5rem 1.25rem",
          position: "relative", marginTop: 14,
        }}>
          <span style={{
            position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
            background: "#fb923c", color: "#ffffff",
            fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "3px 12px", borderRadius: 20,
            whiteSpace: "nowrap",
          }}>Skupiny 2 + 3</span>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: "0.6rem" }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M4 22.3l4.07-3.12c1.97 2.57 4.06 3.74 6.27 3.74 2.2 0 4.26-1.15 6.18-3.68l4.12 3.06C21.96 26.1 18.98 28 14.34 28 9.72 28 6.06 26.15 4 22.3z" fill="#8930FD"/>
              <path d="M4 22.3l4.07-3.12c1.97 2.57 4.06 3.74 6.27 3.74 2.2 0 4.26-1.15 6.18-3.68l4.12 3.06C21.96 26.1 18.98 28 14.34 28 9.72 28 6.06 26.15 4 22.3z" fill="url(#cu-g1)"/>
              <path d="M14.35 8.56l-7.5 6.88-3.6-3.93 11.1-10.18 11.1 10.18-3.61 3.93-7.49-6.88z" fill="#8930FD"/>
              <path d="M14.35 8.56l-7.5 6.88-3.6-3.93 11.1-10.18 11.1 10.18-3.61 3.93-7.49-6.88z" fill="url(#cu-g2)"/>
              <defs>
                <linearGradient id="cu-g1" x1="4" y1="19.18" x2="24.64" y2="19.18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8930FD"/>
                  <stop offset="1" stopColor="#49CCF9"/>
                </linearGradient>
                <linearGradient id="cu-g2" x1="3.25" y1="1.33" x2="25.45" y2="1.33" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF02F0"/>
                  <stop offset="1" stopColor="#FFC800"/>
                </linearGradient>
              </defs>
            </svg>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "#fb923c" }}>Trackování v ClickUp</span>
          </div>
          <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "#fb923c" }}>Musíš se trackovat na dané zakázce.</strong> Bez záznamu v ClickUp na příslušném event tasku nelze přiznat hodiny ani případné přesčasy navíc.
          </p>
        </div>

      </div>

    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────

const KPI_TIERS = [
  { range: "1–24 b.",   bonus: "1 000 Kč",  bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.88)", top: "",         big: false },
  { range: "25–49 b.",  bonus: "2 000 Kč",  bg: "rgba(27,63,103,0.5)",   border: "rgba(27,63,103,0.9)",   color: "#93b3cf",                top: "",         big: false },
  { range: "50–74 b.",  bonus: "3 000 Kč",  bg: "rgba(35,81,124,0.5)",   border: "rgba(35,81,124,0.9)",   color: "#93b3cf",                top: "",         big: false },
  { range: "75–99 b.",  bonus: "4 000 Kč",  bg: "rgba(80,116,153,0.35)", border: "rgba(80,116,153,0.7)",  color: "#93b3cf",                top: "",         big: false },
  { range: "100 b.",    bonus: "5 000 Kč",  bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.4)",    color: "#22c55e",                top: "Standardní", big: false },
  { range: "KPI MAX",   bonus: "až 5 000 Kč", bg: "rgba(255,215,0,0.12)",  border: "rgba(255,215,0,0.4)",   color: "#ffd700",                top: "každý bod = 100 Kč", big: true },
];

const KPI_AREAS = [
  { area: "Příprava",            desc: "Kvalita přípravy, kvalita projektu, briefing, logistika",   max: 25, color: "#cddce8" },
  { area: "Výkon na místě",      desc: "Nasazení, dodržení termínů, výsledky",    max: 35, color: "#93b3cf" },
  { area: "Follow-up do 7 dní",  desc: "Výstupy, záznamy, předání podkladů",     max: 25, color: "#507499" },
  { area: "Týmový cíl",          desc: "Tým splnil leadový cíl eventu",           max: 15, color: "#4d606f" },
];

// ── Komponenty ─────────────────────────────────────────────────────────────────

const SUB_NAV_ITEMS = [
  { id: "proc",    label: "Proč a smysl" },
  { id: "odmeny",  label: "Odměny" },
  { id: "role",    label: "Role" },
  { id: "kpi",     label: "KPI bonus" },
  { id: "deal",    label: "Deal bonus" },
  { id: "oem",     label: "B2B / OEM" },
  { id: "priklady",label: "Příklady" },
  { id: "pokyny",  label: "Pokyny" },
];

const SUB_NAV_SCROLL_OFFSET = 72;

function SubNav() {
  const [active, setActive] = useState<string>("");
  const [hovered, setHovered] = useState<string>("");

  useEffect(() => {
    function updateActiveSection() {
      let current = SUB_NAV_ITEMS[0].id;

      for (const item of SUB_NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= SUB_NAV_SCROLL_OFFSET + 8) {
          current = item.id;
        }
      }

      setActive(current);
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - SUB_NAV_SCROLL_OFFSET;
      window.history.replaceState(null, "", `#${id}`);
      window.scrollTo({ top, behavior: "smooth" });
      setActive(id);
    }
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 10,
      background: "rgba(16,37,62,0.97)",
      backdropFilter: "blur(14px)",
      borderTop: "1px solid rgba(147,179,207,0.15)",
      borderBottom: "1px solid rgba(147,179,207,0.15)",
      marginBottom: "2.5rem",
      marginLeft: "-1.5rem", marginRight: "-1.5rem",
      paddingLeft: "1.5rem", paddingRight: "1.5rem",
    }}>
      <div style={{
        display: "flex", alignItems: "stretch", gap: 0,
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        {SUB_NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const isHovered = hovered === item.id && !isActive;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered("")}
              style={{
                display: "flex", alignItems: "center",
                padding: "0.85rem 1.125rem",
                fontSize: "0.8125rem", fontWeight: isActive ? 700 : 500,
                color: isActive ? "#ffffff" : isHovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
                textDecoration: "none",
                whiteSpace: "nowrap",
                borderBottom: isActive ? "2px solid #d51c17" : "2px solid transparent",
                background: isHovered ? "rgba(147,179,207,0.07)" : "transparent",
                transition: "color 0.15s, background 0.15s, border-color 0.15s",
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.75rem",
      marginBottom: "1.5rem", marginTop: "2.25rem",
    }}>
      <div style={{ width: 3, height: 22, borderRadius: 2, background: "#93b3cf", flexShrink: 0 }} />
      <p style={{
        fontSize: "1.125rem", fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.82)",
        lineHeight: 1,
      }}>
        {children}
      </p>
    </div>
  );
}

function WhyRewardsSection() {
  return (
    <div style={{ marginBottom: "3.5rem" }}>
      <SectionLabel>{MANUAL_WHY_TITLE}</SectionLabel>
      <div style={{
        background: "linear-gradient(135deg, rgba(213,28,23,0.08) 0%, rgba(80,116,153,0.2) 55%, rgba(21,49,81,0.55) 100%)",
        border: "1px solid rgba(147,179,207,0.28)",
        borderLeft: "4px solid #d51c17",
        borderRadius: 12,
        padding: "1.75rem 1.75rem 1.5rem",
      }}>
        {MANUAL_WHY_PARAGRAPHS.map((paragraph, i) => (
          <p
            key={i}
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.7,
              margin: 0,
              marginBottom: i < MANUAL_WHY_PARAGRAPHS.length - 1 ? "1.125rem" : 0,
            }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

function BigStat({ label, value, sub, accent, forAll, deal, fix, gold, badgeLabel }: {
  label: string; value: string; sub: string; accent?: boolean; forAll?: boolean; deal?: boolean; fix?: boolean; gold?: boolean; badgeLabel?: string;
}) {
  const bg    = gold ? "rgba(255,215,0,0.12)"      : forAll ? "rgba(34,197,94,0.08)"   : deal ? "rgba(251,146,60,0.1)"     : fix ? "rgba(80,116,153,0.15)"   : accent ? "rgba(147,179,207,0.12)" : "rgba(255,255,255,0.07)";
  const bdr   = gold ? "rgba(255,215,0,0.4)"       : forAll ? "rgba(34,197,94,0.35)"   : deal ? "rgba(251,146,60,0.45)"    : fix ? "rgba(80,116,153,0.45)"   : accent ? "rgba(147,179,207,0.3)"  : "rgba(255,255,255,0.12)";
  const color = gold ? "#ffd700"                   : forAll ? "#22c55e"                : deal ? "#fb923c"                  : fix ? "#93b3cf"                 : accent ? "#93b3cf"                : "#ffffff";
  const labelColor = gold ? "rgba(255,215,0,0.85)" : forAll ? "rgba(34,197,94,0.8)"    : deal ? "rgba(251,146,60,0.8)"     : fix ? "rgba(147,179,207,0.7)" : "rgba(255,255,255,0.5)";
  const badgeBg = gold ? "#ffd700" : deal ? "#fb923c" : fix ? "#93b3cf" : "#22c55e";
  const badgeColor = gold || fix ? "#153151" : "#fff";
  const badge = badgeLabel ?? (forAll ? "Skupina 1-2-3" : null);
  return (
    <div style={{
      background: bg, border: `1px solid ${bdr}`,
      borderRadius: 8, padding: "1rem 1.25rem", position: "relative",
    }}>
      {badge && (
        <span style={{
          position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
          background: badgeBg, color: badgeColor,
          fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em",
          textTransform: "uppercase", padding: "2px 10px", borderRadius: 20,
          whiteSpace: "nowrap",
        }}>
          {badge}
        </span>
      )}
      <p style={{ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: labelColor, marginBottom: 5, marginTop: badge ? 4 : 0 }}>
        {label}
      </p>
      <p style={{ fontSize: "1.75rem", fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </p>
      <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>{sub}</p>
    </div>
  );
}

function KpiPieCard({ area, desc, max, color }: {
  area: string; desc: string; max: number; color: string;
}) {
  const size = 116;
  const cx = size / 2, cy = size / 2;
  const r = 50, ir = 28;

  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);

  function arcPath(startDeg: number, endDeg: number): string {
    const span = endDeg - startDeg;
    const large = span > 180 ? 1 : 0;
    const sr = toRad(startDeg), er = toRad(endDeg);
    const x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr);
    const x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er);
    const xi1 = cx + ir * Math.cos(sr), yi1 = cy + ir * Math.sin(sr);
    const xi2 = cx + ir * Math.cos(er), yi2 = cy + ir * Math.sin(er);
    return `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ir} ${ir} 0 ${large} 0 ${xi1} ${yi1} Z`;
  }

  const total = KPI_AREAS.reduce((s, a) => s + a.max, 0);
  const gapDeg = 2.5;
  let cumAngle = 0;
  const segments = KPI_AREAS.map(a => {
    const span = (a.max / total) * 360;
    const startAngle = cumAngle + gapDeg / 2;
    const endAngle = cumAngle + span - gapDeg / 2;
    cumAngle += span;
    return { area: a.area, color: a.color, startAngle, endAngle };
  });
  const thisSeg = segments.find(s => s.area === area)!;
  const pct = Math.round((max / total) * 100);

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 8, padding: "1.25rem",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "0.875rem",
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", flexShrink: 0 }}>
        {segments
          .filter(s => s.area !== area)
          .map(seg => (
            <path key={seg.area} d={arcPath(seg.startAngle, seg.endAngle)} fill="rgba(255,255,255,0.07)" />
          ))}
        <path d={arcPath(thisSeg.startAngle, thisSeg.endAngle)} fill={color} />
        <text x={cx} y={cy - 7} textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="700" fontFamily="inherit">{max} b.</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fill="rgba(255,255,255,0.38)" fontSize="9.5" fontFamily="inherit">{pct} %</text>
      </svg>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#ffffff", marginBottom: 5 }}>{area}</p>
        <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.92)", lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

function RoleCard({ badge, title, tagline, color, items, highlight }: {
  badge: string; title: string; tagline: string; color: string;
  items: { icon: string; text: string }[]; highlight: string;
}) {
  return (
    <div style={{
      background: color,
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 10, padding: "1.5rem",
      display: "flex", flexDirection: "column", height: "100%",
    }}>
      <span style={{
        display: "inline-block",
        fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "#ffffff",
        background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
        padding: "3px 10px", borderRadius: 4, marginBottom: "0.875rem", alignSelf: "flex-start",
      }}>
        {badge}
      </span>
      <p style={{ fontWeight: 700, fontSize: "1.1875rem", color: "#ffffff", marginBottom: 5, lineHeight: 1.25 }}>{title}</p>
      {tagline && <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.7)", marginBottom: "1.125rem", fontStyle: "italic" }}>{tagline}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", flex: 1, marginBottom: "1.125rem" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>{item.text}</span>
          </div>
        ))}
      </div>
      <div style={{
        background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)",
        borderRadius: 6, padding: "0.625rem 0.875rem",
        fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff",
      }}>
        {highlight}
      </div>
    </div>
  );
}

function ExampleCard({ title, emoji, lines, total, highlight, oem }: {
  title: string; emoji: string;
  lines: { label: string; value: string }[];
  total: string; highlight?: boolean; oem?: boolean;
}) {
  const bg = oem
    ? "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.03) 100%)"
    : highlight
      ? "linear-gradient(135deg, rgba(147,179,207,0.18) 0%, rgba(80,116,153,0.08) 100%)"
      : "rgba(255,255,255,0.04)";
  const bdr = oem
    ? "1px solid rgba(255,215,0,0.3)"
    : highlight ? "1px solid rgba(147,179,207,0.4)" : "1px solid rgba(255,255,255,0.09)";
  const totalColor = oem ? "#ffd700" : highlight ? "#93b3cf" : "#ffffff";
  return (
    <div style={{ background: bg, border: bdr, borderRadius: 8, padding: "1.125rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.875rem" }}>
        <span style={{ fontSize: "1.75rem", flexShrink: 0 }}>{emoji}</span>
        <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {title}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.875rem" }}>
        {lines.map((l) => (
          <div key={l.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9375rem" }}>
            <span style={{ color: "rgba(255,255,255,0.92)" }}>{l.label}</span>
            <span style={{ color: oem ? "#ffd700" : "#ffffff", fontWeight: 600 }}>{l.value}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${oem ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.09)"}`, paddingTop: "0.75rem" }}>
        <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.95)", display: "block", marginBottom: 2 }}>Odměna celkem</span>
        <span style={{ fontSize: highlight || oem ? "1.25rem" : "1.125rem", fontWeight: 700, color: totalColor }}>
          {total}
        </span>
      </div>
    </div>
  );
}
