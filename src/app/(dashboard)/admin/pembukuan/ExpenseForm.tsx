"use client";

import { useActionState, useEffect, useRef } from "react";
import { addExpense } from "@/app/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/SubmitButton";
import { Plus } from "lucide-react";

export function ExpenseForm() {
    const [state, formAction] = useActionState(addExpense as any, { error: undefined, success: undefined });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
            // Default select today
            const today = new Date().toISOString().split('T')[0];
            const dateInput = formRef.current?.querySelector('input[type="date"]') as HTMLInputElement;
            if (dateInput) dateInput.value = today;
        }
    }, [state]);

    return (
        <div className="bg-white border rounded-3xl p-6 h-fit sticky top-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">Catat Pengeluaran</h2>

            <form ref={formRef} action={formAction} className="space-y-4 text-left">
                {state?.error && (
                    <div className="text-sm border border-red-200 bg-red-50 text-red-600 p-3 rounded-xl font-medium">
                        {state.error}
                    </div>
                )}

                <div className="space-y-2 text-left">
                    <label className="text-sm font-semibold text-gray-700">Tanggal</label>
                    <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                </div>

                <div className="space-y-2 text-left">
                    <label className="text-sm font-semibold text-gray-700">Kategori</label>
                    <select name="category" required className="w-full border-gray-200 bg-gray-50 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700">
                        <option value="Bahan Baku">Bahan Baku (Sembako, Daging, dll)</option>
                        <option value="Operasional">Operasional (Listrik, Air, Internet)</option>
                        <option value="Sewa Tempat">Sewa Tempat</option>
                        <option value="Gaji Pegawai">Gaji Pegawai</option>
                        <option value="Pemasaran">Pemasaran (Iklan, Brosur)</option>
                        <option value="Lainnya">Lainnya...</option>
                    </select>
                </div>

                <div className="space-y-2 text-left">
                    <label className="text-sm font-semibold text-gray-700">Nominal (Rp)</label>
                    <Input name="amount" type="number" required placeholder="50000" min="1000" className="bg-gray-50 border-gray-200 focus:bg-white text-lg font-bold text-gray-900" />
                </div>

                <div className="space-y-2 text-left mt-2">
                    <label className="text-sm font-semibold text-gray-700">Keterangan Tambahan</label>
                    <textarea name="description" className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Beli beras 50kg di pasar induk..."></textarea>
                </div>

                <SubmitButton label="Catat Pengeluaran" loadingLabel="Menyimpan..." className="w-full mt-4 h-12 bg-gray-900 text-white shadow-xl shadow-gray-200 hover:shadow-gray-300 hover:bg-black transition-all rounded-xl text-sm font-bold active:scale-[0.98]" />
            </form>
        </div>
    );
}
