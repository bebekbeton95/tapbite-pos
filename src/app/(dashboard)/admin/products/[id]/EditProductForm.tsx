"use client";

import { useActionState, useState } from "react";
import { updateProduct } from "@/app/actions/product";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/SubmitButton";
import { Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function EditProductForm({ product }: { product: any }) {
    const [state, formAction] = useActionState(updateProduct as any, { error: undefined, success: undefined });
    const [isPreorder, setIsPreorder] = useState(product.isPreorder);
    const [isLive, setIsLive] = useState(product.isLive);
    const [isUnlimitedStock, setIsUnlimitedStock] = useState(product.isUnlimitedStock);
    const router = useRouter();

    if (state?.success) {
        router.push('/admin/products');
    }

    const formatDateForInput = (dateObj: Date | null) => {
        if (!dateObj) return "";
        const d = new Date(dateObj);
        // adjust for timezone to make it look right in local input
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 16);
    };

    return (
        <div className="bg-white border rounded-xl p-8 max-w-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Edit className="w-5 h-5 text-primary" /> Edit Produk</h2>
            <form action={formAction} className="space-y-6">
                {state?.error && (
                    <div className="text-sm border border-red-200 bg-red-100 text-red-600 p-3 rounded-lg font-medium">
                        {state.error}
                    </div>
                )}

                <input type="hidden" name="id" value={product.id} />

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Nama Produk</label>
                    <Input name="name" required defaultValue={product.name} />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Deskripsi Singkat</label>
                    <Input name="description" defaultValue={product.description || ''} />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">URL Gambar (Opsional)</label>
                    <Input name="imageUrl" defaultValue={product.imageUrl || ''} placeholder="https://..." />
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-bold text-gray-900">Publish ke Storefront</label>
                            <p className="text-xs text-gray-500">Hanya produk yang 'Live' akan muncul di etalase toko.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isLive" className="sr-only peer" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} value="true" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B14F]"></div>
                        </label>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-bold text-gray-900">Harga & Diskon (Promo)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">Harga Asli (Rp)</label>
                            <Input name="price" type="number" required defaultValue={product.basePrice} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">Harga Diskon (Opsional)</label>
                            <Input name="discountPrice" type="number" defaultValue={product.discountPrice || ''} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">Promo Mulai</label>
                            <Input name="promoStartDate" type="datetime-local" defaultValue={formatDateForInput(product.promoStartDate)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">Promo Selesai</label>
                            <Input name="promoEndDate" type="datetime-local" defaultValue={formatDateForInput(product.promoEndDate)} />
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
                            <input type="checkbox" name="isUnlimitedStock" className="sr-only peer" checked={isUnlimitedStock} onChange={(e) => setIsUnlimitedStock(e.target.checked)} value="true" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    {!isUnlimitedStock && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">Jumlah Stok</label>
                            <Input name="stock" type="number" defaultValue={product.stock} />
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-bold text-gray-900">Sistem Pre-Order</label>
                            <p className="text-xs text-gray-500">Aktifkan jika butuh waktu pembuatan.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isPreorder" className="sr-only peer" checked={isPreorder} onChange={(e) => setIsPreorder(e.target.checked)} value="true" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {isPreorder && (
                        <div className="pt-2">
                            <label className="text-xs font-semibold text-gray-700 mb-1 block">Estimasi Waktu (Contoh: 2-3 Hari)</label>
                            <Input name="poEstimation" required={isPreorder} defaultValue={product.poEstimation || ''} className="bg-white" />
                        </div>
                    )}
                </div>

                <div className="flex gap-4 pt-4 border-t">
                    <Link href="/admin/products" className="flex-[1] px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-center font-bold transition-colors">
                        Batal
                    </Link>
                    <SubmitButton label="Simpan Perubahan" loadingLabel="Menyimpan..." className="flex-[2] h-auto py-3 bg-primary text-primary-foreground shadow-md hover:shadow-lg rounded-xl text-sm font-bold whitespace-nowrap" />
                </div>
            </form>
        </div>
    );
}
