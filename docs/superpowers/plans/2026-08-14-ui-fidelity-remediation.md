# Gender Reveal UI Fidelity Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved UI fidelity, date picker, accessibility, and animation fixes without changing server contracts.

**Architecture:** Keep `RevealCreator` as the form owner and add a focused controlled `DueDatePicker`. Use Radix Popover for lifecycle/accessibility and DayPicker v10 for calendar semantics. Keep visual fixes local to their existing components and global animation declarations in `app/globals.css`.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, Tailwind CSS 4, `@daypicker/react@10.0.1`, `@radix-ui/react-popover@1.1.23`, Vitest, Testing Library, Playwright.

## Global Constraints

- Work from `codex/production-hardening-and-fidelity` in `/Users/hong9/git/gender-reveal-worktree`.
- Preserve user changes; current worktree is clean.
- Read the installed Next.js 16.3 guides under `node_modules/next/dist/docs/` before Next.js code changes.
- Demonstrate each UI defect with a failing test before production changes.
- Preserve DB, API, migrations, date validation, share-link format, and existing 10-touch behavior.
- Do not address mobile balloon-decoration horizontal scrolling.
- Do not commit, push, or deploy.

### Task 1: Install calendar dependencies and add the controlled date picker

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `components/gender-reveal/due-date-picker.tsx`
- Modify: `components/gender-reveal/reveal-creator.tsx`
- Modify: `app/layout.tsx`, `app/globals.css`
- Create: `tests/components/due-date-picker.test.tsx`
- Modify: `tests/components/reveal-creator.test.tsx`

**Interfaces:**
- `DueDatePicker` accepts `id`, `value: string`, `onChange: (value: string) => void`, `invalid?: boolean`, and `describedBy?: string`, plus a forwarded `HTMLButtonElement` ref.
- `RevealCreator` continues submitting the existing `dueDate: string` payload.

- [ ] **Step 1: Add failing tests** asserting no native date input, `연.월.일`, `YYYY. MM. DD`, local date serialization, invalid ARIA attributes, selection close/focus restore, Escape/outside close, and gender placeholder `예시: 콩콩이`.
- [ ] **Step 2: Run `npm test -- tests/components/due-date-picker.test.tsx tests/components/reveal-creator.test.tsx`** and confirm failure is caused by the missing component/native input and old copy.
- [ ] **Step 3: Install exact packages** with `npm install @daypicker/react@10.0.1 @radix-ui/react-popover@1.1.23`.
- [ ] **Step 4: Implement `DueDatePicker`** with DayPicker `mode="single"`, Korean locale, Radix `Popover.Root/Trigger/Content`, collision padding, and local `YYYY-MM-DD` formatting. Import `@daypicker/react/style.css` before `./globals.css` in `app/layout.tsx`; keep design overrides in `globals.css`.
- [ ] **Step 5: Replace the native input and update placeholder** while widening the focus ref type only as needed for the button trigger. Keep Zod and fetch payload untouched.
- [ ] **Step 6: Run the focused tests again** and confirm green before moving on.

### Task 2: Remove gender-card layout movement

**Files:**
- Modify: `components/gender-reveal/reveal-creator.tsx`
- Modify: `tests/components/reveal-creator.test.tsx`
- Modify: `e2e/gender-reveal.spec.ts`, `e2e/visual.spec.ts`

- [ ] **Step 1: Add failing unit/E2E assertions** for no `translate-x-1`/`-translate-y-1`, explicit legend spacing, and unchanged selected/unselected bounding boxes for both labels.
- [ ] **Step 2: Run the focused unit test and confirm red** against the existing translate classes.
- [ ] **Step 3: Remove transforms and add explicit legend bottom margin**; retain fieldset/legend and use border/ring for selected state.
- [ ] **Step 4: Add Playwright box checks** for son/daughter before and after selection and at least 8px legend-to-card distance; run the focused E2E checks.

### Task 3: Restore modal background

**Files:**
- Modify: `components/gender-reveal/share-link-dialog.tsx`
- Modify: `tests/components/share-link-dialog.test.tsx`
- Modify: `e2e/gender-reveal.spec.ts`, `e2e/visual.spec.ts`

- [ ] **Step 1: Add a failing unit assertion** that the dialog has `bg-white`, and an E2E computed-style assertion for `rgb(255, 255, 255)` while retaining overlay/focus behavior checks.
- [ ] **Step 2: Run the focused unit test and confirm red.**
- [ ] **Step 3: Add only `bg-white` to the dialog panel** and run dialog unit/E2E tests for Escape, outside click, focus trap, and focus restoration.

### Task 4: Fix balloon feedback copy, layer, position, and animation

**Files:**
- Modify: `components/gender-reveal/balloon-interaction.tsx`, `app/globals.css`
- Modify: `tests/components/balloon-interaction.test.tsx`
- Modify: `e2e/gender-reveal.spec.ts`, `e2e/visual.spec.ts`

- [ ] **Step 1: Add failing unit assertions** for lowercase `hit`, `aria-hidden`, an above-balloon position class, `z-20`, and the dedicated animation class.
- [ ] **Step 2: Run the focused test and confirm red** against `Tab!`, center position, and `z-10`.
- [ ] **Step 3: Change feedback to `hit`, position it above the button, use `z-20`, and define a 600ms upward fade animation.** Keep 10-touch and progress logic unchanged.
- [ ] **Step 4: Add E2E capture/assertion immediately after a press** and verify reduced-motion behavior does not alter the interaction.

### Task 5: Separate result images and add motion-safe animations

**Files:**
- Modify: `components/gender-reveal/reveal-result.tsx`, `app/globals.css`
- Modify: `tests/components/reveal-result.test.tsx`
- Modify: `e2e/gender-reveal.spec.ts`, `e2e/visual.spec.ts`

- [ ] **Step 1: Add failing unit assertions** for DOM order (heart before baby) and distinct heart/baby animation classes.
- [ ] **Step 2: Run the focused test and confirm red** against the existing absolute overlap.
- [ ] **Step 3: Use a column stack with at least 20px static gap and small independent float animations** so the animated minimum gap remains at least 12px; preserve gender-specific baby heights, text, and save handlers.
- [ ] **Step 4: Add reduced-motion rules** for both result animations.
- [ ] **Step 5: Add desktop/mobile E2E checks** for son and daughter asserting `heart.bottom <= baby.top - 8` before and after image capture/save preparation.

### Task 6: Full verification and visual evidence

**Files:**
- Modify only if test assertions require it: `e2e/gender-reveal.spec.ts`, `e2e/visual.spec.ts`
- Generated local-only captures: `e2e/screenshots/local/`

- [ ] **Step 1: Run `npm test`.**
- [ ] **Step 2: Run `npm run typecheck`, `npm run lint`, and `npm run build`.**
- [ ] **Step 3: Run `npm run test:e2e:prepare` and `npm run test:e2e`.**
- [ ] **Step 4: Run `git diff --check`.**
- [ ] **Step 5: Inspect 390×844 and 1280×720 captures for picker open, gender choice, share dialog, hit, son result, and daughter result; report exact results and any environment limitation. Do not commit or push.**
