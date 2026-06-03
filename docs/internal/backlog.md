# Backlog

다음 작업 단위로 진행할 항목을 정리합니다.

---

## 다음 브랜치 후보 (간단 메모, 까먹지 않게)

- [x] **라인 번호 기반 단일 테스트 실행 (`--testLocation path:line`)** — IDE 거터 ▶ 버튼 전제 조건. `testManager.test()` 에서 `new Error().stack` 파싱해 `{file, line}` 캡처. 동명 중복 테스트 단일 실행의 유일한 확정 해결책. Jest/Vitest 도 이 케이스는 AST+정규식 근사치만 제공.
- [x] **`describe` 그룹 단위 실행 (`--testLocation` 확장)** — IDE 어댑터(B) 로 종결. 라이브러리 측은 현 정확 일치 동작 유지하고, AST 로 범위를 풀어 하위 test 라인들로 라이브러리를 여러 번 호출하는 책임은 IDE 확장(별도 저장소) 이 맡음.
- [x] **코드 레벨 `.only` / `.skip` / `.todo`** — `test.only` / `test.skip` / `test.todo`, `describe.only` / `describe.skip` 지원. `.only` 적용 범위는 파일 단위 (Jest 방식). reporter 인터페이스에 `onTestSkip` / `onTestTodo` 추가, `run()` 반환값에 `skipped` / `todo` 카운터 추가.
- [x] **JSON reporter** — 테스트 결과를 콘솔 글자 대신 JSON 형태로 출력하는 기능. CI 스크립트나 IDE 확장이 결과를 쉽게 읽어 활용할 수 있게 함. 기존 콘솔 reporter 옆에 `jsonReporter` 를 추가하는 형태.
- [ ] **`test.each` 와 modifier 조합** — `test.only.each(...)`, `test.skip.each(...)`, `test.each(...).only` 등. 현재 1차 범위에서 제외. Jest/Vitest 양쪽 다 지원하므로 후속에서 통일.
- [ ] VSCode / IDEA 확장 (별도 저장소, 위 라인 기반 실행이 선결)
