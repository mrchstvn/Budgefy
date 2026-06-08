// ============================================================
// AUTH LAYOUT — src/app/(auth)/layout.tsx
// ============================================================
// The (auth) folder groups the login and register pages together.
// The parentheses mean it's a "Route Group" — it organizes files
// but does NOT affect the URL (so /login works, not /(auth)/login).
//
// This layout centers the auth forms on screen.
// ============================================================

import { inter } from "@/components/fonts/fonts";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Full screen height, centered content both vertically and horizontally
    <div
      className={`${inter.className} min-h-screen flex items-center justify-center bg-gray-50 px-4`}
    >
      <div className="w-full max-w-md">
        {/* App name at the top of every auth page */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-700">Budgefy</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your personal budget tracker
          </p>
        </div>

        {/* The actual login or register form goes here */}
        {children}
      </div>
    </div>
  );
}
