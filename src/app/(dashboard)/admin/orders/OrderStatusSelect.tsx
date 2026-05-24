"use client";

import { updateOrderStatus } from "@/app/actions/order";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLoading(true);
        await updateOrderStatus(orderId, e.target.value);
        setLoading(false);
        router.refresh();
    };

    return (
        <select
            value={currentStatus}
            onChange={handleChange}
            disabled={loading}
            className={`border rounded-lg px-2 py-1 text-sm bg-white hover:bg-gray-50 transition cursor-pointer ${loading ? 'opacity-50' : ''}`}
        >
            <option value="PENDING">Pending</option>
            <option value="PAID">Lunas</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
        </select>
    );
}
