"use client";
// 'use client' is required because this component:
// 1. Uses usePathname() — a hook that reads the current URL
// 2. Has onClick event handlers (logout button)
// Both of these only work in the browser, not on the server.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BadgeDollarSign,
  BarChart3,
  Settings,
} from "lucide-react";
const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: ArrowLeftRight,
  },
  {
    href: "/budget",
    label: "Budget",
    icon: PieChart,
  },
  {
    href: "/debt-tracker",
    label: "Debt Tracker",
    icon: BadgeDollarSign,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function SideNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navLinks.map((navLink) => {
        // isActive = true if we're currently on this page
        const isActive =
          pathname === navLink.href || pathname.startsWith(navLink.href + "/");
        const Icon = navLink.icon;
        return (
          <Link
            key={navLink.label}
            href={navLink.href}
            className={cn(
              // Base styles for all nav items
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              // Active styles (dark green background)
              isActive
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {navLink.label}
          </Link>
        );
      })}
    </>
  );
}
