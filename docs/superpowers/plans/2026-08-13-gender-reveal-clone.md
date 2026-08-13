# Gender Reveal Clone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a faithful, login-free clone of the reference gender-reveal experience, including persistent share links, the ten-tap balloon interaction, and savable result images.

**Architecture:** A single Next.js App Router application serves the creator and recipient routes. A small domain/service layer validates inputs, generates 32-byte URL-safe tokens, and persists reveal records through Drizzle ORM to Neon Postgres; browser-only components own transient interaction and image-sharing state.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Drizzle ORM, Neon Postgres, Zod, html2canvas, Vitest, React Testing Library, Playwright, Vercel

## Global Constraints

- Match `https://baby.bunnyverse.app/gender-reveal` before adding any improvements.
- Creator route: `/gender-reveal`; recipient route: `/gender-reveal/[token]`; creation route: `POST /api/reveals`.
- Store only token, baby nickname, due date, recipient name, baby gender, and creation timestamp.
- Generate each token from exactly 32 cryptographically secure random bytes encoded as URL-safe Base64.
- Do not add accounts, authentication, admin UI, analytics, link expiration/deletion, usage limits, or unrelated abstractions.
- Keep recipient progress in browser memory; refresh and replay both restart at `0 / 10`.
- The tenth accepted input starts one 600 ms burst transition; ignore further input while bursting.
- Copy reference assets into `public/`; never hotlink them at runtime.
- Deploy to Vercel with Neon Postgres provisioned through the Vercel Marketplace.
- Every task follows red-green-refactor, passes its focused tests, and ends in a small commit.

## File Structure

```text
app/
  api/reveals/route.ts                 POST wrapper around the tested creation handler
  gender-reveal/[token]/page.tsx       Server-rendered recipient entry point
  gender-reveal/page.tsx               Creator entry point
  globals.css                          Fonts, tokens, reference animations, global reset
  layout.tsx                           Root metadata and document shell
  page.tsx                             Redirect to /gender-reveal
components/gender-reveal/
  balloon-interaction.tsx              Ten-tap UI and burst transition
  missing-reveal.tsx                   Unknown-token screen
  reveal-creator.tsx                   Controlled creator form and submission states
  reveal-experience.tsx                Interaction/result state boundary
  reveal-result.tsx                    Result rendering and action buttons
  share-link-dialog.tsx                Copy dialog and toast
db/
  migrations/0000_create_reveals.sql   Production schema
docs/reference/gender-reveal.md        Captured reference measurements and state checklist
e2e/gender-reveal.spec.ts              Deployed-equivalent primary browser journeys
lib/db/
  client.ts                            Neon/Drizzle singleton
  schema.ts                            Reveals table definition
lib/reveals/
  create-handler.ts                    Request-to-response adapter with injected dependencies
  date.ts                              Strict date parse/format helpers
  image-share.ts                       Capture/share/download helpers
  interaction.ts                       Pure reveal interaction reducer
  repository.ts                        Store interface and Drizzle implementation
  service.ts                           Token generation, retry, and canonical URL creation
  types.ts                             Shared domain types
  validation.ts                        Zod input validation
public/fonts/                           Local reference font files
public/img/step1/                       Dialog close icon
public/img/step2/                       Balloon and heart assets
public/img/step3/                       Gender-specific result assets
tests/
  api/create-handler.test.ts
  components/balloon-interaction.test.tsx
  components/reveal-creator.test.tsx
  components/reveal-result.test.tsx
  components/share-link-dialog.test.tsx
  db/schema.test.ts
  reveals/date.test.ts
  reveals/interaction.test.ts
  reveals/service.test.ts
.env.example                            Required environment variable names only
drizzle.config.ts                       Migration configuration
eslint.config.mjs                       Next.js ESLint configuration
next.config.ts                          Next.js configuration
package.json                            Scripts and dependencies
playwright.config.ts                    Browser test configuration
postcss.config.mjs                      Tailwind PostCSS plugin
tsconfig.json                           Strict TypeScript configuration
vitest.config.ts                        Unit/component test configuration
vitest.setup.ts                         jest-dom and browser API cleanup
```

---

### Task 1: Application Shell and Test Harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/gender-reveal/page.tsx`
- Create: `app/globals.css`
- Test: `tests/components/reveal-creator.test.tsx`

**Interfaces:**
- Consumes: none; this is the repository foundation.
- Produces: `npm` scripts `dev`, `build`, `lint`, `typecheck`, `test`, `test:watch`, and `test:e2e`; `@/*` path alias; a renderable `/gender-reveal` route.

- [ ] **Step 1: Install the exact dependency groups**

Run:

```bash
npm init -y
npm install next@latest react@latest react-dom@latest drizzle-orm @neondatabase/serverless zod html2canvas
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss eslint eslint-config-next drizzle-kit vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
npm pkg set private=true scripts.dev="next dev" scripts.build="next build" scripts.start="next start" scripts.lint="eslint ." scripts.typecheck="tsc --noEmit" scripts.test="vitest run" scripts.test:watch="vitest" scripts.test:e2e="playwright test" scripts.db:generate="drizzle-kit generate" scripts.db:migrate="drizzle-kit migrate"
```

Expected: `package.json` and `package-lock.json` exist and `npm install` exits 0.

- [ ] **Step 2: Add strict framework and test configuration**

Create `tsconfig.json` with `strict: true`, `noEmit: true`, `moduleResolution: "bundler"`, `jsx: "preserve"`, the Next plugin, and `@/* -> ./*`. Configure Tailwind through `@tailwindcss/postcss`, configure ESLint with `eslint-config-next/core-web-vitals` and `typescript`, and configure Vitest for `jsdom`, `vitest.setup.ts`, and the `@` alias.

`vitest.setup.ts` must contain:

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

- [ ] **Step 3: Write the failing route smoke test**

Create `tests/components/reveal-creator.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import CreatorPage from "@/app/gender-reveal/page";

it("renders the reference creator heading", () => {
  render(<CreatorPage />);
  expect(screen.getByText("Gender-Reveal")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Come on baby" })).toBeInTheDocument();
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npm test -- tests/components/reveal-creator.test.tsx`

Expected: FAIL because `app/gender-reveal/page.tsx` does not yet export a renderable page.

- [ ] **Step 5: Add the minimal application shell**

Create a root layout that imports `app/globals.css`, exports Korean metadata title `젠더리빌 | Gender Reveal`, and renders `children`. Make `app/page.tsx` call `redirect("/gender-reveal")`. Make the creator page render only:

```tsx
export default function CreatorPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-white p-6">
      <section className="flex w-[min(420px,100%)] flex-col items-center bg-white p-5">
        <p className="m-0 font-pixel text-[22px] tracking-wide text-ink">Gender-Reveal</p>
        <h1 className="m-0 font-pixel text-4xl text-ink">Come on baby</h1>
      </section>
    </main>
  );
}
```

Add the Tailwind import and minimal body reset to `app/globals.css`; detailed tokens arrive in Task 8.

- [ ] **Step 6: Verify the foundation**

Run:

```bash
npm test -- tests/components/reveal-creator.test.tsx
npm run typecheck
npm run lint
```

Expected: all commands PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs vitest.config.ts vitest.setup.ts tests/components/reveal-creator.test.tsx app
git commit -m "chore: bootstrap gender reveal app"
```

---

### Task 2: Domain Types, Validation, and Date Formatting

**Files:**
- Create: `lib/reveals/types.ts`
- Create: `lib/reveals/validation.ts`
- Create: `lib/reveals/date.ts`
- Test: `tests/reveals/date.test.ts`
- Modify: `tests/components/reveal-creator.test.tsx`

**Interfaces:**
- Consumes: Zod from Task 1.
- Produces: `Gender`, `RevealInput`, `RevealRecord`, `revealInputSchema`, `parseDateInput(value)`, and `formatDueDate(value)`.

- [ ] **Step 1: Define the failing validation and date tests**

Create `tests/reveals/date.test.ts` with these cases:

```ts
import { describe, expect, it } from "vitest";
import { formatDueDate, parseDateInput } from "@/lib/reveals/date";
import { revealInputSchema } from "@/lib/reveals/validation";

const valid = { babyNickname: "깡총이", dueDate: "2026-12-25", recipientName: "할머니, 할아버지", babyGender: "daughter" };

describe("reveal input", () => {
  it("accepts a complete reveal", () => expect(revealInputSchema.safeParse(valid).success).toBe(true));
  it.each(["", "2026-02-30", "26-12-25"])("rejects invalid date %s", dueDate => {
    expect(revealInputSchema.safeParse({ ...valid, dueDate }).success).toBe(false);
  });
  it("trims names and rejects blank names", () => {
    expect(revealInputSchema.parse({ ...valid, babyNickname: "  깡총이  " }).babyNickname).toBe("깡총이");
    expect(revealInputSchema.safeParse({ ...valid, recipientName: "   " }).success).toBe(false);
  });
});

it("strictly parses and formats a due date", () => {
  expect(parseDateInput("2026-12-25")).toEqual(new Date(2026, 11, 25));
  expect(parseDateInput("2026-02-30")).toBeNull();
  expect(formatDueDate("2026-12-25")).toBe("2026년 12월 25일");
});
```

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/reveals/date.test.ts`

Expected: FAIL with unresolved `@/lib/reveals/date` and `validation` modules.

- [ ] **Step 3: Implement the domain contract**

Define:

```ts
export type Gender = "son" | "daughter";
export type RevealInput = { babyNickname: string; dueDate: string; recipientName: string; babyGender: Gender };
export type RevealRecord = RevealInput & { token: string; createdAt: Date };
```

Implement `parseDateInput` with the exact `YYYY-MM-DD` regex plus year/month/day round-trip checks. Implement `formatDueDate` from the parsed local date, returning `yyyy년 MM월 dd일`. Build `revealInputSchema` with trimmed non-empty strings, the gender enum, and a `dueDate` refinement using `parseDateInput`.

- [ ] **Step 4: Verify green**

Run:

```bash
npm test -- tests/reveals/date.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/reveals tests/reveals/date.test.ts
git commit -m "feat: add reveal domain validation"
```

---

### Task 3: PostgreSQL Schema, Repository, and Creation Service

**Files:**
- Create: `.env.example`
- Create: `drizzle.config.ts`
- Create: `lib/db/client.ts`
- Create: `lib/db/schema.ts`
- Create: `lib/reveals/repository.ts`
- Create: `lib/reveals/service.ts`
- Create: `db/migrations/0000_create_reveals.sql`
- Test: `tests/db/schema.test.ts`
- Test: `tests/reveals/service.test.ts`

**Interfaces:**
- Consumes: `RevealInput` and `RevealRecord` from Task 2.
- Produces: `RevealStore`, `DrizzleRevealStore`, `TokenConflictError`, and `createReveal(input, store, origin, tokenFactory?)`.

- [ ] **Step 1: Write failing service tests with an in-memory fake**

The tests must assert that `createReveal`:

```ts
const bytes = new Uint8Array(32).fill(7);
const created = await createReveal(input, fakeStore, "https://example.test", () => bytes);
expect(created.shareLink).toBe(`https://example.test/gender-reveal/${created.record.token}`);
expect(Buffer.from(created.record.token, "base64url")).toHaveLength(32);
```

Also use a fake store that throws `TokenConflictError` on its first insert and succeeds on its second; expect two inserts. Use a fake that conflicts twice; expect `createReveal` to reject after exactly two attempts.

In `tests/db/schema.test.ts`, assert that the exported `reveals` table exposes `token`, `babyNickname`, `dueDate`, `recipientName`, `babyGender`, and `createdAt` columns.

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/reveals/service.test.ts tests/db/schema.test.ts`

Expected: FAIL because the service, schema, and repository modules do not exist.

- [ ] **Step 3: Implement schema and migration**

Define a `reveals` PostgreSQL table whose `token` is the text primary key, whose four input fields are non-null text/date/text/text columns, and whose `createdAt` is a non-null timestamp with default now. Add a `CHECK (baby_gender IN ('son', 'daughter'))` constraint. Set `.env.example` to exactly:

```dotenv
DATABASE_URL=
```

In `drizzle.config.ts`, call `loadEnvConfig(process.cwd())` from `@next/env` before reading `process.env.DATABASE_URL`, then configure Drizzle Kit with dialect `postgresql`, schema `./lib/db/schema.ts`, and output `./db/migrations`. This makes the CLI load the same `.env.local` files as Next.js.

Generate the migration once from that schema:

```bash
npx drizzle-kit generate --name=create_reveals
```

Expected: `db/migrations/0000_create_reveals.sql` contains one `CREATE TABLE` with the primary key and gender check; Drizzle's migration metadata is generated beside it.

- [ ] **Step 4: Implement the repository and service**

Define:

```ts
export interface RevealStore {
  insert(input: RevealInput, token: string): Promise<RevealRecord>;
  findByToken(token: string): Promise<RevealRecord | null>;
}
export class TokenConflictError extends Error {}
```

`DrizzleRevealStore` maps Drizzle unique-key error code `23505` to `TokenConflictError` and rethrows all other failures. `createReveal` parses with `revealInputSchema`, calls `crypto.getRandomValues(new Uint8Array(32))` by default, encodes with `Buffer.from(bytes).toString("base64url")`, retries one token collision, and returns `{ record, shareLink }`. Normalize `origin` through `new URL(origin).origin` before building the URL.

- [ ] **Step 5: Verify green and migration consistency**

Run:

```bash
npm test -- tests/reveals/service.test.ts tests/db/schema.test.ts
npx drizzle-kit check
npm run typecheck
```

Expected: tests PASS; generated migration matches the committed migration; typecheck PASS.

- [ ] **Step 6: Commit**

```bash
git add .env.example drizzle.config.ts lib/db lib/reveals/repository.ts lib/reveals/service.ts db/migrations tests/db tests/reveals/service.test.ts
git commit -m "feat: persist gender reveal links"
```

---

### Task 4: Reveal Creation API

**Files:**
- Create: `lib/reveals/create-handler.ts`
- Create: `app/api/reveals/route.ts`
- Test: `tests/api/create-handler.test.ts`

**Interfaces:**
- Consumes: `RevealStore`, `DrizzleRevealStore`, and `createReveal` from Task 3.
- Produces: `handleCreateReveal(request, { store, tokenFactory? }): Promise<Response>` and Next.js `POST(request)`.

- [ ] **Step 1: Write failing handler tests**

Test these exact responses:

```ts
expect((await handleCreateReveal(validRequest, deps)).status).toBe(201);
expect(await response.json()).toEqual({ shareLink: expect.stringMatching(/^https:\/\/example\.test\/gender-reveal\//) });
```

For malformed JSON and invalid input, expect status `400` and `{ code: "INVALID_INPUT" }`, and assert the fake store received no insert. For a generic store failure, expect `500` and `{ code: "CREATE_FAILED" }` without the thrown database message.

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/api/create-handler.test.ts`

Expected: FAIL because `create-handler.ts` is missing.

- [ ] **Step 3: Implement the injected handler and thin route wrapper**

`handleCreateReveal` must parse `await request.json()`, call `createReveal(body, deps.store, new URL(request.url).origin, deps.tokenFactory)`, and return JSON. Catch Zod/JSON failures as 400 and all other failures as 500. Log only the generic server failure with `console.error("Failed to create reveal", error)`.

`app/api/reveals/route.ts` must construct one `DrizzleRevealStore` from the DB singleton and export:

```ts
export async function POST(request: Request) {
  return handleCreateReveal(request, { store });
}
```

- [ ] **Step 4: Verify green**

Run:

```bash
npm test -- tests/api/create-handler.test.ts
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/reveals/create-handler.ts app/api/reveals/route.ts tests/api/create-handler.test.ts
git commit -m "feat: add reveal creation endpoint"
```

---

### Task 5: Creator Form and Share-Link Dialog

**Files:**
- Create: `components/gender-reveal/reveal-creator.tsx`
- Create: `components/gender-reveal/share-link-dialog.tsx`
- Modify: `app/gender-reveal/page.tsx`
- Modify: `tests/components/reveal-creator.test.tsx`
- Test: `tests/components/share-link-dialog.test.tsx`

**Interfaces:**
- Consumes: `RevealInput`, `revealInputSchema`, and `POST /api/reveals`.
- Produces: `<RevealCreator />` and `<ShareLinkDialog shareLink onClose />`.

- [ ] **Step 1: Expand the creator tests to fail on required behavior**

Use `userEvent` to submit an empty form. Assert all four controls are invalid and `정보를 모두 입력해주세요` appears once. Fill `깡총이`, `2026-12-25`, `할머니, 할아버지`, select `딸`, mock `fetch` to resolve `{ shareLink: "https://example.test/gender-reveal/abc" }`, submit, and assert the dialog appears. Add a rejected-fetch case that preserves every input and shows `링크 생성에 실패했어요. 다시 시도해주세요`.

- [ ] **Step 2: Write failing dialog tests**

Stub `navigator.clipboard.writeText`. Assert the copy button writes the exact link and shows `복사가 완료 되었습니다.`; advance fake timers by 2400 ms and assert the toast disappears. Assert Escape, close button, and overlay click call `onClose`, while clicking inside the dialog does not. Reject clipboard writing and expect `복사에 실패했어요. 링크를 직접 선택해 복사해주세요`.

- [ ] **Step 3: Verify red**

Run: `npm test -- tests/components/reveal-creator.test.tsx tests/components/share-link-dialog.test.tsx`

Expected: FAIL because both components are missing.

- [ ] **Step 4: Implement the minimal controlled form**

Use native inputs and local React state only. The form must retain the reference labels/placeholders, `noValidate`, field-specific invalid flags, son/daughter radio cards, and button copy `젠더리빌 풍선 만들기 ›` / `링크 생성 중... ›`. Submit JSON to `/api/reveals`; on 201 store `shareLink`, otherwise show the creation error. Clear a field's invalid flag when that field changes.

- [ ] **Step 5: Implement the accessible dialog**

Use `role="dialog"`, `aria-modal="true"`, label `풍선이 완성되었어요`, overlay click discrimination, an Escape listener with cleanup, and a 2400 ms toast timer with cleanup. Render the exact reference copy and the local `/img/step1/close-icon.svg` path.

- [ ] **Step 6: Verify green**

Run:

```bash
npm test -- tests/components/reveal-creator.test.tsx tests/components/share-link-dialog.test.tsx
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/gender-reveal/reveal-creator.tsx components/gender-reveal/share-link-dialog.tsx app/gender-reveal/page.tsx tests/components
git commit -m "feat: build reveal creator flow"
```

---

### Task 6: Recipient Loading and Experience Boundary

**Files:**
- Create: `components/gender-reveal/missing-reveal.tsx`
- Create: `components/gender-reveal/reveal-experience.tsx`
- Create: `app/gender-reveal/[token]/page.tsx`
- Modify: `lib/reveals/repository.ts`
- Test: `tests/components/reveal-experience.test.tsx`

**Interfaces:**
- Consumes: `DrizzleRevealStore.findByToken(token)` and `RevealRecord`.
- Produces: `<RevealExperience reveal />` and the unknown-token message `존재하지 않는 젠더리빌 링크입니다`.

- [ ] **Step 1: Write the failing boundary tests**

Render `RevealExperience` with a daughter record and expect `깡총이는\n아들일까요? 딸일까요?` plus `0 / 10`. Render `MissingReveal` and assert the exact unknown-link message. Do not mock Next router behavior.

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/components/reveal-experience.test.tsx`

Expected: FAIL because the components are missing.

- [ ] **Step 3: Implement the server entry and boundary**

The async dynamic page awaits `params`, validates the token as a non-empty string of at most 64 characters, and calls `store.findByToken(token)`. Render `<MissingReveal />` for an invalid or absent record. Render `<RevealExperience reveal={record} />` otherwise.

Initially, `RevealExperience` renders a minimal interaction shell with the exact question and `0 / 10`; Task 7 replaces the shell with `BalloonInteraction`.

- [ ] **Step 4: Verify green**

Run:

```bash
npm test -- tests/components/reveal-experience.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/gender-reveal/[token]/page.tsx components/gender-reveal/missing-reveal.tsx components/gender-reveal/reveal-experience.tsx lib/reveals/repository.ts tests/components/reveal-experience.test.tsx
git commit -m "feat: load shared gender reveals"
```

---

### Task 7: Ten-Tap Balloon Interaction

**Files:**
- Create: `lib/reveals/interaction.ts`
- Create: `components/gender-reveal/balloon-interaction.tsx`
- Modify: `components/gender-reveal/reveal-experience.tsx`
- Test: `tests/reveals/interaction.test.ts`
- Test: `tests/components/balloon-interaction.test.tsx`

**Interfaces:**
- Consumes: `RevealRecord`.
- Produces: `InteractionState`, `InteractionAction`, `interactionReducer(state, action)`, and `<BalloonInteraction reveal touchCount isBursting onTouch onComplete />`.

- [ ] **Step 1: Write failing reducer tests**

Define the expected states `{ phase: "interaction", touchCount: 0, isBursting: false }` and `{ phase: "result", touchCount: 10, isBursting: false }`. Dispatch `touch` nine times and expect count 9 without bursting; the tenth dispatch must set count 10 and `isBursting: true`; an eleventh dispatch must return the unchanged state. `completeBurst` before bursting does nothing; after the tenth touch it moves to result. `restart` returns the initial state.

- [ ] **Step 2: Write failing component timing tests**

With fake timers, click `풍선 터치하기 (0/10)` nine times and expect `9 / 10`. Click once more, assert the button is disabled and `10 / 10` is shown, advance 599 ms and expect no `onComplete`, then advance 1 ms and expect exactly one call. Further clicks/timer advances must not call it again.

- [ ] **Step 3: Verify red**

Run: `npm test -- tests/reveals/interaction.test.ts tests/components/balloon-interaction.test.tsx`

Expected: FAIL because the reducer and component do not exist.

- [ ] **Step 4: Implement the reducer and component**

Use `useReducer` in `RevealExperience`. `BalloonInteraction` receives `{ reveal, touchCount, isBursting, onTouch, onComplete }`; `RevealExperience` translates `onTouch` and `onComplete` into reducer actions. Calculate scale as `1 + 0.04 * Math.min(touchCount, 9)`. Each accepted click vibrates for 15 ms when supported, shows a random-offset `Tab!` for 600 ms, triggers a 400 ms shake, and calls `onComplete` once after the 600 ms burst timer.

Render the six static floating hearts at the reference positions, random burst hearts/confetti only while bursting, the balloon at `/img/step2/balloon.png`, and the exact instruction/progress copy.

- [ ] **Step 5: Verify green**

Run:

```bash
npm test -- tests/reveals/interaction.test.ts tests/components/balloon-interaction.test.tsx tests/components/reveal-experience.test.tsx
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/reveals/interaction.ts components/gender-reveal/balloon-interaction.tsx components/gender-reveal/reveal-experience.tsx tests/reveals/interaction.test.ts tests/components/balloon-interaction.test.tsx tests/components/reveal-experience.test.tsx
git commit -m "feat: add balloon reveal interaction"
```

---

### Task 8: Result Rendering and Image Save/Share

**Files:**
- Create: `lib/reveals/image-share.ts`
- Create: `components/gender-reveal/reveal-result.tsx`
- Modify: `components/gender-reveal/reveal-experience.tsx`
- Test: `tests/components/reveal-result.test.tsx`

**Interfaces:**
- Consumes: `RevealRecord`, `formatDueDate`, and the result phase from Task 7.
- Produces: `PreparedResult = { dataUrl: string; file: File }`, `captureResult(element: HTMLElement, gender: Gender): Promise<PreparedResult>`, `shareOrDownloadResult(prepared: PreparedResult): Promise<void>`, and `<RevealResult reveal onReplay onCreateNew />`.

- [ ] **Step 1: Write failing result variant tests**

For a son record assert:

```text
깡총이는
귀엽고 사랑스러운
'아들'이에요!
```

and closing copy `할머니, 할아버지!`, `2026년 12월 25일에`, `건강하게 만나요 :)`, plus `baby-son.png`. Repeat for daughter and `baby-daughter.png`. Click `<  뒤로가기` and expect `onReplay`. Click `젠더리빌 새로 만들기` and expect `onCreateNew`.

Mock the capture helper. When `navigator.canShare({ files })` is true, assert `navigator.share` receives title `젠더리빌 결과`; otherwise assert an anchor download named `gender-reveal-son.png` or `gender-reveal-daughter.png` is triggered. An `AbortError` is silent; other failures render an error and leave the action enabled.

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/components/reveal-result.test.tsx`

Expected: FAIL because the result and image helper modules do not exist.

- [ ] **Step 3: Implement image preparation and action selection**

Wait for every descendant image to be complete, then call `html2canvas(element, { scale: 2, backgroundColor: "#ffffff", useCORS: true, allowTaint: false, imageTimeout: 8000 })`. Race capture against a 12-second timeout. Convert the PNG data URL to a `File` named `gender-reveal-${gender}.png`. Race the platform share call against a 15-second timeout. Fall back to a temporary anchor click when file sharing is unavailable.

- [ ] **Step 4: Implement the faithful result component**

Capture only the inner result card, excluding controls. Prepare the image on mount and show `이미지 준비 중...`; show `저장 중...` while the action is active and `결과 저장하기` otherwise. Use the exact gender colors, bubble/baby asset selection, dimensions from the spec reference, two action buttons, error copy, and the underlined `젠더리빌 새로 만들기` control.

Wire replay to reducer `restart`. Wire create-new to `window.location.assign("/gender-reveal")` so the recipient URL does not retain stale state.

- [ ] **Step 5: Verify green**

Run:

```bash
npm test -- tests/components/reveal-result.test.tsx tests/components/reveal-experience.test.tsx
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/reveals/image-share.ts components/gender-reveal/reveal-result.tsx components/gender-reveal/reveal-experience.tsx tests/components/reveal-result.test.tsx
git commit -m "feat: render and save reveal results"
```

---

### Task 9: Reference Assets, Design Tokens, and Animations

**Files:**
- Create: `public/fonts/DungGeunMo.woff`
- Create: `public/fonts/Pretendard-Regular.woff2`
- Create: `public/img/step1/close-icon.svg`
- Create: `public/img/step2/balloon.png`
- Create: `public/img/step2/heart-blue.png`
- Create: `public/img/step2/heart-pink.png`
- Create: `public/img/step3/baby-daughter.png`
- Create: `public/img/step3/baby-son.png`
- Create: `public/img/step3/bubble-daughter.png`
- Create: `public/img/step3/bubble-son.png`
- Create: `docs/reference/gender-reveal.md`
- Modify: `app/globals.css`
- Modify: `components/gender-reveal/*.tsx`

**Interfaces:**
- Consumes: every rendered state from Tasks 5–8.
- Produces: local reference assets and stable CSS classes/tokens used by all screens.

- [ ] **Step 1: Record the reference state matrix before changing styles**

In `docs/reference/gender-reveal.md`, list the desktop and mobile viewport sizes used for comparison and the eight required states: empty form, invalid form, boy/girl selection, share dialog/toast, balloon 0/10, balloon 9/10, burst, son result, daughter result. Record source URL and asset source paths so later replacement is auditable.

- [ ] **Step 2: Download the public reference assets locally**

Fetch these exact source URLs into their matching local paths and verify every response is 200 and non-empty:

```text
https://baby.bunnyverse.app/fonts/DungGeunMo.woff
https://baby.bunnyverse.app/fonts/Pretendard-Regular.woff2
https://baby.bunnyverse.app/img/step1/close-icon.svg
https://baby.bunnyverse.app/img/step2/balloon.png
https://baby.bunnyverse.app/img/step2/heart-blue.png
https://baby.bunnyverse.app/img/step2/heart-pink.png
https://baby.bunnyverse.app/img/step3/baby-daughter.png
https://baby.bunnyverse.app/img/step3/baby-son.png
https://baby.bunnyverse.app/img/step3/bubble-daughter.png
https://baby.bunnyverse.app/img/step3/bubble-son.png
```

Run: `find public/fonts public/img -type f -size 0 -print`

Expected: no output.

- [ ] **Step 3: Add exact global tokens and keyframes**

Define `RoundedFixedsys` and `Pretendard` font faces. Define colors: ink `#232323`, muted ink `#9f9f9f`, input `#f2f2f2`, boy background `#cae7ff`, girl background `#ffd2d2`, boy point `#509fdf`, girl point `#ff9999`, and heart pink `#fba3af`.

Add these exact animation timings:

```css
/* float: y 0 -> -6px -> 0, 2.6s ease-in-out infinite */
/* shake rotations: 0, -10, 8, -6, 5, 0 degrees over .4s */
/* burst: scale 1 -> 1.6 at 60% -> 2.2 and opacity 0 over .6s */
/* fadeIn: opacity 0/y 8px -> opacity 1/y 0 over .4s */
/* heartFloat: y 0/scale 1 -> y -5px/scale 1.08 over 1.8s */
/* tabPop: .6s; confettiBurst: .9s; pulseSoft: 1.4s */
```

Implement the declarations, not just the comments, and include `prefers-reduced-motion` rules that collapse duration without removing state transitions.

- [ ] **Step 4: Match each component against the recorded metrics**

Use the reference dimensions already captured in the design: 420 px content cap, 380 px desktop input width after padding, 48 px fields, 50 px gender controls, 60/61 px primary buttons, 350 px modal, 200 px/41vw balloon, 70 px/18vw bubble, 168 px/43vw son image, and 200 px/51vw daughter image. Preserve the exact copy, spacing classes, focus rings, invalid outlines, selected rings, overlay, toast, and disabled opacity.

- [ ] **Step 5: Run focused regression checks**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: all commands PASS, with no remote runtime asset requests in built component code. Confirm with `rg -n "baby\.bunnyverse\.app" app components lib public` and expect no output.

- [ ] **Step 6: Commit**

```bash
git add public app/globals.css components/gender-reveal docs/reference/gender-reveal.md
git commit -m "style: match gender reveal reference"
```

---

### Task 10: End-to-End Tests and Visual Baselines

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/gender-reveal.spec.ts`
- Create: `e2e/visual.spec.ts`
- Create: `e2e/fixtures.ts`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: production-equivalent Next.js app and a test Neon `DATABASE_URL`.
- Produces: repeatable browser acceptance and local screenshot artifacts for comparison.

- [ ] **Step 1: Configure Playwright and ignored artifacts**

Configure Chromium desktop at 1280×720 and mobile at 390×844, `baseURL: http://127.0.0.1:3000`, trace on first retry, and `webServer.command: "npm run dev"`. Ignore `.env*` except `.env.example`, `.next/`, `node_modules/`, `test-results/`, `playwright-report/`, and `e2e/screenshots/local/`.

- [ ] **Step 2: Write the failing primary journey**

Create a daughter reveal through the visible form. Intercept the successful `/api/reveals` response only to read its returned `shareLink`, then navigate to it. Click the balloon ten times, verify `10 / 10`, wait for the result, and assert `'딸'이에요!`, the recipient, and formatted date. Reload the share URL and assert it returns to `0 / 10`. Repeat a compact son case. Add unknown-token, validation, replay, clipboard, and download scenarios.

- [ ] **Step 3: Run the journey and fix only discovered integration defects**

Run: `DATABASE_URL="$DATABASE_URL" npm run test:e2e -- e2e/gender-reveal.spec.ts`

Expected: PASS. If it fails, make the smallest product change needed, rerun the focused unit test for that boundary, then rerun this spec.

- [ ] **Step 4: Add deterministic local visual captures**

Freeze animation time where needed, seed deterministic son/daughter records through the real creation endpoint, and capture the state matrix from Task 9 at both configured viewports. Store current-run images under the ignored `e2e/screenshots/local/` directory rather than committing machine-specific pixels.

- [ ] **Step 5: Compare reference and local states manually**

Open each reference/local pair side by side and record any remaining material mismatch in `docs/reference/gender-reveal.md`. Fix one mismatch at a time and recapture until the checklist contains no open mismatch. Do not approve based only on unit tests.

- [ ] **Step 6: Run the full local gate**

Run:

```bash
npm test
npm run test:e2e
npm run typecheck
npm run lint
npm run build
git diff --check
```

Expected: every command PASS.

- [ ] **Step 7: Commit**

```bash
git add playwright.config.ts e2e .gitignore docs/reference/gender-reveal.md
git commit -m "test: cover complete gender reveal journey"
```

---

### Task 11: Neon Migration and Vercel Production Deployment

**Files:**
- Modify: `README.md`
- Verify: `.env.example`
- Verify: `db/migrations/0000_create_reveals.sql`

**Interfaces:**
- Consumes: complete app, Vercel account/project, Neon Marketplace database, and `DATABASE_URL`.
- Produces: production deployment URL with a migrated database and a verified cross-device share flow.

- [ ] **Step 1: Document exact local and production setup**

Add `README.md` sections for prerequisites, `npm install`, copying `.env.example` to `.env.local`, `npm run db:migrate`, `npm run dev`, full verification commands, Neon Marketplace provisioning, Vercel environment variables, and production smoke testing. State that reveal links do not expire and contain the gender-reveal data referenced by their secret token.

- [ ] **Step 2: Provision and connect Neon through Vercel**

Create or select the Vercel project, install the Neon Postgres Marketplace integration, and attach its production database. Confirm Vercel injected `DATABASE_URL` for Production and Preview. Pull development variables with:

```bash
npx vercel link
npx vercel env pull .env.local --environment=development
npx vercel env pull .env.production.local --environment=production
```

Expected: both files contain a non-empty `DATABASE_URL` and remain ignored by Git.

- [ ] **Step 3: Apply the production migration once**

Load the pulled production environment without printing it, then run against the attached production connection:

```bash
set -a
source .env.production.local
set +a
npm run db:migrate
```

Expected: migration exits 0 and the `reveals` table has the expected six columns and gender check.

- [ ] **Step 4: Run the pre-deploy gate**

Run:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: all commands PASS.

- [ ] **Step 5: Deploy production**

Run:

```bash
npx vercel --prod
```

Expected: Vercel returns a production HTTPS URL and the deployment reaches Ready state.

- [ ] **Step 6: Verify production end to end**

On the production URL, create one son and one daughter reveal. Open each returned share link in a fresh browser context, complete ten taps, verify the result, replay, and download/share action. Create a link on a phone and open it on a second device to prove persistence and login-free cross-device access. Check the browser console and Vercel function logs for uncaught errors.

- [ ] **Step 7: Commit deployment documentation**

```bash
git add README.md .env.example db/migrations/0000_create_reveals.sql
git commit -m "docs: add deployment runbook"
```

- [ ] **Step 8: Record the release evidence**

Append the production URL, migration timestamp, tested device/browser names, and pass/fail results for son, daughter, replay, clipboard, download/share, unknown token, and console-error checks to `docs/reference/gender-reveal.md`, then commit:

```bash
git add docs/reference/gender-reveal.md
git commit -m "docs: record production verification"
```
