import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "./ProductForm";
import { ProductActions } from "./ProductActions";
import { PricingSuggestions } from "./PricingSuggestions";

export default async function ProductsManagement() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const store = await db.query.stores.findFirst({
        where: eq(stores.userId, session.user.id),
    });

    if (!store) redirect("/admin/onboarding");

    const storeProducts = await db.query.products.findMany({
        where: eq(products.storeId, store.id),
        orderBy: [desc(products.id)],
    });

    const isFreeLimitReached = store.subscriptionTier === 'FREE' && storeProducts.length >= 1;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Katalog Produk</h1>
                    <p className="text-gray-500 font-medium">Tambahkan atau edit menu yang akan muncul di etalase pembeli Anda.</p>
                </div>
                {isFreeLimitReached && (
                    <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-bold border border-orange-200 shadow-sm shrink-0 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                        Batas Paket Gratis (1 Menu)
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Produk */}
                <div className="lg:col-span-2 space-y-4">
                    {storeProducts.length === 0 ? (
                        <div className="bg-white border border-indigo-100/50 text-center p-16 rounded-2xl shadow-sm text-gray-500 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                                <Package className="w-8 h-8 text-primary/40" />
                            </div>
                            <p className="font-semibold text-lg text-gray-900">Belum ada menu produk.</p>
                            <p className="text-sm mt-1">Silakan tambahkan menu pertama Anda menggunakan form di samping.</p>
                        </div>
                    ) : (
                        storeProducts.map((p) => (
                            <div key={p.id} className="bg-white border border-indigo-50 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 shadow-[0_8px_30px_rgb(84,36,220,0.03)] items-start sm:items-center hover:-translate-y-0.5 transition-all">
                                <div className="w-24 h-24 bg-primary/5 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-primary/10">
                                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-primary/30" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <h3 className="font-bold text-xl text-gray-900">
                                            {p.name}
                                        </h3>
                                        {p.isLive ? (
                                            <span className="text-[10px] uppercase font-black tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">Live</span>
                                        ) : (
                                            <span className="text-[10px] uppercase font-black tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">Draft</span>
                                        )}
                                        {p.isPreorder && (
                                            <span className="text-[10px] uppercase font-black tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200">Pre Order</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 leading-relaxed max-w-md line-clamp-2">{p.description}</p>
                                    <div className="mt-3 font-extrabold text-primary text-xl tracking-tight font-mono flex items-center gap-3">
                                        {p.discountPrice && p.discountPrice < p.basePrice ? (
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 line-through font-medium leading-none">Rp {p.basePrice.toLocaleString('id-ID')}</span>
                                                <span className="text-[#00B14F]">Rp {p.discountPrice.toLocaleString('id-ID')} <span className="text-xs bg-orange-100 text-orange-600 px-1 py-0.5 rounded font-bold ml-1">PROMO</span></span>
                                            </div>
                                        ) : (
                                            <span>Rp {p.basePrice.toLocaleString('id-ID')}</span>
                                        )}

                                        {p.isPreorder && p.poEstimation && (
                                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md self-end mb-1">Estimasi: {p.poEstimation}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0 w-full sm:w-auto text-right flex flex-col gap-2 items-end">
                                    <span className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${p.isAvailable ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {p.isAvailable ? 'Tersedia' : 'Habis'}
                                    </span>
                                    {p.isUnlimitedStock ? (
                                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Stok: Unlimited</span>
                                    ) : (
                                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Stok: {p.stock}</span>
                                    )}
                                    <div className="mt-2">
                                        <ProductActions id={p.id} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Form Tambah */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <ProductForm isFreeLimitReached={isFreeLimitReached} />
                    </div>
                </div>
            </div>

            {/* AI Pricing Suggestions */}
            <PricingSuggestions />
        </div>
    );
}

// Temporary icon component fallback
function Package(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
}
