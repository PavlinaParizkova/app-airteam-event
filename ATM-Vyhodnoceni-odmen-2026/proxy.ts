import { auth } from "./auth";
import { NextResponse } from "next/server";

const DEV_BYPASS =
  process.env.NODE_ENV === "development" &&
  process.env.DEV_AUTH_BYPASS === "true";

// Cesty, které vyžadují admin (`isAdmin`).
const ADMIN_ONLY_PREFIXES = [
  "/admin",
  "/api/admin",
];

// Cesty, které smí volat Vercel Cron (autorizace přes `Authorization: Bearer ${CRON_SECRET}`).
// Middleware je nechá projít — vlastní route handler ověří Bearer token.
const CRON_PREFIXES = ["/api/cron"];

// Veřejné cesty bez autentizace.
const PUBLIC_PREFIXES = [
  "/login",
  "/api/auth",
  "/_next",
  "/favicon",
];

export default auth((req) => {
  if (DEV_BYPASS) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Veřejné cesty
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Cron — autorizace v route handleru
  if (CRON_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Vyžadovat přihlášení
  const isLoggedIn = !!req.auth;
  if (!isLoggedIn) {
    // Pro API → 401, jinak redirect na /login
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  const isAdmin = req.auth?.user?.isAdmin === true;

  // Admin sekce — jen admin
  if (ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p)) && !isAdmin) {
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
