'use server'

import { db } from '@/lib/db';
import { stores } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { nanoid } from 'nanoid';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createStore(prevState: any, formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const name = formData.get('name') as string;
    const slug = (formData.get('slug') as string).toLowerCase().replace(/[^a-z0-9-]/g, '');
    const whatsappNumber = formData.get('whatsappNumber') as string;

    const existingStore = await db.query.stores.findFirst({ where: eq(stores.slug, slug) });
    if (existingStore) return { error: "Slug sudah dipakai." };

    // Grant 30 days PRO trial automatically on first store creation
    const proExpiresAt = new Date();
    proExpiresAt.setDate(proExpiresAt.getDate() + 30);

    await db.insert(stores).values({
        id: `STORE-${nanoid(7)}`,
        userId: session.user.id,
        name, slug, whatsappNumber,
        subscriptionTier: 'PRO',
        proExpiresAt: proExpiresAt
    });

    revalidatePath('/admin', 'layout');

    redirect('/admin');
}

export async function updateStoreSettings(storeId: string, formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const themeColor = formData.get('themeColor') as string;
    const theme = formData.get('theme') as string;
    const bannerUrl = formData.get('bannerUrl') as string;
    const welcomeMessage = formData.get('welcomeMessage') as string;

    await db.update(stores).set({
        theme,
        themeColor,
        bannerUrl,
        welcomeMessage
    }).where(eq(stores.id, storeId));

    revalidatePath('/admin/settings');
    revalidatePath('/[slug]', 'page'); // store page cache

    return { success: true };
}

export async function toggleReferral(storeId: string, isActive: boolean) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    await db.update(stores).set({ isReferralActive: isActive }).where(eq(stores.id, storeId));

    revalidatePath('/admin/referral');
    revalidatePath('/[slug]', 'page');

    return { success: true };
}
