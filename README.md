# TapBite

Commission-free direct-to-WhatsApp ordering platform for Indonesian F&B and retail UMKM.

TapBite gives small merchants a professional online storefront where customers browse products, build a cart, and submit orders sent directly to the merchant's WhatsApp. No app download, no login required.

## Features

- **Storefront** — Customizable themed layouts (Minimalist, Playful, Elegant) at `/<store-slug>`
- **WhatsApp Ordering** — Orders generate pre-formatted `wa.me` deep links, no payment gateway needed
- **Mini POS Dashboard** — Manage products, track orders (PENDING → PAID → COMPLETED), generate PDF invoices
- **AI Smart Pricing** — GPT-4o-mini analyzes sales data and recommends optimal prices with reasoning
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
    actions/           # Server actions (order, product, store, finance, pricing)
    (auth)/            # Login & register pages
    (dashboard)/admin/ # Merchant dashboard (products, orders, analytics, settings)
    (storefront)/[slug]/ # Public customer-facing storefront
  components/ui/       # shadcn/ui primitives
  lib/db/              # Drizzle schema & database client
  store/               # Zustand cart store
```

## Key Architecture Decisions

- **Server Actions** as the sole backend (no REST API routes except auth)
- **Multi-tenant** — one store per user, queried via `stores.userId`
- **Client-side cart** via Zustand (in-memory, no persistence)
- **SQLite** for both dev (`local.db`) and production (Turso)
- **PRO gating** — server actions check `subscriptionTier` before allowing premium features

## License

Private — All rights reserved.
