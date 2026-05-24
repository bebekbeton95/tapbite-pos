import { db } from "@/lib/db";
import { orders, orderItems, products, stores } from "@/lib/db/schema";
import { eq, desc, sql, gte, lte, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, Presentation, Users, Package, Medal, DollarSign } from "lucide-react";
import RevenueChart from "./RevenueChart";

export default async function AnalyticsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const store = await db.query.stores.findFirst({
        where: eq(stores.userId, session.user.id),
    });

    if (!store) redirect("/admin/onboarding");

    // PRO Check
    const isProExpired = store.proExpiresAt ? new Date() > store.proExpiresAt : false;
    if (store.subscriptionTier === 'FREE' || isProExpired) {
        return (
            <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Presentation className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Fitur Analitik Lanjutan</h1>
                <p className="text-gray-500 mb-8 max-w-md">Ketahui tren penjualan dan performa menu terbaik Anda dengan grafik interaktif. Upgrade ke PRO untuk menikmati fitur ini.</p>
                <button className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:-translate-y-1 transition-all shadow-[0_4px_14px_0_rgb(84,36,220,0.39)]">
                    Upgrade ke PRO Sekarang
                </button>
            </div>
        );
    }

    // Advanced Analytics Logic
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const startOfMonthStr = startOfMonth.toISOString().replace('T', ' ').substring(0, 19);
    const endOfMonthStr = endOfMonth.toISOString().replace('T', ' ').substring(0, 19);

    const monthOrders = await db.query.orders.findMany({
        where: and(
            sql`${orders.storeId} = ${store.id}`,
            sql`${orders.status} IN ('PAID', 'completed')`,
            sql`${orders.createdAt} >= ${startOfMonthStr}`,
            sql`${orders.createdAt} <= ${endOfMonthStr}`
        ),
    });

    const totalRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalTransactions = monthOrders.length;
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Top Selling Products logic
    const topProductsRaw = await db.select({
        productId: orderItems.productId,
        productName: products.name,
        totalQty: sql<number>`sum(${orderItems.quantity})`,
    })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(
            and(
                eq(orders.storeId, store.id),
                sql`${orders.status} IN ('PAID', 'completed')`
            )
        )
        .groupBy(orderItems.productId, products.name)
        .orderBy(desc(sql<number>`sum(${orderItems.quantity})`))
        .limit(5);

    // 7-day Revenue Chart logic
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().replace('T', ' ').substring(0, 19);

    const recentOrders = await db.query.orders.findMany({
        where: and(
            eq(orders.storeId, store.id),
            sql`${orders.status} IN ('PAID', 'completed')`,
            sql`${orders.createdAt} >= ${sevenDaysAgoStr}`
        )
    });

    const dailyRevenueMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo.getTime());
        d.setDate(d.getDate() + i);
        dailyRevenueMap.set(d.toLocaleDateString('id-ID', { weekday: 'short' }), 0);
    }

    recentOrders.forEach(order => {
        const dateStr = order.createdAt ? order.createdAt.replace(' ', 'T') + 'Z' : new Date().toISOString();
        const d = new Date(dateStr);
        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
        if (dailyRevenueMap.has(dayName)) {
            dailyRevenueMap.set(dayName, dailyRevenueMap.get(dayName)! + order.totalAmount);
        }
    });

    const chartData = Array.from(dailyRevenueMap, ([date, revenue]) => ({ date, revenue }));

    // Top 5 Customers
    const topCustomers = await db.select({
        name: orders.customerName,
        phone: orders.customerPhone,
        totalSpent: sql<number>`sum(${orders.totalAmount})`,
        orderCount: sql<number>`count(${orders.id})`
    })
        .from(orders)
        .where(
            and(
                eq(orders.storeId, store.id),
                sql`${orders.status} IN ('PAID', 'completed')`
            )
        )
        .groupBy(orders.customerPhone, orders.customerName)
        .orderBy(desc(sql`sum(${orders.totalAmount})`))
        .limit(5);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Analitik Penjualan Lanjutan</h1>
                <p className="text-gray-500 font-medium">Laporan terperinci performa toko Anda dengan fitur PRO.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card - Premium Gradient */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-[2rem] border border-indigo-500/30 shadow-[0_8px_30px_rgb(79,70,229,0.2)] hover:-translate-y-1 transition-all text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl origin-top-right scale-150"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-indigo-200 text-sm font-semibold tracking-wider uppercase">Bulan Ini</span>
                        </div>
                        <div>
                            <p className="text-indigo-200 font-medium mb-1">Total Pendapatan</p>
                            <div className="text-4xl font-black tracking-tight">Rp {totalRevenue.toLocaleString('id-ID')}</div>
                        </div>
                    </div>
                </div>

                {/* Transactions Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium mb-1">Jumlah Transaksi</p>
                            <div className="text-4xl font-black text-gray-900 tracking-tight">{totalTransactions} <span className="text-lg text-gray-400 font-semibold tracking-normal">sukses</span></div>
                        </div>
                    </div>
                </div>

                {/* Avg Order Value Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium mb-1">Rata-rata Transaksi (AOV)</p>
                            <div className="text-4xl font-black text-gray-900 tracking-tight">Rp {Math.round(averageOrderValue).toLocaleString('id-ID')}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 7-Days Revenue Chart */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col w-full overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                        <h2 className="font-bold text-gray-900 text-lg">Grafik Pendapatan (7 Hari Terakhir)</h2>
                    </div>
                    <div className="flex-1 w-full min-h-[300px]">
                        <RevenueChart data={chartData} />
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                            <Package className="w-4 h-4" />
                        </div>
                        <h2 className="font-bold text-gray-900 text-lg">Top 5 Menu Paling Laku</h2>
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                        {topProductsRaw.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Belum ada data penjualan.</div>
                        ) : (
                            topProductsRaw.map((p, idx) => (
                                <div key={p.productId} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">{p.productName}</div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(p.totalQty / (topProductsRaw[0]?.totalQty || 1)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="font-black text-gray-900 font-mono">{p.totalQty} <span className="text-xs text-gray-400 font-medium">terjual</span></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Top Customers */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                            <Medal className="w-4 h-4" />
                        </div>
                        <h2 className="font-bold text-gray-900 text-lg">Top 5 Pelanggan Setia</h2>
                    </div>
                    <div className="p-6">
                        {topCustomers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Belum ada pelanggan.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="py-2 text-xs font-bold text-gray-400 uppercase">Nama</th>
                                            <th className="py-2 text-xs font-bold text-gray-400 uppercase text-center">Total Pesanan</th>
                                            <th className="py-2 text-xs font-bold text-gray-400 uppercase text-right">Total GMV (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {topCustomers.map((c, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4">
                                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                                        {idx === 0 && <span className="text-xl">🏆</span>}
                                                        {idx === 1 && <span className="text-xl">🥈</span>}
                                                        {idx === 2 && <span className="text-xl">🥉</span>}
                                                        {c.name}
                                                    </div>
                                                    <div className="text-sm font-mono text-gray-500 mt-1">{c.phone}</div>
                                                </td>
                                                <td className="py-4 text-center font-bold text-gray-600">
                                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{c.orderCount} Pembelian</span>
                                                </td>
                                                <td className="py-4 text-right font-black text-gray-900 text-lg">Rp {c.totalSpent?.toLocaleString('id-ID')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
