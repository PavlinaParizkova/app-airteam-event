"use client";

import { useCallback, useEffect, useState } from "react";
import { MARKETING_GALLERY_ITEMS, type MarketingGalleryItem } from "../../data/marketing-assets";
import { PHONE_WALLPAPERS, wallpaperPublicPath, type PhoneWallpaper } from "../../data/wallpaper-assets";

function btnLightbox(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 700,
    padding: "10px 18px",
    borderRadius: 8,
    textDecoration: "none",
    letterSpacing: "0.03em",
    border: "none",
    cursor: "pointer",
  };
}

type LightboxState =
  | { kind: "marketing"; id: string }
  | { kind: "wallpaper"; id: string }
  | null;

export default function SlideMarketingKit() {
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeMkt =
    lightbox?.kind === "marketing"
      ? MARKETING_GALLERY_ITEMS.find((x) => x.id === lightbox.id) ?? null
      : null;
  const activeWp =
    lightbox?.kind === "wallpaper"
      ? PHONE_WALLPAPERS.find((x) => x.id === lightbox.id) ?? null
      : null;

  const copyOrShare = useCallback(async (id: string, url: string, title: string) => {
    setCopiedId(null);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        const err = e as { name?: string };
        if (err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2500);
    } catch {
      setCopiedId(null);
    }
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLightbox]);

  useEffect(() => {
    if (lightbox) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [lightbox]);

  return (
    <div className="flex flex-col flex-1 w-full min-w-0 max-w-full px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8">
      <div className="mb-4 sm:mb-5">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: "var(--color-at-white)" }}
        >
          05 Marketingové materiály
        </p>
        <h2 className="text-lg sm:text-2xl font-black" style={{ color: "var(--color-at-white)" }}>
          Co budete mít k dispozici
        </h2>
        <p className="mt-1 text-xs sm:text-sm max-w-2xl" style={{ color: "var(--color-at-blue-v5)" }}>
          Klikněte na dlaždici – zvětšený náhled a odkazy v lightboxu
        </p>
      </div>

      <div className="atm-mkt-gallery">
        {MARKETING_GALLERY_ITEMS.map((item) => (
          <Tile key={item.id} item={item} onOpen={() => setLightbox({ kind: "marketing", id: item.id })} />
        ))}
      </div>

      {/* Tapety na telefon */}
      <div className="mt-8 sm:mt-10">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
          style={{ color: "var(--color-at-red)" }}
        >
          Tapety na telefon
        </p>
        <p className="text-xs sm:text-sm mb-4 max-w-2xl" style={{ color: "var(--color-at-blue-v5)" }}>
          Brandovaná pozadí displeje s QR a jménem – 5 dlaždic na řádku, uložení dlouhým stiskem nebo tlačítkem v náhledu
        </p>
        <div className="atm-mkt-gallery">
          {PHONE_WALLPAPERS.map((wp) => (
            <WallpaperTile key={wp.id} wp={wp} onOpen={() => setLightbox({ kind: "wallpaper", id: wp.id })} />
          ))}
        </div>
      </div>

      {/* Lightbox – marketing */}
      {activeMkt && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
          style={{ background: "rgba(5, 12, 28, 0.88)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mkt-lightbox-title"
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: "var(--color-at-blue-v1)",
              border: "1px solid var(--color-at-blue-v4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-2 right-2 z-10 w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold"
              style={{
                background: "rgba(0,0,0,0.45)",
                color: "var(--color-at-white)",
                border: "1px solid var(--color-at-blue-v4)",
              }}
              aria-label="Zavřít"
              onClick={closeLightbox}
            >
              ×
            </button>

            {/* Akce nahoře – tlačítka jsou hned vidět bez rolování */}
            <div
              className="p-4 sm:p-5 pt-12 shrink-0"
              style={{
                background: "var(--color-at-blue-a5)",
                borderBottom: "1px solid var(--color-at-blue-v4)",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--color-at-red)" }}>
                {activeMkt.kind === "email" ? "E-mailový podpis" : activeMkt.kind === "linkedin" ? "LinkedIn" : "Leták PDF"}
              </p>
              <h3
                id="mkt-lightbox-title"
                className="text-sm sm:text-base font-bold leading-snug pr-8"
                style={{ color: "var(--color-at-blue)" }}
              >
                {activeMkt.title}
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--color-at-blue-v3)" }}>
                {activeMkt.meta}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
                <a
                  href={activeMkt.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...btnLightbox(), background: "var(--color-at-red)", color: "var(--color-at-white)", flex: 1 }}
                >
                  {activeMkt.primaryLabel}
                </a>
                <button
                  type="button"
                  onClick={() => copyOrShare(activeMkt.id, activeMkt.fileUrl, activeMkt.title)}
                  style={{
                    ...btnLightbox(),
                    background: "var(--color-at-blue-v2)",
                    color: "var(--color-at-white)",
                    border: "1px solid var(--color-at-blue-v3)",
                    flex: 1,
                  }}
                >
                  {copiedId === activeMkt.id ? "Odkaz v schránce" : "Sdílet / zkopírovat odkaz"}
                </button>
              </div>
            </div>

            <div
              className="flex-1 min-h-0 flex items-center justify-center overflow-auto p-4"
              style={{ background: "var(--color-at-blue-v1)" }}
            >
              <LightboxVisual item={activeMkt} />
            </div>
          </div>
        </div>
      )}

      {/* Lightbox – tapeta */}
      {activeWp && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
          style={{ background: "rgba(5, 12, 28, 0.88)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wp-lightbox-title"
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: "var(--color-at-blue-v1)",
              border: "1px solid var(--color-at-blue-v4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-2 right-2 z-10 w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold"
              style={{
                background: "rgba(0,0,0,0.45)",
                color: "var(--color-at-white)",
                border: "1px solid var(--color-at-blue-v4)",
              }}
              aria-label="Zavřít"
              onClick={closeLightbox}
            >
              ×
            </button>

            <div
              className="p-4 sm:p-5 pt-12 shrink-0"
              style={{
                background: "var(--color-at-blue-a5)",
                borderBottom: "1px solid var(--color-at-blue-v4)",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--color-at-red)" }}>
                Tapeta na telefon
              </p>
              <h3
                id="wp-lightbox-title"
                className="text-sm sm:text-base font-bold leading-snug pr-8"
                style={{ color: "var(--color-at-blue)" }}
              >
                {activeWp.name}
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--color-at-blue-v3)" }}>
                AERO EXPO 2026 · uložte obrázek do galerie
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
                <a
                  href={wallpaperPublicPath(activeWp.fileName)}
                  download={activeWp.fileName}
                  style={{ ...btnLightbox(), background: "var(--color-at-red)", color: "var(--color-at-white)", flex: 1 }}
                >
                  Stáhnout PNG
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const path = wallpaperPublicPath(activeWp.fileName);
                    const abs =
                      typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
                    copyOrShare(`wp-${activeWp.id}`, abs, `Tapeta ${activeWp.name}`);
                  }}
                  style={{
                    ...btnLightbox(),
                    background: "var(--color-at-blue-v2)",
                    color: "var(--color-at-white)",
                    border: "1px solid var(--color-at-blue-v3)",
                    flex: 1,
                  }}
                >
                  {copiedId === `wp-${activeWp.id}` ? "Odkaz v schránce" : "Sdílet odkaz na soubor"}
                </button>
              </div>
            </div>

            <div
              className="flex-1 min-h-0 flex items-center justify-center overflow-auto p-4"
              style={{ background: "var(--color-at-blue-v1)" }}
            >
              <img
                src={wallpaperPublicPath(activeWp.fileName)}
                alt={activeWp.name}
                className="max-w-full max-h-[min(58vh,560px)] w-auto h-auto object-contain rounded-md shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({ item, onOpen }: { item: MarketingGalleryItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Otevřít náhled: ${item.title}`}
      className="group relative w-full min-w-0 aspect-square rounded-lg overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-at-red)]"
      style={{
        background: "var(--color-at-blue-a5)",
        border: "1px solid var(--color-at-blue-v3)",
        padding: 0,
      }}
    >
      <div className="absolute inset-0">
        {item.kind === "linkedin" ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #0a66c2 0%, #004182 55%, var(--color-at-blue) 100%)",
            }}
          >
            <span className="text-2xl sm:text-3xl font-black text-white/95" style={{ fontFamily: "system-ui" }} aria-hidden>
              in
            </span>
          </div>
        ) : (
          <img
            src={item.thumbSrc!}
            alt=""
            className="w-full h-full object-cover object-top transition duration-200 group-hover:brightness-110 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        )}
        <div
          className="absolute inset-x-0 bottom-0 px-1.5 py-1 border-t"
          style={{
            background: "var(--color-at-blue-a5)",
            borderColor: "var(--color-at-blue-v4)",
          }}
        >
          <p
            className="text-[11px] sm:text-sm font-bold leading-snug line-clamp-2 px-0.5"
            style={{ color: "var(--color-at-blue)" }}
          >
            {item.title}
          </p>
        </div>
      </div>
    </button>
  );
}

function WallpaperTile({ wp, onOpen }: { wp: PhoneWallpaper; onOpen: () => void }) {
  const src = wallpaperPublicPath(wp.fileName);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Náhled tapety: ${wp.name}`}
      className="group relative w-full min-w-0 aspect-[9/16] max-h-[min(320px,70vmin)] sm:max-h-[min(360px,42vmin)] rounded-lg overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-at-red)]"
      style={{
        background: "var(--color-at-blue-a5)",
        border: "1px solid var(--color-at-blue-v5)",
        padding: 0,
      }}
    >
      <div className="absolute inset-0">
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover object-center transition duration-200 group-hover:brightness-110 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-x-0 bottom-0 px-1.5 py-1 border-t"
          style={{
            background: "var(--color-at-blue-a5)",
            borderColor: "var(--color-at-blue-v4)",
          }}
        >
          <p
            className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-1"
            style={{ color: "var(--color-at-blue)" }}
          >
            {wp.name}
          </p>
        </div>
      </div>
    </button>
  );
}

function LightboxVisual({ item }: { item: MarketingGalleryItem }) {
  if (item.kind === "linkedin") {
    return (
      <div
        className="w-full max-w-md aspect-[4/3] rounded-lg flex items-center justify-center"
        style={{
          background: "linear-gradient(145deg, #0a66c2 0%, #004182 55%, var(--color-at-blue) 100%)",
        }}
      >
        <span className="text-8xl font-black text-white/95 select-none" style={{ fontFamily: "system-ui" }} aria-hidden>
          in
        </span>
      </div>
    );
  }

  if (item.kind === "email") {
    return (
      <img
        src={item.thumbSrc!}
        alt={item.title}
        className="max-w-full max-h-[min(55vh,520px)] w-auto h-auto object-contain rounded-md"
      />
    );
  }

  return (
    <img
      src={item.thumbSrc!}
      alt={item.title}
      className="max-w-full max-h-[min(60vh,560px)] w-auto h-auto object-contain rounded-md"
    />
  );
}
