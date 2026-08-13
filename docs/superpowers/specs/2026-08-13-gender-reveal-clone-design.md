# Gender Reveal Clone Design

## Objective

Build a private-use, publicly reachable clone of `https://baby.bunnyverse.app/gender-reveal` that reproduces the original end-to-end experience:

1. A creator enters the baby's nickname, due date, recipient, and gender.
2. The app creates a persistent share link.
3. A recipient opens the link and taps or clicks the balloon ten times.
4. The balloon bursts and reveals the baby's gender.
5. The recipient can replay the interaction and save or share the result image.

The first release prioritizes functional and visual fidelity. Product improvements are explicitly deferred until the clone is complete and verified.

## Scope

### Included

- Faithful responsive reproduction of the creator form, validation states, share-link dialog, balloon interaction, burst transition, and result screen
- Original copy, publicly served visual assets, fonts, colors, spacing, and animation timing for private use
- Persistent, unlisted share links backed by PostgreSQL
- Login-free access for both creators and recipients
- Result replay and image save/share behavior
- Production deployment to Vercel with Neon Postgres provisioned through the Vercel Marketplace
- Automated functional tests, end-to-end browser tests, and desktop/mobile visual comparison

### Excluded

- Accounts, authentication, authorization, or an admin dashboard
- Link expiration, deletion, or usage limits
- Analytics or behavioral tracking
- Product enhancements beyond the original experience
- Search-engine visibility controls beyond the application's normal defaults

## Architecture

Use a single Next.js App Router application written in TypeScript and styled with Tailwind CSS. The application contains both the browser UI and the small server-side data layer needed to create and resolve reveal links.

### Routes

- `/gender-reveal`: creator form and share-link creation flow
- `/gender-reveal/[token]`: recipient balloon interaction and result flow
- `POST /api/reveals`: validated reveal creation; returns the canonical share URL

The recipient page resolves its token on the server. A missing token renders the product-styled not-found state. Client-side state controls the interaction counter, burst animation, result screen, and replay without persisting interaction progress.

### Persistence

Store one PostgreSQL row per reveal with these fields:

- Random share token with a unique constraint
- Baby nickname
- Due date
- Recipient name
- Baby gender (`son` or `daughter`)
- Creation timestamp

Use Drizzle ORM for the single table and its migration. Generate tokens from 32 cryptographically secure random bytes encoded as URL-safe Base64. Links do not expire. In the unlikely event of a unique-token collision, generate a new token and retry the insert once; if that retry fails, return the normal creation failure response.

## UI Components

### RevealCreator

- Centrally aligned, responsive form matching the reference layout
- Baby nickname, due date, recipient, and son/daughter inputs
- Client-side validation that marks missing fields and displays `정보를 모두 입력해주세요`
- Submission state that disables the button and shows the reference loading copy
- Server failure state that displays `링크 생성에 실패했어요. 다시 시도해주세요`

The server independently validates all submitted values before storing them.

### ShareLinkDialog

- Reference-aligned `풍선이 완성되었어요!` dialog
- Copy-link button and completion toast
- Clipboard failure message
- Close button, outside-click close, and Escape-key close behavior

### BalloonInteraction

- Loads the reveal record resolved from the URL token
- Reproduces the reference balloon artwork and interaction layout
- Accepts touch and mouse input
- Displays progress from `0 / 10` through `10 / 10`
- Starts the burst transition on the tenth accepted interaction
- Ignores additional input while bursting
- Moves to the result after the burst animation completes

Refreshing the page resets progress to zero because interaction state is browser-memory-only.

### RevealResult

- Displays the nickname, revealed gender, recipient, and due date using the reference copy and arrangement
- Uses the gender-specific reference colors and artwork
- Provides replay, which returns to the balloon with zero progress
- Provides image save/share behavior that captures the result content and uses the platform share sheet when file sharing is supported, otherwise downloads the image
- Reports image generation or sharing failures without losing the result state

## Visual Fidelity

For this private clone, copy the reference assets and fonts that are publicly delivered to the browser into the local project. Do not hotlink runtime assets from the reference service.

Match the reference at desktop and mobile sizes, including:

- Font families, sizes, weights, and line heights
- Foreground, background, boy, and girl colors
- Form widths, field heights, button dimensions, borders, radii, and spacing
- Modal dimensions and overlay treatment
- Balloon size and placement
- Float, press, burst, and transition timings
- Focus, selected, validation, loading, toast, and error states

Browser-native date controls may render differently by operating system. Preserve the reference layout and placeholder treatment while accepting unavoidable native-picker differences.

## Data Flow

1. The creator fills all four inputs and submits the form.
2. The client validates required values and sends a creation request.
3. The server validates again, generates a secure token, stores the reveal, and returns the canonical share URL.
4. The client opens the share-link dialog and copies that URL on request.
5. A recipient requests `/gender-reveal/[token]`.
6. The server looks up the token and renders the interaction with the stored reveal data.
7. Each accepted tap increments local state once. The tenth tap locks input and starts the burst transition.
8. The completed transition renders the result from the already loaded reveal data.
9. Replay resets only the local interaction state. Reopening or refreshing the link also starts from zero.

## Error Handling

- Missing creator fields: mark each invalid control and show one form-level message.
- Invalid server input: reject the request without writing a row and return a safe validation response.
- Database or creation failure: keep the form data and show the reference retry message.
- Unknown token: render `존재하지 않는 젠더리빌 링크입니다` without exposing database details.
- Clipboard failure: keep the dialog open and show the reference manual-copy guidance.
- Result image failure: keep the result visible, restore the action button, and allow retry.
- Repeated balloon input during the burst: ignore it so the transition completes only once.

Do not add rate limiting, account recovery, administrative tooling, or generalized infrastructure that the approved private-use scope does not require.

## Testing Strategy

### Focused automated tests

- Required-field and server validation rules
- Due-date parsing and presentation
- Token generation and persistence lookup
- Unknown-token behavior
- Balloon progress and exact transition on the tenth accepted interaction
- Replay state reset
- Share fallback selection where browser APIs can be stubbed reliably

### End-to-end browser scenarios

- Create a reveal, copy or capture its URL, open it as a recipient, tap ten times, and verify the expected result
- Verify both son and daughter result variants
- Verify creator validation and server-failure presentation
- Verify an unknown token
- Verify replay and result image download
- Exercise desktop mouse and mobile touch-sized viewports
- Verify that a refreshed recipient link restarts at zero

### Visual verification

Capture the reference and local application at matching desktop and mobile viewports for:

- Empty creator form
- Creator validation errors
- Selected boy and girl controls
- Share-link dialog and copy toast
- Balloon at initial and late-progress states
- Burst transition key state
- Son result
- Daughter result

Compare typography, layout, colors, artwork, and state styling side by side and iterate until differences are limited to unavoidable browser rendering variance.

## Deployment

- Deploy the Next.js application to Vercel.
- Provision Neon Postgres through the Vercel Marketplace and attach it to the project.
- Store database credentials only in Vercel environment variables and local ignored environment files.
- Run the production schema migration before the production smoke test.
- Use the deployed request origin when constructing canonical share URLs so preview and production environments produce valid links for their own host.

## Completion Criteria

The initial clone is complete when all of the following are true:

- The production Vercel deployment and PostgreSQL migration succeed.
- The complete creator-to-recipient flow works on the deployed URL.
- A link created on one device opens and completes on another device without login.
- Both gender variants, replay, clipboard handling, and result image saving work.
- Automated tests pass.
- Desktop and mobile reference comparisons cover every specified state and show no material visual or interaction mismatch.
- There are no uncaught console errors or critical accessibility violations in the primary flow.
