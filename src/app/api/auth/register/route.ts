// ============================================================
// REGISTER API — src/app/api/auth/register/route.ts
// ============================================================
// This handles the server side of user registration.
// When a user fills out the signup form and clicks "Register",
// the form sends a POST request to /api/auth/register.
// This file processes that request.
// ============================================================
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, users, wallets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { registerRatelimit } from "@/lib/rate-limit";
import { DEFAULT_CATEGORIES } from "@/lib/db/seed-categories";

// Exporting a function named 'POST' makes this handle HTTP POST requests.
// Next.js automatically routes POST /api/auth/register here.
// No router.post() needed — the export name IS the routing.

// REGISTER PROCESS FLOW:
// Step 1 → Browser sends name, email, password to this route

export async function POST(request: Request) {
  try {
    // Step 2 → Rate limiter checks
    //  (Get the IP address of whoever is sending this request.)
    //  (If they've sent too many requests recently, block them.)
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { success: withinLimit } = await registerRatelimit.limit(ip);

    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before trying again." },
        { status: 429 }, // 429 = "Too Many Requests" HTTP code
      );
    }

    // Step 3 → Parse request body
    // await request.json() reads the request body as JSON.
    // 'await' is needed because reading the body is asynchronous —
    // it waits for all the data to arrive before processing.
    const body = await request.json();

    // Step 4 → Zod validates the data format
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

    // Step 5 → Check if email is already taken
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

    // Step 6 → Hash (scramble) the password with bcrypt
    // bcrypt.hash(plainPassword, costFactor)
    // Cost factor 12 means bcrypt runs 2^12 = 4,096 iterations.
    // Higher = more secure but slower.
    // 12 is the industry-standard balance between security and speed.
    const passwordHash = await bcrypt.hash(password, 12);

    // Step 7 → Save the new user to the database
    // .returning() gives back the created row so we can confirm.
    // We only return id, name, email — NEVER the password hash.
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(), // Always store emails in lowercase
        password: passwordHash,
      })
      .returning({ id: users.id }); // Give back just the new user's ID

    // Step 8 → Seed default categories for this new user
    // Add all the pre-built categories (Food, Transport, etc.)
    // so the user has something to work with right away.
    await db.insert(categories).values(
      DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        userId: newUser.id, // Link each category to this new user
      })),
    );

    // Step 9 → Create a default wallet for the new user
    // Every new user gets one wallet to start with.
    await db.insert(wallets).values({
      userId: newUser.id,
      name: "Main Wallet",
      currency: "PHP",
      icon: "wallet",
      color: "#1a6358",
    });

    // Step 10 → Return success to the browser
    return NextResponse.json(
      {
        message: "Account created successfully! Please log in.",
        user: { id: newUser.id },
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
