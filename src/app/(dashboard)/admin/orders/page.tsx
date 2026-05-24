import { db } from "@/lib/db";
import { orders, stores } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, ShoppingCart, Receipt } from "lucide-react";
import Link from "next/link";
import OrderStatusSelect from "./OrderStatusSelect"; // Client component untuk mengubah status
import { InvoiceModalTrigger } from "./InvoiceModal";

export default async function OrdersManagement() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const store = await db.query.stores.findFirst({
        where: eq(stores.userId, session.user.id),
    });

    if (!store) redirect("/admin/onboarding");

    const storeOrders = await db.query.orders.findMany({
        where: eq(orders.storeId, store.id),
        orderBy: [desc(orders.createdAt)],
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Manajemen Pesanan</h1>
                <p className="text-gray-500 font-medium">Pantau pesanan yang masuk dan perbarui status untuk pelanggan Anda.</p>
            </header>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-indigo-50/50 border-b border-indigo-100/50">
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm tracking-wide">ID Pesanan</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm tracking-wide">Waktu</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm tracking-wide">Pelanggan</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm tracking-wide">Total Pembayaran</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm tracking-wide">Status Sekarang</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm tracking-wide">Aksi Cepat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {storeOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <ShoppingCart className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="font-semibold text-lg text-gray-900">Belum ada pesanan</p>
                                            <p className="text-sm mt-1">Pesanan dari link toko Anda akan muncul di sini.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                storeOrders.map((o) => (
                                    <tr key={o.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-800">{o.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {new Date(o.createdAt || Date.now()).toLocaleString("id-ID", {
                                                dateStyle: "medium", timeStyle: "short"
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{o.customerName}</div>
                                            <div className="text-xs font-mono text-gray-500 mt-0.5">{o.customerPhone} &bull; <span className="text-primary font-semibold">{o.deliveryType}</span></div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">Rp {o.totalAmount.toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={o.status || "PENDING"} />
                                        </td>
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <OrderStatusSelect orderId={o.id} currentStatus={o.status || "PENDING"} />
                                            <InvoiceModalTrigger orderId={o.id} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
        PAID: "bg-blue-100 text-blue-800 border-blue-200",
        COMPLETED: "bg-green-100 text-green-800 border-green-200",
        CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles[status]}`}>
            {status}
        </span>
    );
}
