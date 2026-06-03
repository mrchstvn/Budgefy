'use client';
// 'use client' is required because this component:
// 1. Uses usePathname() — a hook that reads the current URL
// 2. Has onClick event handlers (logout button)
// Both of these only work in the browser, not on the server.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from '@/lib/utils';
import Image from 'next/image';
const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: "/dashboard_icon.svg", exact: true },
    { href: '/dashboard/transactions', label: 'Transactions', icon: "/transaction_icon.svg", exact: false },
    { href: '/dashboard/budgets', label: 'Budgets', icon: "/budget_icon.svg", exact: false },
    { href: '/dashboard/debts', label: 'Debt Tracker', icon: "/debt_icon.svg", exact: false },
    { href: '/dashboard/reports', label: 'Reports', icon: "/reports_icon.svg", exact: false },
    { href: '/dashboard/settings', label: 'Settings', icon: "/settings_icon.svg", exact: false },
];

export default function SideNavLinks() {
    const pathname = usePathname();

    return (
        <>
            {navLinks.map((link) => {
                return (

                    <Link
                        key={link.label}
                        href={link.href}
                        className={cn(
                            "flex h-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:h-20 md:flex-none md:justify-center md:px-2 lg:h-15 lg:justify-start lg:px-3",
                            {
                                "bg-sky-100 text-blue-600": pathname === link.href,
                            },
                        )}
                    >
                        <div className="md:flex md:flex-col md:items-center md:justify-center md:p-2 lg:flex-row lg:gap-2">
                            <Image
                                src={link.icon}
                                alt={link.label}
                                width={40}
                                height={40}
                                loading="eager"
                            />

                            <p className="hidden md:block md:text-sm lg:text-md">{link.label}</p>
                        </div>
                    </Link>
                )
            })
            }
        </>
    )
}