"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import type { MeetingNote, NotePhoto } from "@/app/api/meetingnotes/route";
import { useIsOffline } from "../../hooks/useIsOffline";

function formatTs(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Google Drive URL `uc?export=view&id=ID` přestalo v 2024/25 fungovat jako `<img src>` i pro
 * server-side fetch (vrací HTML „virus scan / download confirmation"). Přepneme na CDN endpoint
 * `lh3.googleusercontent.com/d/ID`, který pro veřejně sdílené soubory stále vrací přímo obrázek.
 */
function normalizeDriveUrl(url: string, maxWidth = 2048): string {
  const m = url.match(
    /^https?:\/\/drive\.google\.com\/uc(?:\?[^#]*?)?[?&]id=([^&#]+)/i,
  );
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}=w${maxWidth}`;
  const m2 = url.match(/^https?:\/\/drive\.google\.com\/file\/d\/([^/]+)\//i);
  if (m2) return `https://lh3.googleusercontent.com/d/${m2[1]}=w${maxWidth}`;
  return url;
}

/** Náhled / odkaz na přílohu: absolutní URL (např. Google Drive), bloby přes /api/blob, staré přímé URL z Vercel přes proxy. */
function blobImageSrc(stored: string): string {
  if (/^https?:\/\//i.test(stored)) return normalizeDriveUrl(stored);
  if (stored.startsWith("/api/blob")) return stored;
  if (stored.includes("blob.vercel-storage.com")) {
    return `/api/blob?u=${encodeURIComponent(stored)}`;
  }
  return stored;
}

/** Pro export Markdown: veřejné https odkazy beze změny; relativní /api/blob → absolutní URL k aplikaci (vyžaduje přihlášení k náhledu). */
function exportImageUrl(stored: string): string {
  if (/^https?:\/\//i.test(stored)) return normalizeDriveUrl(stored);
  const path = blobImageSrc(stored);
  if (typeof window !== "undefined") {
    try {
      return new URL(path, window.location.origin).href;
    } catch {
      return path;
    }
  }
  return path;
}

function exportToMd(notes: MeetingNote[], filterLabel?: string) {
  const titleSuffix = filterLabel ? ` – ${filterLabel}` : "";
  const lines = [
    `# AERO EXPO 2026 – Zápisy z jednání${titleSuffix}`,
    `Exportováno: ${new Date().toLocaleString("cs-CZ")}`,
    "",
    "---",
    "",
  ];
  for (const note of [...notes].reverse()) {
    const heading = note.title
      ? `## ${note.title} · ${note.author} · ${formatTs(note.createdAt)}`
      : `## ${note.author} · ${formatTs(note.createdAt)}`;
    lines.push(heading, "");
    lines.push(note.body);
    if (note.photos && note.photos.length > 0) {
      lines.push("");
      for (const photo of note.photos) {
        const url = typeof photo === "string" ? photo : photo.full;
        lines.push(`![Příloha](${exportImageUrl(url)})`);
        const ocr = typeof photo === "string" ? null : photo.ocrText?.trim();
        if (ocr) {
          lines.push("");
          lines.push("> **Vyčtený text z fotky (Gemini Vision):**");
          for (const ocrLine of ocr.split("\n")) {
            lines.push(`> ${ocrLine}`);
          }
        }
      }
    }
    if (note.editedAt) {
      lines.push("", `*Upraveno: ${formatTs(note.editedAt)}*`);
    }
    lines.push("", "---", "");
  }
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const slug = filterLabel
    ? `-${filterLabel.toLowerCase().replace(/\s+/g, "-")}`
    : "";
  a.download = `aero-expo-2026-zapisy${slug}-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Plná verze: dost rozlišení na čitelný text (vizitky); náhled: menší, ale ne „zněmizovaný“. */
const PHOTO_FULL_MAX_WIDTH = 4400;
const PHOTO_FULL_QUALITY = 0.92;
const PHOTO_THUMB_MAX_WIDTH = 1440;
const PHOTO_THUMB_QUALITY = 0.88;

function resizeImage(file: File, maxWidth: number, quality: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      // Už menší než limit → nahrát beze ztráty další kompresí JPEG
      if (img.width <= maxWidth) {
        resolve(file);
        return;
      }
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob!], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };
    img.src = url;
  });
}

type PhotoPair = NotePhoto;

type UploadResult = { url: string; storage?: "gdrive" | "blob" };

async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  let data: { url?: string; error?: string; storage?: "gdrive" | "blob" };
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server vrátil ${res.status}: ${res.statusText}`);
  }
  if (!res.ok) throw new Error(data.error ?? `Upload selhal (${res.status})`);
  if (!data.url) throw new Error("Server nevrátil URL");
  return { url: data.url, storage: data.storage };
}

async function uploadPhoto(file: File): Promise<{
  pair: PhotoPair;
  storage?: "gdrive" | "blob";
}> {
  const fullFile = await resizeImage(file, PHOTO_FULL_MAX_WIDTH, PHOTO_FULL_QUALITY);
  const fullRes = await uploadFile(fullFile);
  const thumbFile = await resizeImage(file, PHOTO_THUMB_MAX_WIDTH, PHOTO_THUMB_QUALITY);
  const thumbRes = await uploadFile(thumbFile);
  return {
    pair: { full: fullRes.url, thumb: thumbRes.url },
    storage: fullRes.storage ?? thumbRes.storage,
  };
}

/** Zavolá server OCR přes Gemini. Vrací vyčtený text, nebo null (+ chybu) pokud selže. */
async function ocrPhoto(imageUrl: string): Promise<{ text: string | null; error?: string }> {
  try {
    const res = await fetch("/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: normalizeDriveUrl(imageUrl, 2400) }),
    });
    const data = (await res.json()) as { text?: string; error?: string };
    if (!res.ok) return { text: null, error: data.error ?? `HTTP ${res.status}` };
    return { text: (data.text ?? "").trim() || null };
  } catch (e) {
    return { text: null, error: e instanceof Error ? e.message : "OCR selhalo" };
  }
}

/**
 * Sbalený informační panel „Jak funguje OCR vizitek".
 * Default sbalený – zabírá minimum místa, ale dá se rozbalit kliknutím
 * a prokoukat celý workflow i jak nastavit API klíč po veletrhu.
 */
function OcrInfoPanel() {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="rounded-xl"
      style={{
        background: "rgba(147,179,207,0.08)",
        border: "1px solid var(--color-at-blue-v3)",
      }}
    >
      <summary
        className="cursor-pointer px-4 py-2.5 flex items-center gap-2 select-none text-xs"
        style={{ color: "var(--color-at-white)" }}
      >
        <span className="text-base" aria-hidden>ℹ️</span>
        <span className="font-bold uppercase tracking-[0.12em]" style={{ color: "var(--color-at-blue-v5)" }}>
          Jak fungují vizitky a OCR (klikněte pro rozbalení)
        </span>
      </summary>
      <div className="px-4 pb-4 pt-1 flex flex-col gap-3 text-xs" style={{ color: "var(--color-at-white)", lineHeight: 1.55 }}>
        <div>
          <p className="font-bold mb-1" style={{ color: "var(--color-at-blue-v5)" }}>
            📸 Během veletrhu – jen foťte, nic víc
          </p>
          <p style={{ color: "var(--color-at-blue-a5)" }}>
            Fotku vizitky přiložte k zápisu (tlačítko <strong style={{ color: "var(--color-at-white)" }}>Foto</strong>). Uloží se do Google Drive v plném rozlišení.
            Text z vizitky se vyčte sám na pozadí (~5 s) a uloží se celému týmu do zápisu.
          </p>
        </div>

        <div>
          <p className="font-bold mb-1" style={{ color: "var(--color-at-blue-v5)" }}>
            🪄 Dodatečné vyčtení textu
          </p>
          <p style={{ color: "var(--color-at-blue-a5)" }}>
            Pokud se OCR na pozadí nepovedlo (výpadek Wi-Fi, pomalé připojení…), objeví se u fotky tlačítko <strong style={{ color: "var(--color-at-white)" }}>🪄 Vyčíst text z fotky</strong>.
            Funguje kdykoli – během veletrhu i po něm. Kliknutím se zavolá <strong>Gemini Vision</strong>, do ~5 s se pod fotkou objeví strukturovaný přepis (Jméno, Pozice, Telefon…) a uloží se do databáze pro celý tým.
          </p>
        </div>

        <div>
          <p className="font-bold mb-1" style={{ color: "var(--color-at-blue-v5)" }}>
            📄 Export do Markdownu
          </p>
          <p style={{ color: "var(--color-at-blue-a5)" }}>
            Tlačítkem <strong style={{ color: "var(--color-at-white)" }}>Exportovat .md</strong> nahoře vpravo stáhnete všechny zápisy včetně vyčtených textů pod každou fotkou (jako citované bloky).
            Soubor se dá otevřít v Obsidianu, Notionu, Wordu, nebo jen v textovém editoru – kontakty jsou hned searchable (Ctrl+F).
          </p>
        </div>

        <div>
          <p className="font-bold mb-1" style={{ color: "var(--color-at-blue-v5)" }}>
            ⚙️ Jak nastavit Gemini (jednorázově, zdarma)
          </p>
          <ol className="list-decimal pl-5 space-y-0.5" style={{ color: "var(--color-at-blue-a5)" }}>
            <li>
              Otevřít <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-at-red)", textDecoration: "underline" }}>aistudio.google.com</a> → <strong>Get API key</strong> → <strong>Create API key</strong>
            </li>
            <li>Zkopírovat klíč (začíná <code style={{ background: "var(--color-at-blue-v2)", padding: "1px 4px", borderRadius: 3 }}>AIza…</code>) – platební karta NENÍ třeba</li>
            <li>
              Na <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-at-red)", textDecoration: "underline" }}>vercelu.com</a> → projekt <strong>interni-aplikace</strong> → Settings → Environment Variables
            </li>
            <li>
              Add New: <strong>Name</strong> = <code style={{ background: "var(--color-at-blue-v2)", padding: "1px 4px", borderRadius: 3 }}>GEMINI_API_KEY</code>, <strong>Value</strong> = klíč, všechny 3 Environments → Save
            </li>
            <li>Deployments → poslední → ⋯ → Redeploy (bez cache)</li>
          </ol>
          <p className="mt-1.5" style={{ color: "var(--color-at-blue-v5)" }}>
            <strong style={{ color: "var(--color-at-white)" }}>Limit zdarma:</strong> 1 500 vizitek/den, 15/minutu. Na AERO EXPO vystačí s velkou rezervou.
          </p>
        </div>

        <div
          className="rounded-lg px-3 py-2"
          style={{ background: "rgba(213,28,23,0.1)", border: "1px solid var(--color-at-red)" }}
        >
          <p className="font-bold mb-1" style={{ color: "var(--color-at-white)" }}>💡 Tip</p>
          <p style={{ color: "var(--color-at-blue-a5)" }}>
            Během eventu se OCR nemusíte bát – i když klíč není nastavený nebo Wi-Fi nefunguje, fotka se uloží normálně. Text můžete vyčíst později tlačítkem u každé fotky.
          </p>
        </div>
      </div>
    </details>
  );
}

/**
 * Sjednocené zobrazení fotky + vyčteného textu pod ní.
 * - `preview` varianta má křížek pro smazání (v „nový zápis" / „editace").
 * - `view` varianta má klikatelný náhled (otevře plnou velikost), OCR text v boxu
 *   a (je-li zadán `onOcrRequest`) tlačítko „Vyčíst text" pro dodatečné spuštění OCR.
 */
function PhotoWithOcr({
  photo,
  ocrPending,
  onRemove,
  onOcrRequest,
  variant,
}: {
  photo: NotePhoto;
  ocrPending: boolean;
  onRemove?: () => void;
  onOcrRequest?: () => void;
  variant: "preview" | "view";
}) {
  const isPreview = variant === "preview";
  const imgClass = isPreview
    ? "h-32 w-auto max-w-[240px] object-contain rounded-lg bg-black/20"
    : "h-56 sm:h-64 w-auto max-w-[420px] object-contain rounded-lg bg-black/20 hover:opacity-85 hover:scale-[1.015] transition-all cursor-zoom-in";
  const showOcrButton = !isPreview && !photo.ocrText && !!onOcrRequest;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative group inline-block self-start">
        {isPreview ? (
          <img
            src={blobImageSrc(photo.thumb)}
            alt="Příloha"
            className={imgClass}
            style={{ border: "1px solid var(--color-at-blue-v3)" }}
          />
        ) : (
          <a
            href={blobImageSrc(photo.full)}
            target="_blank"
            rel="noopener noreferrer"
            title="Otevřít plnou velikost v nové kartě"
            className="block"
          >
            <img
              src={blobImageSrc(photo.thumb)}
              alt="Příloha"
              loading="lazy"
              className={imgClass}
              style={{ border: "1px solid var(--color-at-blue-v3)" }}
            />
          </a>
        )}
        {ocrPending && (
          <div
            className="absolute bottom-1.5 left-1.5 flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold tracking-wide uppercase"
            style={{
              background: "rgba(16,37,62,0.88)",
              color: "var(--color-at-white)",
              backdropFilter: "blur(4px)",
            }}
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "var(--color-at-red)" }} />
            ✨ Vyčítám text…
          </div>
        )}
        {isPreview && onRemove && (
          <button
            onClick={onRemove}
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: "var(--color-at-red)",
              color: "var(--color-at-white)",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>
      {showOcrButton && !ocrPending && (
        <button
          type="button"
          onClick={onOcrRequest}
          className="self-start inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
          style={{
            background: "var(--color-at-blue-v3)",
            color: "var(--color-at-white)",
            border: "1px solid var(--color-at-blue-v4)",
          }}
          title="Zavolá Gemini Vision a doplní k této fotce vyčtený text."
        >
          🪄 Vyčíst text z fotky
        </button>
      )}
      {photo.ocrText && (
        <div
          className="rounded-lg px-3 py-2 max-w-[420px]"
          style={{
            background: "rgba(16,37,62,0.55)",
            border: "1px solid var(--color-at-blue-v3)",
          }}
        >
          <p
            className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5"
            style={{ color: "var(--color-at-blue-v5)" }}
          >
            ✨ Vyčtený text z fotky
          </p>
          <pre
            className="text-xs whitespace-pre-wrap font-mono leading-relaxed"
            style={{ color: "var(--color-at-white)", margin: 0 }}
          >
            {photo.ocrText}
          </pre>
        </div>
      )}
    </div>
  );
}

/**
 * Textarea s tlačítkem „zvětšit na celou obrazovku".
 * - Vertikální drag-resize (stáhnete si za pravý dolní roh, kolik potřebujete).
 * - Ikona vpravo nahoře rozbalí textareu do celoobrazovkového modalu (ideál na tabletu a mobilu
 *   během veletrhu – velká plocha pro psaní, Esc nebo × pro zavření, obsah se synchronizuje).
 */
function ExpandableTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  onCtrlEnter,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  onCtrlEnter?: () => void;
  ariaLabel?: string;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  const textareaStyle = {
    background: "var(--color-at-blue-v1)",
    border: "1px solid var(--color-at-blue-v3)",
    color: "var(--color-at-white)",
    lineHeight: 1.7,
  } as const;

  return (
    <>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (onCtrlEnter && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              onCtrlEnter();
            }
          }}
          placeholder={placeholder}
          rows={rows}
          aria-label={ariaLabel}
          className="w-full rounded-lg px-3 py-2 pr-10 text-sm resize-y focus:outline-none font-mono"
          style={textareaStyle}
        />
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          title="Zvětšit na celou obrazovku (Esc pro zavření)"
          aria-label="Zvětšit pole pro psaní"
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-md flex items-center justify-center transition-all hover:opacity-100 opacity-70"
          style={{
            background: "var(--color-at-blue-v2)",
            border: "1px solid var(--color-at-blue-v3)",
            color: "var(--color-at-white)",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: "rgba(7,18,33,0.92)", backdropFilter: "blur(6px)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Zvětšené pole pro psaní zápisu"
        >
          <div
            className="flex items-center justify-between gap-3 px-4 py-3"
            style={{ borderBottom: "1px solid var(--color-at-blue-v3)" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: "var(--color-at-blue-v5)" }}
            >
              {ariaLabel ?? "Zápis"} – zvětšené okno
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] hidden sm:inline" style={{ color: "var(--color-at-blue-v4)" }}>
                Esc = zavřít · Ctrl/⌘+Enter = {onCtrlEnter ? "odeslat" : "nový řádek"}
              </span>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="text-sm font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: "var(--color-at-red)",
                  color: "var(--color-at-white)",
                  border: "1px solid var(--color-at-red)",
                }}
              >
                ✓ Hotovo
              </button>
            </div>
          </div>
          <div className="flex-1 px-4 pt-3 pb-4 flex">
            <textarea
              autoFocus
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (onCtrlEnter && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  onCtrlEnter();
                  setFullscreen(false);
                }
              }}
              placeholder={placeholder}
              aria-label={ariaLabel}
              className="w-full flex-1 rounded-lg px-4 py-3 text-base resize-none focus:outline-none font-mono"
              style={{
                ...textareaStyle,
                lineHeight: 1.8,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default function OpsNotes() {
  const isOffline = useIsOffline();
  const { data: session } = useSession();
  const author = session?.user?.name ?? "";

  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);

  const [photos, setPhotos] = useState<PhotoPair[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  /** Thumb URL fotek, u kterých právě běží OCR přes Gemini. */
  const [ocrPendingThumbs, setOcrPendingThumbs] = useState<Set<string>>(new Set());
  /** Poslední chyba OCR (pokud nějaká nastala). */
  const [ocrError, setOcrError] = useState<string | null>(null);
  /** Poslední typ úložiště z /api/upload (aby bylo vidět, jestli běží Disk). */
  const [lastUploadStorage, setLastUploadStorage] = useState<
    "gdrive" | "blob" | null
  >(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [filterAuthor, setFilterAuthor] = useState<string>("all");
  const [deletingMyNotes, setDeletingMyNotes] = useState(false);

  const authors = Array.from(new Set(notes.map((n) => n.author)));
  const filteredNotes =
    filterAuthor === "all" ? notes : notes.filter((n) => n.author === filterAuthor);
  const filterLabel =
    filterAuthor === "all" ? undefined : filterAuthor;

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/meetingnotes");
      const data: MeetingNote[] = await res.json();
      setNotes(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  /**
   * Spustí OCR pro danou fotku na pozadí a po dokončení aktualizuje stav (photos/editPhotos).
   * Zobrazí spinner u fotky, dokud nedorazí odpověď.
   */
  const runOcrInBackground = useCallback(
    (pair: PhotoPair, target: "new" | "edit") => {
      setOcrPendingThumbs((prev) => new Set(prev).add(pair.thumb));
      ocrPhoto(pair.full).then(({ text, error }) => {
        setOcrPendingThumbs((prev) => {
          const next = new Set(prev);
          next.delete(pair.thumb);
          return next;
        });
        if (error) {
          setOcrError(error);
          return;
        }
        if (!text) return;
        const updater = (prev: PhotoPair[]) =>
          prev.map((p) => (p.thumb === pair.thumb ? { ...p, ocrText: text } : p));
        if (target === "new") setPhotos(updater);
        else setEditPhotos(updater);
      });
    },
    [],
  );

  /**
   * Dodatečné OCR pro už uložený zápis (tlačítko „Vyčíst text" v publikovaném zápisu).
   * Po úspěchu pošle PUT na /api/meetingnotes, aby se text uložil trvale pro všechny.
   */
  const runOcrForExistingNote = useCallback(
    async (noteId: string, photoThumb: string) => {
      setOcrError(null);
      // Najdeme aktuální stav (z callback ref, ať nezmrazíme přes closure)
      setOcrPendingThumbs((prev) => new Set(prev).add(photoThumb));
      let latestNote: MeetingNote | undefined;
      setNotes((current) => {
        latestNote = current.find((n) => n.id === noteId);
        return current;
      });
      if (!latestNote) {
        setOcrPendingThumbs((prev) => {
          const next = new Set(prev);
          next.delete(photoThumb);
          return next;
        });
        return;
      }
      const normalizedPhotos: NotePhoto[] = (latestNote.photos ?? []).map((p) =>
        typeof p === "string" ? { full: p, thumb: p } : p,
      );
      const target = normalizedPhotos.find((p) => p.thumb === photoThumb);
      if (!target) {
        setOcrPendingThumbs((prev) => {
          const next = new Set(prev);
          next.delete(photoThumb);
          return next;
        });
        return;
      }
      const { text, error } = await ocrPhoto(target.full);
      if (error) {
        setOcrError(error);
        setOcrPendingThumbs((prev) => {
          const next = new Set(prev);
          next.delete(photoThumb);
          return next;
        });
        return;
      }
      if (!text) {
        setOcrError("Gemini nevrátil žádný text pro tuto fotku.");
        setOcrPendingThumbs((prev) => {
          const next = new Set(prev);
          next.delete(photoThumb);
          return next;
        });
        return;
      }
      const updatedPhotos = normalizedPhotos.map((p) =>
        p.thumb === photoThumb ? { ...p, ocrText: text } : p,
      );
      try {
        const res = await fetch("/api/meetingnotes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: noteId,
            title: latestNote.title,
            body: latestNote.body,
            photos: updatedPhotos,
          }),
        });
        if (!res.ok) throw new Error(`PUT vrátil ${res.status}`);
        const data: MeetingNote[] = await res.json();
        setNotes(data);
      } catch (e) {
        setOcrError(
          "OCR proběhlo, ale nepodařilo se uložit výsledek. " +
            (e instanceof Error ? e.message : ""),
        );
      } finally {
        setOcrPendingThumbs((prev) => {
          const next = new Set(prev);
          next.delete(photoThumb);
          return next;
        });
      }
    },
    [],
  );

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    setOcrError(null);
    try {
      const pairs: PhotoPair[] = [];
      for (const file of Array.from(files)) {
        const { pair, storage } = await uploadPhoto(file);
        pairs.push(pair);
        if (storage) setLastUploadStorage(storage);
      }
      setPhotos((prev) => [...prev, ...pairs]);
      // OCR pustíme paralelně na pozadí – nečekáme na ně, uživatel může dál psát
      for (const p of pairs) runOcrInBackground(p, "new");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Nahrávání selhalo");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removePhoto = (thumb: string) => {
    setPhotos((prev) => prev.filter((p) => p.thumb !== thumb));
  };

  const handleSubmit = async () => {
    if (!author || !body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/meetingnotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, author, photos: photos.length > 0 ? photos : undefined }),
      });
      const data: MeetingNote[] = await res.json();
      setNotes(data);
      setTitle("");
      setBody("");
      setPhotos([]);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const [editPhotos, setEditPhotos] = useState<PhotoPair[]>([]);
  const [editUploading, setEditUploading] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const startEdit = (note: MeetingNote) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditBody(note.body);
    setEditPhotos(
      (note.photos ?? []).map((p) =>
        typeof p === "string" ? { full: p, thumb: p } : p,
      ),
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
    setEditPhotos([]);
  };

  const handleEditFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setEditUploading(true);
    try {
      const pairs: PhotoPair[] = [];
      for (const file of Array.from(files)) {
        const { pair, storage } = await uploadPhoto(file);
        pairs.push(pair);
        if (storage) setLastUploadStorage(storage);
      }
      setEditPhotos((prev) => [...prev, ...pairs]);
      for (const p of pairs) runOcrInBackground(p, "edit");
    } catch {
      // ignore
    } finally {
      setEditUploading(false);
      if (editFileRef.current) editFileRef.current.value = "";
    }
  };

  const removeEditPhoto = (thumb: string) => {
    setEditPhotos((prev) => prev.filter((p) => p.thumb !== thumb));
  };

  const saveEdit = async (id: string) => {
    if (!editBody.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/meetingnotes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: editTitle,
          body: editBody,
          photos: editPhotos.length > 0 ? editPhotos : [],
        }),
      });
      const data: MeetingNote[] = await res.json();
      setNotes(data);
      setEditingId(null);
      setEditPhotos([]);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const myNotesCount = notes.filter((n) => n.author === author).length;

  const handleDeleteMyNotes = async () => {
    if (!author || isOffline || myNotesCount === 0) return;
    if (
      !confirm(
        `Opravdu smazat všech ${myNotesCount} vašich zápisů? Zápisy ostatních zůstanou. Tuto akci nelze vrátit zpět.`,
      )
    ) {
      return;
    }
    setDeletingMyNotes(true);
    try {
      const res = await fetch("/api/meetingnotes", { method: "DELETE" });
      const data: { error?: string; notes?: MeetingNote[] } = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Smazání selhalo");
      if (data.notes) setNotes(data.notes);
      setEditingId(null);
      setEditTitle("");
      setEditBody("");
      setEditPhotos([]);
    } catch {
      // ignore
    } finally {
      setDeletingMyNotes(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Header */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p
              className="text-xs font-bold tracking-[0.15em] uppercase"
              style={{ color: "var(--color-at-white)" }}
            >
              Zápisy z jednání
            </p>
            <p className="text-xs mt-0.5" style={{ color: isOffline ? "#f97316" : "var(--color-at-blue-v5)" }}>
              {isOffline ? "⚡ offline – zobrazuji poslední záznamy" : "Viditelné pro celý tým · obnova každých 10 s"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <select
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
              className="text-xs px-2 py-1 rounded focus:outline-none"
              style={{
                background: "var(--color-at-blue-v2)",
                border: "1px solid var(--color-at-blue-v3)",
                color: "var(--color-at-white)",
              }}
            >
              <option value="all">Všechny zápisy</option>
              {author && <option value={author}>Moje zápisy</option>}
              {authors
                .filter((a) => a !== author)
                .map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
            </select>
            <button
              onClick={() => exportToMd(filteredNotes, filterLabel)}
              disabled={filteredNotes.length === 0}
              className="text-xs font-bold px-3 py-1 rounded"
              style={{
                background: "var(--color-at-blue-v3)",
                color: "var(--color-at-white)",
                border: "1px solid var(--color-at-blue-v3)",
                opacity: filteredNotes.length === 0 ? 0.4 : 1,
              }}
            >
              Exportovat .md
            </button>
          </div>
        </div>
        {author ? (
          <div
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2"
            style={{
              background: "rgba(213,28,23,0.08)",
              border: "1px solid var(--color-at-blue-v3)",
            }}
          >
            <span className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
              Vaše zápisy: <strong style={{ color: "var(--color-at-white)" }}>{myNotesCount}</strong>
              {" · "}
              ostatní uživatelé se nesmažou.
            </span>
            <button
              type="button"
              onClick={handleDeleteMyNotes}
              disabled={isOffline || myNotesCount === 0 || deletingMyNotes}
              title={
                myNotesCount === 0
                  ? "Nemáte žádné zápisy"
                  : "Smazat jen vaše zápisy"
              }
              className="text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0"
              style={{
                background: myNotesCount === 0 ? "var(--color-at-blue-v2)" : "var(--color-at-red)",
                color: "var(--color-at-white)",
                border: "1px solid var(--color-at-red)",
                opacity: isOffline || deletingMyNotes ? 0.5 : 1,
                cursor:
                  isOffline || myNotesCount === 0 ? "not-allowed" : "pointer",
              }}
            >
              {deletingMyNotes ? "Mažu…" : "Smazat všechny mé zápisy"}
            </button>
          </div>
        ) : null}
      </div>

      {/* Info panel – jak funguje OCR / vizitky */}
      <OcrInfoPanel />

      {/* New note form */}
      <div
        className="flex flex-col gap-2 rounded-xl px-4 py-3"
        style={{
          background: "var(--color-at-blue-v2)",
          border: "1px solid var(--color-at-blue-v3)",
        }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: "var(--color-at-blue-v5)" }}>
          Nový zápis
        </p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Název jednání (volitelné)"
          className="rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={{
            background: "var(--color-at-blue-v1)",
            border: "1px solid var(--color-at-blue-v3)",
            color: "var(--color-at-white)",
          }}
        />
        <ExpandableTextarea
          value={body}
          onChange={setBody}
          onCtrlEnter={handleSubmit}
          placeholder="Obsah zápisu… (Ctrl+Enter = odeslat)"
          rows={4}
          ariaLabel="Obsah zápisu"
        />
        {/* Photo previews */}
        {photos.length > 0 && (
          <div className="flex flex-col gap-3">
            {photos.map((p) => (
              <PhotoWithOcr
                key={p.thumb}
                photo={p}
                ocrPending={ocrPendingThumbs.has(p.thumb)}
                onRemove={() => removePhoto(p.thumb)}
                variant="preview"
              />
            ))}
          </div>
        )}
        {ocrError && (
          <p
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(213,28,23,0.12)", color: "var(--color-at-red)" }}
          >
            OCR: {ocrError}
          </p>
        )}

        {uploading && (
          <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
            Nahrávám fotky…
          </p>
        )}

        {uploadError && (
          <p className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(213,28,23,0.12)", color: "var(--color-at-red)" }}>
            {uploadError}
          </p>
        )}

        {lastUploadStorage && !uploadError && (
          <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
            {lastUploadStorage === "gdrive"
              ? "Úložiště: Google Disk — v exportu budou odkazy na drive.google.com."
              : "Úložiště: Vercel Blob — velký náhled otevřete kliknutím na obrázek (nová karta)."}
          </p>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs" style={{ color: isOffline ? "#f97316" : "var(--color-at-blue-v4)" }}>
            {isOffline ? "Offline – zápisy se neukládají" : (author || "Nepřihlášen/a")}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading || isOffline}
              title="Přidat fotku (vizitka, poznámky…)"
              className="text-sm font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
              style={{
                background: "var(--color-at-blue-v3)",
                color: "var(--color-at-white)",
                border: "1px solid var(--color-at-blue-v3)",
                opacity: uploading || isOffline ? 0.4 : 1,
                cursor: isOffline ? "not-allowed" : "pointer",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              {uploading ? "Nahrávám…" : "Foto"}
              {photos.length > 0 && (
                <span
                  className="text-xs font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--color-at-red)", color: "var(--color-at-white)", fontSize: 10 }}
                >
                  {photos.length}
                </span>
              )}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!body.trim() || submitting || !author || isOffline}
              title={isOffline ? "Offline – zápisy se neukládají" : undefined}
              className="text-sm font-black px-4 py-1.5 rounded-lg transition-all"
              style={{
                background: "var(--color-at-red)",
                color: "var(--color-at-white)",
                opacity: !body.trim() || !author || isOffline ? 0.4 : 1,
                cursor: isOffline ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Odesílám…" : "Přidat zápis"}
            </button>
          </div>
        </div>
      </div>

      {/* Notes wall */}
      <div className="flex flex-col gap-3 overflow-y-auto" style={{ minHeight: 0, flex: 1 }}>
        {filteredNotes.length === 0 && (
          <p
            className="text-sm text-center py-8"
            style={{ color: "var(--color-at-blue-v4)" }}
          >
            {notes.length === 0
              ? "Zatím žádné zápisy. Přidej první zápis z jednání."
              : "Žádné zápisy od tohoto autora."}
          </p>
        )}

        {filteredNotes.map((note) => {
          const isEditing = editingId === note.id;
          const isMe = note.author === author;

          return (
            <div
              key={note.id}
              className="rounded-xl px-4 py-3 flex flex-col gap-2"
              style={{
                background: "var(--color-at-blue-v1)",
                border: `1px solid ${isMe ? "var(--color-at-blue-v3)" : "var(--color-at-blue-v2)"}`,
              }}
            >
              {/* Note header */}
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs font-black"
                      style={{ color: isMe ? "var(--color-at-red)" : "var(--color-at-blue-v5)" }}
                    >
                      {note.author}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
                      {formatTs(note.createdAt)}
                    </span>
                    {note.editedAt && (
                      <span className="text-xs" style={{ color: "var(--color-at-blue-v4)" }}>
                        · upraveno {formatTs(note.editedAt)}
                      </span>
                    )}
                  </div>
                  {note.title && !isEditing && (
                    <p className="text-sm font-bold" style={{ color: "var(--color-at-white)" }}>
                      {note.title}
                    </p>
                  )}
                </div>
                {isMe && !isEditing && (
                  <button
                    onClick={() => startEdit(note)}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      color: "var(--color-at-blue-v5)",
                      border: "1px solid var(--color-at-blue-v3)",
                    }}
                  >
                    Upravit
                  </button>
                )}
              </div>

              {/* View mode */}
              {!isEditing && (
                <>
                  <p
                    className="text-sm whitespace-pre-wrap"
                    style={{ color: "var(--color-at-white)", lineHeight: 1.7 }}
                  >
                    {note.body}
                  </p>
                  {note.photos && note.photos.length > 0 && (
                    <div className="flex flex-col gap-4 mt-3">
                      {note.photos.map((photo) => {
                        const normalized: NotePhoto =
                          typeof photo === "string"
                            ? { full: photo, thumb: photo }
                            : photo;
                        return (
                          <PhotoWithOcr
                            key={normalized.thumb}
                            photo={normalized}
                            ocrPending={ocrPendingThumbs.has(normalized.thumb)}
                            onOcrRequest={() =>
                              runOcrForExistingNote(note.id, normalized.thumb)
                            }
                            variant="view"
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Edit mode */}
              {isEditing && (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Název jednání (volitelné)"
                    className="rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={{
                      background: "var(--color-at-blue-v2)",
                      border: "1px solid var(--color-at-blue-v3)",
                      color: "var(--color-at-white)",
                    }}
                  />
                  <ExpandableTextarea
                    value={editBody}
                    onChange={setEditBody}
                    onCtrlEnter={() => saveEdit(note.id)}
                    rows={5}
                    ariaLabel="Úprava zápisu"
                  />

                  {/* Edit photos */}
                  {editPhotos.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {editPhotos.map((p) => (
                        <PhotoWithOcr
                          key={p.thumb}
                          photo={p}
                          ocrPending={ocrPendingThumbs.has(p.thumb)}
                          onRemove={() => removeEditPhoto(p.thumb)}
                          variant="preview"
                        />
                      ))}
                    </div>
                  )}

                  {editUploading && (
                    <p className="text-xs" style={{ color: "var(--color-at-blue-v5)" }}>
                      Nahrávám fotky…
                    </p>
                  )}

                  <input
                    ref={editFileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleEditFiles}
                  />

                  <div className="flex gap-2 justify-end items-center">
                    <button
                      onClick={() => editFileRef.current?.click()}
                      disabled={editUploading || isOffline}
                      className="text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 mr-auto"
                      style={{
                        background: "var(--color-at-blue-v3)",
                        color: "var(--color-at-white)",
                        border: "1px solid var(--color-at-blue-v3)",
                        opacity: editUploading || isOffline ? 0.4 : 1,
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      {editUploading ? "Nahrávám…" : "Foto"}
                      {editPhotos.length > 0 && (
                        <span
                          className="text-xs font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: "var(--color-at-red)", color: "var(--color-at-white)", fontSize: 10 }}
                        >
                          {editPhotos.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-xs px-3 py-1 rounded"
                      style={{ color: "var(--color-at-blue-v5)", textDecoration: "underline" }}
                    >
                      Zrušit
                    </button>
                    <button
                      onClick={() => saveEdit(note.id)}
                      disabled={!editBody.trim() || saving || isOffline}
                      title={isOffline ? "Offline – změny se neukládají" : undefined}
                      className="text-xs font-bold px-4 py-1 rounded-lg"
                      style={{
                        background: "var(--color-at-red)",
                        color: "var(--color-at-white)",
                        opacity: !editBody.trim() || isOffline ? 0.4 : 1,
                        cursor: isOffline ? "not-allowed" : "pointer",
                      }}
                    >
                      {saving ? "Ukládám…" : "Uložit"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
