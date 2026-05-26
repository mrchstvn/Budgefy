import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()));
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const userId = session.user.id;

    // Run all 3 main queries at the same time using Promise.all()
    const [incomeResult, expenseResult, categoryBreakdown] = await Promise.all([
        db.select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
            .from(transactions)
            .where(and(eq(transactions.userId, userId), eq(transactions.type, 'income'), gte(transactions.date, startDate), lte(transactions.date, endDate)))
            .then((r) => r[0]),
        db.select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
            .from(transactions)
            .where(and(eq(transactions.userId, userId), eq(transactions.type, 'expense'), gte(transactions.date, startDate), lte(transactions.date, endDate)))
            .then((r) => r[0]),
        db.select({
            categoryId: categories.id,
            categoryName: categories.name,
            categoryIcon: categories.icon,
            categoryColor: categories.color,
            total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
            count: sql<number>`COUNT(${transactions.id})`,
        })
            .from(transactions)
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .where(and(eq(transactions.userId, userId), eq(transactions.type, 'expense'), gte(transactions.date, startDate), lte(transactions.date, endDate)))
            .groupBy(categories.id, categories.name, categories.icon, categories.color)
            .orderBy(sql`SUM(${transactions.amount}) DESC`),
    ]);

    // Build 6-month trend data
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
        const trendDate = new Date(year, month - 1 - i, 1);
        const trendStart = new Date(trendDate.getFullYear(), trendDate.getMonth(), 1);
        const trendEnd = new Date(trendDate.getFullYear(), trendDate.getMonth() + 1, 1);
        const [inc, exp] = await Promise.all([
            db.select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` }).from(transactions)
                .where(and(eq(transactions.userId, userId), eq(transactions.type, 'income'), gte(transactions.date, trendStart), lte(transactions.date, trendEnd)))
                .then((r) => r[0]),
            db.select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` }).from(transactions)
                .where(and(eq(transactions.userId, userId), eq(transactions.type, 'expense'), gte(transactions.date, trendStart), lte(transactions.date, trendEnd)))
                .then((r) => r[0]),
        ]);
        monthlyTrends.push({
            month: trendDate.getMonth() + 1,
            year: trendDate.getFullYear(),
            label: trendDate.toLocaleString('default', { month: 'short' }),
            income: parseFloat(inc?.total ?? '0'),
            expenses: parseFloat(exp?.total ?? '0'),
        });
    }

    const totalIncome = parseFloat(incomeResult?.total ?? '0');
    const totalExpenses = parseFloat(expenseResult?.total ?? '0');
    const netSavings = totalIncome - totalExpenses;

    return NextResponse.json({
        summary: {
            totalIncome: totalIncome.toFixed(2),
            totalExpenses: totalExpenses.toFixed(2),
            netSavings: netSavings.toFixed(2),
            savingsRate: totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0,
        },
        categoryBreakdown,
        monthlyTrends,
    });
}

