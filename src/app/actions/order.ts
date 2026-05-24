'use server'

import { db } from '@/lib/db';
import { orders, orderItems, stores } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createOrderAndGenerateWaLink(payload: any) {
    const store = await db.query.stores.findFirst({ where: eq(stores.id, payload.storeId) });
    if (!store) return { success: false, error: "Store not found" };

    const totalAmount = payload.cart.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
    const orderId = `ORD-${nanoid(7).toUpperCase()}`;

    // 1. Simpan Pesanan ke Database
    await db.insert(orders).values({
        id: orderId,
        storeId: payload.storeId,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        referrerPhone: payload.referrerPhone || null, // Iteration 5: Referral support
        deliveryType: payload.deliveryType,
        deliveryAddress: payload.deliveryAddress,
        notes: payload.notes,
        subtotal: totalAmount,
        totalAmount: totalAmount,
        status: 'PENDING',
    });

    const itemsToInsert = payload.cart.map((item: any) => ({
        id: `ITEM-${nanoid(7)}`,
        orderId,
        productId: item.productId,
        productName: item.productName,
        variantDetails: item.variantDetails,
        quantity: item.qty,
        priceAtPurchase: item.price,
        isPreorder: item.isPreorder,
        poEstimation: item.poEstimation
    }));
    await db.insert(orderItems).values(itemsToInsert);

    // 2. Buat Link WA
    const itemsList = payload.cart.map((i: any) => {
        const poText = i.isPreorder && i.poEstimation ? `\n   *(PO: ${i.poEstimation})*` : '';
        return `- ${i.qty}x ${i.productName} (Rp ${i.price})${poText}`;
    }).join('\n');

    const msg = `Halo *${store.name}*, saya ingin pesan:\n*ID:* ${orderId}\n\n${itemsList}\n\n*Total:* Rp ${totalAmount}\n\nNama: ${payload.customerName}\nKirim via: ${payload.deliveryType}`;

    revalidatePath('/admin/orders');

    return { success: true, waLink: `https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}` };
}

export async function updateOrderStatus(orderId: string, status: string) {
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
    return { success: true };
}

export async function getInvoiceData(orderId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;

    const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId)
    });

    if (!order) return null;

    const store = await db.query.stores.findFirst({
        where: eq(stores.id, order.storeId)
    });

    if (!store || store.userId !== session.user.id) return null;

    const items = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, order.id)
    });

    return { order, store, items };
}
