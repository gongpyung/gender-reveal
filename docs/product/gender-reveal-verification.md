# Gender Reveal Verification Record

이 문서는 현재 실행에서 실제로 보관된 검증 증거만 기록합니다.

## Run metadata

- Commit SHA: `701856c` (latest committed product state before the Task 8 evidence-only changes)
- Captured at: `2026-08-14 18:34 Asia/Seoul`
- Playwright/Chromium: Playwright 1.62.1 / bundled Chromium
- Viewports: 1280×720 and 390×844
- Production URL: not verified in this environment

## Evidence matrix

| Viewport | State | Evidence path | Result |
| --- | --- | --- | --- |
| 1280×720 | Empty creator | `e2e/screenshots/local/desktop-creator-empty.png` | passed |
| 390×844 | Empty creator | `e2e/screenshots/local/mobile-creator-empty.png` | passed |
| 1280×720 | Invalid creator | `e2e/screenshots/local/desktop-creator-validation.png` | passed |
| 390×844 | Invalid creator | `e2e/screenshots/local/mobile-creator-validation.png` | passed |
| 1280×720 | Son selected | pending | unchecked |
| 390×844 | Daughter selected | pending | unchecked |
| 1280×720 | Share dialog | pending | unchecked |
| 390×844 | Copy toast | pending | unchecked |
| 1280×720 | Balloon 0/10 | pending | unchecked |
| 390×844 | Balloon 9/10 | pending | unchecked |
| 1280×720 | Burst transition | pending | unchecked |
| 390×844 | Son result | pending | unchecked |
| 1280×720 | Daughter result | pending | unchecked |
| 390×844 | Unknown-link state | pending | unchecked |
| 1280×720 | Operational-error state | pending | unchecked |

## Blockers and variance

- `DATABASE_URL` and `TEST_DATABASE_URL` were not present during this local run, so persistent creation, recipient lookup, migration preflight, and production deployment evidence remain unverified.
- No production URL or redirect behavior is asserted until a canonical public deployment is supplied and checked anonymously.
- The full E2E journey, result download, database lookup, and remaining visual states are unchecked because no `DATABASE_URL` was available during this run.
