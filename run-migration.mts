import { createClient } from "@libsql/client";

async function main() {
    const db = createClient({
        url: "file:./local.db",
    });

    const statements = [
        `CREATE TABLE \`expenses\` (
            \`id\` text PRIMARY KEY NOT NULL,
            \`store_id\` text NOT NULL,
            \`category\` text NOT NULL,
            \`amount\` real NOT NULL,
            \`description\` text,
            \`date\` integer NOT NULL,
            \`created_at\` text DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (\`store_id\`) REFERENCES \`stores\`(\`id\`) ON UPDATE no action ON DELETE cascade
        );`,
        `CREATE TABLE \`product_variants\` (
            \`id\` text PRIMARY KEY NOT NULL,
            \`product_id\` text NOT NULL,
            \`name\` text NOT NULL,
            \`price_offset\` real DEFAULT 0 NOT NULL,
            \`stock\` integer DEFAULT 0,
            \`is_unlimited_stock\` integer DEFAULT true,
            FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
        );`,
        `PRAGMA foreign_keys=OFF;`,
        `CREATE TABLE \`__new_products\` (
            \`id\` text PRIMARY KEY NOT NULL,
            \`store_id\` text NOT NULL,
            \`name\` text NOT NULL,
            \`description\` text,
            \`base_price\` real NOT NULL,
            \`discount_price\` real,
            \`promo_start_date\` integer,
            \`promo_end_date\` integer,
            \`image_url\` text,
            \`stock\` integer DEFAULT 0,
            \`is_unlimited_stock\` integer DEFAULT true,
            \`is_available\` integer DEFAULT true,
            \`is_live\` integer DEFAULT false,
            \`is_preorder\` integer DEFAULT false,
            \`po_estimation\` text,
            FOREIGN KEY (\`store_id\`) REFERENCES \`stores\`(\`id\`) ON UPDATE no action ON DELETE cascade
        );`,
        `INSERT INTO \`__new_products\`("id", "store_id", "name", "description", "base_price", "image_url", "stock", "is_available", "is_preorder", "po_estimation") 
         SELECT "id", "store_id", "name", "description", "base_price", "image_url", "stock", "is_available", "is_preorder", "po_estimation" FROM \`products\`;`,
        `DROP TABLE \`products\`;`,
        `ALTER TABLE \`__new_products\` RENAME TO \`products\`;`,
        `PRAGMA foreign_keys=ON;`,
        `ALTER TABLE \`order_items\` ADD \`is_preorder\` integer DEFAULT false;`,
        `ALTER TABLE \`order_items\` ADD \`po_estimation\` text;`,
        `ALTER TABLE \`stores\` ADD \`theme\` text DEFAULT 'theme-indigo';`,
        `ALTER TABLE \`stores\` ADD \`pro_expires_at\` integer;`,
        `ALTER TABLE \`stores\` ADD \`theme_color\` text DEFAULT '#00B14F';`,
        `ALTER TABLE \`stores\` ADD \`banner_url\` text;`,
        `ALTER TABLE \`stores\` ADD \`welcome_message\` text;`,
        `ALTER TABLE \`stores\` ADD \`is_referral_active\` integer DEFAULT 0;`,
        `ALTER TABLE \`orders\` ADD \`referrer_phone\` text;`
    ];

    for (let statement of statements) {
        try {
            console.log("Executing:", statement.substring(0, 50) + "...");
            await db.execute(statement);
        } catch (e) {
            console.error("Error executing statement, this might happen for ADD COLUMN if it already exists.", (e as Error).message);
        }
    }

    console.log("Migration completed.");
}

main().catch(console.error);
