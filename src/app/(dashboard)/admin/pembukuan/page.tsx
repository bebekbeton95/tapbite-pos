import { db } from "@/lib/db";
import { expenses, orders, stores } from "@/lib/db/schema";
import { eq, desc, sql, gte, lte, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Calculator, TrendingUp, TrendingDown, Wallet, CheckCircle2 } from "lucide-react";
import { ExpenseForm } from "@/app/(dashboard)/admin/pembukuan/ExpenseForm";

export default async function PembukuanPage() {
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
                    <Calculator className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Fitur Pembukuan Otomatis</h1>
                <p className="text-gray-500 mb-8 max-w-md">Ketahui pasti laba/rugi usahamu tanpa repot mencatat satu persatu. Upgrade ke PRO untuk menikmati fitur ini.</p>
                <button className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:-translate-y-1 transition-all shadow-[0_4px_14px_0_rgb(84,36,220,0.39)]">
                    Upgrade ke PRO Sekarang
                </button>
            </div>
        );
    }

    // Get Current Month Data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Format dates for SQLite CURRENT_TIMESTAMP string comparison ('YYYY-MM-DD HH:MM:SS')
    const startStr = startOfMonth.toISOString().replace('T', ' ').substring(0, 19);
    const endStr = endOfMonth.toISOString().replace('T', ' ').substring(0, 19);

    // 1. Calculate Income (from completed or paid orders this month)
    const incomeOrders = await db.query.orders.findMany({
        where: and(
            eq(orders.storeId, store.id),
            sql`${orders.status} IN ('completed', 'PAID')`,
            sql`${orders.createdAt} >= ${startStr}`,
            sql`${orders.createdAt} <= ${endStr}`
        ),
        orderBy: [desc(orders.createdAt)],
    });
    const totalIncome = incomeOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 1b. Calculate Receivables (Piutang - from pending orders this month)
    const receivableOrders = await db.query.orders.findMany({
        where: and(
            eq(orders.storeId, store.id),
            eq(orders.status, 'PENDING'),
            sql`${orders.createdAt} >= ${startStr}`,
            sql`${orders.createdAt} <= ${endStr}`
        ),
        orderBy: [desc(orders.createdAt)],
    });
    const totalPiutang = receivableOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 2. Calculate Expenses (from logged expenses this month)
    const expenseList = await db.query.expenses.findMany({
        where: and(
            eq(expenses.storeId, store.id),
            gte(expenses.date, startOfMonth),
            lte(expenses.date, endOfMonth)
        ),
        orderBy: [desc(expenses.date)],
    });
    const totalExpense = expenseList.reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Combine both for Ledger (Buku Kas)
    const transactions = [
        ...incomeOrders.map(o => ({
            id: o.id,
            type: 'INCOME' as const,
            title: `Order: ${o.customerName}`,
            description: `ID: ${o.id.substring(0, 10)} - ${o.deliveryType}`,
            date: new Date(o.createdAt ? o.createdAt.replace(' ', 'T') + 'Z' : Date.now()),
            amount: o.totalAmount
        })),
        ...expenseList.map(exp => ({
            id: exp.id,
            type: 'EXPENSE' as const,
            title: exp.category,
            description: exp.description || '-',
            date: new Date(exp.date),
            amount: exp.amount
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    // 4. Calculate Profit / Loss
    const netProfit = totalIncome - totalExpense;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Pembukuan</h1>
                <p className="text-gray-500 font-medium">Laporan Laba/Rugi bulan {startOfMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
            </header>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full opacity-50"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pendapatan</h3>
                        </div>
                        <p className="text-3xl font-black text-gray-900 tracking-tight">Rp {totalIncome.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">Dari {incomeOrders.length > 0 ? `${incomeOrders.length} pesanan lunas` : '0 pesanan'}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full opacity-50"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                                <TrendingDown className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pengeluaran</h3>
                        </div>
                        <p className="text-3xl font-black text-gray-900 tracking-tight">Rp {totalExpense.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">Bahan baku, operasional, dll.</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full opacity-50"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Piutang Pelanggan</h3>
                        </div>
                        <p className="text-3xl font-black text-gray-900 tracking-tight">Rp {totalPiutang.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-orange-600 mt-2 font-medium">Dari {receivableOrders.length} pesanan belum lunas</p>
                    </div>
                </div>

                <div className={`p-6 rounded-3xl border shadow-[0_8px_30px_rgb(0,0,0,0.07)] relative overflow-hidden text-white ${netProfit >= 0 ? 'bg-primary border-primary/20' : 'bg-red-600 border-red-500/20'}`}>
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full"></div>
                    <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">Laba Bersih</h3>
                        </div>
                        <p className="text-4xl font-black tracking-tight">Rp {netProfit.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-white/60 mt-2 font-medium">{netProfit >= 0 ? 'Bisnis sehat & menguntungkan 🚀' : 'Sedang merugi, periksa biaya.'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Transaction History */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-bold text-gray-900">Buku Kas (Arus Kas Bulan Ini)</h2>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <Calculator className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">Belum ada transaksi di bulan ini.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {transactions.map(trx => (
                                    <div key={trx.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                        <div className="flex gap-4 items-center">
                                            {trx.type === 'INCOME' ? (
                                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-bold border border-green-100">
                                                    <TrendingUp className="w-5 h-5" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-bold text-xs border border-red-100 uppercase tracking-wider">
                                                    {trx.title.substring(0, 3)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-gray-900">{trx.title}</p>
                                                <p className="text-sm text-gray-500">{trx.description}</p>
                                                <p className="text-xs text-gray-400 mt-1">{trx.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-4">
                                            <span className={`font-black text-lg font-mono tracking-tight ${trx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                                {trx.type === 'INCOME' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Daftar Piutang */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-orange-100 flex justify-between items-center bg-orange-50/30">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-orange-500" />
                                Daftar Piutang (Belum Lunas)
                            </h2>
                        </div>

                        {receivableOrders.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <Wallet className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">Hore! Tidak ada piutang saat ini.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {receivableOrders.map(order => (
                                    <div key={order.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-orange-50/10 transition-colors">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-bold border border-orange-100">
                                                <Wallet className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{order.customerName}</p>
                                                <p className="text-sm text-gray-500 font-mono">{order.id}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt ? order.createdAt.replace(' ', 'T') + 'Z' : Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                            <span className="font-black text-lg text-gray-900 font-mono tracking-tight whitespace-nowrap">
                                                Rp {order.totalAmount.toLocaleString('id-ID')}
                                            </span>
                                            <form action={async () => {
                                                'use server'
                                                const { updateOrderStatus } = await import('@/app/actions/order');
                                                await updateOrderStatus(order.id, 'PAID');
                                            }}>
                                                <button type="submit" className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                                                    <CheckCircle2 className="w-4 h-4" /> Lunasi
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Tambah Pengeluaran */}
                <div className="lg:col-span-1">
                    <ExpenseForm />
                </div>
            </div>
        </div>
    );
}
