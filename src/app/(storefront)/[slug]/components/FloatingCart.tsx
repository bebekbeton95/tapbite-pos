"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { createOrderAndGenerateWaLink } from "@/app/actions/order";
import { ShoppingBag, ChevronUp, X } from "lucide-react";

export default function FloatingCart({ storeId, storeName }: { storeId: string, storeName: string }) {
    const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);
    const [referrer, setReferrer] = useState<string | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refParam = urlParams.get('ref');
        if (refParam) {
            setReferrer(refParam);
            localStorage.setItem('tapbite_ref', refParam);
        } else {
            const stored = localStorage.getItem('tapbite_ref');
            if (stored) setReferrer(stored);
        }
    }, []);

    const handleCheckout = async (formData: FormData) => {
        setLoading(true);
        const payload = {
            storeId,
            customerName: formData.get("name"),
            customerPhone: formData.get("phone"),
            referrerPhone: referrer,
            deliveryType: formData.get("deliveryType"),
            notes: formData.get("notes"),
            cart: items,
        };

        const res = await createOrderAndGenerateWaLink(payload);
        if (res.success) {
            setSuccessMsg(true);
            setTimeout(() => {
                window.open(res.waLink, "_blank");
                clearCart();
                setIsOpen(false);
                setSuccessMsg(false);
            }, 3000);
        } else {
            alert("Gagal membuat pesanan: " + res.error);
        }
        setLoading(false);
    };

    if (getTotalItems() === 0) return null;

    return (
        <>
            {/* Checkout Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setIsOpen(false)}></div>
            )}

            {/* Cart Summary Header / Trigger */}
            <div
                className={`fixed bottom-0 left-0 right-0 p-4 transition-all duration-300 z-50 ${isOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
            >
                <div className="max-w-2xl mx-auto cursor-pointer group" onClick={() => setIsOpen(true)}>
                    <div className="bg-primary text-primary-foreground w-full rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex items-center justify-between hover:bg-primary/95 group-active:scale-[0.98] transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <ShoppingBag className="w-6 h-6" />
                                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-primary shadow-sm drop-shadow-md">
                                    {getTotalItems()}
                                </span>
                            </div>
                            <span className="font-bold hidden sm:inline">Pesanan Anda</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-xs opacity-80">Total Bayar</div>
                                <div className="font-bold text-lg leading-none">Rp {getTotalPrice().toLocaleString('id-ID')}</div>
                            </div>
                            <ChevronUp className="w-5 h-5 opacity-75" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Form Modal */}
            <div
                className={`fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-bold">Ringkasan Pesanan</h2>
                        <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"><X className="w-5 h-5" /></button>
                    </div>

                    {successMsg ? (
                        <div className="p-12 text-center space-y-4">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center animate-bounce">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Pesanan Dibuat!</h3>
                            <p className="text-gray-500">Membuka WhatsApp untuk mengirim pesanan ke kasir...</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 max-h-[40vh] overflow-y-auto bg-gray-50 border-b">
                                {items.map((i) => (
                                    <div key={i.productId} className="flex justify-between py-2 border-b last:border-0 border-gray-200">
                                        <div>
                                            <div className="font-semibold flex items-center gap-2">
                                                {i.productName}
                                                {i.isPreorder === true && <span className="text-[9px] font-black tracking-wider bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded border border-orange-200 uppercase shrink-0">PO</span>}
                                            </div>
                                            <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                                <span>{i.qty}x Rp {i.price.toLocaleString('id-ID')}</span>
                                                {i.isPreorder === true && i.poEstimation && (
                                                    <span className="text-xs text-orange-600 font-medium whitespace-nowrap">({i.poEstimation})</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="font-bold">Rp {(i.qty * i.price).toLocaleString('id-ID')}</div>
                                    </div>
                                ))}
                                <div className="mt-4 flex justify-between font-bold text-lg pt-4 border-t-2 border-gray-200">
                                    <span>Total tagihan:</span>
                                    <span className="text-primary">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <form action={handleCheckout} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="name" required placeholder="Nama Anda" className="border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                                    <input name="phone" required placeholder="No WhatsApp" type="tel" className="border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                                </div>
                                <select name="deliveryType" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary font-medium text-gray-700">
                                    <option value="Diantar">Diantar oleh Kurir/Toko</option>
                                    <option value="Ambil Sendiri">Ambil Sendiri di Toko</option>
                                    <option value="Dine-in">Makan di Tempat (Dine-in)</option>
                                </select>
                                <textarea name="notes" placeholder="Catatan tambahan (Misal: jangan pakai bawang)" className="w-full border p-3 rounded-lg text-sm"></textarea>

                                <button type="submit" disabled={loading} className={`w-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:brightness-110 hover:-translate-y-0.5 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    {loading ? (
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        "Kirim Pesanan via WhatsApp"
                                    )}
                                    {!loading && <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
