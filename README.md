# TapBite

Commission-free direct-to-WhatsApp ordering platform for Indonesian F&B and retail UMKM.

TapBite gives small merchants a professional online storefront where customers browse products, build a cart, and submit orders sent directly to the merchant's WhatsApp. No app download, no login required.

## Features

- **Storefront** — Customizable themed layouts (Minimalist, Playful, Elegant) at `/<store-slug>`
- **WhatsApp Ordering** — Orders generate pre-formatted `wa.me` deep links, no payment gateway needed
- **Mini POS Dashboard** — Manage products, track orders (PENDING → PAID → COMPLETED), generate PDF invoices
- **AI Smart Pricing** — GPT-4o-mini analyzes sales data and recommends optimal prices with reasoning (PRO)
- **Analytics** — Revenue charts, top products, top customers, AOV tracking (PRO)
- **Bookkeeping** — Income/expense tracking with profit/loss reports (PRO)
- **Referral Program** — Customer referral links with attribution tracking (PRO)
- **Tiered Plans** — Free tier (1 product) and PRO tier (unlimited products, AI pricing, analytics)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Server Actions, React 19) |
| Language | TypeScript |
| Database | SQLite via libsql (Turso for production) |
| ORM | Drizzle ORM |
| Auth | Better Auth (email + password, session-based) |
| State | Zustand (client-side cart) |
| UI | Tailwind CSS 4, shadcn/ui, Lucide icons |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| PDF | @react-pdf/renderer, jsPDF |
| AI | OpenAI GPT-4o-mini (smart pricing suggestions) |

---

## AI Smart Pricing — Technical Deep Dive

The AI Smart Pricing feature is a PRO-only capability that uses GPT-4o-mini to analyze a merchant's historical sales data and generate optimal price recommendations for each product.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Products Page (Client Component)                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  PricingSuggestions.tsx                            │  │
│  │  - useEffect → calls getPricingSuggestions()       │  │
│  │  - Renders suggestion cards with Apply buttons     │  │
│  │  - "Terapkan" → calls applyPricingSuggestion()     │  │
│  └───────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ Server Action Call
                        ▼
┌─────────────────────────────────────────────────────────┐
│  pricing.ts (Server Action)                             │
│                                                         │
│  1. Auth + PRO gate check                               │
│  2. Rate limit (1 req / 60s per store)                  │
│  3. Data gathering (Drizzle queries)                    │
│  4. Build LLM prompt (Bahasa Indonesia)                 │
│  5. Call OpenAI GPT-4o-mini (JSON mode)                 │
│  6. Validate, clamp, and return suggestions             │
└───────────────────────┬─────────────────────────────────┘
                        │ API Call
                        ▼
┌─────────────────────────────────────────────────────────┐
│  OpenAI GPT-4o-mini                                     │
│  - response_format: json_object                         │
│  - temperature: 0.7                                     │
│  - max_tokens: 2000                                     │
└─────────────────────────────────────────────────────────┘
```

### Data Pipeline

**Step 1 — Sales Data Aggregation (Drizzle ORM)**

The server action queries `orderItems` joined with `orders` and `products`, filtering to the last 90 days of completed orders (status `PAID` or `completed`). For each product, it computes:

| Metric | SQL | Purpose |
|--------|-----|---------|
| `totalQty` | `SUM(orderItems.quantity)` | Total units sold |
| `totalRevenue` | `SUM(priceAtPurchase * quantity)` | Revenue generated |
| `avgSellingPrice` | `totalRevenue / totalQty` | Effective average price (detects if discounts were applied) |
| `firstSaleDate` | `MIN(orders.createdAt)` | Used to calculate sales velocity |
| `salesVelocity` | `totalQty / daysSinceFirstSale` | Units per day — indicates demand strength |

Products with zero sales are included with zeroed metrics so the LLM can suggest introductory pricing.

**Step 2 — Store-Level Context**

The action also computes:
- Store name and slug (for LLM context)
- Average Order Value (AOV) across all completed orders
- Total number of active products
- Total completed order count

**Step 3 — Data Sufficiency Check**

If the store has fewer than 3 completed orders, the action returns early with a user-friendly message. This prevents wasting API calls on stores with insufficient data for meaningful analysis.

**Step 4 — LLM Prompt Construction**

The prompt is structured in two parts:

**System prompt** (Bahasa Indonesia):
> Anda adalah analis harga untuk merchant UMKM makanan dan minuman di Indonesia. Tugas Anda adalah menganalisis data penjualan dan menyarankan harga optimal. Selalu respons dalam format JSON yang valid. Pertimbangkan: harga psikologis (misal 25000 bukan 24876), daya beli pasar lokal, dan strategi diskon. Jangan menyarankan harga di bawah 70% atau di atas 200% dari harga saat ini.

Key constraints embedded in the prompt:
- **Psychological pricing** — round to clean numbers (Rp 25.000, not Rp 24.876)
- **Local purchasing power** — considers Indonesian UMKM market context
- **Price bounds** — clamped between 70% and 200% of current price
- **Introductory pricing** — handles products with zero sales

**User prompt** includes per-product data blocks with all computed metrics, plus an explicit JSON schema for the response.

**Step 5 — OpenAI API Call**

```typescript
const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
});
```

- **Model**: `gpt-4o-mini` — chosen for cost efficiency (~$0.001 per invocation with 10 products)
- **JSON mode**: `response_format: { type: 'json_object' }` guarantees valid JSON output without regex parsing
- **Temperature 0.7**: balances creativity with consistency in price suggestions

**Step 6 — Response Validation & Safety**

After receiving the LLM response, the action:
1. Parses the JSON and extracts the `suggestions` array
2. Filters out entries missing required fields (`productId`, `suggestedPrice`, `reasoning`, `confidence`)
3. **Clamps prices** to `[currentPrice * 0.7, currentPrice * 2]` and minimum Rp 1.000
4. Maps confidence strings to numeric scores: `high` → 90, `medium` → 70, `low` → 50
5. Truncates reasoning to 200 characters

### The Apply Flow

When the merchant clicks "Terapkan" on a suggestion:

1. `applyPricingSuggestion(productId, newPrice)` server action is called
2. Verifies the product belongs to the authenticated user's store
3. Updates `basePrice` on the `products` table
4. Calls `revalidatePath('/admin/products')` and `revalidatePath('/${store.slug}')` to refresh both the dashboard and public storefront

### Safeguards

| Safeguard | Implementation |
|-----------|---------------|
| PRO gating | Server action checks `subscriptionTier` and `proExpiresAt` before any processing |
| Rate limiting | In-memory `Map<storeId, timestamp>` with 60-second cooldown per store |
| Price clamping | Math bounds prevent extreme suggestions (70%-200% of current price) |
| Data threshold | Minimum 3 completed orders required before generating suggestions |
| Product limit | Analysis capped at top 20 products by sales volume to control prompt size |
| Error handling | Try/catch around API call with user-friendly fallback messages |
| API key check | Returns clear error if `OPENAI_API_KEY` is not configured |

### UI Component

The `PricingSuggestions.tsx` client component:
- Auto-loads suggestions on page mount via `useEffect`
- Displays a purple/indigo gradient header with Sparkles icon
- Each suggestion card shows: product name, current vs suggested price, direction arrow (up/down/same), confidence badge (green/yellow/red), reasoning text, and "Terapkan" button
- Applied suggestions show a green checkmark with muted styling
- Loading state shows a spinner with "Menganalisis data penjualan Anda..."
- Error/empty states display appropriate messages with retry option

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- OpenAI API key (for AI pricing feature)

### Installation

```bash
git clone https://github.com/bebekbeton95/tapbite-pos.git
cd tapbite-pos
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `TURSO_DATABASE_URL` | LibSQL/Turso database URL (or `file:./local.db` for local dev) |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `BETTER_AUTH_SECRET` | Random secret for session signing (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Public app URL |
| `OPENAI_API_KEY` | OpenAI API key for AI pricing suggestions |

### Database Setup

```bash
npx drizzle-kit push
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    actions/
      order.ts        # createOrderAndGenerateWaLink, updateOrderStatus
      product.ts       # addProduct, updateProduct, deleteProduct
      store.ts         # createStore (onboarding), updateStoreSettings
      finance.ts       # addExpense, deleteExpense (PRO bookkeeping)
      pricing.ts       # getPricingSuggestions, applyPricingSuggestion (AI pricing)
    (auth)/            # Login & register pages
    (dashboard)/admin/
      products/
        PricingSuggestions.tsx  # AI pricing UI component
        ProductForm.tsx         # Add product form
        ProductActions.tsx      # Delete actions
        [id]/EditProductForm.tsx
      orders/          # Order management, status updates, PDF invoices
      analytics/       # Revenue charts, top products, top customers (PRO)
      pembukuan/       # Income/expense tracking (PRO)
      referral/        # Referral program management (PRO)
      settings/        # Theme, color, banner configuration
    (storefront)/[slug]/
      FloatingCart.tsx  # Cart drawer + WhatsApp checkout
  lib/db/
    schema.ts          # Drizzle schema (9 tables)
    index.ts           # Database client
  store/
    useCartStore.ts    # Zustand cart state
```

## Key Architecture Decisions

- **Server Actions** as the sole backend (no REST API routes except auth)
- **Multi-tenant** — one store per user, queried via `stores.userId`
- **Client-side cart** via Zustand (in-memory, no persistence)
- **SQLite** for both dev (`local.db`) and production (Turso)
- **PRO gating** — server actions check `subscriptionTier` before allowing premium features
- **GPT-4o-mini** for AI pricing — cost-efficient (~$0.001/invocation), JSON mode for reliable output, Bahasa Indonesia prompts tuned for UMKM context

## License

Private — All rights reserved.
