"use client";

import { useState, useEffect } from "react";
import { getPricingSuggestions, applyPricingSuggestion } from "@/app/actions/pricing";
import type { PricingSuggestion } from "@/app/actions/pricing";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, TrendingDown, Check, Loader2, AlertCircle, Minus } from "lucide-react";

export function PricingSuggestions() {
    const [suggestions, setSuggestions] = useState<PricingSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applyingId, setApplyingId] = useState<string | null>(null);
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadSuggestions();
    }, []);

    async function loadSuggestions() {
        setLoading(true);
        setError(null);
        const result = await getPricingSuggestions();
        if (result.error) {
            setError(result.error);
        }
        setSuggestions(result.suggestions);
        setLoading(false);
    }

    async function handleApply(suggestion: PricingSuggestion) {
        setApplyingId(suggestion.productId);
        const result = await applyPricingSuggestion(suggestion.productId, suggestion.suggestedPrice);
        if (result.success) {
            setAppliedIds(prev => new Set(prev).add(suggestion.productId));
        } else {
            setError(result.error ?? "Gagal menerapkan harga.");
        }
        setApplyingId(null);
    }

    function getPriceDirection(current: number, suggested: number) {
        if (suggested > current * 1.02) return "up";
        if (suggested < current * 0.98) return "down";
        return "same";
    }

    const confidenceColors: Record<string, { bg: string; text: string; border: string }> = {
        high: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
        medium: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
        low: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
    };

    // Don't render anything if no suggestions and no error (e.g. FREE user)
    if (!loading && suggestions.length === 0 && !error) return null;

    return (
        <div className="mt-10">
            {/* Section Header */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-800 p-8 rounded-3xl border border-violet-500/30 shadow-[0_8px_30px_rgb(124,58,237,0.2)] text-white relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl origin-top-right scale-150"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">Saran Harga AI</h2>
                        <p className="text-violet-200 text-sm font-medium mt-1">Rekomendasi harga berdasarkan analisis data penjualan Anda</p>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Menganalisis data penjualan Anda...</p>
                    <p className="text-gray-400 text-sm mt-1">AI sedang menyusun rekomendasi harga optimal</p>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">Tidak dapat memuat saran</p>
                        <p className="text-gray-500 text-sm mt-1">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 rounded-xl"
                            onClick={loadSuggestions}
                        >
                            Coba Lagi
                        </Button>
                    </div>
                </div>
            )}

            {/* Suggestions List */}
            {!loading && suggestions.length > 0 && (
                <div className="space-y-4">
                    {suggestions.map((s) => {
                        const direction = getPriceDirection(s.currentPrice, s.suggestedPrice);
                        const isApplied = appliedIds.has(s.productId);
                        const isApplying = applyingId === s.productId;
                        const colors = confidenceColors[s.confidence];

                        return (
                            <div
                                key={s.productId}
                                className={`bg-white border rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all ${isApplied ? 'border-green-200 bg-green-50/30 opacity-70' : 'border-gray-100 hover:-translate-y-0.5'}`}
                            >
                                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                                    {/* Product Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <h3 className="font-bold text-lg text-gray-900">{s.productName}</h3>
                                            <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                                                {s.confidence === 'high' ? 'Tinggi' : s.confidence === 'medium' ? 'Sedang' : 'Rendah'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">{s.reasoning}</p>
                                    </div>

                                    {/* Price Comparison */}
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 font-medium">Harga Saat Ini</p>
                                            <p className="font-mono font-bold text-gray-500 text-lg">Rp {s.currentPrice.toLocaleString('id-ID')}</p>
                                        </div>

                                        <div className="flex items-center">
                                            {direction === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                                            {direction === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                                            {direction === 'same' && <Minus className="w-5 h-5 text-gray-400" />}
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 font-medium">Saran AI</p>
                                            <p className={`font-mono font-extrabold text-xl ${direction === 'up' ? 'text-green-600' : direction === 'down' ? 'text-red-600' : 'text-gray-900'}`}>
                                                Rp {s.suggestedPrice.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Apply Button */}
                                    <div className="sm:ml-4">
                                        {isApplied ? (
                                            <div className="flex items-center gap-2 text-green-600 font-bold text-sm px-4 py-2 bg-green-50 rounded-xl border border-green-200">
                                                <Check className="w-4 h-4" />
                                                Diterapkan
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => handleApply(s)}
                                                disabled={isApplying}
                                                className="bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2 rounded-xl shadow-[0_4px_14px_0_rgb(84,36,220,0.39)] hover:-translate-y-0.5 transition-all"
                                            >
                                                {isApplying ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    "Terapkan"
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <p className="text-xs text-gray-400 text-center pt-2">
                        Saran dihasilkan oleh AI berdasarkan data penjualan 90 hari terakhir. Selalu pertimbangkan kondisi pasar lokal Anda.
                    </p>
                </div>
            )}
        </div>
    );
}
