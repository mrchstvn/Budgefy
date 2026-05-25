// src/app/api/auth/[...nextauth]/route.ts
// This is NextAuth's catch-all route handler.
// The [...nextauth] folder name means it catches ALL routes
// starting with /api/auth/ — like a wildcard.
//
// NextAuth automatically handles these URLs for us:
//   GET  /api/auth/session    → returns who is currently logged in
//   POST /api/auth/signin     → processes a login attempt
//   POST /api/auth/signout    → processes a logout
//   GET  /api/auth/csrf       → provides a security token
//
// We don't write any logic here — NextAuth handles it all.
// We just export the handlers from our auth.ts config.

import { handlers } from "@/lib/auth";

// Export GET and POST from the handlers object.
// This is all you need — NextAuth does the rest.
export const { GET, POST } = handlers;
