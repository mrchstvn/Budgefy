import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { profileSchema } from '@/lib/validations';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const user = await db
        .select({ id: users.id, name: users.name, email: users.email, currency: users.currency, timezone: users.timezone, createdAt: users.createdAt })
        .from(users).where(eq(users.id, session.user.id)).limit(1).then((r) => r[0]);
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    return NextResponse.json({ user });
}

export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data', fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    const [updated] = await db.update(users)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(users.id, session.user.id))
        .returning({ id: users.id, name: users.name, email: users.email, currency: users.currency, timezone: users.timezone });
    return NextResponse.json({ user: updated, message: 'Profile updated!' });
}

