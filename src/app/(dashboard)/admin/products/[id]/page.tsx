import { db } from "@/lib/db";
import { products, stores } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditProductForm } from "./EditProductForm";

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const store = await db.query.stores.findFirst({
        where: eq(stores.userId, session.user.id),
    });

    if (!store) redirect("/admin/onboarding");

    const product = await db.query.products.findFirst({
        where: and(eq(products.id, params.id), eq(products.storeId, store.id))
    });

    if (!product) redirect("/admin/products");

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-6 flex items-center gap-4">
                <Link href="/admin/products" className="p-2 border rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Edit Produk</h1>
                    <p className="text-gray-500 font-medium text-sm">Update informasi menu <b>{product.name}</b></p>
                </div>
            </header>
            <EditProductForm product={product} />
        </div>
    );
}
