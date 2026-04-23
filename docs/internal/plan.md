# feature-partial-run — CLI 부분 실행 기능 구현 계획

## 진행 현황

세션 단위로 Phase 하나씩 진행. 세션 시작 시 이 문서와 체크박스를 확인하고, 세션 종료 시 해당 Phase 내 체크박스를 갱신한 뒤 사용자 허락을 받아 커밋한다.

- [x] **Phase 1** — CLI 인자 파서 도입
- [x] **Phase 2** — 파일 필터
- [x] **Phase 3** — testManager 이름 필터
- [ ] **Phase 4** — 0건 정책 · `--help` · 경고 메시지
- [ ] **Phase 5** — 단위/통합 테스트
- [ ] **Phase 6** — 문서 (CLI 레퍼런스 · README · CHANGELOG)

## 배경

현재 [bin/cli.js](../../bin/cli.js)는 `process.argv`를 전혀 읽지 않아 **항상 전체 테스트**를 실행한다. Jest/Vitest 수준의 "파일/이름 단위 부분 실행"을 지원해, 개발 중 빠른 피드백 루프와 IDE 거터 ▶ 같은 후속 통합의 **전제 조건**을 마련한다.

원래 사용자가 떠올린 UX(IDE 거터 버튼)는 결국 IDE가 CLI 필터를 호출하는 구조라서, **CLI 부분 실행이 모든 후속 작업의 토대**가 된다. 이번 브랜치는 그 토대만 다진다.

범위는 [backlog.md](backlog.md)의 "CLI 부분 실행 기능" 섹션과 동일하다.

## 사용자 UX

```bash
js-te                              # 전체 실행 (기존과 동일)

js-te user                         # 경로에 "user" 포함된 테스트 파일만
js-te src/auth.test.js             # 특정 파일만
js-te user payment                 # "user" 또는 "payment" 포함 (OR)

js-te --testNamePattern "로그인"
js-te -t "로그인"                   # short alias
js-te -t="로그인"                   # = 구분자

js-te auth -t "토큰"                # 조합: auth 파일 중 "토큰" 포함 테스트
js-te --help                       # 도움말
```

## 설계 결정

1. **인자 파서**: Node 내장 `node:util.parseArgs` 사용. 의존성 추가 없음. `engines.node >= 22.15.0`이라 사용 가능.
2. **파일 매칭**: Jest 스타일 **부분 문자열 매칭 단일 규칙**. positional이 파일 전체 경로에 포함되면 매칭, 여러 개면 OR. exact-path 분기 없음.
3. **describe 중첩 구분자**: 기존 `" > "` 유지. 이미 [src/view/reportMessages.js:8](../../src/view/reportMessages.js) `DIRECTORY_DELIMITER`로 정의·사용 중. `-t` 매칭 대상 풀네임은 `"{path} > {description}"` (path 비면 description 단독).
4. **0건 매칭 종료 코드**: 실패(exit 1). Vitest 기본과 동일. CI에서 "조용한 성공"으로 리그레션 놓치는 사고 방지 우선. `--passWithNoTests` 플래그는 이번 브랜치 범위 밖.
5. **문서 배치**: README에는 짧은 사용법만, 상세는 `docs/reference/CLI.md` / `CLI.ko.md` 신규 생성.

---

## Phase 1 — CLI 인자 파서

- [x] `src/cli/parseCliArgs.js` 신규
- [x] `bin/cli.js`에서 파싱 결과 수신 → `{ filePatterns, testNamePattern, help }`
- [x] `--help` 플래그 시 도움말 출력 후 `exit 0`
- [ ] 단위 테스트 동반 작성 (Phase 5에서 항목 체크)

### 구현 메모

- `node:util`의 `parseArgs`로 다음 스펙 파싱:
  - `--testNamePattern` / `-t`: `type: 'string'`
  - `--help` / `-h`: `type: 'boolean'`
  - positionals(`allowPositionals: true`): 파일 경로/패턴 여러 개
- 도움말 문자열은 `parseCliArgs.js` 내부 상수로 두거나, 길어지면 `src/cli/helpText.js`로 분리.
- 에러 메시지(잘못된 플래그 등)는 parseArgs가 던지는 에러를 캐치해 간결하게 재포장 후 exit 1.

---

## Phase 2 — 파일 필터

- [x] `src/cli/utils/filterTestFiles.js` 신규
- [x] [src/cli/setupFiles.js](../../src/cli/setupFiles.js)가 `filePatterns` 인자 받도록 시그니처 변경
- [x] [bin/cli.js](../../bin/cli.js)에서 필터 주입
- [ ] 단위 테스트 동반 작성 (Phase 5)

### 구현 메모

- 규칙:
  ```js
  if (filePatterns.length === 0) return testFiles;
  return testFiles.filter(p => filePatterns.some(q => p.includes(q)));
  ```
- [src/cli/utils/findFiles.js](../../src/cli/utils/findFiles.js)의 `findTestFiles`는 그대로 두고 **후처리 필터**로 간다. 이유: `findTestFiles`는 테스트 디렉토리/파일명 규칙 판별 책임, 필터는 별도 책임. 섞으면 단위 테스트가 어려워짐.

---

## Phase 3 — testManager 이름 필터

- [x] [src/testManager.js](../../src/testManager.js)의 `run()`이 `testNamePattern`을 positional로 수용 — `run(reporter, testNamePattern, file)` (옵션 객체 대신 positional — 단일 옵션이면 감싸지 않는 프로젝트 스타일)
- [x] 내부에서 풀네임(`path + " > " + description` 또는 `description`) 조립 후 `includes(testNamePattern)` 필터
- [x] [src/cli/runTests.js](../../src/cli/runTests.js)가 옵션 전달
- [x] [index.js](../../index.js) `run` 래퍼가 `testNamePattern`·`file` 전달 (계획 외 발견 — dist 번들이 이 경로로 공개 API 노출)
- [x] 매칭 0건 파일은 헤더·suite 출력 생략 (계획 외 발견 — `testManager.run(reporter, pattern, file)`에서 파일 레벨 리포팅 내장화. `getMatchingTests`/`clearTests`는 testManager 내부 메서드로만 유지, 공개 API 표면은 `run` 하나)
- [ ] 단위/통합 테스트 동반 작성 (Phase 5)

### 구현 메모

- 매칭은 **대소문자 구분 부분 문자열**. 정규식 지원은 이번 범위 밖 (요청 누적되면 별도 옵션 `--testNamePatternRegex` 추가 고려).
- `test.path`가 빈 문자열이면 풀네임은 `description` 단독. 이미 조립 규칙이 [reportMessages.js:13](../../src/view/reportMessages.js) `formatSuccessMessage`에 같은 형태로 존재하므로 재사용 가능.
- 필터링된 테스트는 `getTests()` 단계에서 걸러, `run()`의 실행 루프는 그대로 둔다.

---

## Phase 4 — 0건 정책 · `--help` · 경고

- [ ] `bin/cli.js`: `totalPassed + totalFailed === 0`일 때 exit 1
- [ ] `src/view/reportMessages.js`: "0 tests matched your pattern" 계열 경고 포맷터 추가
- [ ] `--help` 출력 문자열 최종 확정 (Phase 1에서 초안 → 여기서 다듬기)

### 구현 메모

- 현재 종료 코드 로직은 [bin/cli.js:21](../../bin/cli.js)의 `totalFailed > 0 ? 1 : 0`. 여기에 0건 조건을 AND가 아닌 OR로 추가:
  ```js
  const zeroMatched = totalPassed + totalFailed === 0;
  return (totalFailed > 0 || zeroMatched) ? 1 : 0;
  ```
- 0건 경고는 리포터 `onRunDone` 호출 전에 찍어 사용자가 원인을 바로 파악할 수 있게 한다.

---

## Phase 5 — 단위/통합 테스트

- [ ] `test/cli/parseCliArgs.test.js` — positional·옵션·alias·에러 케이스
- [ ] `test/cli/filterTestFiles.test.js` — 부분 문자열 매칭·OR·0건
- [ ] `test/cli/testNameFilter.test.js` — 풀네임 매칭·describe 중첩·0건
- [ ] 기존 `test/basic.test.js` 등 전체 `npm test` 통과 (회귀 없음)

### 구현 메모

- 기존 `test/cli/` 하위 테스트([test/cli/findFiles.test.js](../../test/cli/findFiles.test.js) 등) 패턴 따라가기.
- `testNameFilter.test.js`는 `testManager`에 직접 describe/test를 쌓고 `run(silentReporter, {testNamePattern})` 호출해 남은 테스트 수를 검증.
- fixture 디렉토리가 필요하면 기존 `test/cli/findFiles.test.js`가 쓰는 방식 참고.

---

## Phase 6 — 문서

- [ ] `docs/reference/CLI.md` 신규 — 사용 예, 옵션 표, 매칭 규칙, 종료 코드, 예시 시나리오
- [ ] `docs/reference/CLI.ko.md` 신규 — 한글 버전
- [ ] `README.md` Quick Start 근처에 짧은 CLI 예시 3~5줄 + `CLI.md` 링크
- [ ] `CHANGELOG.ko.md` `## [0.7.0]` 신규 섹션, `### 추가 (CLI)` 분류로 항목 기재
- [ ] `docs/internal/backlog.md` 해당 섹션 체크박스 갱신

---

## 파일 영향 요약

### 신규
- `src/cli/parseCliArgs.js`
- `src/cli/utils/filterTestFiles.js`
- `test/cli/parseCliArgs.test.js`
- `test/cli/filterTestFiles.test.js`
- `test/cli/testNameFilter.test.js`
- `docs/reference/CLI.md`
- `docs/reference/CLI.ko.md`

### 수정
- `bin/cli.js` — 인자 파싱 · 필터 주입 · `--help` · 0건 exit 1
- `src/cli/setupFiles.js` — `filePatterns` 인자 수용
- `src/cli/runTests.js` — `testNamePattern` 옵션 전달
- `src/testManager.js` — `run()`에 이름 필터 옵션 적용
- `src/view/reportMessages.js` — 0건 경고 포맷터 추가
- `README.md` — Quick Start에 CLI 예시
- `CHANGELOG.ko.md` — 0.7.0 섹션
- `docs/internal/backlog.md` — 체크박스 갱신 (완료 단계에서)

---

## 검증 체크리스트

각 Phase 종료 시 확인:

- [ ] `npm test` — 기존 테스트 전부 통과
- [ ] `npm run build` — rollup dual build 성공 (Phase 1·2·3·4 중 하나라도 `dist`가 영향받으면)
- [ ] 수동 실행 시나리오
  - [ ] `js-te` — 전체 실행, exit 0
  - [ ] `js-te user` — 매칭 파일만 실행
  - [ ] `js-te -t "키워드"` — 이름 필터 동작
  - [ ] `js-te user -t "키워드"` — 조합 동작
  - [ ] `js-te nonexistent` — exit 1 + 경고
  - [ ] `js-te --help` — 도움말 출력, exit 0

## 명시적 제외 (다음 브랜치 후보)

- 코드 레벨 `.only` / `.skip` / `.todo`
- JSON reporter
- VSCode 확장 (`vscode.tests` API 기반, 별도 저장소)
- `--passWithNoTests` / `--testNamePatternRegex` 같은 완화·확장 플래그

**Why 분리:** 사용자가 원래 떠올린 UX(IDE 거터 ▶)는 결국 IDE가 CLI 필터를 호출하는 구조라 CLI 부분 실행이 전제 조건. 이번 브랜치는 그 토대만 다지고, 위 항목은 토대 위에서 별도로 쌓는다.
