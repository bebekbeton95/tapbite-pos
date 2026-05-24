'use server'

import { db } from '@/lib/db';
import { products, stores, orders, orderItems } from '@/lib/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';

export interface PricingSuggestion {
    productId: string;
    productName: string;
    currentPrice: number;
    suggestedPrice: number;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
    confidenceScore: number;
}

// Rate limiting: 1 request per 60 seconds per store
const rateLimitMap = new Map<string, number>();

export async function getPricingSuggestions(): Promise<{
    suggestions: PricingSuggestion[];
    error?: string;
}> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { suggestions: [], error: 'Unauthorized' };

    const store = await db.query.stores.findFirst({ where: eq(stores.userId, session.user.id) });
    if (!store) return { suggestions: [], error: 'Toko tidak ditemukan.' };

    // PRO Check
    const isProExpired = store.proExpiresAt ? new Date() > store.proExpiresAt : false;
    if (store.subscriptionTier === 'FREE' || isProExpired) {
        return { suggestions: [], error: 'Fitur Saran Harga AI hanya untuk pengguna PRO.' };
    }

    // Rate limit check
    const lastCall = rateLimitMap.get(store.id);
    if (lastCall && Date.now() - lastCall < 60_000) {
        return { suggestions: [], error: 'Tunggu 60 detik sebelum meminta saran lagi.' };
    }
    rateLimitMap.set(store.id, Date.now());

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
        return { suggestions: [], error: 'API key OpenAI belum dikonfigurasi.' };
    }

    // Gather per-product sales data (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().replace('T', ' ').substring(0, 19);

    const salesData = await db.select({
        productId: orderItems.productId,
        productName: products.name,
        basePrice: products.basePrice,
        discountPrice: products.discountPrice,
        totalQty: sql<number>`sum(${orderItems.quantity})`,
        totalRevenue: sql<number>`sum(${orderItems.priceAtPurchase} * ${orderItems.quantity})`,
        avgSellingPrice: sql<number>`sum(${orderItems.priceAtPurchase} * ${orderItems.quantity}) / sum(${orderItems.quantity})`,
        firstSaleDate: sql<string>`min(${orders.createdAt})`,
    })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(
            and(
                eq(orders.storeId, store.id),
                sql`${orders.status} IN ('PAID', 'completed')`,
                sql`${orders.createdAt} >= ${ninetyDaysAgoStr}`,
                sql`${orderItems.productId} IS NOT NULL`
            )
        )
        .groupBy(orderItems.productId, products.name, products.basePrice, products.discountPrice)
        .orderBy(desc(sql<number>`sum(${orderItems.quantity})`))
        .limit(20);

    // Also include products with no sales
    const allStoreProducts = await db.query.products.findMany({
        where: eq(products.storeId, store.id),
    });

    const salesMap = new Map(salesData.map(s => [s.productId, s]));

    const productAnalysis = allStoreProducts.map(p => {
        const sale = salesMap.get(p.id);
        if (sale) {
            const daysSinceFirst = Math.max(1, Math.floor((Date.now() - new Date(sale.firstSaleDate).getTime()) / 86_400_000));
            return {
                productId: p.id,
                productName: p.name,
                basePrice: p.basePrice,
                discountPrice: p.discountPrice,
                totalQty: sale.totalQty,
                totalRevenue: Math.round(sale.totalRevenue),
                avgSellingPrice: Math.round(sale.avgSellingPrice),
                salesVelocity: +(sale.totalQty / daysSinceFirst).toFixed(2),
            };
        }
        return {
            productId: p.id,
            productName: p.name,
            basePrice: p.basePrice,
            discountPrice: p.discountPrice,
            totalQty: 0,
            totalRevenue: 0,
            avgSellingPrice: null as number | null,
            salesVelocity: 0,
        };
    });

    // Need at least 3 completed orders
    const totalCompletedOrders = await db.select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(and(
            eq(orders.storeId, store.id),
            sql`${orders.status} IN ('PAID', 'completed')`
        ));

    if ((totalCompletedOrders[0]?.count ?? 0) < 3) {
        return { suggestions: [], error: 'Data penjualan belum cukup. Minimal 3 transaksi diperlukan untuk saran harga.' };
    }

    // Store-level context
    const aovResult = await db.select({
        avg: sql<number>`avg(${orders.totalAmount})`,
        total: sql<number>`sum(${orders.totalAmount})`,
        count: sql<number>`count(*)`,
    })
        .from(orders)
        .where(and(
            eq(orders.storeId, store.id),
            sql`${orders.status} IN ('PAID', 'completed')`
        ));

    const aov = Math.round(aovResult[0]?.avg ?? 0);

    // Build LLM prompt
    const productLines = productAnalysis.map((p, i) =>
        `${i + 1}. ${p.productName}\n   - Harga saat ini: Rp ${p.basePrice.toLocaleString('id-ID')}\n   - Harga diskon: ${p.discountPrice ? 'Rp ' + p.discountPrice.toLocaleString('id-ID') : 'Tidak ada'}\n   - Total terjual: ${p.totalQty} unit\n   - Pendapatan: Rp ${p.totalRevenue.toLocaleString('id-ID')}\n   - Rata-rata harga jual: ${p.avgSellingPrice ? 'Rp ' + p.avgSellingPrice.toLocaleString('id-ID') : 'Belum ada data'}\n   - Kecepatan penjualan: ${p.salesVelocity} unit/hari`
    ).join('\n\n');

    const systemPrompt = `Anda adalah analis harga untuk merchant UMKM makanan dan minuman di Indonesia. Tugas Anda adalah menganalisis data penjualan dan menyarankan harga optimal. Selalu respons dalam format JSON yang valid. Pertimbangkan: harga psikologis (misal 25000 bukan 24876), daya beli pasar lokal, dan strategi diskon. Jangan menyarankan harga di bawah 70% atau di atas 200% dari harga saat ini. Jika suatu produk belum terjual, sarankan harga perkenalan yang kompetitif.`;

    const userPrompt = `Toko: ${store.name}
Rata-rata nilai pesanan: Rp ${aov.toLocaleString('id-ID')}
Total produk: ${allStoreProducts.length}

Data produk:
${productLines}

Berikan saran harga untuk setiap produk dalam format JSON:
{
  "suggestions": [
    {
      "productId": "...",
      "suggestedPrice": 25000,
      "reasoning": "Alasan singkat dalam Bahasa Indonesia",
      "confidence": "high|medium|low"
    }
  ]
}`;

    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) return { suggestions: [], error: 'Tidak ada respons dari AI.' };

        const parsed = JSON.parse(content);
        const rawSuggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

        // Validate and map suggestions
        const priceMap = new Map(productAnalysis.map(p => [p.productId, p]));

        const suggestions: PricingSuggestion[] = rawSuggestions
            .filter((s: any) => s.productId && s.suggestedPrice && s.reasoning && s.confidence)
            .map((s: any) => {
                const product = priceMap.get(s.productId);
                const currentPrice = product?.basePrice ?? 0;
                let suggestedPrice = Math.round(s.suggestedPrice);

                // Clamp to reasonable bounds
                suggestedPrice = Math.max(Math.round(currentPrice * 0.7), suggestedPrice);
                suggestedPrice = Math.min(Math.round(currentPrice * 2), suggestedPrice);
                suggestedPrice = Math.max(1000, suggestedPrice); // min Rp 1.000

                const confidence: 'high' | 'medium' | 'low' = ['high', 'medium', 'low'].includes(s.confidence) ? s.confidence : 'low';
                const confidenceScore = confidence === 'high' ? 90 : confidence === 'medium' ? 70 : 50;

                return {
                    productId: s.productId,
                    productName: product?.productName ?? 'Unknown',
                    currentPrice,
                    suggestedPrice,
                    reasoning: String(s.reasoning).substring(0, 200),
                    confidence,
                    confidenceScore,
                };
            })
            .filter((s: PricingSuggestion) => s.productId);

        return { suggestions };
    } catch (err: any) {
        console.error('Pricing AI error:', err);
        return { suggestions: [], error: 'Layanan AI sedang tidak tersedia. Coba lagi nanti.' };
    }
}

export async function applyPricingSuggestion(
    productId: string,
    newPrice: number
): Promise<{ success?: boolean; error?: string }> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: 'Unauthorized' };

    const store = await db.query.stores.findFirst({ where: eq(stores.userId, session.user.id) });
    if (!store) return { error: 'Toko tidak ditemukan.' };

    // Verify product belongs to this store
    const product = await db.query.products.findFirst({
        where: and(eq(products.id, productId), eq(products.storeId, store.id)),
    });
    if (!product) return { error: 'Produk tidak ditemukan.' };

    await db.update(products)
        .set({ basePrice: Math.round(newPrice) })
        .where(eq(products.id, productId));

    revalidatePath('/admin/products');
    revalidatePath(`/${store.slug}`);

    return { success: true };
}
