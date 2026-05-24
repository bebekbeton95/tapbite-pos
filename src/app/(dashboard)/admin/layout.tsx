import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const store = await db.query.stores.findFirst({
        where: eq(stores.userId, session.user.id),
    });

    if (!store) {
        return <>{children}</>;
    }

    return (
        <div className={`flex flex-col md:flex-row min-h-screen bg-gray-50 selection:bg-primary/20 ${store.theme || "theme-indigo"}`}>
            <AdminSidebar storeName={store.name} userName={session.user.name} />
            <main className="flex-1 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
