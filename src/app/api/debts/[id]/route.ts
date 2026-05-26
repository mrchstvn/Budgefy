import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { debts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateDebtSchema = z.object({
    personName: z.string().min(1).max(100).optional(),
    description: z.string().min(1).max(255).optional(),
    paidAmount: z.string().optional(),
    status: z.enum(['pending', 'partial', 'paid']).optional(),
    dueDate: z.string().optional().nullable(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const parsed = updateDebtSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    // Find the current debt to calculate the new status
    const debtRecord = await db.select().from(debts)
        .where(and(eq(debts.id, id), eq(debts.userId, session.user.id)))
        .limit(1).then((r) => r[0]);
    if (!debtRecord) return NextResponse.json({ error: 'Debt not found.' }, { status: 404 });

    // Auto-calculate status from paidAmount
    const paidAmount = parsed.data.paidAmount ? parseFloat(parsed.data.paidAmount) : parseFloat(debtRecord.paidAmount);
    const originalAmount = parseFloat(debtRecord.originalAmount);
    let status: 'pending' | 'partial' | 'paid' =
        paidAmount >= originalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';

    const [updated] = await db.update(debts)
        .set({ ...parsed.data, status, dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null, updatedAt: new Date() })
        .where(and(eq(debts.id, id), eq(debts.userId, session.user.id)))
        .returning();
    return NextResponse.json({ debt: updated, message: 'Debt updated!' });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { id } = await params;
    const [deleted] = await db.delete(debts)
        .where(and(eq(debts.id, id), eq(debts.userId, session.user.id)))
        .returning({ id: debts.id });
    if (!deleted) return NextResponse.json({ error: 'Debt not found.' }, { status: 404 });
    return NextResponse.json({ message: 'Debt deleted.' });
}

