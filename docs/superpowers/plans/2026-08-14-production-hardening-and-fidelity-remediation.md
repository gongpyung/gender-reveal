# Gender Reveal Production Hardening and Fidelity Remediation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair every issue found in the 2026-08-14 review so the Gender Reveal service reliably persists links, completes image saving, matches the approved visual specification, provides honest verification evidence, and presents itself everywhere as a standalone product.

**Architecture:** Keep the existing Next.js App Router, React, Drizzle, and Neon structure. Make database configuration fail fast, let operational lookup failures reach a dedicated error boundary, store due dates with PostgreSQL date semantics, and keep transient reveal progress in the client reducer. Use the existing local fonts and artwork through focused UI components, with browser tests covering the real user journey and image download.

**Tech Stack:** Next.js 16.3, React 19, TypeScript 6, Tailwind CSS 4, Drizzle ORM, Neon Postgres, Zod, html2canvas, Vitest, React Testing Library, Playwright, Vercel

## Global Constraints

- Read the relevant installed Next.js 16.3 guide under `node_modules/next/dist/docs/` before changing a Next.js API or convention.
- Use test-driven development: demonstrate each defect with a failing test before changing production code.
- Preserve unrelated user changes and make only changes tied to this remediation.
- Do not add accounts, administration, analytics, expiry, deletion, rate limiting, or unrelated abstractions.
- A reveal link must remain available across processes and devices; production must never silently use process memory.
- The tenth accepted balloon press starts exactly one 600 ms burst and ignores later input.
- The result image action must succeed in Chromium without browser console errors.
- The current checked-out tree must describe Gender Reveal as its own product. Remove external-product comparison or inspiration language from README, maintained docs, tests, package metadata, headings, filenames, and comments.
- Treat Git history rewriting as out of scope. Historical commits remain intact; changing them would require separate, explicit authorization because it rewrites shared history.
- Do not claim a visual state, deployment, browser, or feature passed without retained evidence from the current run.
- Every task ends with focused verification and a small commit.

## File Structure Changes

```text
app/gender-reveal/[token]/error.tsx       New operational lookup error screen and retry action
components/gender-reveal/
  balloon-particles.tsx                   Static hearts, tap feedback, and deterministic burst particles
  balloon-interaction.tsx                 Balloon-only press target and transition timing
  reveal-creator.tsx                      Approved form copy, native date input, and accessible errors
  reveal-result.tsx                       Approved result layout and image-action status
  share-link-dialog.tsx                   Approved modal layout, focus, copy, toast, and errors
db/migrations/0001_due_date_as_date.sql   Safe text-to-date production migration
docs/product/gender-reveal-verification.md
                                            Evidence-based local and production verification record
docs/superpowers/specs/2026-08-13-gender-reveal-design.md
                                            Standalone product design document
docs/superpowers/plans/2026-08-13-gender-reveal.md
                                            Standalone original implementation plan
e2e/
  gender-reveal.spec.ts                   Full functional journey and failure coverage
  visual.spec.ts                          Complete desktop/mobile visual state capture matrix
  screenshots/approved/                   Reviewed visual baselines, if stable across the chosen CI browser
lib/db/client.ts                          Required lazy database construction
lib/reveals/repository.ts                 Database-only production repository and propagated failures
tests/
  components/*.test.tsx                   Accessibility, interaction, result, and dialog coverage
  integration/repository.test.ts          Real PostgreSQL date and lookup behavior when test DB is available
  reveals/image-share.test.ts             Capture/share/download helper behavior
README.md                                 Standalone product setup and operations guide
```

---

### Task 1: Restore Result Image Save and Surface Preparation Failures

**Files:**
- Create: `tests/reveals/image-share.test.ts`
- Modify: `lib/reveals/image-share.ts`
- Modify: `components/gender-reveal/reveal-result.tsx`
- Modify: `tests/components/reveal-result.test.tsx`
- Modify: `e2e/gender-reveal.spec.ts`

**Interfaces:**
- Consumes: existing `PreparedResult`, `captureResult(element, gender)`, and `shareOrDownloadResult(prepared)`.
- Produces: a capture-safe result card, a retryable preparation error, and a tested PNG download/share action.

- [ ] **Step 1: Add focused helper tests that expose timer cleanup and image readiness**

Create `tests/reveals/image-share.test.ts` with mocked `html2canvas`, `HTMLCanvasElement.toDataURL`, and `fetch`. Assert that an image is considered ready only when both `complete` and `naturalWidth > 0`, image errors do not hang capture, `html2canvas` receives the approved capture options, and a prepared file is named from the gender:

```ts
expect(html2canvas).toHaveBeenCalledWith(element, {
  scale: 2,
  backgroundColor: "#ffffff",
  useCORS: true,
  allowTaint: false,
  imageTimeout: 8000,
});
expect(result.file.name).toBe("gender-reveal-son.png");
```

Use fake timers to prove the 12-second capture timer and 15-second share timer are cleared after success so no later unhandled rejection occurs.

- [ ] **Step 2: Add failing result component tests for preparation failure and retry**

Mock `captureResult` to reject on mount. Assert that the component shows `이미지를 준비하지 못했어요. 다시 시도해주세요`, keeps `결과 저장하기` enabled, and retries capture when clicked. Mock `shareOrDownloadResult` to reject and assert `이미지 저장에 실패했어요. 다시 시도해주세요` while the result remains visible.

- [ ] **Step 3: Add a failing Chromium download test**

Extend `e2e/gender-reveal.spec.ts` to create and reveal a record, then wait for `결과 저장하기` to become enabled and capture the download event:

```ts
const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: "결과 저장하기" }).click();
const download = await downloadPromise;
expect(download.suggestedFilename()).toBe("gender-reveal-son.png");
expect(consoleErrors).toEqual([]);
```

Register `page.on("console")` before navigation and collect only application error messages. Run against a production build so the Next.js development overlay is not part of the result.

- [ ] **Step 4: Run the new tests to verify red**

Run:

```bash
npm test -- tests/reveals/image-share.test.ts tests/components/reveal-result.test.tsx
npm run test:e2e -- e2e/gender-reveal.spec.ts --grep "downloads the result image"
```

Expected: unit tests fail because preparation errors are hidden, and the browser test fails with the unsupported `lab()` color error.

- [ ] **Step 5: Remove unsupported computed colors from the capture subtree**

Keep the capture card free of Tailwind palette utilities that compile to CSS Color 4 functions. Replace `border-gray-100`, inherited palette colors, and generic shadow colors inside `cardRef` with explicit project variables or arbitrary hex/RGB values. The capture subtree may use only these defined colors:

```css
--color-ink: #232323;
--color-muted-ink: #9f9f9f;
--color-boy-point: #509fdf;
--color-girl-point: #ff9999;
--color-card-border: #f3f4f6;
--color-card-shadow: rgba(0, 0, 0, 0.10);
```

Do not solve this by globally downgrading Tailwind or patching `node_modules`.

- [ ] **Step 6: Make capture and share timeouts cancellable**

Wrap each timeout in `try/finally` and call `clearTimeout` after `Promise.race`. Keep the public function signatures unchanged. Treat `AbortError` from the platform share sheet as a successful user cancellation; rethrow all other errors.

- [ ] **Step 7: Show preparation failure and preserve retry**

In `RevealResult`, set the preparation error in the mount effect catch, clear it before retry, and disable the save button only while capture or sharing is actively running. The button text order must be `이미지 준비 중...`, `저장 중...`, then `결과 저장하기`.

- [ ] **Step 8: Verify green and commit**

Run:

```bash
npm test -- tests/reveals/image-share.test.ts tests/components/reveal-result.test.tsx
npm run test:e2e -- e2e/gender-reveal.spec.ts --grep "downloads the result image"
npm run typecheck
npm run lint
git diff --check
```

Expected: every command passes and the browser console contains no capture error.

```bash
git add lib/reveals/image-share.ts components/gender-reveal/reveal-result.tsx tests/reveals/image-share.test.ts tests/components/reveal-result.test.tsx e2e/gender-reveal.spec.ts app/globals.css
git commit -m "fix: restore result image saving"
```

---

### Task 2: Require Persistent Storage and Preserve Operational Errors

**Files:**
- Modify: `lib/db/client.ts`
- Modify: `lib/reveals/repository.ts`
- Modify: `app/api/reveals/route.ts`
- Modify: `app/gender-reveal/[token]/page.tsx`
- Create: `app/gender-reveal/[token]/error.tsx`
- Create: `tests/reveals/repository.test.ts`
- Modify: `tests/api/create-handler.test.ts`
- Modify: `tests/components/reveal-experience.test.tsx`

**Interfaces:**
- Consumes: `RevealStore` and `DrizzleRevealStore`.
- Produces: `getDb(): NeonHttpDatabase`, `getRevealStore(): DrizzleRevealStore`, and `DatabaseConfigurationError` for missing configuration.

- [ ] **Step 1: Write failing configuration tests**

Test `getDb()` with `DATABASE_URL` removed and assert:

```ts
expect(() => getDb()).toThrowError(DatabaseConfigurationError);
expect(() => getDb()).toThrow("DATABASE_URL is required");
```

Test `getRevealStore()` returns a `DrizzleRevealStore` only when the URL is present. Remove all expectations that production code can select `MemoryRevealStore`.

- [ ] **Step 2: Write a failing lookup error test**

Inject a fake Drizzle database whose `select` chain rejects with `new Error("connection failed")`. Assert `findByToken` rejects with the same error. Keep a separate test where the query returns an empty array and assert `null`.

- [ ] **Step 3: Verify red**

Run: `npm test -- tests/reveals/repository.test.ts tests/api/create-handler.test.ts tests/components/reveal-experience.test.tsx`

Expected: FAIL because missing configuration currently creates a memory store and lookup errors currently return `null`.

- [ ] **Step 4: Make database construction lazy and mandatory**

Replace the module-level placeholder connection with:

```ts
export class DatabaseConfigurationError extends Error {}

export function getDb() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new DatabaseConfigurationError("DATABASE_URL is required");
  }
  return drizzle(neon(connectionString), { schema });
}
```

Construct `DrizzleRevealStore` inside `getRevealStore()`. Delete `MemoryRevealStore`, its global variable, placeholder URL logic, and the eager `db` export. Tests continue to use local fake stores through dependency injection.

- [ ] **Step 5: Propagate lookup failures and add a route error boundary**

Remove the `try/catch` around `findByToken`. Return `null` only when the successful query has no row. Add a client `error.tsx` with the product-styled message `링크를 불러오지 못했어요` and a `다시 시도하기` button calling `reset()`. Do not reveal database details to the browser.

- [ ] **Step 6: Verify green and commit**

Run:

```bash
npm test -- tests/reveals/repository.test.ts tests/api/create-handler.test.ts tests/components/reveal-experience.test.tsx
npm run typecheck
npm run lint
npm run build
git diff --check
```

Expected: all pass; `rg -n "MemoryRevealStore|placeholder:placeholder|__memoryRevealStore" app lib` returns no matches.

```bash
git add lib/db/client.ts lib/reveals/repository.ts app/api/reveals/route.ts app/gender-reveal/[token] tests/reveals/repository.test.ts tests/api/create-handler.test.ts tests/components/reveal-experience.test.tsx
git commit -m "fix: require persistent reveal storage"
```

---

### Task 3: Enforce Due Dates at the Database Layer

**Files:**
- Modify: `lib/db/schema.ts`
- Create: `db/migrations/0001_due_date_as_date.sql`
- Modify: `db/migrations/meta/_journal.json`
- Create: `db/migrations/meta/0001_snapshot.json`
- Modify: `tests/db/schema.test.ts`
- Create: `tests/integration/repository.test.ts`

**Interfaces:**
- Consumes: application `dueDate` values in strict `YYYY-MM-DD` form.
- Produces: PostgreSQL `date` storage while preserving `RevealRecord.dueDate: string` in application code.

- [ ] **Step 1: Write a failing schema test**

Inspect Drizzle table metadata and assert the `dueDate` column has PostgreSQL type `date`, is non-null, and uses string mode. Keep assertions for the existing primary key and gender check.

- [ ] **Step 2: Write an optional real-database integration test**

Gate the test on `TEST_DATABASE_URL`. Apply migrations to an isolated test database, insert `2026-12-25`, retrieve it, and assert the exact string survives. Execute raw SQL attempting to insert `2026-02-30` and assert PostgreSQL rejects it.

- [ ] **Step 3: Verify red**

Run: `npm test -- tests/db/schema.test.ts`

Expected: FAIL because `due_date` is currently text.

- [ ] **Step 4: Change the Drizzle column and generate a migration**

Use:

```ts
dueDate: date("due_date", { mode: "string" }).notNull(),
```

Generate the next migration with `npx drizzle-kit generate --name=due_date_as_date`. Inspect the generated SQL and ensure it performs:

```sql
ALTER TABLE "reveals"
ALTER COLUMN "due_date" TYPE date
USING "due_date"::date;
```

Do not edit the already-applied `0000` migration.

- [ ] **Step 5: Verify migration safety**

Before applying production migration, run:

```sql
SELECT token, due_date
FROM reveals
WHERE due_date !~ '^\d{4}-\d{2}-\d{2}$'
   OR to_char(to_date(due_date, 'YYYY-MM-DD'), 'YYYY-MM-DD') <> due_date;
```

Expected: zero rows. If any row is returned, stop and report the exact tokens; do not coerce or delete user data without approval.

- [ ] **Step 6: Verify green and commit**

Run:

```bash
npm test -- tests/db/schema.test.ts
npx drizzle-kit check
TEST_DATABASE_URL="$TEST_DATABASE_URL" npm test -- tests/integration/repository.test.ts
npm run typecheck
git diff --check
```

Expected: schema and migration checks pass; the integration test passes when the test URL is supplied and reports a skip otherwise.

```bash
git add lib/db/schema.ts db/migrations tests/db/schema.test.ts tests/integration/repository.test.ts
git commit -m "fix: enforce reveal due dates in postgres"
```

---

### Task 4: Match the Approved Creator Form and Accessibility Contract

**Files:**
- Modify: `components/gender-reveal/reveal-creator.tsx`
- Modify: `app/globals.css`
- Modify: `tests/components/reveal-creator.test.tsx`
- Modify: `e2e/visual.spec.ts`

**Interfaces:**
- Consumes: `revealInputSchema` and `POST /api/reveals`.
- Produces: a native date form with exact approved copy, sizing, selected states, and accessible validation.

- [ ] **Step 1: Write failing semantic and copy tests**

Assert these exact labels/placeholders and input type:

```tsx
expect(screen.getByLabelText("아기 태명")).toHaveAttribute("placeholder", "예시: 깡총이");
expect(screen.getByLabelText("출산 예정일")).toHaveAttribute("type", "date");
expect(screen.getByLabelText("받는 사람")).toHaveAttribute("placeholder", "예시: 할머니, 할아버지");
expect(screen.getByRole("group", { name: "아기 성별" })).toBeInTheDocument();
```

After empty submit, assert every invalid control has `aria-invalid="true"`, the form message has `role="alert"`, and `aria-describedby` points to that message. After editing one field, assert only that field clears its invalid state.

- [ ] **Step 2: Write failing layout assertions in the visual test**

At 1280×720, use DOM measurements to assert form content width 380 px, inputs 48 px high, gender controls 50 px high, and submit button 60 px high. At 390×844, assert there is no horizontal overflow and the entire form can be reached by vertical scrolling.

- [ ] **Step 3: Verify red**

Run:

```bash
npm test -- tests/components/reveal-creator.test.tsx
npm run test:e2e -- e2e/visual.spec.ts --grep "creator"
```

Expected: FAIL on current labels, placeholders, text date field, group semantics, and measurements.

- [ ] **Step 4: Implement the approved form structure**

Use one 420 px capped form with 20 px internal padding, pixel font headings, 64 px space before the first field, 30 px between subsequent field groups, 12 px label-to-control gaps, 4 px radii, and approved colors. Use `fieldset`/`legend` for gender. Both gender cards always show their blue/pink backgrounds; selection adds the ink ring and offset.

Render the date control as `type="date"`. When empty, overlay `연.월.일` with `pointer-events: none`; hide the overlay after a value is selected. Preserve the native picker.

- [ ] **Step 5: Implement accessible errors and focus**

Set `aria-invalid`, connect each invalid control to one form error using `aria-describedby`, and move focus to the first invalid control after failed submit. Preserve entered values on server failure. Do not remove visible focus outlines; style `:focus-visible` to the approved slate ring.

- [ ] **Step 6: Verify green and commit**

Run:

```bash
npm test -- tests/components/reveal-creator.test.tsx
npm run test:e2e -- e2e/visual.spec.ts --grep "creator"
npm run typecheck
npm run lint
git diff --check
```

```bash
git add components/gender-reveal/reveal-creator.tsx app/globals.css tests/components/reveal-creator.test.tsx e2e/visual.spec.ts
git commit -m "fix: align creator form behavior and layout"
```

---

### Task 5: Match the Share Dialog and Keyboard Behavior

**Files:**
- Modify: `components/gender-reveal/share-link-dialog.tsx`
- Modify: `tests/components/share-link-dialog.test.tsx`
- Modify: `e2e/gender-reveal.spec.ts`
- Modify: `e2e/visual.spec.ts`

**Interfaces:**
- Consumes: `shareLink` and `onClose`.
- Produces: approved dialog copy, clipboard status, focus containment, and restored focus on close.

- [ ] **Step 1: Write failing dialog behavior tests**

Assert the exact text `링크를 복사하여 카카오톡이나` / `문자로 공유해보세요.`, button `공유 링크 복사`, and completion status `복사가 완료 되었습니다.`. Assert clipboard failure uses `role="alert"`; success uses `role="status"`.

Open the dialog from the creator submit button, assert focus moves to the close button, Tab remains within the dialog, Escape closes it, and focus returns to the creator submit button.

- [ ] **Step 2: Add clipboard E2E coverage**

Grant clipboard permissions in the Playwright context, create a reveal, press `공유 링크 복사`, read the clipboard, and assert it equals the read-only link. Also stub clipboard rejection in a separate browser test and assert the manual-copy message.

- [ ] **Step 3: Verify red**

Run:

```bash
npm test -- tests/components/share-link-dialog.test.tsx
npm run test:e2e -- e2e/gender-reveal.spec.ts --grep "clipboard|dialog keyboard"
```

Expected: FAIL on current copy, button label, inline toast placement, and focus behavior.

- [ ] **Step 4: Implement the approved dialog**

Use a 350 px capped panel, 10 px radius, 20 px horizontal padding, 49 px top padding, close control at top 29/right 20, 30 px copy blocks, and 61 px primary button. Render the success toast as a fixed top status separate from the panel. Keep outside-click and Escape close.

Use a minimal focus trap covering the close button, read-only link, and copy button. Save `document.activeElement` on mount and restore it on unmount.

- [ ] **Step 5: Verify green and commit**

Run:

```bash
npm test -- tests/components/share-link-dialog.test.tsx
npm run test:e2e -- e2e/gender-reveal.spec.ts --grep "clipboard|dialog keyboard"
npm run typecheck
npm run lint
```

```bash
git add components/gender-reveal/share-link-dialog.tsx tests/components/share-link-dialog.test.tsx e2e/gender-reveal.spec.ts e2e/visual.spec.ts
git commit -m "fix: align share dialog and keyboard flow"
```

---

### Task 6: Restore Balloon Artwork, Press Target, and Burst Sequence

**Files:**
- Create: `components/gender-reveal/balloon-particles.tsx`
- Modify: `components/gender-reveal/balloon-interaction.tsx`
- Modify: `app/globals.css`
- Modify: `tests/components/balloon-interaction.test.tsx`
- Modify: `e2e/gender-reveal.spec.ts`
- Modify: `e2e/visual.spec.ts`

**Interfaces:**
- Consumes: `touchCount`, `isBursting`, `onTouch`, `onComplete`, and local step-two artwork.
- Produces: one accessible balloon button, six static image hearts, tap feedback, and a one-shot burst particle layer.

- [ ] **Step 1: Write failing structural tests**

Assert there is exactly one button named `풍선 터치하기 (0/10)` and it contains the balloon image. Assert there is no separate text CTA button. Assert six decorative heart images exist and use only `/img/step2/heart-pink.png` and `/img/step2/heart-blue.png`.

After one press, assert the balloon gets the 400 ms shake class and a `Tab!` feedback item. After 400 ms, shake is removed. On the tenth press, assert the one-shot burst class and particle layer appear, input is disabled, and `onComplete` fires once at 600 ms.

- [ ] **Step 2: Add mobile pointer coverage**

In Playwright mobile mode, use `touchscreen.tap` at the balloon center ten times. Assert progress reaches 10 and the result appears. This must not click a separate CTA.

- [ ] **Step 3: Verify red**

Run:

```bash
npm test -- tests/components/balloon-interaction.test.tsx
npm run test:e2e -- e2e/gender-reveal.spec.ts --grep "touches the balloon"
```

Expected: FAIL because the current implementation has a second button, text hearts, no custom burst particles, and different animation classes.

- [ ] **Step 4: Implement the six-heart layout and single press target**

Use the six approved positions and sizes:

```ts
[
  ["pink", "left-[-30%] top-[9%]", "w-[23%]", "0s"],
  ["blue", "left-[-52%] top-[39%]", "w-[23%]", "0.3s"],
  ["pink", "left-[-34%] top-[75%]", "w-[23%]", "0.6s"],
  ["blue", "left-[114%] top-[27%]", "w-[23%]", "0.15s"],
  ["pink", "left-[126%] top-[67%]", "w-[23%]", "0.45s"],
  ["pink", "left-[93%] top-[100%]", "w-[15%]", "0.75s"],
]
```

Make the balloon itself the button. Apply scale `1 + 0.04 * min(touchCount, 9)`, float while idle, shake for 400 ms after accepted presses, and burst for 600 ms on the tenth.

- [ ] **Step 5: Implement bounded particle state**

Move particle creation/rendering to `balloon-particles.tsx`. Create ten heart particles and ten color confetti particles only when bursting. Generate each particle set once with `useMemo`, use stable IDs, remove tap feedback timers on unmount, and render every particle `aria-hidden="true"`.

- [ ] **Step 6: Implement exact keyframes and reduced motion**

Use the approved 2.6 s float, 400 ms shake, 600 ms burst, 600 ms tap pop, 900 ms confetti burst, and 1.8 s heart float definitions. Preserve `--balloon-scale` in all transform keyframes. Under reduced motion, collapse visual duration but keep the 600 ms state transition timer so behavior remains deterministic.

- [ ] **Step 7: Verify green and commit**

Run:

```bash
npm test -- tests/reveals/interaction.test.ts tests/components/balloon-interaction.test.tsx
npm run test:e2e -- e2e/gender-reveal.spec.ts --grep "touches the balloon"
npm run typecheck
npm run lint
git diff --check
```

```bash
git add components/gender-reveal/balloon-particles.tsx components/gender-reveal/balloon-interaction.tsx app/globals.css tests/components/balloon-interaction.test.tsx e2e
git commit -m "fix: restore balloon interaction sequence"
```

---

### Task 7: Match the Result Screen and Replay Flow

**Files:**
- Modify: `components/gender-reveal/reveal-result.tsx`
- Modify: `components/gender-reveal/reveal-experience.tsx`
- Modify: `tests/components/reveal-result.test.tsx`
- Modify: `tests/components/reveal-experience.test.tsx`
- Modify: `e2e/gender-reveal.spec.ts`
- Modify: `e2e/visual.spec.ts`

**Interfaces:**
- Consumes: fixed image helpers from Task 1 and reducer restart from the existing interaction module.
- Produces: approved result typography/artwork, two side-by-side actions, replay reset, and new-event navigation.

- [ ] **Step 1: Write failing layout and behavior tests**

Assert result copy is grouped as multiline pixel text, decorative bubble has empty alt, the baby artwork has descriptive alt, son artwork is 168 px/43vw capped, and daughter artwork is 200 px/51vw capped. Assert the visible action row contains `<  뒤로가기` and `결과 저장하기`, each taking half the width.

Complete the reveal in `RevealExperience`, press back, and assert `0 / 10`; then press ten times again and assert the result returns. Press `젠더리빌 새로 만들기` and assert navigation to `/gender-reveal`.

- [ ] **Step 2: Verify red**

Run:

```bash
npm test -- tests/components/reveal-result.test.tsx tests/components/reveal-experience.test.tsx
npm run test:e2e -- e2e/gender-reveal.spec.ts --grep "replays|creates a new reveal"
```

Expected: FAIL because the current result is a shadowed card with a separate top back link and untested replay journey.

- [ ] **Step 3: Implement the approved result layout**

Remove the shadowed card treatment. Keep the capture area as a white, 420 px capped column with 24 px padding. Use 22/29 px top copy, 70 px/18vw bubble, approved gender image sizes, and 18/24/18 px closing text with 30 px line height. Keep controls outside the capture area.

Place the 60 px back and save buttons side by side with a 10 px gap. Keep `젠더리빌 새로 만들기` as the underlined secondary action 30 px below.

- [ ] **Step 4: Verify green and commit**

Run:

```bash
npm test -- tests/components/reveal-result.test.tsx tests/components/reveal-experience.test.tsx
npm run test:e2e -- e2e/gender-reveal.spec.ts --grep "replays|creates a new reveal|downloads the result image"
npm run typecheck
npm run lint
```

```bash
git add components/gender-reveal/reveal-result.tsx components/gender-reveal/reveal-experience.tsx tests/components e2e
git commit -m "fix: align reveal result and replay flow"
```

---

### Task 8: Replace Incomplete Acceptance and Visual Evidence

**Files:**
- Modify: `playwright.config.ts`
- Modify: `e2e/gender-reveal.spec.ts`
- Modify: `e2e/visual.spec.ts`
- Create: `docs/product/gender-reveal-verification.md`
- Remove: `docs/reference/gender-reveal.md`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: completed product flow from Tasks 1–7.
- Produces: production-build E2E coverage, full state screenshots, console-error enforcement, and evidence-backed verification records.

- [ ] **Step 1: Run E2E against a production server**

Change local Playwright startup to a script that builds once and starts Next.js on port 3000. Add package scripts:

```json
"test:e2e:prepare": "next build",
"test:e2e:serve": "next start -p 3000"
```

The verification command runs `npm run test:e2e:prepare` before `npm run test:e2e`. This eliminates the development toolbar and makes console-error assertions meaningful.

- [ ] **Step 2: Cover the complete functional matrix**

Keep creation, son, daughter, unknown token, and validation scenarios. Add explicit scenarios for:

- clipboard success and failure;
- mouse clicking the balloon itself;
- mobile touchscreen tapping the balloon itself;
- replay and new-event navigation;
- result PNG download;
- image preparation/share failure recovery through helper/component tests;
- API 500 form state retention using route interception;
- refresh reset to 0/10;
- no uncaught page errors or application console errors in every primary journey.

Each test title must name exactly one behavior. Do not count desktop/mobile project multiplication as distinct product scenarios in the release record.

- [ ] **Step 3: Capture the full visual matrix**

At 1280×720 and 390×844, capture:

1. empty creator;
2. invalid creator;
3. son selected;
4. daughter selected;
5. share dialog;
6. copy toast;
7. balloon 0/10;
8. balloon 9/10;
9. burst key frame;
10. son result;
11. daughter result;
12. unknown-link state;
13. operational-error state.

Use deterministic test data and freeze animations only at the screenshot boundary. Inspect every saved file before marking it accepted.

- [ ] **Step 4: Create an honest verification document**

Replace the existing checklist with `docs/product/gender-reveal-verification.md`. Record:

- commit SHA;
- capture timestamp and timezone;
- Playwright/Chromium version;
- viewport;
- scenario name;
- evidence path;
- pass/fail result;
- known browser-rendering variance;
- production URL status and redirect behavior.

Begin every state unchecked and mark it only after the evidence exists in the current run. Do not write aggregate claims such as “all passed” without the matrix.

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm run test:e2e:prepare
npm run test:e2e
find e2e/screenshots/local -type f | sort
git diff --check
```

Expected: all scenarios pass, 26 visual screenshots exist, and the verification document has one evidence entry per screenshot/state pair.

```bash
git add package.json package-lock.json playwright.config.ts e2e docs/product/gender-reveal-verification.md docs/reference/gender-reveal.md .gitignore
git commit -m "test: verify complete gender reveal experience"
```

---

### Task 9: Present the Repository as a Standalone Product

**Files:**
- Modify: `README.md`
- Modify: `package.json`
- Rename: the single dated Gender Reveal spec whose filename contains an extra qualifier → `docs/superpowers/specs/2026-08-13-gender-reveal-design.md`
- Rename: the single dated Gender Reveal plan whose filename contains an extra qualifier → `docs/superpowers/plans/2026-08-13-gender-reveal.md`
- Modify: both renamed documents
- Modify: `docs/product/gender-reveal-verification.md`
- Modify: matching test titles and source comments under `app/`, `components/`, `lib/`, `tests/`, and `e2e/`
- Modify: `.gitignore`
- Create: `scripts/check-standalone-language.mjs`
- Remove from Git: `tsconfig.tsbuildinfo`

**Interfaces:**
- Consumes: verified product behavior and deployment instructions.
- Produces: current-tree documentation and metadata containing only standalone Gender Reveal product language.

- [ ] **Step 1: Rewrite README around the product and its users**

Use this opening:

```md
# Gender Reveal

로그인 없이 젠더리빌 이벤트를 만들고 가족과 공유할 수 있는 웹 애플리케이션입니다.
제작자는 태명, 출산 예정일, 받는 사람과 성별을 입력해 비밀 링크를 만들고,
받는 사람은 풍선을 열 번 터치한 뒤 결과를 확인하고 이미지로 저장할 수 있습니다.
```

Keep features, architecture, local setup, migration, testing, and Vercel/Neon operations. Update prerequisites to Node.js `>=20.9.0`. Remove external-product comparison and inspiration language. Do not include another product's name or URL.

- [ ] **Step 2: Rename and rewrite maintained design documents**

First list `docs/superpowers/specs/2026-08-13-gender-reveal-*.md` and `docs/superpowers/plans/2026-08-13-gender-reveal-*.md`; each pattern must resolve to exactly one existing source before running `git mv` to the destinations above. Change titles and objectives to standalone product requirements. Replace comparative phrases with measurable UI requirements: exact widths, colors, timings, copy, routes, and behaviors. Remove third-party product names, third-party URLs, and external asset-source tables from maintained documents.

Keep the useful engineering decisions—32-byte token, Neon persistence, visual state matrix, test requirements—but describe them as product requirements rather than derivation work.

- [ ] **Step 3: Sanitize verification, tests, comments, and metadata semantically**

Set `package.json.description` to `Private, login-free gender reveal event sharing`. Rename test titles such as `renders the reference creator heading` to behavior descriptions such as `renders the creator heading and required fields`. Remove fallback comments that imply assets may not exist after deployment; verified local assets are required.

Do not replace ordinary clipboard verbs such as “copy link,” because those describe a product feature.

- [ ] **Step 4: Remove generated build metadata from version control**

Add `*.tsbuildinfo` to `.gitignore` and run:

```bash
git rm --cached tsconfig.tsbuildinfo
```

Keep `next-env.d.ts` tracked as the framework-generated file required by the installed Next.js version.

- [ ] **Step 5: Add and run a current-tree language audit**

Create `scripts/check-standalone-language.mjs`. It must read `git ls-files`, skip `package-lock.json`, binary assets, and generated files, and reject a curated list of Korean and English external-product comparison phrases, plus the removed third-party hostname. Construct the phrase list from character arrays in the script so the disallowed phrases do not appear verbatim in maintained source. Keep ordinary clipboard wording allowed.

Run:

```bash
node scripts/check-standalone-language.mjs
git grep -n -I -i -E 'cop(y|ied|ying)|reference|원본|동일하게' -- ':!package-lock.json'
```

Expected: the script exits 0 without findings. For the second command, the only allowed matches are clipboard actions such as link copying or neutral programming references generated by Next.js; document every allowed match in the commit message review notes and remove all external-product comparison meanings.

- [ ] **Step 6: Verify docs and commit**

Run:

```bash
npm run typecheck
npm run lint
git diff --check
git status --short
```

```bash
git add README.md package.json .gitignore docs app components lib tests e2e scripts/check-standalone-language.mjs
git add -u tsconfig.tsbuildinfo
git commit -m "docs: present gender reveal as a standalone product"
```

---

### Task 10: Make the Intended Production URL Public and Re-verify Release Evidence

**Files:**
- Modify: `README.md`
- Modify: `docs/product/gender-reveal-verification.md`

**Interfaces:**
- Consumes: Vercel project access, Neon production database, completed migrations, and the full Playwright suite.
- Produces: one canonical, unauthenticated production URL and a truthful release verification matrix.

- [ ] **Step 1: Resolve the canonical production URL before deployment**

Choose the public Vercel production origin as canonical unless the intended custom domain can be made publicly accessible. In Vercel project settings, disable deployment protection for the production domain intended for family sharing. Do not disable protection for unrelated projects or preview deployments.

- [ ] **Step 2: Apply the due-date migration safely**

Pull the production environment to an ignored file, run the Task 3 preflight query, and apply `0001_due_date_as_date.sql` only when the query returns zero invalid rows:

```bash
npx vercel env pull .env.production.local --environment=production
set -a
source .env.production.local
set +a
npm run db:migrate
```

Record the UTC and Asia/Seoul timestamps and migration identifier in the verification document without recording credentials.

- [ ] **Step 3: Deploy the verified commit**

Run the full local gate, then deploy that exact commit:

```bash
npm ci
npm test
npm run test:e2e:prepare
npm run test:e2e
npm run typecheck
npm run lint
npm run build
npx drizzle-kit check
git diff --check
npx vercel --prod
```

Expected: all local checks pass and Vercel reports Ready.

- [ ] **Step 4: Prove anonymous access and canonical link generation**

Run without browser authentication cookies:

```bash
curl -fsSIL "https://<canonical-production-host>/gender-reveal"
```

Expected: final response is HTTP 200 and no redirect points to a login or SSO page. Create a reveal through that host and assert the returned `shareLink` uses the same public host.

- [ ] **Step 5: Run the complete suite against production**

Run:

```bash
PLAYWRIGHT_TEST_BASE_URL="https://<canonical-production-host>" npm run test:e2e
```

Record scenario-level results for son, daughter, clipboard, mouse, touch, replay, refresh reset, image download, unknown token, server failure presentation, and console errors. Do not report the number of Playwright project executions as the number of distinct scenarios.

- [ ] **Step 6: Perform a two-device smoke test**

Create a reveal on one physical device or isolated browser context and open the returned link on another. Complete ten touches, save the result image, replay, and refresh. Record device/browser names and pass/fail outcomes.

- [ ] **Step 7: Update only verified release facts and commit**

Add the canonical public URL to README and the verification document. Remove inaccessible or obsolete domains. Confirm the repository language audit from Task 9 still passes.

```bash
git add README.md docs/product/gender-reveal-verification.md
git commit -m "docs: record verified production release"
```

---

### Task 11: Final Independent Review and Completion Gate

**Files:**
- Review: all changes since `86186bd`
- Modify only if a reviewer identifies a verified defect.

**Interfaces:**
- Consumes: Tasks 1–10.
- Produces: evidence that every 2026-08-14 review finding is closed.

- [ ] **Step 1: Request an independent requirements review**

Use `superpowers:requesting-code-review` with the original review findings and this plan. Require exact file/line evidence for any remaining Critical or Important issue. The reviewer must inspect the current diff, tests, migration, production accessibility, image download evidence, and documentation language audit.

- [ ] **Step 2: Fix verified review findings through TDD**

For each valid finding, add or tighten a failing test, demonstrate it, implement the smallest correction, and rerun the focused test. Do not make unrelated cleanup changes.

- [ ] **Step 3: Run the fresh completion gate**

Invoke `superpowers:verification-before-completion`, then run:

```bash
npm ci
npm test
npm run test:e2e:prepare
npm run test:e2e
npm run typecheck
npm run lint
npm run build
npx drizzle-kit check
git diff --check
git status --short
node scripts/check-standalone-language.mjs
```

Expected: every build/test command passes, the worktree is clean after committed evidence updates, and the language audit prints no matches.

- [ ] **Step 4: Confirm review closure explicitly**

The final report must map each original finding to a commit and verification result:

- result image save;
- mandatory persistent database;
- propagated database errors;
- PostgreSQL date type;
- creator form fidelity/accessibility;
- dialog copy/focus/clipboard;
- balloon artwork/animations/touch;
- result layout/replay/download;
- full visual evidence matrix;
- complete E2E scenarios and console checks;
- anonymous production URL;
- accurate Node.js prerequisite;
- standalone product wording throughout the current tree.

Do not declare completion if any row lacks current evidence.
