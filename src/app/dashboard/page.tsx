// src/app/dashboard/page.tsx
// The overview dashboard — runs on the SERVER.
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactions, budgets, debts } from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
    return (
        <div>
            Hello from dashboard
        </div>
    )
}

