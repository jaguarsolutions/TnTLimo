This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Setting up Google Maps

The point-to-point quote engine uses Google Maps APIs for address autocomplete + driving distance.

### 1. Enable APIs

Go to <https://console.cloud.google.com/> and in the project that bills these requests:

- **Maps JavaScript API** (for client-side autocomplete)
- **Places API (New)** (for server-side Place Details + client autocomplete)
- **Routes API** (for server-side driving distance)
- **Enable billing** on the project. Required even within the free tier.

### 2. Create two restricted API keys

| Key | env var | Restrictions |
|-----|---------|--------------|
| Browser key | `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | **HTTP referrers**: `https://<your-prod-url>/*`, `https://*.vercel.app/*`, `http://localhost:3000/*`. **APIs**: Maps JavaScript API, Places API. |
| Server key | `GOOGLE_MAPS_SERVER_KEY` | **IP restriction** to Vercel's outbound egress IPs in production (unrestricted in local dev). **APIs**: Routes API, Places API. |

The browser key is exposed to the client by design; the HTTP-referrer + API restriction is what protects it. The server key never leaves Vercel's edge / functions — it's read in `/api/quote` and the booking-create handler only.

### 3. Add to env

Local: copy values into `.env.local`.
Vercel: **Settings → Environment Variables**, add both keys, check the **Production** and **Preview** boxes, redeploy.

### 4. Cost expectations (as of 2026)

Google's monthly free tier covers:

- **Dynamic Maps**: 10,000 loads / mo
- **Routes API (Compute Routes — Essentials)**: 10,000 / mo
- **Place Details (Essentials)**: 10,000 / mo
- **Autocomplete sessions**: free

Each completed quote consumes ~2 Place Details + 1 Routes call (skipped for fixed routes). Estimated cost beyond free tier: **~$0.02–$0.05 per completed quote**.

Recommendation: set a **$25/mo billing budget alert** in Cloud Console → Billing → Budgets so an unexpected spike (or leaked key) doesn't surprise you.

## Database, Stripe, Resend

For DB migrations, Stripe webhook setup, and Resend domain verification, see [`.env.example`](./.env.example) and the section comments in:

- [`src/lib/booking/`](./src/lib/booking/) — booking domain (DB schema, email dispatch, Stripe sync helpers)
- [`src/app/api/`](./src/app/api/) — booking + Stripe + admin API routes

## Tests

```bash
npm test          # one-shot Vitest run
npm run test:watch
```

Pricing and geo modules are pure and fully covered. The Google Maps integration is exercised at runtime — there are no contract tests against Google's APIs (mocking the v1 Places + Routes JSON shape would be more brittle than useful).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
