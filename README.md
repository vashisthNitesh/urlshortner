# PulseLink - URL Shortener SaaS

Production-ready URL shortener with premium features, Stripe billing, Next.js App Router UI, Prisma/PostgreSQL data layer, and secure authentication via NextAuth (email/password + Google). Includes admin tooling, GDPR-friendly analytics, ads for free tier, and deployment guidance.

## Features
- Marketing site: landing, pricing, FAQ, contact, legal pages (Privacy, Terms, Cookies).
- Auth: email/password with verification, password reset, Google OAuth, optional TOTP 2FA for premium.
- Plans: free (ad-supported) vs premium (no ads) with quotas and entitlements.
- Link management: custom slugs, reserved words, QR codes, UTM builder, folders/tags, editing, search, previews, safety checks, bulk CSV shortening.
- Redirect engine: 301/302 toggles, password-protected links, expiration, bot filtering, rate limits, cached lookups.
- Analytics: referrer/device/country/region, campaign params, daily chart-ready data, CSV export (premium), retention windows by plan.
- Payments: Stripe Checkout + Customer Portal, webhook lifecycle handling, proration-aware upgrades, tax/VAT via Stripe settings.
- Admin: user management snapshot, abuse reports, block/disable malicious links/domains, feature flag toggles.
- Compliance & security: CSRF protection via NextAuth, input validation (Zod), reCAPTCHA hooks, secure headers, audit logging, secrets via env.

## Getting Started
1. Copy `.env.example` to `.env` and fill secrets (Postgres, Stripe, Google OAuth, NextAuth secret, AdSense IDs, reCAPTCHA).
2. Install dependencies and generate Prisma client:
   ```bash
   npm install
   npx prisma migrate dev
   npm run seed
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Sign in with seeded admin: `admin@pulselink.test / Admin123!`

## Stripe Webhook
Expose your local server (e.g., `stripe listen --forward-to localhost:3000/api/webhooks/stripe`). The webhook verifies signatures with `STRIPE_WEBHOOK_SECRET`.

## Deployment
- Frontend: Vercel, Render, or Fly.io.
- Database: Managed Postgres (Neon, Supabase, RDS).
- Environment: set all secrets and run `prisma migrate deploy`.
- AdSense: provide client + slot IDs; ads excluded from redirect endpoints.

## Testing
Unit/integration tests should focus on auth, link creation, redirect, and webhook handlers. Add additional tests under `src/__tests__` as needed.
