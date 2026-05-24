import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Settings, Palette, Image as ImageIcon, MessageSquare, Store, CheckCircle2 } from "lucide-react";
import { updateStoreSettings } from "@/app/actions/store";
import { revalidatePath } from "next/cache";

export default async function SettingsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const store = await db.query.stores.findFirst({
        where: eq(stores.userId, session.user.id),
    });

    if (!store) redirect("/admin/onboarding");

    // Client action wrapper for revalidation? No, we use a standard server component with server action directly
    const handleSave = async (formData: FormData) => {
        "use server";
        await updateStoreSettings(store.id, formData);
        revalidatePath('/admin/settings');
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Pengaturan Toko</h1>
                <p className="text-gray-500 font-medium">Kustomisasi tampilan Storefront Anda agar terlihat lebih menarik dan profesional.</p>
            </header>

            <form action={handleSave} className="space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900">
                        <Store className="w-6 h-6 text-primary" /> Template & Desain Storefront
                    </h2>

                    <div className="mb-8">
                        <p className="text-sm font-medium text-gray-600 mb-4">Pilih gaya visual atau template struktur untuk toko online Anda.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <label className={`relative flex cursor-pointer rounded-2xl border-2 p-4 flex-col gap-3 hover:bg-gray-50 transition-all ${store.theme === 'theme-zinc' || !store.theme ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200'}`}>
                                <input type="radio" name="theme" value="theme-zinc" defaultChecked={store.theme === 'theme-zinc' || !store.theme} className="sr-only" />
                                <div className="h-24 bg-gray-100 rounded-xl w-full border border-gray-200 overflow-hidden relative">
                                    <div className="absolute top-2 left-2 right-2 h-4 bg-white rounded shadow-sm"></div>
                                    <div className="absolute top-8 left-2 w-1/3 h-12 bg-gray-200 rounded"></div>
                                    <div className="absolute top-8 right-2 w-1/2 h-12 bg-white rounded shadow-sm"></div>
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-900">Minimalist Modern</span>
                                    <span className="block text-xs text-gray-500 mt-1">Bersih, fokus pada gambar menu dan warna solid abu-abu.</span>
                                </div>
                                {(store.theme === 'theme-zinc' || !store.theme) && (
                                    <div className="absolute top-4 right-4 text-primary"><CheckCircle2 className="w-5 h-5" /></div>
                                )}
                            </label>

                            <label className={`relative flex cursor-pointer rounded-2xl border-2 p-4 flex-col gap-3 hover:bg-gray-50 transition-all ${store.theme === 'theme-orange' ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200'}`}>
                                <input type="radio" name="theme" value="theme-orange" defaultChecked={store.theme === 'theme-orange'} className="sr-only" />
                                <div className="h-24 bg-orange-50 rounded-xl w-full border border-orange-100 overflow-hidden relative">
                                    <div className="absolute top-2 left-2 right-2 h-6 bg-orange-200 rounded-full"></div>
                                    <div className="absolute top-10 left-2 w-10 h-10 bg-orange-300 rounded-full"></div>
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-900">Playful & Fun</span>
                                    <span className="block text-xs text-gray-500 mt-1">Ceria dengan aksen membulat, cocok untuk jajanan atau minuman.</span>
                                </div>
                                {store.theme === 'theme-orange' && (
                                    <div className="absolute top-4 right-4 text-primary"><CheckCircle2 className="w-5 h-5" /></div>
                                )}
                            </label>

                            <label className={`relative flex cursor-pointer rounded-2xl border-2 p-4 flex-col gap-3 hover:bg-gray-50 transition-all ${store.theme === 'theme-indigo' ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200'}`}>
                                <input type="radio" name="theme" value="theme-indigo" defaultChecked={store.theme === 'theme-indigo'} className="sr-only" />
                                <div className="h-24 bg-indigo-50 rounded-xl w-full border border-indigo-100 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 right-0 h-8 bg-indigo-600"></div>
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-md"></div>
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-900">Elegant Classic</span>
                                    <span className="block text-xs text-gray-500 mt-1">Tampilan premium dan formal, andalan cafe dan resto.</span>
                                </div>
                                {store.theme === 'theme-indigo' && (
                                    <div className="absolute top-4 right-4 text-primary"><CheckCircle2 className="w-5 h-5" /></div>
                                )}
                            </label>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900 pt-6 border-t border-gray-50">
                        <Palette className="w-6 h-6 text-primary" /> Warna Tema Utama
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-4">Pilih warna yang paling merepresentasikan brand Anda. Warna ini akan digunakan pada tombol, aksen, dan elemen penting di Storefront.</p>
                            <div className="flex items-center gap-4">
                                <label htmlFor="themeColor" className="w-14 h-14 rounded-full border-4 border-white shadow-md relative overflow-hidden cursor-pointer">
                                    <input
                                        type="color"
                                        id="themeColor"
                                        name="themeColor"
                                        defaultValue={store.themeColor || '#00B14F'}
                                        className="absolute -top-2 -left-2 w-20 h-20 opacity-0 cursor-pointer"
                                    />
                                    <div className="w-full h-full" style={{ backgroundColor: store.themeColor || '#00B14F' }}></div>
                                </label>
                                <div>
                                    <div className="font-bold text-gray-900">Warna Aksen Aktif</div>
                                    <div className="text-xs text-gray-500 font-mono mt-0.5">{store.themeColor || '#00B14F'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900">
                        <ImageIcon className="w-6 h-6 text-primary" /> Banner Storefront
                    </h2>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-4">Tambahkan URL gambar banner untuk mempercantik bagian atas Storefront Anda. (Rekomendasi rasio: 16:9 atau lebih lebar)</p>
                        <input
                            type="url"
                            name="bannerUrl"
                            placeholder="https://example.com/banner.jpg"
                            defaultValue={store.bannerUrl || ''}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        />
                        {store.bannerUrl && (
                            <div className="mt-4 rounded-xl overflow-hidden shadow-sm border border-gray-100 aspect-[21/9] w-full">
                                <img src={store.bannerUrl} alt="Store Banner" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900">
                        <MessageSquare className="w-6 h-6 text-primary" /> Pesan Sambutan
                    </h2>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-4">Tuliskan pesan sambutan singkat atau promosi yang sedang berlangsung. Ini akan muncul di bawah nama toko Anda.</p>
                        <textarea
                            name="welcomeMessage"
                            placeholder="Halo! Selamat datang di toko kami. Nikmati diskon spesial..."
                            defaultValue={store.welcomeMessage || ''}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
                        <Settings className="w-5 h-5" /> Simpan Pengaturan
                    </button>
                </div>
            </form>
        </div>
    );
}
