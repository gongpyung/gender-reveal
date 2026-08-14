# Gender Reveal Verification Record

현재 실행에서 확인한 로컬·Production 검증 증거를 기록합니다. 스크린샷은 저장소의 로컬 증거 디렉터리에 생성되며, 캡처 시점의 실행 결과만 이 문서에 반영합니다.

## Run metadata

- Application deployment commit: `8af7848` (`docs: record production migration verification`)
- Evidence test commit: `bc4fc8a` (`test: complete production acceptance evidence`)
- Captured at: `2026-08-14 12:32 KST`
- Playwright/Chromium: Playwright 1.62.1 / bundled Chromium
- Viewports: 1280×720 and 390×844
- Canonical public production URL: [https://kongkong-gender-reveal.vercel.app/gender-reveal](https://kongkong-gender-reveal.vercel.app/gender-reveal)
- Deployment URL: [https://gender-reveal-qz2n7w3x2-gongpyungs-projects.vercel.app](https://gender-reveal-qz2n7w3x2-gongpyungs-projects.vercel.app)
- Vercel deployment: `dpl_HA7oaeh43XZnejCXrxdPah5YHJ5f`, target `production`, status `Ready`

## Production access and database

- Anonymous `HEAD` checks returned HTTP 200 for the deployment URL and all three production aliases, including the canonical URL. No Vercel SSO redirect remained.
- The created share links use the same public origin as the browser session that creates them.
- Read-only migration preflight at `2026-08-14 10:19 KST` returned 0 invalid `due_date` rows.
- Migration `0001_due_date_as_date.sql` applied at `2026-08-14 10:20 KST`.
- Read-only postflight confirmed PostgreSQL `date`, 17 retained records, 0 NULL dates, and 2 migration-ledger entries.
- Production `DATABASE_URL` was updated only in the linked `gender-reveal` Vercel project. Secret values are intentionally not recorded here.

## Functional production evidence

Command:

```bash
PLAYWRIGHT_TEST_BASE_URL=https://kongkong-gender-reveal.vercel.app npm run test:e2e -- --workers=1
```

Result: 23 passed, 3 skipped across desktop and mobile projects in the latest full Production run. The skipped cases are the desktop-only exclusion for touchscreen coverage and the two operational-error visual cases, which were run separately against the isolated unavailable-database server.

Verified scenarios:

- creator validation and unknown-token state;
- son and daughter creation and result rendering;
- mouse balloon interaction and ten-press burst;
- mobile touchscreen balloon interaction;
- refresh reset to `0 / 10`;
- result PNG download with `gender-reveal-son.png` and no application console errors;
- clipboard success and clipboard failure recovery;
- replay to `0 / 10` and new-event navigation;
- server `500` creation failure with entered values preserved.

## Visual evidence matrix

The complete matrix has 13 states × 2 viewports. The 26 current-run files are under `e2e/screenshots/local/`:

| State | Desktop | Mobile |
| --- | --- | --- |
| Empty creator | `desktop-creator-empty.png` | `mobile-creator-empty.png` |
| Invalid creator | `desktop-creator-invalid.png` | `mobile-creator-invalid.png` |
| Son selected | `desktop-creator-son-selected.png` | `mobile-creator-son-selected.png` |
| Daughter selected | `desktop-creator-daughter-selected.png` | `mobile-creator-daughter-selected.png` |
| Share dialog | `desktop-share-dialog.png` | `mobile-share-dialog.png` |
| Copy toast | `desktop-copy-toast.png` | `mobile-copy-toast.png` |
| Balloon 0/10 | `desktop-balloon-0.png` | `mobile-balloon-0.png` |
| Balloon 9/10 | `desktop-balloon-9.png` | `mobile-balloon-9.png` |
| Burst transition | `desktop-burst.png` | `mobile-burst.png` |
| Son result | `desktop-result-son.png` | `mobile-result-son.png` |
| Daughter result | `desktop-result-daughter.png` | `mobile-result-daughter.png` |
| Unknown link | `desktop-unknown-link.png` | `mobile-unknown-link.png` |
| Operational error | `desktop-operational-error.png` | `mobile-operational-error.png` |

The operational-error pair was captured against an isolated Next.js server configured with an unavailable database. It verifies the dedicated `링크를 불러오지 못했어요` boundary without touching the Production database.

## Local verification gate

The latest local gate before the production run passed:

- `npm ci`
- `npm test`: 47 passed, 1 skipped (integration test skipped without `TEST_DATABASE_URL`)
- `npm run test:e2e:prepare`
- `npm run typecheck`
- `npm run lint` (2 existing raw-image warnings)
- `npm run build`
- `npx drizzle-kit check`
- `git diff --check`
- `node scripts/check-standalone-language.mjs`

The screenshot files are generated evidence and remain ignored by Git. They were inspected during this run at desktop and mobile sizes.
