// src/lib/ratelimit.ts
// Rate limiting to prevent brute-force attacks on login and register.
// Uses Upstash Redis to count attempts per IP address.

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ── LOGIN RATE LIMITER ────────────────────────────────────────
// Allow a maximum of 5 login attempts per 15 minutes per IP address.
// After 5 failures, the IP must wait 15 minutes before trying again.
export const loginRatelimit = new Ratelimit({
    // Redis.fromEnv() reads UPSTASH_REDIS_REST_URL and
    // UPSTASH_REDIS_REST_TOKEN from your .env.local file automatically.
    redis: Redis.fromEnv(),

    // slidingWindow(limit, duration):
    // 'sliding window' means the 15-minute window MOVES with time.
    // (Not a fixed 15-minute clock block that resets on the hour.)
    // If you try at 2:00, 2:05, 2:10, 2:13, 2:14 — that's 5 attempts.
    // Your next attempt at 2:15 would work (the 2:00 attempt slid out).
    limiter: Ratelimit.slidingWindow(5, '15 m'),

    // prefix: a namespace for keys in Redis.
    // Prevents clashes between login and register rate limiters.
    prefix: 'budget_login',
});

// ── REGISTER RATE LIMITER ─────────────────────────────────────
// Less strict: 3 registrations per hour per IP.
// People only register once normally, but we still prevent spam accounts.
export const registerRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'budget_register',
});

// ── getClientIp() ────────────────────────────────────────────
// Extracts the real IP address from the request.
// IP address = the numeric 'home address' of the device making the request.
// We use the IP to identify WHO is making repeated attempts.
export function getClientIp(request: Request): string {
    // Some networks (cloud servers, proxies) put the real IP
    // in a special header called x-forwarded-for.
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwarded) {
        // x-forwarded-for can contain multiple IPs: '1.2.3.4, 5.6.7.8'
        // The first one is the actual client's IP.
        return forwarded.split(',')[0].trim();
    }
    if (realIp) return realIp;

    // Fallback — localhost IP during development
    return '127.0.0.1';
}
