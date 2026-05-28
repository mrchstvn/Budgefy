// src/app/layout.tsx
// The root layout — wraps EVERY page in the entire app.
// Think of it as the master template.

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Toaster } from "sonner";

// Metadata is the information that goes in the browser tab.
// Search engines also read this for SEO (Search Engine Optimization).
export const metadata: Metadata = {
  title: {
    // 'default': the title when no page overrides it
    default: "Budgefy",

    // 'template': when a page sets its own title,
    // it becomes: 'PageTitle | BudgetApp'.
    // %s is replaced with the page's title.
    template: "%s | Budgefy",
  },
  description: "Finances made easy.",
};

// RootLayout receives 'children' — whatever page is currently active.
// Every page's content will be placed where {children} is.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // ReactNode = any renderable React content
}) {
  return (
    // lang='en' helps screen readers and search engines
    // suppressHydrationWarning: suppresses a React warning that happens
    // when the server-rendered HTML differs slightly from the browser's.
    // Common with themes and extensions that modify the page.
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Providers wraps everything with React Query */}
        {/* This makes useQuery() and useMutation() work everywhere */}
        <Providers>
          {/* children = whichever page the user is currently on */}
          {children}

          {/* Toaster renders the toast notification container */}
          {/* It must be at the root level so it appears above everything */}
          {/* richColors = green for success, red for error automatically */}
          {/* position='top-right' = notifications appear top-right */}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
