# Gender Reveal Verification Record

이 문서는 현재 실행에서 실제로 보관된 검증 증거만 기록합니다.

## Run metadata

- Commit SHA: `64cdaa1b232661c945b286165eee4a6885f2cd05`
- Captured at: `2026-08-14 09:47:48 Asia/Seoul`
- Playwright/Chromium: Playwright 1.62.1 / bundled Chromium
- Viewports: 1280×720 and 390×844
- Candidate production URL: `https://gender-reveal-kcckbd9z8-gongpyungs-projects.vercel.app/gender-reveal`
- Public production URL: not verified; candidate redirects anonymous requests to Vercel SSO (HTTP 302)

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

- Production migration preflight: 0 invalid rows at `2026-08-14 10:19 KST`; no user data was deleted or coerced.
- Migration `0001_due_date_as_date.sql`: applied successfully at `2026-08-14 10:20 KST`; postflight confirmed PostgreSQL `date`, 17 records retained, 0 NULL dates, and 2 migration ledger entries.
- Vercel production environment pull returned redacted `[SENSITIVE]` placeholders for database URL values, so the deployed runtime database configuration is not independently verified.
- The candidate production URL is protected by Vercel SSO. Deployment protection must be deliberately changed for the intended public production domain before anonymous verification.
- The full E2E journey, result download, database lookup, and remaining visual states are unchecked because no `DATABASE_URL` was available during this run.
- Full production-server E2E result: 4 scenarios passed (validation and visual creator states); 8 scenarios failed at the expected fail-fast database boundary with `DatabaseConfigurationError: DATABASE_URL is required`.
- Independent review completed. The timer-cleanup finding was fixed in commit `64cdaa1`; the remaining Important findings are external database/Vercel access and the resulting unchecked production journey/evidence matrix.
