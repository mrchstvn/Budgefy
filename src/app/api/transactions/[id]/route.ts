// src/app/api/transactions/[id]/route.ts
// PUT    → Update one specific transaction
// DELETE → Delete one specific transaction
//
// [id] in the folder name = dynamic URL segment.
// /api/transactions/abc-123 → params.id = 'abc-123'

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { transactionSchema } from '@/lib/validations';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // In Next.js 15, params is a Promise. Always await it.
    const { id } = await params;

    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid data', fieldErrors: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    // Update WHERE id matches AND userId matches.
    // The second condition is CRITICAL SECURITY:
    // Even if someone knows another user's transaction ID,
    // they cannot edit it — their userId won't match.
    const [updated] = await db
        .update(transactions)
        .set({
            ...parsed.data,
            date: new Date(parsed.data.date),
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(transactions.id, id),
                eq(transactions.userId, session.user.id) // SECURITY: must own it
            )
        )
        .returning();

    if (!updated) {
        return NextResponse.json(
            { error: 'Transaction not found or you do not have permission.' },
            { status: 404 }
        );
    }

    return NextResponse.json({ transaction: updated, message: 'Transaction updated!' });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    const [deleted] = await db
        .delete(transactions)
        .where(
            and(
                eq(transactions.id, id),
                eq(transactions.userId, session.user.id)
            )
        )
        .returning({ id: transactions.id });

    if (!deleted) {
        return NextResponse.json({ error: 'Transaction not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction deleted.' });
}

