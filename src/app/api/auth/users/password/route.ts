import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { changePasswordSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data', fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    const { currentPassword, newPassword } = parsed.data;
    const user = await db.select({ passwordHash: users.passwordHash })
        .from(users).where(eq(users.id, session.user.id)).limit(1).then((r) => r[0]);
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    const isCorrect = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCorrect) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    const newHash = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, session.user.id));
    return NextResponse.json({ message: 'Password changed successfully!' });
}

