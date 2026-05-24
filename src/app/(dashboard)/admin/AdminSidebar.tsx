"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, ShoppingCart, Package, Settings, LogOut, Activity, Calculator, Presentation } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AdminSidebar({ storeName, userName }: { storeName: string, userName: string }) {
    const pathname = usePathname();
    const router = useRouter();

    const menu = [
        { name: "Dashboard", href: "/admin", icon: Activity },
        { name: "Manajemen Pesanan", href: "/admin/orders", icon: ShoppingCart },
        { name: "Katalog Produk", href: "/admin/products", icon: Package },
        { name: "Pembukuan (PRO)", href: "/admin/pembukuan", icon: Calculator },
        { name: "Analitik (PRO)", href: "/admin/analytics", icon: Presentation },
        { name: "Program Referral", href: "/admin/referral", icon: Activity },
        { name: "Pengaturan Toko", href: "/admin/settings", icon: Settings },
    ];

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/login");
    };

    return (
        <aside className="w-full md:w-64 bg-white border-r md:min-h-screen flex flex-col shadow-sm sticky top-0 z-20">
            <div className="p-6 border-b">
                <div className="flex items-center gap-2 font-extrabold text-2xl text-primary tracking-tight">
                    <img src="/logo.png" alt="TapBite Logo" className="w-8 h-8 rounded-lg object-cover" />
                    TapBite
                </div>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {menu.map((item) => {
                    const isActive = pathname === item.href;
                    return 'disabled' in item && item.disabled ? (
                        <div key={item.name} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed opacity-60">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </div>
                    ) : (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold relative ${isActive ? "bg-primary/5 text-primary before:absolute before:inset-y-2 before:left-0 before:w-1.5 before:bg-primary before:rounded-r-full" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "relative z-10" : ""}`} />
                            <span className={isActive ? "relative z-10" : ""}>{item.name}</span>
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-4 border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                        {userName.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-sm tracking-tight">{storeName}</div>
                        <div className="text-xs text-gray-500 font-medium">Kasir Aktif</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-colors"
                >
                    <LogOut className="w-5 h-5" /> Keluar
                </button>
            </div>
        </aside>
    );
}
