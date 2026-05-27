# Backlog

다음 작업 단위로 진행할 항목을 정리합니다.

---

## 다음 브랜치 후보 (간단 메모, 까먹지 않게)

- [x] **라인 번호 기반 단일 테스트 실행 (`--testLocation path:line`)** — IDE 거터 ▶ 버튼 전제 조건. `testManager.test()` 에서 `new Error().stack` 파싱해 `{file, line}` 캡처. 동명 중복 테스트 단일 실행의 유일한 확정 해결책. Jest/Vitest 도 이 케이스는 AST+정규식 근사치만 제공.
- [ ] 코드 레벨 `.only` / `.skip` / `.todo`
- [ ] **JSON reporter** — 테스트 결과를 콘솔 글자 대신 JSON 형태로 출력하는 기능. CI 스크립트나 IDE 확장이 결과를 쉽게 읽어 활용할 수 있게 함. 기존 콘솔 reporter 옆에 `jsonReporter` 를 추가하는 형태.
- [ ] VSCode / IDEA 확장 (별도 저장소, 위 라인 기반 실행이 선결)
