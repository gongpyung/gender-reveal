# Gender Reveal Implementation Plan

## Goal

Build the standalone Gender Reveal application described in the product design:
persistent share links, a deterministic ten-touch balloon flow, accessible sharing,
result replay, and PNG saving.

## Ordered work

1. Set up the Next.js App Router, strict TypeScript, Vitest, Playwright, Tailwind, and local assets.
2. Implement the PostgreSQL-backed reveal repository, secure token generation, validation, and API route.
3. Implement creator form, validation, share dialog, clipboard handling, and focus behavior.
4. Implement balloon artwork, six floating hearts, tap feedback, bounded burst particles, and reducer timing.
5. Implement result artwork, replay/new-event actions, capture preparation, share/download fallback, and retry errors.
6. Add unit, integration, browser, and visual evidence coverage for desktop and mobile viewports.
7. Run migrations only after read-only data preflight; deploy only after the local gate is green.

## Acceptance criteria

- Reveal records remain available across processes and devices.
- PostgreSQL stores due dates as `date` while application code uses `YYYY-MM-DD` strings.
- The tenth accepted press starts exactly one 600ms burst.
- Creator, dialog, balloon, result, replay, clipboard, and image download flows are keyboard and touch usable.
- Every release claim has a current evidence path and timestamp.
