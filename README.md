# Gender Reveal

로그인 없이 젠더리빌 이벤트를 만들고 가족과 공유할 수 있는 웹 애플리케이션입니다.
제작자는 태명, 출산 예정일, 받는 사람과 성별을 입력해 비밀 링크를 만들고,
받는 사람은 풍선을 열 번 터치한 뒤 결과를 확인하고 이미지로 저장할 수 있습니다.

## Features

- 제작자 흐름: 태명, 출산 예정일, 받는 사람, 성별을 입력해 영구 공유 링크를 생성합니다.
- 받는 사람 흐름: 풍선을 열 번 터치해 결과를 확인합니다.
- 결과 흐름: 다시 보기와 결과 이미지 저장을 제공합니다.
- 저장소: Drizzle ORM과 Neon/PostgreSQL을 사용합니다.

## Prerequisites

- Node.js `>=20.9.0` and npm
- PostgreSQL database (or Neon Postgres)

## Local Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Create `.env.local` with the database connection:

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
npm run test:e2e:prepare
npm run test:e2e
npx drizzle-kit check
git diff --check
```

## Production Deployment (Vercel + Neon)

1. **Provision Neon Postgres on Vercel:**
   Attach a Neon Postgres database integration to the project.

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
   - Confirm the public origin responds anonymously with HTTP 200.
   - Create a reveal link and open it in another browser context or device.
   - Tap 10 times, save the result image, replay, and refresh.

## Architecture

The application uses the Next.js App Router, React client components for transient
interaction state, Drizzle ORM, and Neon/PostgreSQL for reveal records. Reveal
tokens are generated from cryptographically secure random bytes. Links do not
expire and the database stores the due date as a PostgreSQL `date`.
