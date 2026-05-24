import { create } from 'zustand';

export type CartItem = {
    productId: string;
    productName: string;
    price: number;
    qty: number;
    variantDetails?: string;
    isPreorder?: boolean;
    poEstimation?: string | null;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.productId === item.productId);
        if (existing) {
            return {
                items: state.items.map((i) =>
                    i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i
                ),
            };
        }
        return { items: [...state.items, item] };
    }),
    removeItem: (productId) => set((state) => ({
        items: state.items.filter((i) => i.productId !== productId)
    })),
    clearCart: () => set({ items: [] }),
    getTotalPrice: () => get().items.reduce((sum, i) => sum + (i.price * i.qty), 0),
    getTotalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
}));
