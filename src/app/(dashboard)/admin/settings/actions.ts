"use server";

import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateStoreTheme(storeId: string, theme: string) {
    try {
        await db.update(stores).set({ theme }).where(eq(stores.id, storeId));
        revalidatePath("/", "layout");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
