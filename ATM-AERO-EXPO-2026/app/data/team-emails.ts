/**
 * Mapování firemního Google e-mailu → zobrazované jméno (volitelné přesnější než profil z Google).
 */
export const TEAM_EMAILS: Record<string, string> = {
  "pavlina.parizkova@airteam.eu":   "Pavlína Pařízková",
  "petr.polak@airteam.eu":          "Petr Polák",
  "polak@airteam.eu":               "Petr Polák",
  "jan.polak@airteam.eu":           "Jan Polák",
  "magdalena.sevcikova@airteam.eu": "Magdaléna Ševčíková",
  "vratko.kapus@airteam.eu":        "Vratko Kapuš",
  "jakub.dryska@airteam.eu":        "Jakub Dryska",
  "lucie.kysucanova@airteam.eu":    "Lucie Kysučanová",
  "alex.mudrych@airteam.eu":        "Alex Mudrych",
  "jiri.franz@airteam.eu":          "Jiří Franz",
};

/** Domény Google Workspace, ze kterých je přihlášení povolené (kdokoli s účtem v doméně). */
export const DEFAULT_ALLOWED_SIGN_IN_DOMAINS = ["airteam.eu"] as const;

/**
 * Domény z env (Vercel): ALLOWED_AUTH_EMAIL_DOMAINS=airteam.eu,dalsi-domena.cz
 * Když není nastaveno, použijí se DEFAULT_ALLOWED_SIGN_IN_DOMAINS.
 */
export function getAllowedSignInDomains(): string[] {
  const raw = process.env.ALLOWED_AUTH_EMAIL_DOMAINS;
  if (raw?.trim()) {
    return raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((d) => d.length > 0);
  }
  return [...DEFAULT_ALLOWED_SIGN_IN_DOMAINS];
}

export function isAllowedSignInEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  const domain = lower.includes("@") ? (lower.split("@").pop() ?? "") : "";
  if (!domain) return false;
  return getAllowedSignInDomains().includes(domain);
}

export function displayNameForSignIn(email: string, profileName?: string | null): string {
  const lower = email.toLowerCase();
  if (TEAM_EMAILS[lower]) return TEAM_EMAILS[lower];
  if (profileName?.trim()) return profileName.trim();
  const local = lower.split("@")[0] ?? lower;
  return local;
}
