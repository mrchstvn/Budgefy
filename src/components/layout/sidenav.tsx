
// src/components/layout/sidebar.tsx
// The left navigation panel shown on all dashboard pages.

'use client';
// 'use client' is required because this component:
// 1. Uses usePathname() — a hook that reads the current URL
// 2. Has onClick event handlers (logout button)
// Both of these only work in the browser, not on the server.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { LogOutIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import Logo from '@/components/ui/logo';
import SideNavLinks from '../ui/side-nav-links';

// Type definition for the user prop this component receives.
// '?' means the field is optional (might not exist).
// 'null' means it could also be null (not just undefined).
interface SidebarUser {
    name?: string | null;
    email?: string | null;
}

interface SidebarProps {
    user: SidebarUser;
}

// ── NAV LINKS ARRAY ───────────────────────────────────────────
// Defining links as data (not hardcoded JSX) makes it easy
// to add new pages — just add one entry to this array.



export function DashboardSideNav({ user }: SidebarProps) {
    // usePathname() returns the current URL path.
    // Example: '/dashboard/transactions'
    const pathname = usePathname();

    // Determines whether a nav link should appear 'active' (highlighted).
    // exact: true  → only highlight if path matches EXACTLY
    // exact: false → highlight if path STARTS WITH the href
    const isActive = (href: string, exact: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    const handleLogout = async () => {
        try {
            // signOut from next-auth/react — destroys the JWT session cookie.
            // redirect: false = we handle the redirect ourselves.
            await signOut({ redirect: false });
            toast.success('Logged out successfully.');
            // Redirect to login page by changing the browser's URL.
            window.location.href = '/auth/login';
        } catch {
            toast.error('Failed to log out. Please try again.');
        }
    };

    return (
        // sticky top-0: sidebar stays in place as the right side scrolls
        // h-screen: full viewport height
        // flex-col: stack items vertically
        <div className="w-full">

            {/* App brand / logo at the top */}
            <Logo />

            <div>
                <hr className="hidden md:block md:border-t-2 md:w-[90%] md:mx-auto md:mb-5" />
            </div>

            {/* Navigation links */}
            <SideNavLinks />


        </div>
    );
}

