// src/lib/auth.ts
// The brain of the entire login system.
// Configures NextAuth: how to verify passwords, what to store in sessions.

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db/index';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validations';

// NextAuth() returns 4 things we export and use throughout the app:
// handlers → the GET/POST handler for /api/auth/[...nextauth]
// signIn   → call this to log a user in (used in login page)
// signOut  → call this to log a user out (used in sidebar)
// auth     → call this on the SERVER to check if someone is logged in
export const { handlers, signIn, signOut, auth } = NextAuth({

    // ── PROVIDERS ─────────────────────────────────────────────
    // A 'provider' is a login method.
    // 'Credentials' = email + password (what we use).
    // You could add Google, GitHub, Facebook here as well.
    providers: [
        Credentials({
            // 'authorize' runs every time someone tries to log in.
            // Return a user object = login succeeds.
            // Return null = login fails.
            authorize: async (credentials) => {

                // STEP 1: Validate the data format with Zod.
                // Even before touching the database, make sure
                // the email looks like an email and password isn't empty.
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) return null;

                const { email, password } = parsed.data;

                // STEP 2: Look up the user in the database by email.
                // We convert email to lowercase to match how we stored it.
                const user = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email.toLowerCase()))
                    .limit(1)  // Stop after finding the first match
                    .then((rows) => rows[0]); // Get the first row

                // STEP 3: If no user found with that email, reject.
                // We return null (not an error message) so attackers
                // can't tell whether the email exists or not.
                if (!user) return null;

                // STEP 4: Check if the password matches.
                // bcrypt.compare() scrambles the typed password
                // the same way and checks if it matches the stored hash.
                // It NEVER unscrambles the hash.
                const passwordMatches = await bcrypt.compare(
                    password,
                    user.passwordHash
                );
                if (!passwordMatches) return null;

                // STEP 5: Password is correct! Return user data.
                // This object gets stored in the session token.
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    currency: user.currency,
                };
            },
        }),
    ],

    // ── SESSION SETTINGS ──────────────────────────────────────
    session: {
        strategy: 'jwt',
        // Store sessions as JWT tokens (not in a database table).
        // JWT = JSON Web Token. Like a digital wristband.
        // The token is stored in an HTTP-only cookie in the browser.

        maxAge: 30 * 24 * 60 * 60,
        // 30 days * 24 hours * 60 minutes * 60 seconds = 2,592,000 seconds.
        // After this many seconds, the session expires automatically.
    },

    // ── CALLBACKS ─────────────────────────────────────────────
    // Callbacks are functions that run at specific points in the auth flow.
    callbacks: {

        // jwt() runs when CREATING or UPDATING the JWT token.
        // We add extra info (userId, currency) to the token here.
        // Without this, the token only has: name, email, picture.
        jwt({ token, user }) {
            if (user) {
                // 'user' only exists right after login.
                // Copy user data into the token.
                token.id = user.id as string;
                token.currency = (user as { currency?: string }).currency ?? 'PHP';
            }
            return token; // Always return the token
        },

        // session() runs when the FRONTEND checks 'who is logged in?'
        // It transfers info from the token into the session object.
        // Pages read from session, so we put everything we need here.
        session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                (session.user as { currency?: string }).currency =
                    token.currency as string;
            }
            return session; // Always return the session
        },
    },

    // ── CUSTOM PAGES ──────────────────────────────────────────
    // Tell NextAuth where our custom login page is.
    // Without this, NextAuth shows its own default (ugly) login page.
    pages: {
        signIn: '/auth/login',
        error: '/auth/login', // Show errors on the login page too
    },
});
