import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. BETTER AUTH TABLES
export const user = sqliteTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const session = sqliteTable('session', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    token: text('token').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const account = sqliteTable('account', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
});

// 2. MULTI-TENANT SAAS TABLES
export const stores = sqliteTable('stores', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    whatsappNumber: text('whatsapp_number').notNull(),
    logoUrl: text('logo_url'),
    theme: text('theme').default('theme-indigo'),
    themeColor: text('theme_color').default('#00B14F'), // Iteration 5
    bannerUrl: text('banner_url'),                      // Iteration 5
    welcomeMessage: text('welcome_message'),            // Iteration 5
    isReferralActive: integer('is_referral_active', { mode: 'boolean' }).default(false), // Iteration 5
    subscriptionTier: text('subscription_tier').default('FREE'),
    proExpiresAt: integer('pro_expires_at', { mode: 'timestamp' }),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const products = sqliteTable('products', {
    id: text('id').primaryKey(),
    storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    basePrice: real('base_price').notNull(),
    discountPrice: real('discount_price'),
    promoStartDate: integer('promo_start_date', { mode: 'timestamp' }),
    promoEndDate: integer('promo_end_date', { mode: 'timestamp' }),
    imageUrl: text('image_url'),
    stock: integer('stock').default(0),
    isUnlimitedStock: integer('is_unlimited_stock', { mode: 'boolean' }).default(true),
    isAvailable: integer('is_available', { mode: 'boolean' }).default(true),
    isLive: integer('is_live', { mode: 'boolean' }).default(false),
    isPreorder: integer('is_preorder', { mode: 'boolean' }).default(false),
    poEstimation: text('po_estimation'),
});

export const productVariants = sqliteTable('product_variants', {
    id: text('id').primaryKey(),
    productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    priceOffset: real('price_offset').default(0).notNull(),
    stock: integer('stock').default(0),
    isUnlimitedStock: integer('is_unlimited_stock', { mode: 'boolean' }).default(true),
});

export const expenses = sqliteTable('expenses', {
    id: text('id').primaryKey(),
    storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    amount: real('amount').notNull(),
    description: text('description'),
    date: integer('date', { mode: 'timestamp' }).notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 3. ORDER & POS TRACKING TABLES
export const orders = sqliteTable('orders', {
    id: text('id').primaryKey(),
    storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
    customerName: text('customer_name').notNull(),
    customerPhone: text('customer_phone').notNull(),
    referrerPhone: text('referrer_phone'), // Iteration 5: Referral tracking
    deliveryType: text('delivery_type').notNull(),
    deliveryAddress: text('delivery_address'),
    notes: text('notes'),
    subtotal: real('subtotal').notNull(),
    totalAmount: real('total_amount').notNull(),
    status: text('status').default('PENDING'), // PENDING, PAID, COMPLETED, CANCELLED
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const orderItems = sqliteTable('order_items', {
    id: text('id').primaryKey(),
    orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
    productName: text('product_name').notNull(),
    variantDetails: text('variant_details'),
    quantity: integer('quantity').notNull(),
    priceAtPurchase: real('price_at_purchase').notNull(),
    isPreorder: integer('is_preorder', { mode: 'boolean' }).default(false),
    poEstimation: text('po_estimation'),
});
