import { db } from "@/lib/db";
import { stores, orders } from "@/lib/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingCart, Store, ArrowRight, DollarSign, Activity, Clock, ChevronRight } from "lucide-react";

export default async function AdminDashboard() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const store = await db.query.stores.findFirst({
        where: eq(stores.userId, session.user.id),
    });

    if (!store) redirect("/admin/onboarding");

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Format to SQLite string YYYY-MM-DD HH:MM:SS
    const todayStr = today.toISOString().replace('T', ' ').substring(0, 19);

    const todayOrders = await db.query.orders.findMany({
        where: and(
            eq(orders.storeId, store.id),
            gte(orders.createdAt, todayStr)
        ),
    });

    const dailyRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const dailyOrderCount = todayOrders.length;

    // Get 5 recent orders for the dashboard list
    const recentOrders = await db.query.orders.findMany({
        where: eq(orders.storeId, store.id),
        orderBy: [desc(orders.createdAt)],
        limit: 5
    });

    // Dynamic Greeting
    const hour = new Date().getHours();
    let greeting = 'Selamat Pagi';
    if (hour >= 11 && hour < 15) greeting = 'Selamat Siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
    else if (hour >= 18) greeting = 'Selamat Malam';

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">{greeting}, {session.user.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-gray-500 font-medium">Berikut adalah pantauan performa toko Anda hari ini.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-sm font-bold text-gray-700">Toko Online Aktif</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Left Column (Banner & Stats) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Banner */}
                    <div className="bg-gradient-to-br from-indigo-600 via-primary to-purple-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(79,70,229,0.2)] text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl origin-top-right scale-150"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl origin-bottom-left scale-150"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-3">Toko {store.name}</h2>
                            <p className="text-indigo-100 max-w-md leading-relaxed font-medium">Link toko Anda siap melayani pelanggan. Bagikan sekarang ke Instagram atau WhatsApp pelanggan setia Anda.</p>
                        </div>

                        <div className="relative z-10 mt-8 flex sm:justify-end">
                            <a href={`/${store.slug}`} target="_blank" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 hover:scale-105 transition-all shadow-lg">
                                Kunjungi Etalase <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Today's Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:-translate-y-1 transition-all relative overflow-hidden group">
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-green-50 rounded-full blur-2xl group-hover:bg-green-100 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <p className="font-bold text-gray-500 uppercase tracking-wider text-sm">Pendapatan Hari Ini</p>
                                </div>
                                <h3 className="text-4xl font-black tracking-tight text-gray-900">Rp {dailyRevenue.toLocaleString('id-ID')}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:-translate-y-1 transition-all relative overflow-hidden group">
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <p className="font-bold text-gray-500 uppercase tracking-wider text-sm">Pesanan Hari Ini</p>
                                </div>
                                <h3 className="text-4xl font-black tracking-tight text-gray-900">{dailyOrderCount} <span className="text-lg text-gray-400 font-semibold tracking-normal">pesanan</span></h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Recent Orders & Shortcuts) */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Recent Orders List */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full max-h-[460px]">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" /> Pesanan Terbaru
                            </h2>
                            <Link href="/admin/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Lihat Semua</Link>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {recentOrders.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                        <ShoppingCart className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium text-sm">Belum ada pesanan masuk.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {recentOrders.map((order) => (
                                        <Link key={order.id} href="/admin/orders" className="flex items-start justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group">
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{order.customerName}</p>
                                                <p className="text-xs text-gray-500 font-mono mt-0.5">{order.id.substring(0, 12)}</p>
                                                <div className="mt-2 text-xs font-bold flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded border ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        order.status === 'PAID' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                'bg-red-50 text-red-700 border-red-200'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                    <span className="text-gray-400">
                                                        {new Date(order.createdAt ? order.createdAt.replace(' ', 'T') + 'Z' : Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <span className="font-black text-gray-900">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                                                <ChevronRight className="w-4 h-4 text-gray-300 mt-2 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom App Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                <Link href="/admin/orders" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Manajemen Pesanan</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Pantau pesanan masuk</p>
                    </div>
                </Link>

                <Link href="/admin/products" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Katalog & Menu</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Atur produk jualan</p>
                    </div>
                </Link>

                <Link href="/admin/settings" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Pengaturan Toko</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Ubah tema & profil</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
