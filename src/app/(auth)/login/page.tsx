"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await authClient.signIn.email({
            email,
            password,
        });
        setLoading(false);
        if (error) {
            setError(error.message || "Gagal login.");
        } else {
            router.push("/admin");
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-24">
                <div className="w-full max-w-sm mx-auto space-y-8">
                    <div className="flex items-center gap-2 text-primary mb-8 font-extrabold tracking-tight text-2xl">
                        <img src="/logo.png" alt="TapBite Logo" className="w-8 h-8 rounded-lg object-cover" />
                        TapBite
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Selamat Datang Kembali</h1>
                        <p className="text-gray-500">Masukkan email dan password Anda untuk masuk ke dashboard kasir.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="text-sm rounded-lg border border-red-200 bg-red-50 text-red-600 py-3 px-4 flex items-center gap-2">
                                <span className="font-bold">!</span> {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-medium text-gray-700">Email Utama</Label>
                            <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-primary px-4 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-medium text-gray-700">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-primary px-4 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-sm" />
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" disabled={loading}>
                            {loading ? "Menghubungkan..." : "Masuk ke Dashboard"}
                        </Button>

                        <div className="text-center text-sm text-gray-500">
                            Belum mendaftar? <Link href="/register" className="text-primary font-bold hover:underline">Buat toko gratis</Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side: Visual Context */}
            <div className="hidden lg:flex flex-1 bg-primary text-white relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-primary to-purple-800 z-0"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="relative z-10 max-w-lg bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 text-white">
                    <div className="flex gap-4 items-start mb-6">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl mb-1 text-white">Scale Bisnismu</h3>
                            <p className="text-white/80 leading-relaxed">Kelola ribuan pesanan dengan mudah dan bebas penalti komisi per transaksi.</p>
                        </div>
                    </div>
                    <div className="p-4 bg-black/20 rounded-2xl border border-white/10 text-sm font-mono text-white/90 flex justify-between items-center group cursor-default">
                        <span>Status Sistem:</span>
                        <span className="flex items-center gap-2 text-green-400 font-bold"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse group-hover:scale-125 transition-transform"></span> Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
