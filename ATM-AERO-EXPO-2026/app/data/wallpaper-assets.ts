/**
 * Tapety na telefon – AERO EXPO 2026 (vizitka + QR), soubory v /public/wallpapers/
 */

export type PhoneWallpaper = {
  id: string;
  /** zobrazené jméno */
  name: string;
  /** název souboru v public/wallpapers/ */
  fileName: string;
};

/** Pořadí jako u týmu na veletrhu */
export const PHONE_WALLPAPERS: PhoneWallpaper[] = [
  { id: "petr-polak", name: "Petr Polák", fileName: "petr-polak.png" },
  { id: "jan-polak", name: "Jan Polák", fileName: "jan-polak.png" },
  { id: "magdalena-sevcikova", name: "Magdaléna Ševčíková", fileName: "magdalena-sevcikova.png" },
  { id: "vratko-kapus", name: "Vratko Kapuš", fileName: "vratko-kapus.png" },
  { id: "jakub-dryska", name: "Jakub Dryska", fileName: "jakub-dryska.png" },
  { id: "lucie-kysucanova", name: "Lucie Kysučanová", fileName: "lucie-kysucanova.png" },
  { id: "alex-mudrych", name: "Alex Mudrych", fileName: "alex-mudrych.png" },
  { id: "jiri-franz", name: "Jiří Franz", fileName: "jiri-franz.png" },
];

export function wallpaperPublicPath(fileName: string): string {
  return `/wallpapers/${fileName}`;
}
