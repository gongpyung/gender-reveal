# Gender Reveal Reference Measurements & Visual Checklist

## Reference URL
https://baby.bunnyverse.app/gender-reveal

## Live Production URLs
- Primary Custom Domain: https://kongkong-gender-reveal.vercel.app
- Production Origin URL: https://gender-reveal-nine-tau.vercel.app

## Asset Map
| Local Path | Reference URL | Verified Size |
| --- | --- | --- |
| `public/fonts/DungGeunMo.woff` | `https://baby.bunnyverse.app/fonts/DungGeunMo.woff` | 1,614,668 bytes |
| `public/fonts/Pretendard-Regular.woff2` | `https://baby.bunnyverse.app/fonts/Pretendard-Regular.woff2` | 765,892 bytes |
| `public/img/step1/close-icon.svg` | `https://baby.bunnyverse.app/img/step1/close-icon.svg` | 334 bytes |
| `public/img/step2/balloon.png` | `https://baby.bunnyverse.app/img/step2/balloon.png` | 309,371 bytes |
| `public/img/step2/heart-blue.png` | `https://baby.bunnyverse.app/img/step2/heart-blue.png` | 17,007 bytes |
| `public/img/step2/heart-pink.png` | `https://baby.bunnyverse.app/img/step2/heart-pink.png` | 16,951 bytes |
| `public/img/step3/baby-daughter.png` | `https://baby.bunnyverse.app/img/step3/baby-daughter.png` | 98,430 bytes |
| `public/img/step3/baby-son.png` | `https://baby.bunnyverse.app/img/step3/baby-son.png` | 87,196 bytes |
| `public/img/step3/bubble-daughter.png` | `https://baby.bunnyverse.app/img/step3/bubble-daughter.png` | 373,824 bytes |
| `public/img/step3/bubble-son.png` | `https://baby.bunnyverse.app/img/step3/bubble-son.png` | 376,544 bytes |

## Target Viewports for Visual Verification
- Desktop: 1280 × 720
- Mobile: 390 × 844

## State Checklist (All Passed)
- [x] 1. Empty creator form
- [x] 2. Creator validation error state (`정보를 모두 입력해주세요`)
- [x] 3. Selected boy / girl controls
- [x] 4. Share-link dialog and copy toast
- [x] 5. Balloon initial state (0 / 10)
- [x] 6. Balloon late progress state (9 / 10)
- [x] 7. Burst transition key state
- [x] 8. Son result screen
- [x] 9. Daughter result screen

## Production Release Verification Log
- Migration: Executed `0000_create_reveals.sql` on Neon Postgres (PASSED)
- Vercel Deployment: READY on `https://kongkong-gender-reveal.vercel.app`
- Live E2E Tests: 10 / 10 passed against live deployment
