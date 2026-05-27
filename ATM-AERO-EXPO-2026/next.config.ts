import type { NextConfig } from "next";
import path from "path";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // Bez agresivní cache při navigaci – jinak /ops může dlouho ukazovat staré RSC/UI po deployi.
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    // Po novém buildu odstranit staré precache z předchozí verze SW (méně „zaseknutých“ starých /ops).
    cleanupOutdatedCaches: true,
    /**
     * Ve výchozím stavu next-pwa přidává do precache i /_next/static/chunks/*.js.
     * Precache má přednost před runtime „NetworkOnly“ → uživatelé mohli měsíce vidět starý OpsChecklists (jen 3 záložky).
     * Chunky neprecachovat – vždy se stáhnou aktuální z deploye (offline prezentace zůstává v public + runtime cache).
     */
    exclude: [
      /\/_next\/static\/.*(?<!\.p)\.woff2/,
      /\.map$/,
      /^manifest.*\.js$/,
      ({ asset }) => {
        const n = String((asset as { name?: string }).name ?? "");
        return n.includes("static/chunks") && n.endsWith(".js");
      },
    ],
    runtimeCaching: [
      {
        // Operativa – vždy síť (žádné zastaralé UI po deployi; pathname + query např. ?_rsc=)
        urlPattern: ({ url }: { url: URL }) =>
          url.pathname === "/ops" || url.pathname.startsWith("/ops/"),
        handler: "NetworkOnly",
      },
      {
        // Chunk stránky /ops – vždy síť (žádný starý shell)
        urlPattern: /\/_next\/static\/chunks\/app\/ops\//i,
        handler: "NetworkOnly",
      },
      {
        // Všechny webpack/turbopack chunky – NetworkOnly (žádný starý OpsChecklists po deployi).
        urlPattern: /\/_next\/static\/chunks\//i,
        handler: "NetworkOnly",
      },
      {
        // Google OAuth – nikdy necachovat
        urlPattern: /^https:\/\/accounts\.google\.com\/.*/i,
        handler: "NetworkOnly",
      },
      {
        // API routes – Network First s fallback na cache
        urlPattern: /^\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "aero-expo-api-cache",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 hodin
          },
          networkTimeoutSeconds: 5,
        },
      },
      {
        // Next.js statické assety – Cache First
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-assets",
          expiration: {
            maxEntries: 128,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dní
          },
        },
      },
      {
        // Obrázky a další statické soubory
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|webp|woff2?)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-media",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dní
          },
        },
      },
      {
        // HTML stránky – Network First (vždy čerstvá verze, pokud je síť)
        urlPattern: /^\/(?!api\/).*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "aero-expo-pages",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hodin
          },
          networkTimeoutSeconds: 5,
        },
      },
    ],
  },
});

/** Stejná cesta jako turbopack.root – jinak Vercel hlásí konflikt s outputFileTracingRoot. */
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  async headers() {
    const opsCache = [
      {
        key: "Cache-Control",
        value: "private, no-cache, no-store, max-age=0, must-revalidate",
      },
    ] as const;
    return [
      // Hlavní prezentace – bez CDN cache HTML, ať se po deployi hned projeví změny slidů
      { source: "/", headers: [...opsCache] },
      { source: "/ops", headers: [...opsCache] },
      { source: "/ops/:path*", headers: [...opsCache] },
    ];
  },
};

export default withPWA(nextConfig);
