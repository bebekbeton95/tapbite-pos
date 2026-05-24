"use client";

import { deleteProduct } from "@/app/actions/product";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ProductActions({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await deleteProduct(id);
        setIsDeleting(false);
        setIsOpen(false);
    };

    return (
        <>
            <div className="flex gap-2 items-center">
                <Link href={`/admin/products/${id}`} className="p-2 text-gray-400 hover:text-primary bg-gray-50 border border-gray-100 rounded-lg hover:bg-primary/5 transition-all outline-none">
                    <Edit className="w-4 h-4" />
                </Link>
                <button onClick={() => setIsOpen(true)} className={`p-2 text-red-400 hover:text-white bg-red-50 border border-red-100 rounded-lg hover:bg-red-500 transition-all outline-none`}>
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Premium Animated Delete Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200 relative overflow-hidden border border-gray-100">
                        {/* Subtle background decoration */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 border-4 border-white shadow-sm">
                                <Trash2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">Hapus Produk Ini?</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                Tindakan ini tidak dapat dibatalkan. Produk akan dihapus secara permanen dari etalase toko Anda.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 bg-red-500 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgb(239,68,68,0.39)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.23)] hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Menghapus...
                                        </>
                                    ) : (
                                        "Ya, Hapus"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
