// src/app/api/budgets/route.ts
// GET  → Fetch budgets WITH spending calculated from transactions
// POST → Create a new budget

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { budgets, transactions, categories } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { budgetSchema } from '@/lib/validations';

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()));

    const userBudgets = await db
        .select({
            id: budgets.id,
            name: budgets.name,
            limitAmount: budgets.limitAmount,
            currency: budgets.currency,
            month: budgets.month,
            year: budgets.year,
            isActive: budgets.isActive,
            categoryId: categories.id,
            categoryName: categories.name,
            categoryIcon: categories.icon,
            categoryColor: categories.color,
        })
        .from(budgets)
        .leftJoin(categories, eq(budgets.categoryId, categories.id))
        .where(and(
            eq(budgets.userId, session.user.id),
            eq(budgets.month, month),
            eq(budgets.year, year),
        ));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // For each budget, calculate how much has been spent.
    // Promise.all() runs ALL queries simultaneously (in parallel).
    // Much faster than running them one at a time (in series).
    const budgetsWithSpending = await Promise.all(
        userBudgets.map(async (budget) => {
            const spendingResult = await db
                .select({
                    // COALESCE(SUM(...), 0): SUM returns NULL when no rows match.
                    // COALESCE replaces NULL with 0.
                    totalSpent: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
                })
                .from(transactions)
                .where(and(
                    eq(transactions.userId, userId),
                    eq(transactions.type, 'expense'),
                    budget.categoryId
                        ? eq(transactions.categoryId, budget.categoryId)
                        : sql`true`, // If no category, count ALL expenses
                    gte(transactions.date, startDate),
                    lte(transactions.date, endDate),
                ))
                .then((rows) => rows[0]);

            const spent = parseFloat(spendingResult?.totalSpent ?? '0');
            const limit = parseFloat(budget.limitAmount);
            const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;

            return {
                ...budget,
                spent: spent.toFixed(2),
                percentage,
                remaining: Math.max(0, limit - spent).toFixed(2),
                isOverBudget: spent > limit,
            };
        })
    );

    return NextResponse.json({ budgets: budgetsWithSpending });
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = budgetSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid data', fieldErrors: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const [newBudget] = await db
        .insert(budgets)
        .values({
            userId: session.user.id,
            ...parsed.data,
            categoryId: parsed.data.categoryId || null,
        })
        .returning();

    return NextResponse.json({ budget: newBudget, message: 'Budget created!' }, { status: 201 });
}

