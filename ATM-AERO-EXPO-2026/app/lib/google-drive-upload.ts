import { createPrivateKey } from "node:crypto";
import { Readable } from "node:stream";
import { google } from "googleapis";

function trimEnv(s: string | undefined): string {
  return (s ?? "").trim();
}

/** Normalizace řetězce klíče z Vercelu (uvozovky, \\n, BOM, typografické uvozovky). */
export function normalizePrivateKey(raw: string): string {
  let k = trimEnv(raw);
  if (k.charCodeAt(0) === 0xfeff) k = k.slice(1);
  k = k.replace(/\uFEFF/g, "");
  k = k.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'");
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1);
  }
  return k.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").trim();
}

/**
 * Hodnota z Vercelu: buď jen private_key, nebo omylem celý JSON soubor od Google.
 */
export function resolvePrivateKeyFromEnv(raw: string): string {
  const trimmed = trimEnv(raw);
  if (trimmed.startsWith("{")) {
    try {
      const j = JSON.parse(trimmed) as { private_key?: string };
      if (j.private_key && typeof j.private_key === "string") {
        return normalizePrivateKey(j.private_key);
      }
    } catch {
      // neplatný JSON – zkusíme dál jako PEM
    }
  }
  return normalizePrivateKey(trimmed);
}

/** PEM v jednotném PKCS#8 tvaru – vyřeší část chyb OpenSSL 3 „DECODER routines::unsupported“. */
function coercePrivateKeyPem(pem: string): string {
  try {
    const key = createPrivateKey({ key: pem, format: "pem" });
    return key.export({ format: "pem", type: "pkcs8" }) as string;
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Neplatný soukromý klíč (GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY). V Vercelu musí být celý blok od -----BEGIN … do -----END …, nebo celý JSON soubor od Google. ${detail}`,
    );
  }
}

function looksLikePemKey(k: string): boolean {
  return (
    k.includes("BEGIN PRIVATE KEY") ||
    k.includes("BEGIN RSA PRIVATE KEY") ||
    k.includes("BEGIN EC PRIVATE KEY")
  );
}

/** E-mail service accountu z env, nebo z celého JSONu vloženého do PRIVATE_KEY. */
export function resolveServiceAccountEmail(): string {
  const direct = trimEnv(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  if (direct) return direct;
  const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!keyRaw) return "";
  const t = trimEnv(keyRaw);
  if (t.startsWith("{")) {
    try {
      const j = JSON.parse(t) as { client_email?: string };
      if (j.client_email && typeof j.client_email === "string") {
        return trimEnv(j.client_email);
      }
    } catch {
      // ignore
    }
  }
  return "";
}

/** Uživatel chce Disk (nastavené ID složky) – nesmíme tiše spadnout na Blob. */
export function isGoogleDriveFolderIdSet(): boolean {
  return Boolean(trimEnv(process.env.GOOGLE_DRIVE_FOLDER_ID));
}

/**
 * Když je nastavená složka na Disku, vrátí důvod proč upload nemůže běžet, jinak null.
 * (Používá stejnou kontrolu jako skutečné nahrání včetně OpenSSL.)
 */
export function validateGoogleDriveEnvForUpload(): string | null {
  if (!isGoogleDriveFolderIdSet()) return null;

  const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!trimEnv(keyRaw)) {
    return "Chybí nebo je prázdná GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY. Na Vercelu u každé proměnné zaškrtněte Production (a Preview pokud chcete) a po uložení proveďte Redeploy.";
  }

  const email = resolveServiceAccountEmail();
  if (!email) {
    return "Chybí GOOGLE_SERVICE_ACCOUNT_EMAIL. Doplňte e-mail service accountu (např. …@….iam.gserviceaccount.com), nebo vložte celý stažený JSON od Google jen do pole GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (obsahuje i client_email).";
  }

  const key = resolvePrivateKeyFromEnv(keyRaw!);

  if (!looksLikePemKey(key)) {
    const rawLen = trimEnv(keyRaw).length;
    const hint =
      rawLen < 80
        ? " Hodnota je velmi krátká — zkuste vložit celý stažený JSON soubor do jedné proměnné, nebo celý PEM blok včetně řádků BEGIN/END."
        : trimEnv(keyRaw).startsWith("AIza")
          ? " Začíná to jako API klíč (AIza…); potřebujete soukromý klíč service accountu (JSON nebo PEM), ne API klíč projektu."
          : !trimEnv(keyRaw).startsWith("{") && /^[A-Za-z0-9+/=\s]+$/.test(key.replace(/\s/g, ""))
            ? " Vypadá to jako čistý Base64 bez hlavičky PEM — vložte celý blok od -----BEGIN PRIVATE KEY----- až po -----END …----- (nebo celý JSON)."
            : trimEnv(keyRaw).startsWith("projects/")
              ? " Vypadá to jako ID projektu nebo cesta — do GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY patří jen obsah pole private_key z JSONu, nebo celý JSON soubor."
              : "";
    return `V GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY není rozpoznatelný klíč (chybí PEM hlavička BEGIN … PRIVATE KEY nebo platný JSON od {).${hint}`;
  }

  try {
    coercePrivateKeyPem(key);
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }

  return null;
}

export function isGoogleDriveUploadConfigured(): boolean {
  if (!isGoogleDriveFolderIdSet()) return false;
  return validateGoogleDriveEnvForUpload() === null;
}

/**
 * Nahraje soubor do sdílené složky na Disku a nastaví přístup „kdokoli s odkazem“.
 * Obrázek pak jde vložit do Markdownu jako veřejný odkaz (funguje mimo interní aplikaci).
 */
export async function uploadImageToGoogleDrive(
  fileName: string,
  buffer: Buffer,
  mimeType: string,
): Promise<{ url: string; fileId: string }> {
  const privateKey = coercePrivateKeyPem(
    resolvePrivateKeyFromEnv(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!),
  );
  const clientEmail = resolveServiceAccountEmail();
  const folderId = trimEnv(process.env.GOOGLE_DRIVE_FOLDER_ID);
  if (!clientEmail) {
    throw new Error(
      "Chybí GOOGLE_SERVICE_ACCOUNT_EMAIL (nebo client_email v JSONu u PRIVATE_KEY).",
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    // drive.file někdy nestačí na permissions + sdílenou složku; drive je vhodné pro SA s přístupem jen ke sdílené složce
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });

  const created = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: mimeType || "image/jpeg",
      body: Readable.from(buffer),
    },
    fields: "id",
    supportsAllDrives: true,
  });

  const fileId = created.data.id!;
  await drive.permissions.create({
    fileId,
    requestBody: {
      type: "anyone",
      role: "reader",
    },
    supportsAllDrives: true,
  });

  const url = `https://drive.google.com/uc?export=view&id=${fileId}`;
  return { url, fileId };
}
