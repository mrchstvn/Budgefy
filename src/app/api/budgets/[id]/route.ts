import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { budgets } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { budgetSchema } from '@/lib/validations';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const parsed = budgetSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data', fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    const [updated] = await db.update(budgets).set({ ...parsed.data, updatedAt: new Date() })
        .where(and(eq(budgets.id, id), eq(budgets.userId, session.user.id))).returning();
    if (!updated) return NextResponse.json({ error: 'Budget not found.' }, { status: 404 });
    return NextResponse.json({ budget: updated, message: 'Budget updated!' });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { id } = await params;
    const [deleted] = await db.delete(budgets)
        .where(and(eq(budgets.id, id), eq(budgets.userId, session.user.id)))
        .returning({ id: budgets.id });
    if (!deleted) return NextResponse.json({ error: 'Budget not found.' }, { status: 404 });
    return NextResponse.json({ message: 'Budget deleted.' });
}

