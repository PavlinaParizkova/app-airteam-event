import { auth } from "./auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Veřejné cesty
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Nepřihlášený → přesměrovat na Google login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (pathname === "/ops" || pathname.startsWith("/ops/")) {
    const res = NextResponse.next();
    res.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, max-age=0, must-revalidate",
    );
    return res;
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
