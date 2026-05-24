"use client";

import { useState } from "react";
import { updateStoreTheme } from "./actions";
import { Check, Presentation } from "lucide-react";

const themes = [
    {
        id: "theme-indigo",
        name: "Vibrant Indigo",
        desc: "Tema cerah dengan nuansa modern.",
        color: "bg-indigo-600",
    },
    {
        id: "theme-emerald",
        name: "Fresh Emerald",
        desc: "Segar dan alami, cocok untuk makanan sehat.",
        color: "bg-emerald-600",
    },
    {
        id: "theme-rose",
        name: "Warm Rose",
        desc: "Tema merah muda yang estetik & hangat.",
        color: "bg-rose-600",
    },
    {
        id: "theme-monochrome",
        name: "Dark Monochrome",
        desc: "Elegan, hitam-putih, minimalis penuh kelas.",
        color: "bg-zinc-900",
    }
];

export function ThemeSelector({ storeId, currentTheme }: { storeId: string, currentTheme: string }) {
    const [theme, setTheme] = useState(currentTheme);
    const [loading, setLoading] = useState(false);

    const handleSelectTheme = async (newTheme: string) => {
        if (newTheme === theme) return;
        setTheme(newTheme);
        setLoading(true);
        await updateStoreTheme(storeId, newTheme);
        setLoading(false);
    };

    return (
        <section className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Presentation className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">Tema Etalase Toko</h2>
                    <p className="text-sm text-gray-500">Pilih palet warna yang paling mewakili identitas / brand kuliner Anda.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map((t) => {
                    const isActive = theme === t.id;
                    return (
                        <div
                            key={t.id}
                            onClick={() => handleSelectTheme(t.id)}
                            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 overflow-hidden group hover:-translate-y-0.5 ${isActive ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'} `}
                        >
                            <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center ${t.color}`}>
                                {isActive && <Check className="text-white w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-bold text-lg mb-1 ${isActive ? 'text-primary' : 'text-gray-900'}`}>{t.name}</h3>
                                <p className="text-xs text-gray-500">{t.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && (
                <p className="text-sm mt-4 text-gray-500 animate-pulse font-medium">✨ Menerapkan tema aplikasi...</p>
            )}
        </section>
    );
}
