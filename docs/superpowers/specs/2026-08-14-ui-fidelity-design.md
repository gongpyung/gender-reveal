# Gender Reveal UI Fidelity Remediation Design

## Goal

수정 범위를 UI와 접근성으로 한정해 제작 폼, 공유 모달, 풍선 피드백, 결과 화면의 시각적 결함을 바로잡고, 서버 계약과 기존 10회 터치 흐름을 유지한다.

## Design

- `DueDatePicker`는 `@radix-ui/react-popover`와 `@daypicker/react`를 조합한 controlled client component다. 외부 계약은 `dueDate: string`과 `onChange(value: string)`이며, 날짜는 로컬 `getFullYear()`, `getMonth() + 1`, `getDate()`를 이용해 `YYYY-MM-DD`로 만든다.
- Radix가 Escape, 바깥 클릭, 키보드 포커스 이동과 trigger 복귀를 처리한다. trigger는 기존 입력과 같은 48px 높이·배경색을 유지하고, `aria-invalid`/`aria-describedby`를 전달한다. Popover content는 흰색 제품 색상, 경계와 그림자, collision padding을 사용한다.
- 성별 카드는 `fieldset/legend`를 유지하고 legend 하단에 명시적 여백을 둔다. 선택 상태는 border/ring만 바꾸며 transform은 사용하지 않는다.
- 풍선 tap feedback은 `hit`, `aria-hidden`, `z-20`으로 풍선보다 위에 렌더링하고, 600ms 전용 위쪽 fade 애니메이션을 사용한다.
- 결과 이미지 영역은 bubble/heart 이미지를 위, 아기 이미지를 아래에 배치하는 column stack으로 바꾼다. 최소 정적 간격을 각 애니메이션 이동 폭보다 크게 두고, `prefers-reduced-motion: reduce`에서 두 애니메이션을 사실상 끈다.

## Constraints

- `RevealInput`, Zod 검증, API payload, DB, migration, 날짜 검증 규칙, 공유 링크 형식은 변경하지 않는다.
- 모바일 풍선 장식의 가로 스크롤 문제와 요청되지 않은 리팩터링은 건드리지 않는다.
- `app/layout.tsx`에서는 DayPicker stylesheet를 `globals.css`보다 먼저 import한다.
- 커밋, 푸시, 배포는 수행하지 않는다.

## Verification

각 컴포넌트의 회귀 테스트를 먼저 실패시키고 최소 구현으로 통과시킨다. 이후 `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, E2E 준비/실행, `git diff --check`를 실행한다. Playwright에서 390×844 및 1280×720의 날짜 picker, 성별 선택, 공유 모달, hit, son/daughter 결과를 캡처하고 bounding box·computed style을 검증한다.
