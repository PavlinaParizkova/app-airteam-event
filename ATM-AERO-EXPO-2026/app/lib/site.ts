/**
 * Kanonická adresa nasazené interní aplikace na Vercelu (prezentace + Operativa).
 * Produkc: https://interni-aplikace.vercel.app/
 *
 * Pro sdílení vždy jen tato doména. Nepoužívat jiné hosty téže aplikace (preview / barevné aliasy
 * typu interni-aplikace-*.vercel.app, týmové preview URL atd.).
 *
 * Přepsat lze v .env:
 * - NEXT_PUBLIC_INTERNAL_APP_ORIGIN – např. https://interni-aplikace.vercel.app
 * - NEXT_PUBLIC_INTERNAL_APP_OPS_URL – plná URL na /ops (má přednost před odvozením z ORIGIN)
 */
export const INTERNAL_APP_ORIGIN =
  process.env.NEXT_PUBLIC_INTERNAL_APP_ORIGIN?.replace(/\/$/, "").trim() ||
  "https://interni-aplikace.vercel.app";

export const INTERNAL_APP_OPS_URL =
  process.env.NEXT_PUBLIC_INTERNAL_APP_OPS_URL?.trim() ||
  `${INTERNAL_APP_ORIGIN}/ops`;

/** Google Drive – podklad „badge“ / vystavovatelský průkaz (slide Prezentace). */
export const EXHIBITOR_BADGE_DRIVE_URL =
  "https://drive.google.com/file/d/1x_LHOqwi_mXHyH64krbLEw_7q4JZPzOv/view?usp=drive_link";

/** Google Drive – druhý podklad ke stažení u vystavovatelských průkazů (slide Prezentace). */
export const EXHIBITOR_BADGE_DRIVE_URL_2 =
  "https://drive.google.com/file/d/13S3u9DejlX8dPCr9wTlcvB3w-0htB8L_/view?usp=drive_link";

/** Oficiální mobilní aplikace AERO Friedrichshafen (program, mapa stánků, plánovač). */
export const AERO_APP_URL = "https://www.aero-expo.com/visit/aero-app";

/** Google Drive – food mapa výstaviště AERO (restaurace, bistra, stánky s občerstvením). */
export const AERO_FOOD_MAP_URL =
  "https://drive.google.com/file/d/1xIzqGq3OiKC2i1Y89VDhJOKtfXaVUD0u/view?usp=drive_link";
