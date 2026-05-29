
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
import {
    LayoutDashboard, // Dashboard home icon
    ArrowLeftRight,  // Transactions icon
    Target,          // Budgets icon
    CreditCard,      // Debt tracker icon
    BarChart3,       // Reports icon
    Settings,        // Settings icon
    LogOut,          // Logout icon
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight, exact: false },
    { href: '/dashboard/budgets', label: 'Budgets', icon: Target, exact: false },
    { href: '/dashboard/debts', label: 'Debt Tracker', icon: CreditCard, exact: false },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart3, exact: false },
];

const settingsLinks = [
    { href: '/dashboard/settings/app', label: 'App Settings', icon: Settings, exact: false },
    { href: '/dashboard/settings/profile', label: 'Profile', icon: Settings, exact: false },
];

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
        <aside className='w-56 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0'>

            {/* App brand / logo at the top */}
            <div className='p-4 border-b border-gray-100'>
                <Link href='/dashboard' className='flex items-center gap-2'>
                    <span className='text-lg'>💰</span>
                    <span className='font-semibold text-gray-900 text-sm'>BudgetApp</span>
                </Link>
            </div>

            {/* Navigation links */}
            <nav className='flex-1 p-3 space-y-0.5 overflow-y-auto'>

                {/* Main navigation items */}
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href, link.exact);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                // Base classes applied to ALL nav links
                                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                                // Conditional classes based on active state
                                active
                                    ? 'bg-gray-900 text-white font-medium'    // Active: dark
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' // Inactive
                            )}
                        >
                            <Icon className='h-4 w-4 shrink-0' />
                            {link.label}
                        </Link>
                    );
                })}

                {/* Settings section separator */}
                <div className='pt-3 pb-1'>
                    <p className='px-3 text-xs font-medium text-gray-400 uppercase tracking-wider'>
                        Settings
                    </p>
                </div>

                {/* Settings links */}
                {settingsLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href, link.exact);
                    return (
                        <Link key={link.href} href={link.href}
                            className={cn(
                                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                                active ? 'bg-gray-900 text-white font-medium'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            )}
                        >
                            <Icon className='h-4 w-4 shrink-0' />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User info and logout at the bottom of the sidebar */}
            <div className='p-3 border-t border-gray-100'>
                <div className='px-3 py-2 mb-1'>
                    {/* truncate: cuts off long text with '...' instead of wrapping */}
                    <p className='text-sm font-medium text-gray-900 truncate'>
                        {user.name ?? 'User'}
                        {/* ?? is the nullish coalescing operator: */}
                        {/* if user.name is null or undefined, show 'User' */}
                    </p>
                    <p className='text-xs text-gray-500 truncate'>{user.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className='w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors'
                >
                    <LogOut className='h-4 w-4 shrink-0' />
                    Sign out
                </button>
            </div>
        </aside>
    );
}

