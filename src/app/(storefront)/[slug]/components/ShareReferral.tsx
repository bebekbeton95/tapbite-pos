"use client";

import { useState } from "react";
import { Share2, Copy, CheckCircle2 } from "lucide-react";

export default function ShareReferral({ slug, storeName }: { slug: string, storeName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [phone, setPhone] = useState("");
    const [copied, setCopied] = useState(false);

    const link = typeof window !== 'undefined'
        ? `${window.location.origin}/${slug}?ref=${phone.replace(/\D/g, '')}`
        : `https://tapbite.id/${slug}?ref=${phone.replace(/\D/g, '')}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) {
        return (
            <div className="flex justify-center mt-8 pb-12">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 font-bold hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all group"
                >
                    <Share2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    Ikut Program Referral & Untung Bareng!
                </button>
            </div>
        );
    }

    return (
        <div className="flex justify-center mt-8 pb-12 w-full max-w-md mx-auto px-4">
            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-[#1c1c1c] text-lg flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary" /> Dapatkan Komisi
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 text-sm font-bold">Tutup</button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Masukkan nomor WhatsApp Anda untuk membuat link khusus. Jika ada yang membeli via link ini, Anda akan tercatat sebagai referrer!
                </p>
                <div className="space-y-4">
                    <div>
                        <input
                            type="tel"
                            placeholder="Nomor WhatsApp Anda (Cth: 0812...)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm"
                        />
                    </div>
                    {phone.length > 8 && (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Link Referral Anda:</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={link}
                                    className="w-full px-3 py-2 bg-primary/5 text-primary border border-primary/20 rounded-lg text-xs font-mono select-all"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="shrink-0 p-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
