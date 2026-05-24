"use client";

import { useActionState } from "react";
import { createStore } from "@/app/actions/store";
import { SubmitButton } from "@/components/SubmitButton";

export function OnboardingForm() {
    const [state, formAction] = useActionState(createStore as any, { error: undefined, success: undefined });

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <div className="text-sm border border-red-200 bg-red-100 text-red-600 p-2 rounded">
                    {state.error}
                </div>
            )}
            <div className="space-y-2">
                <label className="text-sm font-medium">Nama Toko</label>
                <input name="name" required className="w-full border rounded-lg p-3" placeholder="Misal: Kedai Kopi Senja" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Username Tautan (Slug)</label>
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 bg-gray-100 p-3 rounded-lg border">tapbite.com/</span>
                    <input name="slug" required className="flex-1 border rounded-lg p-3" placeholder="kopi-senja" pattern="[a-z0-9\-]+" title="Hanya huruf kecil, angka, dan strip (-)" />
                </div>
                <p className="text-xs text-gray-500">Tautan ini akan diberikan ke pelanggan Anda.</p>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Nomor WhatsApp Penerima Order</label>
                <input name="whatsappNumber" required className="w-full border rounded-lg p-3" placeholder="6281234567890" type="tel" />
            </div>
            <SubmitButton label="Selesai & Mulai Jualan" className="w-full bg-primary text-primary-foreground font-semibold p-3 rounded-lg hover:bg-primary/90" />
        </form>
    );
}
