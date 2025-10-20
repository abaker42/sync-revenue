# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Revenue Sync is a Next.js 15 application that consolidates revenue data from multiple payment platforms (Stripe, Gumroad, PayPal, Lemon Squeezy) into a unified dashboard. The app uses Supabase for authentication and data persistence, and integrates with payment providers via OAuth flows.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **Runtime**: React 19.1.0
- **Auth & Database**: Supabase (using @supabase/ssr for server-side rendering)
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Payment APIs**: Stripe SDK

### Directory Structure

```
app/
├── api/integrations/          # OAuth callbacks and data fetching endpoints
│   ├── stripe/
│   │   ├── route.ts          # Fetches Stripe charges, aggregates daily revenue
│   │   ├── callback/route.ts # Handles Stripe OAuth callback, stores tokens in Supabase
│   │   └── status/route.ts
│   ├── gumroad/route.ts
│   ├── paypal/route.ts
│   └── lemonsqueezy/route.ts
├── auth/                      # Authentication pages
│   ├── login/page.tsx        # Client component using Supabase browser client
│   └── register/page.tsx
├── dashboard/
│   ├── layout.tsx
│   └── page.tsx              # Main dashboard with revenue summary and integration cards
├── layout.tsx                 # Root layout with navbar and footer
└── page.tsx                   # Landing page

components/
├── dashboard/
│   ├── integration-card.tsx   # Integration connection buttons (Stripe, Gumroad, etc.)
│   ├── revenue-summary.tsx
│   ├── stripe-chart.tsx      # Recharts line chart for daily revenue
│   └── chart.tsx
├── auth/
│   ├── auth-form.tsx
│   └── logout.tsx
└── shared/                    # Reusable UI components
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    └── navbar.tsx

lib/
├── stripe.ts                  # Stripe integration utilities
├── auth.ts                    # Supabase auth utilities
├── paypal.ts
├── gumroad.ts
└── lemonsqueezy.ts
```

### Key Architectural Patterns

**OAuth Integration Flow**:
1. User clicks "Connect" on IntegrationCard → redirects to provider's OAuth URL
2. Provider redirects to `/api/integrations/{provider}/callback` with authorization code
3. Callback route exchanges code for access/refresh tokens
4. Tokens stored in Supabase `integrations` table with `user_id` foreign key
5. Redirect back to dashboard

**Supabase SSR Pattern** (used in callback routes):
```typescript
const cookieStore = await cookies();
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) { /* ... */ }
    }
  }
);
```

**Client-Side Auth** (login/register pages):
```typescript
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**Data Fetching**:
- API routes in `/api/integrations/{provider}/route.ts` fetch data directly from payment APIs
- Client components use `useEffect` + `fetch()` to load data
- Stripe route aggregates charges into daily revenue buckets using Map, then sorts chronologically

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_CLIENT_ID=
NEXT_PUBLIC_BASE_URL=          # OAuth redirect base (e.g., http://localhost:3000)
NEXT_PUBLIC_URL=                # Used in callback routes
```

### Database Schema

**Supabase tables**:
- `integrations`: Stores OAuth tokens per user
  - `user_id` (FK to Supabase auth.users)
  - `provider` (stripe, gumroad, paypal, lemonsqueezy)
  - `access_token`, `refresh_token`
  - `stripe_user_id` (for Stripe Connect accounts)

### Known Issues & Patterns

- **Stripe API Version**: Currently hardcoded to `"2025-09-30.clover"` in both `/api/integrations/stripe/route.ts` and `callback/route.ts`
- **IntegrationCard redirect bug** (integration-card.tsx:36): `onClick={redirect(connectUrl)}` immediately invokes redirect instead of using it as a click handler. Should be `onClick={() => window.location.href = connectUrl}` or use Link component
- **Auth Flow**: Login/register pages wait for Supabase session before navigating to dashboard to ensure cookies are set
- **Path Aliases**: `@/*` maps to project root (tsconfig.json)

### Styling

- Tailwind CSS v4 with PostCSS
- No custom theme configuration in tailwind.config (using defaults)
- Global styles in `app/globals.css`

### Recent Development Context

Recent commits focus on fixing Stripe OAuth integration:
- Storing Stripe integrations to Supabase
- Fixing session/cookie handling after auth flow
- Debugging NextResponse redirect issues
- Moving Supabase client creation to server files with async functions
