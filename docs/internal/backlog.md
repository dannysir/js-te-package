# Backlog

다음 작업 단위로 진행할 항목을 정리합니다.

---

## 다음 브랜치 후보 (간단 메모, 까먹지 않게)

- [ ] **`-t` 필터 시 `Found N test file(s)` 숫자 부정확** — 이름 필터는 import 후 적용되므로 초기 표시 숫자에 반영 안 됨. 2-pass 리팩터로 해결 (pre-scan → `testManager.setTests` 주입 API 신규 → 실제 실행).
- [ ] **`testNameFilter.test.js` marker 우회 격리 방식 정리** — 현재 본 파일은 외부 러너가 본 파일의 top-level 테스트를 스냅샷·실행한 뒤 각 테스트 안에서 추가 fixture 를 staging 하는 marker 방식으로 우회한다. 사용자에게 노출되지 않는 testManager 의 인스턴스화 또는 `testManager.reset()` 같은 격리 API 도입 후 표준 패턴으로 원복할지 결정 필요. 결정 분기:
  - (a) `testManager` 를 `index.js` 에 export 하고 새 인스턴스 격리 — testManager 클래스 인스턴스화 가능 여부 선검토.
  - (b) `testManager.reset()`/`clearTests()` 명시 API 추가 — 싱글톤 유지, 각 테스트가 호출.
  - (c) 현 marker 방식 유지하고 주석으로 의도 고정.
  근거 데이터: 본 우회는 mockStore 충돌과 무관하게 testManager 싱글톤 격리 한계에서 비롯됨. mockStore 수정 brunch 와 분리해 단독 진행 권장.
- [ ] **mockStore 충돌 회귀 통합 테스트** — `fix-mock-store-injection-collision` 에서는 transformer 단위 테스트로 식별자 부재·globalThis 접근만 고정. 자가 충돌(서브패스 import + mock 동시) 및 사용자 공간 오염(지역 `const mockStore`) 시나리오를 별도 fixture 디렉터리로 두고 통합 회귀 테스트 추가.
- [ ] **라인 번호 기반 단일 테스트 실행 (`--testLocation path:line`)** — IDE 거터 ▶ 버튼 전제 조건. `testManager.test()` 에서 `new Error().stack` 파싱해 `{file, line}` 캡처. 동명 중복 테스트 단일 실행의 유일한 확정 해결책. Jest/Vitest 도 이 케이스는 AST+정규식 근사치만 제공.
- [ ] 코드 레벨 `.only` / `.skip` / `.todo`
- [ ] JSON reporter
- [ ] VSCode / IDEA 확장 (별도 저장소, 위 라인 기반 실행이 선결)
