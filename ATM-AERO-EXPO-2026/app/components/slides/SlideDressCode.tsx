"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SizeRow = { size: string; length?: string; width?: string; sleeve?: string };

type Product = {
  id: string;
  code: string;
  name: string;
  brand: string;
  gender: string;
  color: string;
  colorHex: string;
  material: string;
  weight: string;
  washTemp: string;
  graphicFront: string;
  graphicBack: string;
  imageFront: string;
  imageBack: string;
  sizes: string[];
  sizeTable?: SizeRow[];
  details: string[];
  price?: string;
  url?: string;
};

type TeamMember = {
  name: string;
  group: string;
  poloId: string;
  bomberId: string;
};

type SizeSelections = Record<string, { polo: string; bomber: string }>;

// ─── Product Data ─────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: "collar-256",
    code: "256",
    name: "Collar Up 256",
    brand: "Malfini Premium",
    gender: "Muži",
    color: "Bílá",
    colorHex: "#e8e8e8",
    material: "Piqué, 100% bavlna",
    weight: "215 g/m²",
    washTemp: "40 °C",
    graphicFront: "Logo AIR TEAM – levý prs",
    graphicBack: "AIR TEAM CREW – záda",
    imageFront: "/01_38_08-obleceni-tricko-muzi-predek.png",
    imageBack: "/01_38_08-obleceni-tricko-muzi-zadek.png",
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    details: [
      "Zpevnění ramenních švů páskou",
      "Průkrčník s kontrastní páskou uvnitř",
      "Rozparky v bočních švech",
      "Léga s 2 knoflíčky v barvě materiálu",
      "Žebrový úplet 1:1 na límci a manžetách",
    ],
    url: "https://shop.malfini.com/cz/cs/product/collar-up-256?color=00",
  },
  {
    id: "bomber-453",
    code: "453",
    name: "Bomber 453",
    brand: "Malfini Premium",
    gender: "Muži",
    color: "Námořní modrá",
    colorHex: "#002060",
    material: "100% bavlna, výplňková pletenina",
    weight: "320 g/m²",
    washTemp: "40 °C",
    graphicFront: "Logo AIR TEAM – levý prs",
    graphicBack: "YOUR MISSION. OUR TECHNOLOGY.",
    imageFront: "/01_38_08-obleceni-mikina-muzi-predek.png",
    imageBack: "/01_38_08-obleceni-mikina-muzi-zadek.png",
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    sizeTable: [
      { size: "S",    length: "70 cm", width: "50 cm", sleeve: "63 cm" },
      { size: "M",    length: "72 cm", width: "55 cm", sleeve: "65 cm" },
      { size: "L",    length: "74 cm", width: "60 cm", sleeve: "67 cm" },
      { size: "XL",   length: "76 cm", width: "64 cm", sleeve: "69 cm" },
      { size: "XXL",  length: "78 cm", width: "68 cm", sleeve: "71 cm" },
      { size: "XXXL", length: "80 cm", width: "73 cm", sleeve: "72 cm" },
    ],
    details: [
      "Kovový zip s gravírovaným logem",
      "Kapsy v členících švech se skrytým zipem",
      "Žebrovaný stojáček s elastanem",
      "Žebro 2:2 + 5% elastan na manžetách a lemu",
    ],
    url: "https://shop.malfini.com/cz/cs/product/bomber-453?color=02",
  },
  {
    id: "collar-257",
    code: "257",
    name: "Collar Up 257",
    brand: "Malfini Premium",
    gender: "Ženy",
    color: "Bílá",
    colorHex: "#e8e8e8",
    material: "Single Jersey, 100% bavlna",
    weight: "215 g/m²",
    washTemp: "40 °C",
    graphicFront: "Logo AIR TEAM – levý prs",
    graphicBack: "AIR TEAM CREW – záda",
    imageFront: "/01_38_08-obleceni-tricko-zeny-predek.png",
    imageBack: "/01_38_08-obleceni-tricko-zeny-zadek.png",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    sizeTable: [
      { size: "XS",  length: "63 cm", width: "38 cm", sleeve: "15,5 cm" },
      { size: "S",   length: "65 cm", width: "42 cm", sleeve: "16 cm" },
      { size: "M",   length: "67 cm", width: "46 cm", sleeve: "16,5 cm" },
      { size: "L",   length: "69 cm", width: "50 cm", sleeve: "17 cm" },
      { size: "XL",  length: "71 cm", width: "55 cm", sleeve: "17,5 cm" },
      { size: "2XL", length: "73 cm", width: "61 cm", sleeve: "18 cm" },
    ],
    details: [
      "Lehce vypasovaný střih s bočními švy",
      "Kontrastní zdobení na spodní straně límce",
      "Léga se 4 knoflíčky zdobenými logem",
      "Žebrový úplet 1:1 na límci a manžetách",
    ],
    url: "https://shop.malfini.com/cz/cs/product/collar-up-257?color=00",
  },
  {
    id: "bomber-454",
    code: "454",
    name: "Bomber 454",
    brand: "Malfini Premium",
    gender: "Ženy",
    color: "Námořní modrá",
    colorHex: "#002060",
    material: "100% bavlna, výplňková pletenina",
    weight: "320 g/m²",
    washTemp: "40 °C",
    graphicFront: "Logo AIR TEAM – levý prs",
    graphicBack: "YOUR MISSION. OUR TECHNOLOGY.",
    imageFront: "/01_38_08-obleceni-mikina-zeny-predek.png",
    imageBack: "/01_38_08-obleceni-mikina-zeny-zadek.png",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    details: [
      "Bomber styl · kovový zip s gravírovaným logem",
      "Kapsy v členících švech se skrytým zipem",
      "Žebrovaný stojáček s elastanem",
      "Tvarovaný střih bočními díly",
    ],
    url: "https://shop.malfini.com/cz/cs/product/bomber-454?color=02",
  },
  {
    id: "slim-139",
    code: "139",
    name: "Slim 139",
    brand: "Malfini",
    gender: "Ženy – Lucie",
    color: "Černá",
    colorHex: "#1d1d1b",
    material: "Single Jersey, 95% bavlna + 5% elastan",
    weight: "180 g/m²",
    washTemp: "30 °C",
    graphicFront: "Logo AIR TEAM – levý prs",
    graphicBack: "AIR TEAM CREW – záda",
    imageFront: "/01_38_08-obleceni-tricko-lucie-predek.png",
    imageBack: "/01_38_08-obleceni-tricko-lucie-zadek.png",
    sizes: ["XS", "S", "M", "L", "XL"],
    details: [
      "Slim-fit střih s bočními švy",
      "Zpevnění ramenních švů páskou",
      "Širší kulatý průkrčník začištěn páskou",
      "Žebrový průkrčník 1:1 s 5% elastanem",
      "Dlouhé přiléhavé rukávy",
    ],
    url: "https://shop.malfini.com/cz/cs/product/slim-139?color=01",
  },
  {
    id: "next-level-hoodie",
    code: "BP3869",
    name: "Mikina – nabírané rukávy",
    brand: "Next Level Apparel",
    gender: "Ženy – Lucie",
    color: "Černá",
    colorHex: "#1d1d1b",
    material: "80% česaná bavlna + 20% recykl. polyester",
    weight: "340 g/m²",
    washTemp: "30 °C",
    graphicFront: "Logo AIR TEAM – levý prs",
    graphicBack: "YOUR MISSION. OUR TECHNOLOGY.",
    imageFront: "/01_38_08-obleceni-mikina-lucie-predek.png",
    imageBack: "/01_38_08-obleceni-mikina-lucie-zadek.png",
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    sizeTable: [
      { size: "XS",  length: "54 cm",   width: "58,5 cm" },
      { size: "S",   length: "55,5 cm", width: "61 cm" },
      { size: "M",   length: "57 cm",   width: "63,5 cm" },
      { size: "L",   length: "58,5 cm", width: "66 cm" },
      { size: "XL",  length: "60,5 cm", width: "70 cm" },
      { size: "XXL", length: "62 cm",   width: "73,5 cm" },
    ],
    details: [
      "Kratší oversize střih se spadlými rameny",
      "Nabírané rukávy",
      "Žebrované manžety",
    ],
    price: "697 Kč / ks",
    url: "https://www.bezpotisku.cz/produkt/mikina-s-nabiranymi-rukavy",
  },
];

// ─── Team Members ─────────────────────────────────────────────────────────────

const TEAM: TeamMember[] = [
  { name: "Petr Polák",          group: "Muži",         poloId: "collar-256", bomberId: "bomber-453" },
  { name: "Jan Polák",           group: "Muži",         poloId: "collar-256", bomberId: "bomber-453" },
  { name: "Vratko Kapuš",        group: "Muži",         poloId: "collar-256", bomberId: "bomber-453" },
  { name: "Jakub Dryska",        group: "Muži",         poloId: "collar-256", bomberId: "bomber-453" },
  { name: "Alex Mudrych",        group: "Muži",         poloId: "collar-256", bomberId: "bomber-453" },
  { name: "Jirka Franz",         group: "Muži",         poloId: "collar-256", bomberId: "bomber-453" },
  { name: "Magdaléna Ševčíková", group: "Ženy",         poloId: "collar-257", bomberId: "bomber-454" },
  { name: "Lucie Kysučanová",    group: "Ženy – Lucie", poloId: "slim-139", bomberId: "next-level-hoodie" },
];

const PRODUCT_MAP = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

async function fetchSizes(): Promise<SizeSelections> {
  try {
    const res = await fetch("/api/sizes");
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

async function saveSize(name: string, polo: string, bomber: string): Promise<SizeSelections> {
  try {
    const res = await fetch("/api/sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, polo, bomber }),
    });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

async function resetSizes(): Promise<void> {
  try {
    await fetch("/api/sizes", { method: "DELETE" });
  } catch {
    // ignore
  }
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const [showBack, setShowBack] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [sizeTableOpen, setSizeTableOpen] = useState(false);

  const imgSrc = showBack ? product.imageBack : product.imageFront;

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "var(--color-at-blue-v1)",
        border: "1px solid var(--color-at-blue-v3)",
      }}
    >
      {/* Image with front/back toggle */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{ aspectRatio: "4/3", background: "#fff" }}
      >
        {!imgError ? (
          <img
            src={imgSrc}
            alt={`${product.name} – ${showBack ? "záda" : "přední strana"}`}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{
              background: product.colorHex === "#e8e8e8" ? "#f0f0f0" : product.colorHex,
            }}
          >
            <span className="text-4xl">👕</span>
            <span
              className="text-xs font-bold"
              style={{ color: product.colorHex === "#e8e8e8" ? "#153151" : "#ffffff" }}
            >
              {product.name}
            </span>
          </div>
        )}

        {/* Front/Back toggle */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {(["Před", "Záda"] as const).map((label, i) => {
            const isActive = i === 0 ? !showBack : showBack;
            return (
              <button
                key={label}
                onClick={() => { setShowBack(i === 1); setImgError(false); }}
                className="rounded px-2 py-0.5 text-xs font-bold transition-all"
                style={{
                  background: isActive ? "var(--color-at-blue-v3)" : "rgba(0,0,0,0.55)",
                  color: "var(--color-at-white)",
                  border: isActive ? "1px solid var(--color-at-blue-v4)" : "1px solid transparent",
                  backdropFilter: "blur(4px)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Product link – overlaid on image */}
        {product.url && (
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-black transition-all hover:scale-105"
            style={{
              background: "var(--color-at-red)",
              color: "var(--color-at-white)",
              boxShadow: "0 4px 14px rgba(213,28,23,0.5)",
              letterSpacing: "0.01em",
            }}
          >
            Prohlédnout ↗
          </a>
        )}

        {/* Gender tag */}
        <div className="absolute top-2 left-2">
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold"
            style={{
              background: "rgba(16,37,62,0.8)",
              color: "var(--color-at-blue-v5)",
              backdropFilter: "blur(4px)",
            }}
          >
            {product.gender}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-4 flex flex-col gap-3 flex-1">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-black leading-tight" style={{ color: "var(--color-at-white)" }}>
              {product.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-at-blue-v5)" }}>
              {product.brand} · kód {product.code}
            </p>
          </div>
          <div
            className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5"
            style={{
              background: product.colorHex,
              border: product.colorHex === "#e8e8e8"
                ? "2px solid var(--color-at-blue-v3)"
                : "2px solid rgba(255,255,255,0.15)",
            }}
            title={product.color}
          />
        </div>

        {/* Material badges */}
        <div className="flex flex-wrap gap-1">
          {[product.material, product.weight, `Praní ${product.washTemp}`].map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background: "var(--color-at-blue-v2)",
                color: "var(--color-at-blue-v5)",
              }}
            >
              {tag}
            </span>
          ))}
          {product.price && (
            <span
              className="text-xs px-2 py-0.5 rounded font-black"
              style={{
                background: "rgba(213,28,23,0.15)",
                color: "var(--color-at-white)",
                border: "1px solid var(--color-at-red)",
              }}
            >
              {product.price}
            </span>
          )}
        </div>

        {/* Graphics */}
        <div
          className="rounded-lg px-3 py-2.5 flex flex-col gap-1.5"
          style={{ background: "var(--color-at-blue-v2)" }}
        >
          <p
            className="text-xs font-black uppercase tracking-wider mb-0.5"
            style={{ color: "var(--color-at-blue-v4)" }}
          >
            Grafika / potisk
          </p>
          <div className="flex items-start gap-2">
            <span
              className="text-xs font-bold flex-shrink-0 w-10"
              style={{ color: "var(--color-at-blue-v5)" }}
            >
              Přední
            </span>
            <span className="text-xs" style={{ color: "var(--color-at-white)" }}>
              {product.graphicFront}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span
              className="text-xs font-bold flex-shrink-0 w-10"
              style={{ color: "var(--color-at-blue-v5)" }}
            >
              Záda
            </span>
            <span className="text-xs" style={{ color: "var(--color-at-white)" }}>
              {product.graphicBack}
            </span>
          </div>
        </div>

        {/* Construction details */}
        <div>
          <p
            className="text-xs font-black uppercase tracking-wider mb-1.5"
            style={{ color: "var(--color-at-blue-v4)" }}
          >
            Konstrukční detaily
          </p>
          <ul className="flex flex-col gap-0.5">
            {product.details.map((d) => (
              <li key={d} className="flex items-start gap-1.5">
                <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "var(--color-at-blue-v4)" }}>
                  –
                </span>
                <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                  {d}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Available sizes */}
        <div>
          <p
            className="text-xs font-black uppercase tracking-wider mb-1.5"
            style={{ color: "var(--color-at-blue-v4)" }}
          >
            Dostupné velikosti
          </p>
          <div className="flex flex-wrap gap-1">
            {product.sizes.map((s) => (
              <span
                key={s}
                className="text-xs font-bold px-2.5 py-1 rounded"
                style={{
                  background: "var(--color-at-blue-v3)",
                  color: "var(--color-at-white)",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Size table toggle */}
        {product.sizeTable && (
          <div>
            <button
              onClick={() => setSizeTableOpen((v) => !v)}
              className="text-xs font-bold flex items-center gap-1.5 mb-2"
              style={{ color: "var(--color-at-blue-v5)" }}
            >
              <span
                className="text-xs"
                style={{
                  display: "inline-block",
                  transform: sizeTableOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s",
                }}
              >
                ▶
              </span>
              {sizeTableOpen ? "Skrýt rozměrovou tabulku" : "Zobrazit rozměrovou tabulku"}
            </button>

            {sizeTableOpen && (
              <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid var(--color-at-blue-v2)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--color-at-blue-v2)" }}>
                      <th className="px-3 py-2 text-left font-bold" style={{ color: "var(--color-at-blue-v5)" }}>
                        Vel.
                      </th>
                      <th className="px-3 py-2 text-left font-bold" style={{ color: "var(--color-at-blue-v5)" }}>
                        Délka
                      </th>
                      <th className="px-3 py-2 text-left font-bold" style={{ color: "var(--color-at-blue-v5)" }}>
                        Šířka
                      </th>
                      {product.sizeTable[0]?.sleeve && (
                        <th className="px-3 py-2 text-left font-bold" style={{ color: "var(--color-at-blue-v5)" }}>
                          Rukáv
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {product.sizeTable.map((row, i) => (
                      <tr
                        key={row.size}
                        style={{
                          background: i % 2 === 0 ? "transparent" : "var(--color-at-blue-v1)",
                          borderTop: "1px solid var(--color-at-blue-v2)",
                        }}
                      >
                        <td className="px-3 py-1.5 font-black" style={{ color: "var(--color-at-white)" }}>
                          {row.size}
                        </td>
                        <td className="px-3 py-1.5" style={{ color: "var(--color-at-blue-v5)" }}>
                          {row.length}
                        </td>
                        <td className="px-3 py-1.5" style={{ color: "var(--color-at-blue-v5)" }}>
                          {row.width}
                        </td>
                        {row.sleeve && (
                          <td className="px-3 py-1.5" style={{ color: "var(--color-at-blue-v5)" }}>
                            {row.sleeve}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Size Row ─────────────────────────────────────────────────────────────────

function SizeRow({
  member,
  sizes,
  onSetSize,
}: {
  member: TeamMember;
  sizes: SizeSelections;
  onSetSize: (name: string, type: "polo" | "bomber", size: string) => void;
}) {
  const polo   = PRODUCT_MAP[member.poloId];
  const bomber = PRODUCT_MAP[member.bomberId];
  const sel    = sizes[member.name] ?? { polo: "", bomber: "" };
  const bothSelected = sel.polo !== "" && sel.bomber !== "";

  return (
    <div
      className="rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3"
      style={{
        background: "var(--color-at-blue-v1)",
        border: `1px solid ${bothSelected ? "var(--color-at-blue-v4)" : "var(--color-at-blue-v2)"}`,
        transition: "border-color 0.2s",
      }}
    >
      {/* Name + status dot */}
      <div className="flex items-center gap-2 sm:w-48 flex-shrink-0 pt-0.5">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{
            background: bothSelected ? "#22c55e" : "var(--color-at-blue-v3)",
            boxShadow: bothSelected ? "0 0 6px rgba(34,197,94,0.4)" : "none",
            transition: "background 0.2s, box-shadow 0.2s",
          }}
        />
        <p className="text-sm font-black" style={{ color: "var(--color-at-white)" }}>
          {member.name}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {/* Polo */}
        <div className="flex flex-col gap-1.5 flex-1">
          <p className="text-xs font-black" style={{ color: "var(--color-at-blue-v5)" }}>
            {polo?.name ?? "Polokošile / tričko"}
          </p>
          <div className="flex flex-wrap gap-1 items-center">
            {polo?.sizes.map((s) => (
              <button
                key={s}
                onClick={() => onSetSize(member.name, "polo", s)}
                className="rounded px-2.5 py-1 text-xs font-bold transition-all"
                style={{
                  background: sel.polo === s ? "var(--color-at-red)" : "var(--color-at-blue-v2)",
                  color: "var(--color-at-white)",
                  border: sel.polo === s
                    ? "1px solid var(--color-at-red)"
                    : "1px solid var(--color-at-blue-v3)",
                  transform: sel.polo === s ? "scale(1.08)" : "scale(1)",
                }}
              >
                {s}
              </button>
            ))}
            {sel.polo !== "" && (
              <span
                className="rounded px-2.5 py-1 text-xs font-black"
                style={{
                  background: "rgba(34,197,94,0.12)",
                  color: "#22c55e",
                  border: "1px solid rgba(34,197,94,0.3)",
                }}
              >
                ✓ {sel.polo}
              </span>
            )}
          </div>
        </div>

        {/* Bomber */}
        <div className="flex flex-col gap-1.5 flex-1">
          <p className="text-xs font-black" style={{ color: "var(--color-at-blue-v5)" }}>
            {bomber?.name ?? "Mikina"}
          </p>
          <div className="flex flex-wrap gap-1 items-center">
            {bomber?.sizes.map((s) => (
              <button
                key={s}
                onClick={() => onSetSize(member.name, "bomber", s)}
                className="rounded px-2.5 py-1 text-xs font-bold transition-all"
                style={{
                  background: sel.bomber === s ? "var(--color-at-red)" : "var(--color-at-blue-v2)",
                  color: "var(--color-at-white)",
                  border: sel.bomber === s
                    ? "1px solid var(--color-at-red)"
                    : "1px solid var(--color-at-blue-v3)",
                  transform: sel.bomber === s ? "scale(1.08)" : "scale(1)",
                }}
              >
                {s}
              </button>
            ))}
            {sel.bomber !== "" && (
              <span
                className="rounded px-2.5 py-1 text-xs font-black"
                style={{
                  background: "rgba(34,197,94,0.12)",
                  color: "#22c55e",
                  border: "1px solid rgba(34,197,94,0.3)",
                }}
              >
                ✓ {sel.bomber}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SlideDressCode() {
  const [tab, setTab]           = useState<"products" | "sizes">("products");
  const [sizes, setSizes]       = useState<SizeSelections>({});
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    fetchSizes().then((data) => {
      setSizes(data);
      setHydrated(true);
    });

    const interval = setInterval(() => {
      fetchSizes().then((data) => setSizes(data));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const setSize = (name: string, type: "polo" | "bomber", size: string) => {
    setSizes((prev) => {
      const current = prev[name] ?? { polo: "", bomber: "" };
      const newValue = current[type] === size ? "" : size;
      const updated: SizeSelections = {
        ...prev,
        [name]: { ...current, [type]: newValue },
      };

      setSaving(true);
      saveSize(
        name,
        type === "polo" ? newValue : (updated[name]?.polo ?? ""),
        type === "bomber" ? newValue : (updated[name]?.bomber ?? ""),
      ).then((serverData) => {
        if (Object.keys(serverData).length > 0) setSizes(serverData);
        setSaving(false);
      });

      return updated;
    });
  };

  const completedCount = TEAM.filter(
    (m) => (sizes[m.name]?.polo ?? "") !== "" && (sizes[m.name]?.bomber ?? "") !== ""
  ).length;

  const productGroups = [
    { label: "Muži",                                 products: PRODUCTS.filter((p) => p.gender === "Muži") },
    { label: "Ženy",                                 products: PRODUCTS.filter((p) => p.gender === "Ženy") },
    { label: "Lucie Kysučanová – individuální kolekce", products: PRODUCTS.filter((p) => p.gender === "Ženy – Lucie") },
  ];

  const teamGroups = [
    { label: "Muži",         members: TEAM.filter((m) => m.group === "Muži") },
    { label: "Ženy",         members: TEAM.filter((m) => m.group === "Ženy") },
    { label: "Ženy – Lucie", members: TEAM.filter((m) => m.group === "Ženy – Lucie") },
  ];

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          Příprava veletrhu
        </p>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl sm:text-3xl font-black" style={{ color: "var(--color-at-white)" }}>
              Dress Code – oblečení na veletrh
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-at-blue-v5)" }}>
              Malfini Premium + Next Level Apparel · AERO EXPO 2026 · Friedrichshafen · 22.–25. 4. 2026
            </p>
          </div>

          {/* Progress pill */}
          {hydrated && (
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  background: "var(--color-at-blue-v1)",
                  border: `1px solid ${completedCount === TEAM.length ? "rgba(34,197,94,0.4)" : "var(--color-at-blue-v3)"}`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: completedCount === TEAM.length ? "#22c55e" : "#f59e0b",
                    boxShadow: completedCount === TEAM.length ? "0 0 6px rgba(34,197,94,0.5)" : "none",
                  }}
                />
                <span className="text-xs font-bold" style={{ color: "var(--color-at-white)" }}>
                  {completedCount} / {TEAM.length} velikostí vyplněno
                </span>
              </div>
              {saving && (
                <span className="text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
                  Ukládám…
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div
        className="flex gap-1 mb-5 p-1 rounded-lg w-fit"
        style={{ background: "var(--color-at-blue-v1)" }}
      >
        {([
          { key: "products", label: "Oblečení & materiály" },
          { key: "sizes",    label: "Výběr velikostí" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="rounded-md px-4 py-1.5 text-sm font-bold transition-all"
            style={{
              background: tab === key ? "var(--color-at-blue-v3)" : "transparent",
              color:      tab === key ? "var(--color-at-white)" : "var(--color-at-blue-v5)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Products ── */}
      {tab === "products" && (
        <div className="flex flex-col gap-8 overflow-y-auto pb-4">
          {productGroups.map((group) => (
            <div key={group.label}>
              <p
                className="text-xs font-black tracking-[0.15em] uppercase mb-3 pb-2"
                style={{
                  color: "var(--color-at-blue-v5)",
                  borderBottom: "1px solid var(--color-at-blue-v2)",
                }}
              >
                {group.label}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Sizes ── */}
      {tab === "sizes" && hydrated && (
        <div className="flex flex-col gap-6 overflow-y-auto pb-4">
          <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
            Každý člen týmu vybere svou velikost kliknutím na příslušné tlačítko. Výběr se automaticky ukládá.
          </p>

          {teamGroups.map((group) => {
            if (group.members.length === 0) return null;
            const polo   = PRODUCT_MAP[group.members[0].poloId];
            const bomber = PRODUCT_MAP[group.members[0].bomberId];

            return (
              <div key={group.label}>
                {/* Group header */}
                <div
                  className="flex items-center justify-between mb-3 pb-2"
                  style={{ borderBottom: "1px solid var(--color-at-blue-v2)" }}
                >
                  <p
                    className="text-xs font-black tracking-[0.15em] uppercase"
                    style={{ color: "var(--color-at-blue-v5)" }}
                  >
                    {group.label}
                  </p>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: "var(--color-at-blue-v2)", color: "var(--color-at-blue-v5)" }}
                    >
                      Polokošile: {polo?.name ?? "–"} · {polo?.color}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: "var(--color-at-blue-v2)", color: "var(--color-at-blue-v5)" }}
                    >
                      Mikina: {bomber?.name ?? "–"} · {bomber?.color}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {group.members.map((member) => (
                    <SizeRow
                      key={member.name}
                      member={member}
                      sizes={sizes}
                      onSetSize={setSize}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Summary table */}
          {completedCount > 0 && (
            <div>
              <p
                className="text-xs font-black tracking-[0.15em] uppercase mb-3 pb-2"
                style={{
                  color: "var(--color-at-blue-v5)",
                  borderBottom: "1px solid var(--color-at-blue-v2)",
                }}
              >
                Přehled vybraných velikostí
              </p>
              <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--color-at-blue-v2)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--color-at-blue-v2)" }}>
                      <th className="px-4 py-2.5 text-left font-black" style={{ color: "var(--color-at-blue-v5)" }}>
                        Jméno
                      </th>
                      <th className="px-4 py-2.5 text-left font-black" style={{ color: "var(--color-at-blue-v5)" }}>
                        Polokošile / tričko
                      </th>
                      <th className="px-4 py-2.5 text-left font-black" style={{ color: "var(--color-at-blue-v5)" }}>
                        Mikina
                      </th>
                      <th className="px-4 py-2.5 text-center font-black" style={{ color: "var(--color-at-blue-v5)" }}>
                        Stav
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEAM.map((m, i) => {
                      const sel  = sizes[m.name] ?? { polo: "", bomber: "" };
                      const done = sel.polo !== "" && sel.bomber !== "";
                      return (
                        <tr
                          key={m.name}
                          style={{
                            background: i % 2 === 0 ? "transparent" : "var(--color-at-blue-v1)",
                            borderTop: "1px solid var(--color-at-blue-v2)",
                          }}
                        >
                          <td className="px-4 py-2 font-black" style={{ color: "var(--color-at-white)" }}>
                            {m.name}
                          </td>
                          <td className="px-4 py-2">
                            {sel.polo ? (
                              <span
                                className="font-black px-2 py-0.5 rounded text-xs"
                                style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
                              >
                                {sel.polo}
                              </span>
                            ) : (
                              <span style={{ color: "var(--color-at-blue-v4)" }}>–</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {sel.bomber ? (
                              <span
                                className="font-black px-2 py-0.5 rounded text-xs"
                                style={{ background: "var(--color-at-blue-v3)", color: "var(--color-at-white)" }}
                              >
                                {sel.bomber}
                              </span>
                            ) : (
                              <span style={{ color: "var(--color-at-blue-v4)" }}>–</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded"
                              style={{
                                background: done ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                                color:      done ? "#22c55e" : "#f59e0b",
                                border: `1px solid ${done ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
                              }}
                            >
                              {done ? "✓ Hotovo" : "Čeká"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reset */}
          <button
            onClick={() => {
              setSizes({});
              resetSizes();
            }}
            className="text-xs self-start mt-1"
            style={{ color: "var(--color-at-blue-v4)" }}
          >
            Resetovat všechny výběry
          </button>
        </div>
      )}
    </div>
  );
}
