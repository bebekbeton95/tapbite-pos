"use client";

import { useCartStore } from "@/store/useCartStore";
import { Plus, Minus } from "lucide-react";

export default function AddToCartButton({ product }: { product: any }) {
    const { items, addItem, removeItem } = useCartStore();
    const cartItem = items.find((i) => i.productId === product.id);
    const qty = cartItem ? cartItem.qty : 0;

    if (qty > 0) {
        return (
            <div className="flex items-center bg-gray-100 rounded-full border border-gray-200 overflow-hidden shadow-sm">
                <button
                    onClick={() => {
                        if (qty === 1) removeItem(product.id);
                        else
                            addItem({
                                productId: product.id,
                                productName: product.name,
                                price: product.basePrice,
                                qty: -1,
                                isPreorder: product.isPreorder,
                                poEstimation: product.poEstimation,
                            });
                    }}
                    className="p-3 text-gray-700 hover:bg-gray-200 hover:text-black transition-colors"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="font-extrabold w-8 text-center text-gray-900">{qty}</span>
                <button
                    onClick={() => addItem({ productId: product.id, productName: product.name, price: product.basePrice, qty: 1 })}
                    className="p-3 text-gray-700 hover:bg-gray-200 hover:text-black transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => addItem({
                productId: product.id,
                productName: product.name,
                price: product.discountPrice || product.basePrice,
                qty: 1,
                isPreorder: product.isPreorder,
                poEstimation: product.poEstimation
            })}
            className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full hover:brightness-95 hover:scale-105 transition-all shadow-sm"
        >
            <Plus className="w-5 h-5" />
        </button>
    );
}
