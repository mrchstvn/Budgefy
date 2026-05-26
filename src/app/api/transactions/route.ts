// src/app/api/transactions/route.ts
// GET  → Fetch transactions (with optional filters)
// POST → Create a new transaction

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { transactionSchema } from '@/lib/validations';

// ── GET ───────────────────────────────────────────────────────
export async function GET(request: Request) {
    // AUTH CHECK — every route starts with this
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Read filter parameters from the URL query string.
    // URL example: /api/transactions?month=1&year=2025&type=expense
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const type = searchParams.get('type') as 'income' | 'expense' | null;

    // Build the WHERE conditions array.
    // We always start with: only this user's data.
    const conditions = [eq(transactions.userId, session.user.id)];

    if (month && year) {
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        // First millisecond of the month
        const startDate = new Date(yearNum, monthNum - 1, 1);
        // First millisecond of the NEXT month (exclusive upper bound)
        const endDate = new Date(yearNum, monthNum, 1);
        conditions.push(gte(transactions.date, startDate));
        conditions.push(lte(transactions.date, endDate));
    }

    if (type && (type === 'income' || type === 'expense')) {
        conditions.push(eq(transactions.type, type));
    }

    const results = await db
        .select({
            // Only select the columns we actually need
            id: transactions.id,
            type: transactions.type,
            amount: transactions.amount,
            currency: transactions.currency,
            description: transactions.description,
            date: transactions.date,
            notes: transactions.notes,
            createdAt: transactions.createdAt,
            // From the JOIN: category info
            categoryId: categories.id,
            categoryName: categories.name,
            categoryIcon: categories.icon,
            categoryColor: categories.color,
        })
        .from(transactions)
        // LEFT JOIN: include transactions even if they have no category
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(and(...conditions)) // and() combines all conditions with AND
        .orderBy(desc(transactions.date)); // newest first

    return NextResponse.json({ transactions: results });
}

// ── POST ──────────────────────────────────────────────────────
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid data', fieldErrors: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const { type, amount, description, categoryId, currency, date, notes } =
        parsed.data;

    const [newTransaction] = await db
        .insert(transactions)
        .values({
            userId: session.user.id,
            type,
            amount,
            description,
            categoryId: categoryId || null,
            currency,
            date: new Date(date), // Convert string to Date object
            notes: notes || null,
        })
        .returning();

    return NextResponse.json(
        { transaction: newTransaction, message: 'Transaction added!' },
        { status: 201 }
    );
}

