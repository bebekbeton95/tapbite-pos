import { db } from "@/lib/db";
import { stores, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import FloatingCart from "./components/FloatingCart";
import AddToCartButton from "./components/AddToCartButton";
import ShareReferral from "./components/ShareReferral";
import { Store, UtensilsCrossed } from "lucide-react";

export default async function StorefrontPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;

    const store = await db.query.stores.findFirst({
        where: eq(stores.slug, slug),
    });

    if (!store) notFound();

    const storeProducts = await db.query.products.findMany({
        where: (products, { eq, and }) => and(eq(products.storeId, store.id), eq(products.isLive, true))
    });

    return (
        <div
            className="min-h-screen bg-[#F5F6F8] pb-32 font-sans antialiased selection:bg-black/10"
            style={{
                '--color-primary': store.themeColor || '#00B14F',
                '--theme-color': store.themeColor || '#00B14F',
                '--theme-color-10': `${store.themeColor || '#00B14F'}1A`,
            } as React.CSSProperties}
        >
            {/* Custom Banner */}
            {store.bannerUrl && (
                <div className="w-full h-48 md:h-64 relative bg-gray-200">
                    <img src={store.bannerUrl} alt="Store Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
            )}

            {/* Premium Store Header */}
            <header className={`${store.bannerUrl ? '-mt-16 rounded-t-3xl relative' : 'sticky top-0'} bg-white z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-b border-gray-100/50 pt-8 pb-6 px-4 sm:px-6 transition-all`}>
                <div className="max-w-4xl mx-auto flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-3xl shadow-sm"
                            style={{ backgroundColor: 'var(--theme-color-10)', color: 'var(--theme-color)' }}
                        >
                            {store.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[#1C1C1C] tracking-tight">{store.name}</h1>
                            <div className="text-[13px] font-bold flex items-center gap-1.5 mt-1" style={{ color: 'var(--theme-color)' }}>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--theme-color)' }}></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--theme-color)' }}></span>
                                </span>
                                Buka & Menerima Pesanan
                            </div>
                        </div>
                    </div>
                    {store.welcomeMessage && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100/50 leading-relaxed font-medium">
                            {store.welcomeMessage}
                        </div>
                    )}
                </div>
            </header>

            {/* Product List Area */}
            <main className="max-w-4xl mx-auto p-4 sm:p-6 mt-4 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-[#1C1C1C] mb-5 flex items-center gap-2">
                        Daftar Menu
                    </h2>
                </div>

                {storeProducts.length === 0 ? (
                    <div className="text-center py-24 px-6 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                            <Store className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1C1C1C] mb-2">Belum Ada Menu</h3>
                        <p className="text-gray-500 max-w-sm text-sm">Toko ini masih mempersiapkan hidangan spesialnya. Silakan cek kembali nanti.</p>
                    </div>
                ) : (
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 ${store.theme === 'theme-indigo' ? 'lg:grid-cols-2 lg:gap-6' : ''}`}>
                        {storeProducts.filter(p => p.isAvailable).map((p) => {
                            const isPlayful = store.theme === 'theme-orange';
                            const isElegant = store.theme === 'theme-indigo'; // Grid view
                            const isMinimal = store.theme === 'theme-zinc' || !store.theme;

                            if (isElegant) {
                                return (
                                    <div key={p.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group flex flex-col overflow-hidden border border-gray-100">
                                        <div className="w-full h-48 bg-[#F8F9FA] relative">
                                            {p.imageUrl ?
                                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" /> :
                                                <div className="w-full h-full flex items-center justify-center"><UtensilsCrossed className="w-12 h-12 text-gray-200" /></div>
                                            }
                                            {p.isPreorder && (
                                                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#E94B4B]">Pre Order</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-bold text-[#1C1C1C] text-[18px] leading-[1.3] mb-1">{p.name}</h3>
                                            <p className="text-[14px] text-[#676767] line-clamp-2 leading-relaxed mb-4">{p.description}</p>

                                            <div className="mt-auto flex items-end justify-between pt-2 border-t border-gray-50">
                                                <div>
                                                    {p.discountPrice && p.discountPrice < p.basePrice ? (
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] bg-[#FEF2F2] text-[#EF4444] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Promo</span>
                                                                <span className="text-[12px] text-[#9CA3AF] line-through font-semibold">Rp {p.basePrice.toLocaleString('id-ID')}</span>
                                                            </div>
                                                            <span className="font-extrabold text-[#1C1C1C] text-[18px]">Rp {p.discountPrice.toLocaleString('id-ID')}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-extrabold text-[#1C1C1C] text-[18px]">Rp {p.basePrice.toLocaleString('id-ID')}</span>
                                                    )}
                                                </div>
                                                <AddToCartButton product={p} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            if (isPlayful) {
                                return (
                                    <div key={p.id} className="bg-white p-3 rounded-[2rem] border-2 border-gray-900 shadow-[4px_4px_0px_rgba(17,24,39,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(17,24,39,1)] flex gap-4 transition-all duration-200 group relative">
                                        <div className="w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] bg-[#F8F9FA] rounded-[1.5rem] flex-shrink-0 overflow-hidden relative border-2 border-gray-100">
                                            {p.imageUrl ?
                                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> :
                                                <div className="w-full h-full flex items-center justify-center"><UtensilsCrossed className="w-8 h-8 text-gray-300" /></div>
                                            }
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1 pr-1">
                                            <div>
                                                <h3 className="font-black text-gray-900 text-[17px] leading-[1.2] mb-1 tracking-tight">{p.name}</h3>
                                                <p className="text-[13px] text-gray-500 line-clamp-2 leading-snug mb-2 font-medium">{p.description}</p>
                                                {p.isPreorder && <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200 mb-1">Pre Order</span>}
                                            </div>
                                            <div className="mt-auto flex items-end justify-between">
                                                <div className="pb-1">
                                                    {p.discountPrice && p.discountPrice < p.basePrice ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] text-gray-400 line-through font-bold">Rp {p.basePrice.toLocaleString('id-ID')}</span>
                                                            <span className="font-black text-gray-900 text-[18px]">Rp {p.discountPrice.toLocaleString('id-ID')}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-black text-gray-900 text-[18px]">Rp {p.basePrice.toLocaleString('id-ID')}</span>
                                                    )}
                                                </div>
                                                <div className="shrink-0 scale-110 origin-bottom-right">
                                                    <AddToCartButton product={p} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // Default Minimalist
                            return (
                                <div key={p.id} className="bg-white p-4 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-transparent hover:border-gray-100 flex gap-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 group relative">
                                    <div className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] bg-[#F8F9FA] rounded-2xl flex-shrink-0 overflow-hidden relative shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
                                        {p.imageUrl ?
                                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" /> :
                                            <div className="w-full h-full flex items-center justify-center"><UtensilsCrossed className="w-8 h-8 text-gray-300" /></div>
                                        }
                                        {p.isPreorder && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm text-center py-1 border-t border-gray-100/50">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#E94B4B]">Pre Order</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-0.5">
                                        <div>
                                            <h3 className="font-bold text-[#1C1C1C] text-[16px] leading-[1.3] mb-1 line-clamp-2">{p.name}</h3>
                                            <p className="text-[13px] text-[#676767] line-clamp-2 leading-relaxed">{p.description}</p>
                                        </div>
                                        <div className="mt-auto flex items-end justify-between">
                                            <div>
                                                {p.discountPrice && p.discountPrice < p.basePrice ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-[10px] bg-[#FEF2F2] text-[#EF4444] px-1.5 py-0.5 rounded font-black uppercase tracking-wider whitespace-nowrap">Promo</span>
                                                            <span className="text-[11px] text-[#9CA3AF] line-through font-semibold whitespace-nowrap">Rp {p.basePrice.toLocaleString('id-ID')}</span>
                                                        </div>
                                                        <span className="font-extrabold text-[#1C1C1C] text-[16px] truncate">Rp {p.discountPrice.toLocaleString('id-ID')}</span>
                                                    </div>
                                                ) : (
                                                    <span className="font-extrabold text-[#1C1C1C] text-[16px] truncate">Rp {p.basePrice.toLocaleString('id-ID')}</span>
                                                )}
                                            </div>
                                            <AddToCartButton product={p} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Referral Widget */}
            {store.isReferralActive && (
                <ShareReferral slug={store.slug} storeName={store.name} />
            )}

            {/* Floating Cart (Zustand) */}
            <FloatingCart storeId={store.id} storeName={store.name} />

            {/* Watermark (Hidden for PRO) */}
            {(!store.proExpiresAt || new Date() > store.proExpiresAt) && store.subscriptionTier === 'FREE' && (
                <div className="pb-8 pt-4 text-center">
                    <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium hover:text-gray-600 transition-colors">
                        Powered by <img src="/logo.png" alt="TapBite" className="h-4 w-4 rounded opacity-75 grayscale" /> <span className="font-bold tracking-tight">TapBite</span>
                    </a>
                </div>
            )}
        </div>
    );
}
