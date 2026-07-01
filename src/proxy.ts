// src/middleware.ts
// Runs BEFORE every page load in the app.
// Protects dashboard routes and redirects correctly.

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// auth() wraps our middleware function.
// It automatically reads the JWT cookie from every request
// and attaches the session to req.auth if valid.
export default auth((req: NextRequest & { auth?: unknown }) => {
  // req.auth is the session object if the user is logged in.
  // !! converts it to a boolean: !!undefined = false, !!{...} = true.
  const isLoggedIn = !!(req as { auth?: unknown }).auth;

  // pathname = the URL path of the request.
  // e.g., '/dashboard/transactions' or '/auth/login'
  const pathname = req.nextUrl.pathname;

  // ── DEFINE WHICH ROUTES NEED PROTECTION ───────────────────
  // Protected routes: only logged-in users can access these.
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/budget") ||
    pathname.startsWith("/debt-tracker") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings");

  // Auth routes: only make sense if NOT logged in.
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname === "/";

  // ── RULE 1: Not logged in + trying to go to dashboard ─────
  if (isProtectedRoute && !isLoggedIn) {
    // Build the login URL with the original destination saved.
    // Example: /auth/login?callbackUrl=/dashboard/transactions
    // After login, we redirect back to /dashboard/transactions.
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── RULE 2: Already logged in + trying to go to login page ─
  if (isAuthRoute && isLoggedIn) {
    // Skip the login page — they're already in.
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ── RULE 3: Everything else — let the request through ─────
  return NextResponse.next();
});

// ── MATCHER ──────────────────────────────────────────────────
// Tells Next.js WHICH requests to run this middleware on.
// Without this, middleware would run on EVERY request,
// including image files, CSS, JS — unnecessary and slow.
export const config = {
  matcher: [
    // Run on everything EXCEPT:
    // - api routes (they handle their own auth)
    // - _next/static (CSS, JS files)
    // - _next/image (image optimization)
    // - favicon.ico
    // - the home page ($) — public landing page
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
