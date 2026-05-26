import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { debts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { debtSchema } from '@/lib/validations';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const userDebts = await db.select().from(debts)
        .where(eq(debts.userId, session.user.id))
        .orderBy(desc(debts.createdAt));
    return NextResponse.json({ debts: userDebts });
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const body = await request.json();
    const parsed = debtSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data', fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    const { personName, description, originalAmount, currency, debt_type, dueDate } = parsed.data;
    const [newDebt] = await db.insert(debts).values({
        userId: session.user.id, personName, description, originalAmount,
        currency, type: debt_type, dueDate: dueDate ? new Date(dueDate) : null,
        paidAmount: '0', status: 'pending',
    }).returning();
    return NextResponse.json({ debt: newDebt, message: 'Debt record added!' }, { status: 201 });
}

