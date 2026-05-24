CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`category` text NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	`date` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`price_offset` real DEFAULT 0 NOT NULL,
	`stock` integer DEFAULT 0,
	`is_unlimited_stock` integer DEFAULT true,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`base_price` real NOT NULL,
	`discount_price` real,
	`promo_start_date` integer,
	`promo_end_date` integer,
	`image_url` text,
	`stock` integer DEFAULT 0,
	`is_unlimited_stock` integer DEFAULT true,
	`is_available` integer DEFAULT true,
	`is_live` integer DEFAULT false,
	`is_preorder` integer DEFAULT false,
	`po_estimation` text,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "store_id", "name", "description", "base_price", "discount_price", "promo_start_date", "promo_end_date", "image_url", "stock", "is_unlimited_stock", "is_available", "is_live", "is_preorder", "po_estimation") SELECT "id", "store_id", "name", "description", "base_price", "discount_price", "promo_start_date", "promo_end_date", "image_url", "stock", "is_unlimited_stock", "is_available", "is_live", "is_preorder", "po_estimation" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `order_items` ADD `is_preorder` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `order_items` ADD `po_estimation` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `theme` text DEFAULT 'theme-indigo';--> statement-breakpoint
ALTER TABLE `stores` ADD `pro_expires_at` integer;