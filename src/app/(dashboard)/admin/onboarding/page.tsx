import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const existingStore = await db.query.stores.findFirst({
        where: eq(stores.userId, session.user.id),
    });

    if (existingStore) redirect("/admin");

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border">
                <h1 className="text-2xl font-bold mb-2">Selamat Datang di TapBite!</h1>
                <p className="text-gray-600 mb-6">Mari siapkan warung/toko Anda dalam beberapa langkah mudah.</p>

                <OnboardingForm />
            </div>
        </div>
    );
}
