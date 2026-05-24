ALTER TABLE `orders` ADD `referrer_phone` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `theme_color` text DEFAULT '#00B14F';--> statement-breakpoint
ALTER TABLE `stores` ADD `banner_url` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `welcome_message` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `is_referral_active` integer DEFAULT false;