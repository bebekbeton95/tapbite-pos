"use client";

import { useActionState, useEffect, useRef } from "react";
import { addProduct } from "@/app/actions/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/SubmitButton";
import { Plus } from "lucide-react";
import { useState } from "react";

export function ProductForm({ isFreeLimitReached }: { isFreeLimitReached: boolean }) {
    const [state, formAction] = useActionState(addProduct as any, { error: undefined, success: undefined });
    const [isPreorder, setIsPreorder] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [isUnlimitedStock, setIsUnlimitedStock] = useState(true);
    const [variants, setVariants] = useState([{ name: '', price: '' }]);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
            setIsPreorder(false);
            setIsLive(false);
            setIsUnlimitedStock(true);
            setVariants([{ name: '', price: '' }]);
        }
    }, [state]);

    const addVariant = () => setVariants([...variants, { name: '', price: '' }]);
    const removeVariant = (i: number) => setVariants(variants.filter((_, index) => index !== i));

    return (
        <div className="bg-white border rounded-xl p-6 h-fit sticky top-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5" /> Tambah Baru</h2>
            <form ref={formRef} action={formAction} className="space-y-4">
                {state?.error && (
                    <div className="text-sm border border-red-200 bg-red-100 text-red-600 p-2 rounded">
                        {state.error}
                    </div>
                )}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Produk</label>
                    <Input name="name" required placeholder="Nasi Goreng Spesial" disabled={isFreeLimitReached} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Deskripsi Singkat</label>
                    <Input name="description" placeholder="Deskripsi menu yang menggugah selera..." disabled={isFreeLimitReached} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">URL Gambar (Opsional)</label>
                    <Input name="imageUrl" placeholder="https://..." disabled={isFreeLimitReached} />
                </div>
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-bold text-gray-900">Publish ke Storefront</label>
                            <p className="text-xs text-gray-500">Hanya produk yang 'Live' akan muncul di halaman toko.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isLive" className="sr-only peer" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} disabled={isFreeLimitReached} value="true" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B14F]"></div>
                        </label>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-bold text-gray-900">Harga & Diskon (Promo)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">Harga Asli (Rp)</label>
                            <Input name="price" type="number" required placeholder="25000" disabled={isFreeLimitReached} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">Harga Diskon (Opsional)</label>
                            <Input name="discountPrice" type="number" placeholder="20000" disabled={isFreeLimitReached} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">Promo Mulai</label>
                            <Input name="promoStartDate" type="datetime-local" disabled={isFreeLimitReached} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">Promo Selesai</label>
                            <Input name="promoEndDate" type="datetime-local" disabled={isFreeLimitReached} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-bold text-gray-900">Stok Unlimited</label>
                            <p className="text-xs text-gray-500">Matikan jika ingin mengatur jumlah stok.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isUnlimitedStock" className="sr-only peer" checked={isUnlimitedStock} onChange={(e) => setIsUnlimitedStock(e.target.checked)} disabled={isFreeLimitReached} value="true" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    {!isUnlimitedStock && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">Jumlah Stok</label>
                            <Input name="stock" type="number" placeholder="100" disabled={isFreeLimitReached} />
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-gray-900">Varian Produk (Opsional)</label>
                        <button type="button" onClick={addVariant} className="text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded-md">+ Tambah Varian</button>
                    </div>

                    {variants.map((v, i) => (
                        <div key={i} className="flex gap-2 items-start relative">
                            <div className="w-2/3">
                                <Input name="variantName" placeholder={`Nama Varian (misal: Pedas)`} disabled={isFreeLimitReached} />
                            </div>
                            <div className="w-1/3">
                                <Input name="variantPrice" type="number" placeholder={`+ Harga (misal: 5000)`} disabled={isFreeLimitReached} />
                            </div>
                            {i > 0 && (
                                <button type="button" onClick={() => removeVariant(i)} className="absolute -right-2 -top-2 bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">x</button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-bold text-gray-900">Sistem Pre-Order</label>
                            <p className="text-xs text-gray-500">Aktifkan jika butuh waktu pembuatan.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isPreorder" className="sr-only peer" checked={isPreorder} onChange={(e) => setIsPreorder(e.target.checked)} disabled={isFreeLimitReached} value="true" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {isPreorder && (
                        <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-xs font-semibold text-gray-700 mb-1 block">Estimasi Waktu (Contoh: 2-3 Hari)</label>
                            <Input name="poEstimation" required={isPreorder} placeholder="2-3 Hari Kerja" disabled={isFreeLimitReached} className="bg-white" />
                        </div>
                    )}
                </div>

                <SubmitButton label="Simpan Produk" loadingLabel="Menyimpan..." disabled={isFreeLimitReached} className="w-full h-11 px-4 py-2 bg-primary text-primary-foreground shadow-[0_4px_14px_0_rgb(84,36,220,0.3)] hover:shadow-[0_8px_30px_rgb(84,36,220,0.4)] hover:-translate-y-0.5 transition-all outline-none rounded-xl text-sm font-bold flex items-center justify-center whitespace-nowrap active:scale-[0.98]" />
            </form>
        </div>
    );
}
