# Backlog

다음 작업 단위로 진행할 항목을 정리합니다.

## CLI 부분 실행 기능 (`feature-partial-run`)

### 핵심 기능
- [ ] CLI 인자 파서 도입 (현재 `bin/cli.js`는 `process.argv`를 전혀 안 읽음)
- [ ] 파일 경로 인자 처리 — `js-te path/to/foo.test.js` 형태
- [ ] 파일명 패턴 인자 처리 — `js-te user` → `*user*.test.js` 매칭
- [ ] `--testNamePattern` / `-t` 옵션 — 테스트 이름 정규식/부분 매칭
- [ ] `testManager` 측 필터 적용 로직 추가
- [ ] describe 중첩 시 풀네임 결합 규칙 결정 (예: `"결제 > 로그인"`)

### 부가
- [ ] `--help` 출력
- [ ] 잘못된 인자 / 매칭 결과 0건일 때 에러·경고 메시지
- [ ] 종료 코드 정책 (매칭 0건은 실패? 성공?)

### 검증·문서
- [ ] CLI 인자 파서 단위 테스트
- [ ] 필터 적용 통합 테스트
- [ ] `docs/reference/API.ko.md` / `API.md` CLI 섹션 추가
- [ ] `README` 사용법 보강
- [ ] `CHANGELOG.ko.md` 항목 추가

## 다음 브랜치 후보 (이번 범위에서 제외)

- [ ] 코드 레벨 `.only` / `.skip` / `.todo`
- [ ] JSON reporter
- [ ] VSCode 확장 (`vscode.tests` API 기반, 별도 저장소)
- [ ] **`-t` 필터 시 `Found N test file(s)` 숫자 부정확 문제**
  - 현재 문구는 파일 스캔 + 파일 경로 필터 결과. 이름 필터(`-t`)는 import 후에만 적용되므로 이 숫자에 반영되지 않음 → 실제 실행 파일보다 많게 표시됨.
  - 후보 해결책: `runTests.js`를 2-pass로 재작성 (1차: 매 파일 import → 매칭 있는 파일만 `{file, tests[]}`로 수집 → `clearTests`; `onRunStart`는 pre-scan 이후에 호출 / 2차: `testManager.setTests` 같은 주입 API로 ESM 캐시 우회해서 실제 실행).
  - 필요 변경: `testManager.setTests` 신규 + `index.js` 노출, `onRunStart` 호출 위치를 `bin/cli.js` → `runTests.js`로 이동.
  - 트레이드오프: import 비용은 현재와 동일(이미 전 파일 import 중), 다만 공개 API 표면이 `setTests` 하나 늘어남.

- [ ] **라인 번호 기반 단일 테스트 실행 — IDE 플러그인(IDEA/VSCode) ▶ 버튼 UX 전제 조건**
  - **문제**: 현재 `-t "풀네임"`은 부분 문자열 매칭이라, 같은 파일 내 동일 풀네임 테스트(중복 `test('성공', ...)`, 템플릿 없는 `test.each` 등)가 있으면 단일 테스트 실행 불가. IDE 거터 ▶ 버튼이 해당 라인 테스트 하나만 돌리려 해도 같은 이름 전부 실행됨.
  - **해결 방향**: 테스트 등록 시 호출 위치(`file:line`)를 캡처해 고유 식별자로 사용.
    - `testManager.test()`에서 `new Error().stack` 파싱 → `{file, line}`를 `testObj.location`에 저장
    - CLI에 `--testLocation <path>:<line>` 플래그 신규 → 해당 위치 테스트 1개만 실행
    - IDE 플러그인은 ▶ 버튼 클릭 시 커서가 있는 라인 번호를 이 플래그로 전달
  - **참고**: Jest/Vitest도 이 케이스(동명 중복)는 완벽히 못 잡음 — VSCode 확장은 AST + 정규식으로 최선을 다할 뿐. 라인 기반이 유일한 확정 해결책.
  - **구현 시 주의**: stack trace 파싱 시 ESM(`file://`), CJS, 소스맵 적용 환경 모두 고려. `npm` 링크·모노레포 경로도 테스트.
  - **선결 조건**: 없음. 현재 브랜치(`feature-partial-run`)가 머지된 후 별도 브랜치 권장 (`feature-test-location` 가칭).
  - **후속 작업**: 이 기능이 들어간 후에야 IDEA/VSCode 플러그인 개발 가능.
