# Gender Reveal Product Design

## Objective

Gender Reveal은 로그인 없이 이벤트를 만들고 가족과 공유하는 웹 애플리케이션이다.
제작자는 태명, 출산 예정일, 받는 사람, 성별을 입력해 영구 링크를 만들고, 받는
사람은 링크를 열어 풍선을 열 번 터치한 뒤 결과를 확인하고 이미지를 저장한다.

## Scope and routes

- `/gender-reveal`: 제작자 폼과 공유 링크 생성
- `/gender-reveal/[token]`: 받는 사람의 풍선·결과 흐름
- `POST /api/reveals`: Zod 검증 후 canonical share URL 반환
- PostgreSQL에는 token, nickname, due date, recipient, gender, created timestamp만 저장
- token은 32바이트 암호학적 난수의 URL-safe Base64이며 만료되지 않는다.

## UI contract

- 폼은 최대 420px, 내부 여백 20px, 입력 높이 48px, 성별 카드 높이 50px, primary 버튼 높이 60px이다.
- 라벨은 `아기 태명`, `출산 예정일`, `받는 사람`, `아기 성별`이며 날짜는 native date input이다.
- 오류 필드는 `aria-invalid`와 form error를 연결하고 제출 실패 시 첫 오류로 focus를 이동한다.
- 공유 dialog는 최대 350px이며 Escape, 바깥 클릭, 닫기 버튼을 지원하고 focus를 복원한다.
- 풍선은 하나의 접근 가능한 버튼이며 10번째 입력에서 600ms burst를 시작하고 이후 입력을 무시한다.
- 결과 capture 영역은 white 420px column이며 bubble은 decorative, gender artwork는 descriptive alt를 사용한다.

## Data and failure handling

DB 설정이 없으면 `DatabaseConfigurationError`를 발생시킨다. 조회 오류는 전용
route error boundary로 전달하고 상세 오류를 사용자에게 노출하지 않는다. 이미지
준비·저장 오류는 결과 화면을 유지한 채 retry 가능한 메시지로 표시한다.

## Verification

Vitest, React Testing Library, Playwright Chromium, production build, typecheck,
lint, Drizzle migration check를 실행한다. desktop 1280×720과 mobile 390×844에서
creator, dialog, balloon, burst, result, unknown-link, operational-error 상태를
증거 파일과 함께 기록한다.
