import { createClient } from "@libsql/client";

async function main() {
    const db = createClient({
        url: "file:./local.db",
    });

    const orders = await db.execute("SELECT id, status, created_at FROM orders;");
    console.log("Current orders:", orders.rows);

    await db.execute("UPDATE orders SET status = 'completed'");
    console.log("Updated all orders to completed!");
}

main().catch(console.error);
