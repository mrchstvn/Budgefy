// src/app/api/auth/register/route.ts
// Handles POST /api/auth/register — creates a new user account.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { registerRatelimit, getClientIp } from "@/lib/rate-limit";

// Exporting a function named 'POST' makes this handle HTTP POST requests.
// Next.js automatically routes POST /api/auth/register here.
// No router.post() needed — the export name IS the routing.
export async function POST(request: Request) {
  try {
    // ── STEP 1: RATE LIMIT CHECK ──────────────────────────────
    const ip = getClientIp(request);
    const {
      success: rateLimitOk,
      limit,
      remaining,
    } = await registerRatelimit.limit(ip);

    if (!rateLimitOk) {
      return NextResponse.json(
        {
          error:
            "Too many registration attempts. Please wait before trying again.",
        },
        {
          status: 429,
          // HTTP 429 = 'Too Many Requests' — a standard status code.
          headers: {
            // Send limit info in headers so clients can see their status.
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
          },
        },
      );
    }

    // ── STEP 2: PARSE REQUEST BODY ────────────────────────────
    // await request.json() reads the request body as JSON.
    // 'await' is needed because reading the body is asynchronous —
    // it waits for all the data to arrive before processing.
    const body = await request.json();

    // ── STEP 3: VALIDATE WITH ZOD ────────────────────────────
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid data",
          // flatten().fieldErrors turns Zod errors into:
          // { email: ['Invalid email'], password: ['Too short'] }
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }, // HTTP 400 = 'Bad Request'
      );
    }

    const { name, email, password } = parsed.data;

    // ── STEP 4: CHECK IF EMAIL ALREADY EXISTS ─────────────────
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then((rows) => rows[0]);

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }, // HTTP 409 = 'Conflict' (resource already exists)
      );
    }

    // ── STEP 5: HASH THE PASSWORD ─────────────────────────────
    // bcrypt.hash(plainPassword, costFactor)
    // Cost factor 12 means bcrypt runs 2^12 = 4,096 iterations.
    // Higher = more secure but slower.
    // 12 is the industry-standard balance between security and speed.
    const passwordHash = await bcrypt.hash(password, 12);

    // ── STEP 6: SAVE TO DATABASE ──────────────────────────────
    // .returning() gives back the created row so we can confirm.
    // We only return id, name, email — NEVER the password hash.
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        currency: "PHP",
        timezone: "Asia/Manila",
      })
      .returning({ id: users.id, name: users.name, email: users.email });

    // ── STEP 7: RETURN SUCCESS ────────────────────────────────
    return NextResponse.json(
      {
        message: "Account created successfully! Please log in.",
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
      },
      { status: 201 }, // HTTP 201 = 'Created' (something new was made)
    );
  } catch (error) {
    // If anything unexpected goes wrong, return a generic error.
    // We log the real error on the server but hide it from the user.
    console.error("[REGISTER] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }, // HTTP 500 = 'Internal Server Error'
    );
  }
}
