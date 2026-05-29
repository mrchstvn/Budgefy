
// src/components/layout/header.tsx
// Top bar shown on all dashboard pages.
// Shows the current page title and user avatar.

'use client';

import { usePathname } from 'next/navigation';

interface HeaderUser {
    name?: string | null;
    email?: string | null;
}

interface HeaderProps {
    user: HeaderUser;
}

// Map URL paths to human-readable page titles.
// Record<string, string> is a TypeScript type for an object
// where every key is a string and every value is a string.
const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/transactions': 'Transactions',
    '/dashboard/budgets': 'Budgets',
    '/dashboard/debts': 'Debt Tracker',
    '/dashboard/reports': 'Reports',
    '/dashboard/settings/app': 'App Settings',
    '/dashboard/settings/profile': 'Profile Settings',
};

export function DashboardNavBar({ user }: HeaderProps) {
    const pathname = usePathname();

    // Look up the page title. ?? 'Dashboard' = default if not in the map.
    const pageTitle = pageTitles[pathname] ?? 'Dashboard';

    // Build initials from the full name.
    // 'Juan dela Cruz' → ['Juan', 'dela', 'Cruz'] → ['J', 'd', 'C']
    //   → 'JdC' → 'JDC' → 'JD' (slice first 2)
    const initials = (user.name ?? 'U')
        .split(' ')               // Split by spaces
        .map((word) => word[0])   // Take first letter of each word
        .join('')                 // Join into one string
        .toUpperCase()            // Make all uppercase
        .slice(0, 2);             // Keep only first 2 characters

    return (
        // sticky top-0 z-10: header sticks to the top as the page scrolls
        // z-10: appears above page content (z-index: 10)
        <header className='bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10'>
            <h1 className='text-base font-semibold text-gray-900'>{pageTitle}</h1>
            <div className='flex items-center gap-3'>
                {/* Initials avatar circle */}
                <div className='h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold'>
                    {initials}
                </div>
            </div>
        </header>
    );
}

