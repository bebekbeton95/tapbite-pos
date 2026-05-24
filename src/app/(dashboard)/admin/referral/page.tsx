import { db } from "@/lib/db";
import { stores, orders } from "@/lib/db/schema";
import { eq, desc, isNotNull, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Users, Link as LinkIcon, Trophy } from "lucide-react";
import { toggleReferral } from "@/app/actions/store";
import { revalidatePath } from "next/cache";

export default async function ReferralPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const store = await db.query.stores.findFirst({
        where: eq(stores.userId, session.user.id),
    });

    if (!store) redirect("/admin/onboarding");

    // Fetch top referrers
    const referrers = await db.select({
        phone: orders.referrerPhone,
        totalSales: sql<number>`sum(${orders.totalAmount})`,
        orderCount: sql<number>`count(${orders.id})`
    })
        .from(orders)
        .where(
            sql`${orders.storeId} = ${store.id} AND ${orders.referrerPhone} IS NOT NULL AND TRIM(${orders.referrerPhone}) != '' AND ${orders.status} = 'COMPLETED'`
        )
        .groupBy(orders.referrerPhone)
        .orderBy(desc(sql`sum(${orders.totalAmount})`))
        .limit(50);


    const handleToggle = async (formData: FormData) => {
        "use server";
        const isActive = formData.get('isActive') === 'true';
        await toggleReferral(store.id, !isActive);
        revalidatePath('/admin/referral');
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Program Referral</h1>
                    <p className="text-gray-500 font-medium">Beri insentif kepada pelanggan yang membagikan toko Anda.</p>
                </div>
                <form action={handleToggle}>
                    <input type="hidden" name="isActive" value={store.isReferralActive ? "true" : "false"} />
                    <button type="submit" className={`px-6 py-2.5 rounded-full font-bold transition-all shadow-sm flex items-center gap-2 ${store.isReferralActive ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-[#00B14F] text-white hover:bg-[#009140]'}`}>
                        {store.isReferralActive ? 'Matikan Program' : 'Aktifkan Program Referral'}
                    </button>
                </form>
            </header>

            {!store.isReferralActive && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8 flex gap-4 text-yellow-800">
                    <Trophy className="w-8 h-8 shrink-0 text-yellow-600" />
                    <div>
                        <h3 className="font-bold text-lg mb-1">Mulai Tingkatkan GMV dari Mulut ke Mulut!</h3>
                        <p className="text-sm">Program referral belum aktif. Dengan mengaktifkannya, tombol "Bagikan & Untung" akan muncul di storefront Anda. Anda kemudian bisa melacak siapa saja pelanggan setia yang membantu mempromosikan toko Anda.</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" /> Top Afiliator / Referrer
                    </h2>
                </div>

                {referrers.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LinkIcon className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Belum Ada Data Referral</h3>
                        <p className="text-gray-500 text-sm">Bagikan link toko Anda kepada pelanggan setia untuk memulai.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">No. WhatsApp Referrer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Total Pesanan Sukses</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total GMV (Rp)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {referrers.map((ref, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-gray-900">{ref.phone}</td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-600">
                                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{ref.orderCount} Pembelian</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-gray-900 text-lg">Rp {ref.totalSales?.toLocaleString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
