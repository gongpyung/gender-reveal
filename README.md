# Gender Reveal Clone

A private-use, login-free clone of the baby gender reveal experience.

## Features

- **Creator Flow**: Input baby nickname, due date, recipient, and gender to generate a persistent share link.
- **Recipient Flow**: Interactive balloon requiring 10 taps to burst and reveal the baby's gender.
- **Replay & Share**: Result screen with replay option and savable/shareable result card image.
- **Persistence**: Backed by PostgreSQL via Drizzle ORM and Neon Postgres serverless.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon Postgres)

## Local Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   Fill in your PostgreSQL / Neon connection string:

   ```dotenv
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   ```

3. **Run database migration:**

   ```bash
   npm run db:migrate
   ```

4. **Start local development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000/gender-reveal](http://localhost:3000/gender-reveal).

## Verification Gate

Run all verification checks before submitting changes:

```bash
npm test
npm run test:e2e
npm run typecheck
npm run lint
npm run build
git diff --check
```

## Production Deployment (Vercel + Neon)

1. **Provision Neon Postgres on Vercel:**
   Attach a Neon Postgres database integration to the project in the Vercel Marketplace.

2. **Pull Environment Variables:**

   ```bash
   npx vercel link
   npx vercel env pull .env.production.local --environment=production
   ```

3. **Apply Migration to Production:**

   ```bash
   set -a
   source .env.production.local
   set +a
   npm run db:migrate
   ```

4. **Deploy Production:**

   ```bash
   npx vercel --prod
   ```

5. **Smoke Test Production:**
   - Create a reveal link on the production URL.
   - Open link in another context or device, tap 10 times, verify gender reveal result.
