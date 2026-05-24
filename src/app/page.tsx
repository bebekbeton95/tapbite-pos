import Link from "next/link";
import { ArrowRight, Store, Smartphone, TrendingUp, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary/20">
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <div className="font-extrabold text-2xl flex items-center gap-2 text-primary tracking-tight">
            <img src="/logo.png" alt="TapBite Logo" className="w-8 h-8 rounded-lg object-cover" />
            TapBite
          </div>
          <div className="space-x-4 flex items-center">
            <Link href="/login" className="font-semibold text-gray-600 hover:text-black transition-colors">Masuk</Link>
            <Link href="/register" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">Mulai Gratis</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Animated Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-purple-500/5 -z-10" />
          <div className="max-w-6xl mx-auto px-4 pt-24 pb-32 text-center relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Platform Kasir & Katalog Web #1
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-zinc-900 max-w-4xl mx-auto">
              Bikin Toko Online dalam <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                1 Menit, 0 Rupiah.
              </span>
            </h1>

            <p className="text-xl/relaxed text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
              Sistem pemesanan pintar tanpa komisi. Cocok untuk F&B, Retail, dan Jasa.
              Pelanggan order langsung dari browser, masuk otomatis ke WhatsApp Anda.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/register" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-bold hover:bg-primary/90 transition-all duration-300 shadow-[0_8px_30px_rgb(84,36,220,0.2)] hover:shadow-[0_20px_40px_rgb(84,36,220,0.3)] hover:-translate-y-1">
                Buat Tokoku Sekarang <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#features" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white text-zinc-900 border border-zinc-200 px-8 py-4 rounded-full text-lg font-bold hover:bg-zinc-50 transition-all duration-300">
                Pelajari Fitur
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm font-medium text-gray-500">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Gratis Selamanya</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Tanpa Komisi Potongan</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Setup &lt; 1 Menit</span>
            </div>

            <div className="mt-20 max-w-5xl mx-auto rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-gray-100 hidden md:block">
              <img src="/hero-illustration.png" alt="TapBite Interface Showcase" className="w-full h-auto object-cover" />
            </div>
          </div>
        </section>

        {/* Features / Value Proposition */}
        <section id="features" className="bg-white py-24 border-t">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Fokus Jualan, Kami Urus Sisanya.</h2>
              <p className="text-xl text-gray-600">Tinggalkan cara lama mencatat pesanan manual. Beralih ke TapBite.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-8 rounded-3xl bg-indigo-50/30 hover:bg-white shadow-sm hover:shadow-[0_20px_40px_rgb(84,36,220,0.06)] transition-all duration-500 ease-out border border-indigo-100/50 hover:border-primary/20 hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ease-out">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900">Frictionless Order</h3>
                <p className="text-zinc-600 text-lg leading-relaxed">Pelanggan tidak perlu download aplikasi. Cukup klik link di biografi Instagram Anda, pilih menu, kirim pesanan.</p>
              </div>

              <div className="p-8 rounded-3xl bg-indigo-50/30 hover:bg-white shadow-sm hover:shadow-[0_20px_40px_rgb(84,36,220,0.06)] transition-all duration-500 ease-out border border-indigo-100/50 hover:border-primary/20 hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ease-out">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900">100% Milik Anda</h3>
                <p className="text-zinc-600 text-lg leading-relaxed">Selamat tinggal komisi 20-30% platform lain. Semua keuntungan yang Anda dapatkan masuk ke kantong Anda 100%.</p>
              </div>

              <div className="p-8 rounded-3xl bg-indigo-50/30 hover:bg-white shadow-sm hover:shadow-[0_20px_40px_rgb(84,36,220,0.06)] transition-all duration-500 ease-out border border-indigo-100/50 hover:border-primary/20 hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ease-out">
                  <Store className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900">Kasir Cerdas</h3>
                <p className="text-zinc-600 text-lg leading-relaxed">Kelola semua pesanan yang masuk melalui Dashboard canggih yang merangkap fungsi sebagai sistem Point of Sale mini.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-indigo-50 bg-indigo-50/20 text-center py-12 text-gray-500 font-medium">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          <img src="/logo.png" alt="TapBite Logo" className="w-8 h-8 mb-4 rounded-lg object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
          <p>&copy; {new Date().getFullYear()} TapBite. Diberdayakan oleh Kreativitas.</p>
        </div>
      </footer>
    </div>
  );
}
