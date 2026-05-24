"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);

    const feedbacks = [
        {
            quote: "\"Semenjak pakai TapBite, catat orderan WhatsApp gak pernah serempong ini. Semua terstruktur rapi!\"",
            name: "Dimas K.",
            role: "Owner Kedai Kopi Senja",
            initials: "DK"
        },
        {
            quote: "\"Dulu pelanggan sering komplain karena salah catat pesanan, sekarang mereka tinggal klik pesanan 100% akurat.\"",
            name: "Siska P.",
            role: "Founder Ayam Geprek Siska",
            initials: "SP"
        },
        {
            quote: "\"Tampilannya sangat mewah dan profesional. Pelanggan saya merasa belanja di restoran bintang lima!\"",
            name: "Andi Wijaya",
            role: "CEO Burger Nusantara",
            initials: "AW"
        },
        {
            quote: "\"100% gratis tanpa potongan! Kalau di aplikasi ojek online margin udah kepotong banyak banget. TapBite ngebantu UMKM.\"",
            name: "Nadia M.",
            role: "Pemilik Seblak Mercon",
            initials: "NM"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeedbackIndex((prev) => (prev + 1) % feedbacks.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [feedbacks.length]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await authClient.signUp.email({
            email,
            password,
            name,
        });
        setLoading(false);
        if (error) {
            setError(error.message || "Gagal membuat akun.");
        } else {
            router.push("/admin/onboarding");
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-24">
                <div className="w-full max-w-sm mx-auto space-y-6">
                    <div className="flex items-center gap-2 text-primary mb-6 font-extrabold tracking-tight text-2xl">
                        <img src="/logo.png" alt="TapBite Logo" className="w-8 h-8 rounded-lg object-cover" />
                        TapBite
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Mulai Perjalanan Anda</h1>
                        <p className="text-gray-500">Dapatkan katalog online gratis, bebas 100% komisi aplikasi.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {error && (
                            <div className="text-sm rounded-lg border border-red-200 bg-red-50 text-red-600 py-3 px-4 flex items-center gap-2">
                                <span className="font-bold">!</span> {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-medium text-gray-700">Nama Pemilik Baru</Label>
                            <Input id="name" placeholder="Budi Santoso" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-primary px-4 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-medium text-gray-700">Email Bisnis</Label>
                            <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-primary px-4 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-medium text-gray-700">Buat Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-primary px-4 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-sm" />
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mt-4" disabled={loading}>
                            {loading ? "Menyiapkan Akun..." : "Buat Akun Sekarang"}
                        </Button>

                        <div className="text-center text-sm text-gray-500">
                            Sudah punya warung? <Link href="/login" className="text-primary font-bold hover:underline">Masuk</Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side: Visual Context */}
            <div className="hidden lg:flex flex-1 bg-primary text-white relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-primary to-purple-800 z-0"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                <div className="relative z-10 max-w-lg min-h-[300px] flex flex-col justify-center">
                    <div
                        key={currentFeedbackIndex}
                        className="animate-fade-in-up"
                    >
                        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-8">
                            {feedbacks[currentFeedbackIndex].quote}
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur text-white overflow-hidden flex items-center justify-center border border-white/30 shrink-0 shadow-lg">
                                <span className="font-bold text-lg">{feedbacks[currentFeedbackIndex].initials}</span>
                            </div>
                            <div>
                                <div className="font-bold text-white">{feedbacks[currentFeedbackIndex].name}</div>
                                <div className="text-white/80 text-sm">{feedbacks[currentFeedbackIndex].role}</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex gap-2 mt-12">
                        {feedbacks.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentFeedbackIndex(idx)}
                                aria-label={`Testimonial ${idx + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentFeedbackIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-600 hover:bg-gray-400'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
