"use client";

import { useState } from "react";
import { Receipt, Printer, MessageCircle, Mail, X } from "lucide-react";
import { getInvoiceData } from "@/app/actions/order";

export function InvoiceModalTrigger({ orderId }: { orderId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    const handleOpen = async () => {
        setIsOpen(true);
        setIsLoading(true);
        const res = await getInvoiceData(orderId);
        setData(res);
        setIsLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) {
        return (
            <button onClick={handleOpen} className="p-2 bg-gray-50 border border-gray-200 hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-gray-600 rounded-lg transition-all" title="Cetak Invoice/Struk">
                <Receipt className="w-4 h-4" />
            </button>
        );
    }

    let itemsString = "";
    let waText = "";
    let mailtoLink = "";

    if (data) {
        itemsString = data.items.map((i: any) => `- ${i.quantity}x ${i.productName} (Rp ${i.priceAtPurchase.toLocaleString('id-ID')})`).join('\n');
        waText = encodeURIComponent(`Halo ${data.order.customerName},\n\nTerima kasih telah berbelanja di *${data.store.name}*.\n\nDetail Pesanan Anda (ID: ${data.order.id}):\n${itemsString}\n\n*Total Tagihan: Rp ${data.order.totalAmount.toLocaleString('id-ID')}*\nStatus: ${data.order.status}\n\nTerima kasih!`);
        mailtoLink = `mailto:?subject=Invoice Pesanan ${data.order.id} - ${data.store.name}&body=${waText}`;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:p-0">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200 print:shadow-none print:max-h-none print:overflow-visible">

                {/* Close Button & Actions (Hidden in Print) */}
                <div className="sticky top-0 right-0 left-0 bg-white/90 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center print:hidden z-10">
                    <h2 className="font-bold text-lg flex items-center gap-2"><Receipt className="w-5 h-5 text-primary" /> Invoice Pesanan</h2>
                    <div className="flex items-center gap-2">
                        {data && (
                            <>
                                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-bold text-sm transition-all shadow-sm">
                                    <Printer className="w-4 h-4" /> Cetak
                                </button>
                                <a href={`https://wa.me/${data.order.customerPhone.replace(/\D/g, '')}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white hover:bg-[#20BE5A] rounded-xl font-bold text-sm transition-all shadow-sm">
                                    <MessageCircle className="w-4 h-4" /> WA
                                </a>
                                <a href={mailtoLink} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-sm transition-all shadow-sm">
                                    <Mail className="w-4 h-4" /> Email
                                </a>
                                <div className="w-px h-6 bg-gray-200 mx-2"></div>
                            </>
                        )}
                        <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Memuat data invoice...</p>
                    </div>
                ) : !data ? (
                    <div className="p-20 text-center text-red-500 font-medium">Gagal memuat invoice.</div>
                ) : (
                    <div className="p-8 sm:p-12 print:p-0" id="printable-invoice">
                        {/* Print Styles */}
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @media print {
                                @page { margin: 0; size: auto; }
                                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                * { color: black !important; }
                            }
                        `}} />

                        {/* Invoice Header */}
                        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-6">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-1">INVOICE</h1>
                                <p className="text-gray-500 font-medium">#{data.order.id.toUpperCase()}</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {new Date(data.order.createdAt || Date.now()).toLocaleDateString('id-ID', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-bold text-gray-900">{data.store.name}</h2>
                                <p className="text-gray-500 mt-1">{data.store.whatsappNumber}</p>
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ditagihkan Kepada:</h3>
                                <p className="font-bold text-gray-900">{data.order.customerName}</p>
                                <p className="text-gray-600 text-sm">{data.order.customerPhone}</p>
                                {data.order.deliveryAddress && (
                                    <p className="text-gray-600 leading-relaxed mt-1 text-sm">{data.order.deliveryAddress}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Metode Pesanan:</h3>
                                <p className="font-bold text-gray-900 uppercase">{data.order.deliveryType}</p>
                                <div className="mt-2">
                                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gray-200 text-gray-700">
                                        Status:  {data.order.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full text-left mb-8 border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-900">
                                    <th className="py-3 font-bold text-gray-900 uppercase tracking-wider text-xs">Menu</th>
                                    <th className="py-3 font-bold text-gray-900 uppercase tracking-wider text-xs text-center">Qty</th>
                                    <th className="py-3 font-bold text-gray-900 uppercase tracking-wider text-xs text-right">Harga</th>
                                    <th className="py-3 font-bold text-gray-900 uppercase tracking-wider text-xs text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.items.map((item: any, i: number) => (
                                    <tr key={i}>
                                        <td className="py-3">
                                            <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                                            {item.variantDetails && <p className="text-xs text-gray-500 mt-0.5">{item.variantDetails}</p>}
                                        </td>
                                        <td className="py-3 text-center font-medium text-gray-600 text-sm">{item.quantity}</td>
                                        <td className="py-3 text-right font-medium text-gray-600 text-sm">Rp {item.priceAtPurchase.toLocaleString('id-ID')}</td>
                                        <td className="py-3 text-right font-bold text-gray-900 text-sm">Rp {(item.quantity * item.priceAtPurchase).toLocaleString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-1/2 min-w-[200px]">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-600 text-sm">Subtotal</span>
                                    <span className="font-bold text-gray-900 text-sm">Rp {data.order.subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b-2 border-gray-900">
                                    <span className="font-black text-lg text-gray-900 uppercase">Total Akhir</span>
                                    <span className="font-black text-lg text-gray-900">Rp {data.order.totalAmount.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Notes */}
                        <div className="mt-12 text-center text-gray-400 text-xs">
                            <p>Terima kasih atas pesanan Anda.</p>
                            <p className="mt-1">Invoice ini sah dan diproduksi secara sistem oleh TapBite POS.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
