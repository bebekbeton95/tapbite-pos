import { createClient } from "@libsql/client";

async function main() {
    const db = createClient({
        url: "file:./local.db",
    });

    const stores = await db.execute("SELECT id FROM stores LIMIT 1;");
    const storeId = stores.rows[0].id;

    const orderId = `ORD-TEST-${Date.now().toString().slice(-6)}`;

    // Create a PENDING order (Piutang)
    await db.execute({
        sql: `INSERT INTO orders (id, store_id, customer_name, customer_phone, delivery_type, subtotal, total_amount, status, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [orderId, storeId, "Budi (Test Piutang)", "081234567890", "Dine In", 75000, 75000, "PENDING"]
    });

    console.log(`Created test PENDING order: ${orderId} for 75,000`);
}

main().catch(console.error);
