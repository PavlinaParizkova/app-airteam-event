/**
 * Grafické podklady AERO EXPO 2026 – zdroj: 01_38_07 ATM-Event-AERO-EXPO-graficke-podklady
 * Náhledy letáků: /public/marketing/*.png
 */

export type MarketingLeaflet = {
  id: string;
  title: string;
  format: string;
  fileUrl: string;
  /** cesta pod /public, např. /marketing/foo.png */
  previewSrc: string;
};

export const MARKETING_LINKEDIN = {
  title: "LinkedIn – profilová fotografie / cover",
  format: "—",
  fileUrl:
    "https://drive.google.com/file/d/1LFz0qAATv7f2wrVwxQCyWVCiH7nEA_x3/view?usp=drive_link",
} as const;

export const MARKETING_EMAIL_BANNER = {
  title: "E-mailový banner",
  format: "542 × 135 px",
  imageUrl:
    "https://live.airteam.eu/hubfs/MKT-email/01_38_10%20ATM_AE_2026_email_banner_542x135_fin.jpg",
  fileUrl:
    "https://live.airteam.eu/hubfs/MKT-email/01_38_10%20ATM_AE_2026_email_banner_542x135_fin.jpg",
} as const;

/** Letáky (PDF) – pořadí a texty podle přehledu v dokumentu */
export const MARKETING_LEAFLETS: MarketingLeaflet[] = [
  {
    id: "corporate-2026",
    title: "AIR TEAM Corporate Leaflet 2026",
    format: "PDF",
    fileUrl:
      "https://live.airteam.eu/hubfs/MKT-Leaflet/AIR%20TEAM%20Everything%20Your%20Aircraft%20Needs%20Leaflet%202026.pdf",
    previewSrc: "/marketing/air-team-corporate-leaflet-2026.png",
  },
  {
    id: "everything-needs-2026",
    title: "AIR TEAM Everything Your Aircraft Needs Leaflet 2026",
    format: "PDF",
    fileUrl:
      "https://live.airteam.eu/hubfs/MKT-Leaflet/AIR%20TEAM%20Everything%20Your%20Aircraft%20Needs%20Leaflet%202026.pdf",
    previewSrc: "/marketing/air-team-everything-your-aircraft-needs-2026.png",
  },
  {
    id: "part-21j",
    title: "AIR TEAM Leaflet Part 21J | 21G | 145",
    format: "PDF",
    fileUrl:
      "https://live.airteam.eu/hubfs/MKT-Leaflet/AIR%20TEAM%20Leaflet%20Part%2021J_21G_145.pdf",
    previewSrc: "/marketing/air-team-part-21j-21g-145.png",
  },
  {
    id: "glass-2026",
    title: "AIR TEAM Stop Buying Boxes. Start Flying Glass. Leaflet 2026",
    format: "PDF",
    fileUrl:
      "https://live.airteam.eu/hubfs/MKT-Leaflet/AIR%20TEAM%20Stop%20Buying%20Boxes.%20Start%20Flying%20Glass.%20Leaflet%202026.pdf",
    previewSrc: "/marketing/air-team-stop-buying-boxes-glass-2026.png",
  },
  {
    id: "upgrade-2026",
    title: "AIR TEAM Upgrade Catalogue 2026",
    format: "PDF",
    fileUrl:
      "https://live.airteam.eu/hubfs/MKT-Leaflet/AIR%20TEAM%20Upgrade%20Catalogue%202026.pdf",
    previewSrc: "/marketing/air-team-upgrade-catalogue-2026.png",
  },
  {
    id: "pilotstyle-helmet",
    title: "PilotStyle Helmet – Integrated BOSE A30 Leaflet 2026",
    format: "PDF",
    fileUrl:
      "https://live.airteam.eu/hubfs/MKT-Leaflet/PilotStyle%20Helmet%20-%20Integrated%20BOSE%20A30%20Leaflet%202026.pdf",
    previewSrc: "/marketing/pilotstyle-helmet-bose-a30-2026.png",
  },
  {
    id: "pilotstyle-leaflet",
    title: "PilotStyle Leaflet 2026",
    format: "PDF",
    fileUrl:
      "https://live.airteam.eu/hubfs/MKT-Leaflet/PilotStyle%20Leaflet%202026.pdf",
    previewSrc: "/marketing/pilotstyle-leaflet-2026.png",
  },
  {
    id: "pilotstyle-collection",
    title: "PilotStyle The 2026 Flight Collection",
    format: "PDF",
    fileUrl:
      "https://live.airteam.eu/hubfs/MKT-Leaflet/PilotStyle%20The%202026%20Flight%20Collection.pdf",
    previewSrc: "/marketing/pilotstyle-2026-flight-collection.png",
  },
  {
    id: "work-you-can-sign",
    title: "AIR TEAM Work You Can Sign Your Name To Leaflet 2026",
    format: "PDF",
    fileUrl:
      "https://live.airteam.eu/hubfs/MKT-Leaflet/AIR%20TEAM%20Work%20You%20Can%20Sign%20Your%20Name%20To%20Leaflet%202026.pdf",
    previewSrc: "/marketing/air-team-work-you-can-sign-your-name-to-2026.png",
  },
];

/** Položky pro galerii (dlaždice + lightbox) – e-mail, LinkedIn, letáky */
export type MarketingGalleryItem = {
  id: string;
  title: string;
  meta: string;
  fileUrl: string;
  /** null = dlaždice LinkedIn (bez náhledového obrázku) */
  thumbSrc: string | null;
  kind: "email" | "linkedin" | "pdf";
  primaryLabel: string;
};

export const MARKETING_GALLERY_ITEMS: MarketingGalleryItem[] = [
  {
    id: "email-banner",
    title: MARKETING_EMAIL_BANNER.title,
    meta: `${MARKETING_EMAIL_BANNER.format} · e-mail`,
    fileUrl: MARKETING_EMAIL_BANNER.fileUrl,
    thumbSrc: MARKETING_EMAIL_BANNER.imageUrl,
    kind: "email",
    primaryLabel: "Otevřít obrázek",
  },
  {
    id: "linkedin",
    title: MARKETING_LINKEDIN.title,
    meta: "Google Drive",
    fileUrl: MARKETING_LINKEDIN.fileUrl,
    thumbSrc: null,
    kind: "linkedin",
    primaryLabel: "Otevřít / stáhnout",
  },
  ...MARKETING_LEAFLETS.map((L) => ({
    id: L.id,
    title: L.title,
    meta: L.format,
    fileUrl: L.fileUrl,
    thumbSrc: L.previewSrc,
    kind: "pdf" as const,
    primaryLabel: "Otevřít PDF",
  })),
];
