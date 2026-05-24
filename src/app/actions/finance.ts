'use server'

import { db } from '@/lib/db';
import { expenses, stores, orders } from '@/lib/db/schema';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';

export async function addExpense(prevState: any, formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const store = await db.query.stores.findFirst({ where: eq(stores.userId, session.user.id) });
    if (!store) return { error: "Store not found" };

    // PRO Check
    const isProExpired = store.proExpiresAt ? new Date() > store.proExpiresAt : false;
    if (store.subscriptionTier === 'FREE' || isProExpired) {
        return { error: "Fitur Pembukuan hanya untuk pengguna PRO." };
    }

    const category = formData.get('category') as string;
    const amount = Number(formData.get('amount'));
    const description = formData.get('description') as string;
    const dateRaw = formData.get('date') as string;

    if (!category || !amount || !dateRaw) {
        return { error: "Data tidak lengkap." };
    }

    await db.insert(expenses).values({
        id: `EXP-${nanoid(8)}`,
        storeId: store.id,
        category,
        amount,
        description,
        date: new Date(dateRaw),
    });

    revalidatePath('/admin/pembukuan');
    return { success: true };
}

export async function deleteExpense(id: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return;

    const store = await db.query.stores.findFirst({ where: eq(stores.userId, session.user.id) });
    if (!store) return;

    await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.storeId, store.id)));
    revalidatePath('/admin/pembukuan');
}
