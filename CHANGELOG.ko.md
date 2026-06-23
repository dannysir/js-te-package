# CHANGE LOG

## [Unreleased]

### 추가
- **`test.only.each` / `test.skip.each`** — modifier 와 데이터 기반(`.each`) 테스트의 조합. `test.only.each(cases)(template, fn)` 는 생성된 묶음 전체를 focus 하고(같은 파일의 다른 일반 테스트는 `skipped` 로 강등), `test.skip.each(cases)(template, fn)` 는 생성된 모든 케이스를 실행하지 않고 `skipped` 로 보고합니다. 메인 entry 와 `/browser` entry 양쪽에서 사용할 수 있습니다. 타입 선언은 `test.only` / `test.skip` 에 `each` 멤버를 추가했습니다.

## [0.9.2] 2026-06-13

### 수정
- **브라우저 entry 에 `.only` / `.skip` / `.todo` 추가.** 0.9.0 에서 추가된 `.only` / `.skip` / `.todo` modifier 가 메인 `index.js` entry 에만 반영되고 `browser.js` 에는 빠져 있어, 동봉된 타입 선언(이미 modifier 를 선언함)과 런타임이 어긋나 있었음. 그 결과 `@dannysir/js-te/browser` 에서 `test.only` / `test.skip` / `test.todo` 나 `describe.only` / `describe.skip` 을 호출하면 `TypeError` 가 발생했음. 이제 `browser.js` 가 이들을 `testManager` 로 위임하고, Node 가드 빌드(`browser-node-stub.js`)도 modifier 까지 커버해 undefined 속성 크래시 대신 가드의 안내 에러로 실패함. API 레퍼런스(en/ko)의 "Exported" 목록도 일치하도록 갱신.

## [0.9.1] 2026-06-08

### 수정
- **브라우저 번들이 더 이상 `node:url` 을 import 하지 않음.** 0.8.0 의 `--testLocation` 콜사이트 캡처가 `testManager.js` 에 `import {fileURLToPath} from "node:url"` 를 끌어왔고, 번들러가 이를 `dist/browser.mjs` 최상단에도 그대로 내보냈음. 브라우저·Web Worker 환경(예: Turbopack)은 이 Node 빌트인을 풀지 못해 `@dannysir/js-te/browser` 가 로드되지 않거나 멈출 수 있었음. 이제 `fileURLToPath` 의존을 분리해 **브라우저 빌드에서만** no-op stub 으로 치환함. Node CLI(`--testLocation`) 동작은 변화 없음. `/browser` 타입 표면에 `TestMode` re-export 도 추가.

## [0.9.0] 2026-06-05

### 추가
- **`.only` / `.skip` / `.todo`** — Jest/Vitest 스타일의 focus·skip modifier 지원:
  - `test.only(name, fn)` — 같은 파일에 하나라도 있으면 그 파일의 일반 테스트는 모두 skipped 로 보고. 적용 범위는 **파일 단위** 라서 다른 파일은 영향 없음.
  - `test.skip(name, fn)` — 함수를 실행하지 않고 skipped 로 보고.
  - `test.todo(name)` — 함수 없는 pending 테스트로 등록. 함수 인자를 주면 에러.
  - `describe.only(name, fn)` / `describe.skip(name, fn)` — 그룹 안의 모든 테스트에 modifier 적용. **가장 가까운 명시 modifier 가 우선** (`describe.only` 안의 `test.skip` 은 skip, `describe.skip` 안의 `test.only` 는 실행).

### 변경
- 리포터 인터페이스에 `onTestSkip(test)` / `onTestTodo(test)` 추가. `onSuiteDone(passed, failed, skipped, todo)` 와 `onRunDone(totalPassed, totalFailed, totalSkipped, totalTodo)` 시그니처가 카운터 두 개씩 확장됨. 기존 `onTestPass` / `onTestFail` 시그니처는 그대로.
- `testManager.run()` 반환값이 `{passed, failed, skipped, todo}` 로 확장 (필드 추가). CLI 의 `zeroMatched` 판정에도 skipped/todo 가 포함되어, `.skip` / `.todo` 만 있는 파일도 "no tests found" 로 잘못 분류되지 않음.
- JSON 리포터 — 각 테스트의 `status` 가 `"skipped"` 또는 `"todo"` 가 될 수 있음. `totals` 에 `skipped` / `todo` 키 추가, 각 `files[]` 엔트리에도 같은 카운터 추가.

### 문서
- README(영/한) 에 "집중 실행 & 스킵" 섹션 추가, 핵심 기능 목록에 새 modifier 표기.
- CLI 레퍼런스(영/한) JSON 스키마 섹션을 새 status 값·카운터에 맞춰 갱신.
- API 레퍼런스(영/한) 에 `test.only` / `.skip` / `.todo` 및 `describe.only` / `.skip` 항목 추가.

## [0.8.0] 2026-05-28

### 추가
- **위치 필터** — `--testLocation <경로>:<라인>` 으로 `<경로>` 의 `<라인>` 줄에 있는 `test(...)` 테스트 하나만 실행. `--testNamePattern` 으로는 구분할 수 없는 **동명 테스트**가 여러 개일 때도 그중 하나만 확실히 실행할 수 있으며, 에디터의 "이 테스트 실행" 거터 동작을 위한 것. 각 테스트는 등록 시점에 콜 스택을 파싱해 정의 위치를 기록.
- Babel 인메모리 변환에 `retainLines` 적용 — 변환된 테스트 파일이 원본 소스 라인 번호와 어긋나지 않도록 유지해, `mock()` 을 쓰는 파일에서도 위치 매칭이 정확하게 동작.
- **JSON 리포터** — `--reporter json` 으로 실행이 끝난 뒤 stdout 으로 JSON 객체를 한 번 출력. 스키마는 `{totals, files:[{path, passed, failed, tests:[{path, description, status, location, error?}]}]}` 형태. IDE 확장이나 CI 스크립트가 결과를 머신 파싱할 수 있게 함. `default` 리포터는 그대로 유지되며 여전히 기본값.

### 문서
- CLI 레퍼런스(영/한)와 README 빠른 시작에 `--testLocation` 옵션·매칭 규칙·`test.each` 공유 라인 한계 추가.
- CLI 레퍼런스(영/한)에 "리포터" 섹션 추가 — `--reporter` 옵션·기본 제공 리포터·JSON 스키마·`noTestsFound` / `error` 특수 케이스 문서화.

## [0.7.4] 2026-05-21

### 변경
- `package.json` 에 `homepage` 필드 추가 — npm 패키지 페이지에서 dannysir-labs 시연/문서 사이트(`https://dannysir-labs.vercel.app/en/libraries/js-te`)로 연결. 메타데이터 변경만 있고 API·런타임 동작 변화 없음.

## [0.7.3] 2026-05-20

### 추가
- **브라우저 entry** — `@dannysir/js-te/browser` 가 코어 테스트 API(`test`(`test.each` 포함), `describe`, `beforeEach`, `expect`, `fn`, `testManager`)를 re-export 하여 Node CLI 러너가 동작하지 않는 브라우저·Web Worker 에서도 사용 가능. 모듈 모킹(`mock`, `unmock`, `isMocked`, `clearAllMocks`, `mockStore`) 과 CLI 러너(`run`) 는 Node 전용이라 의도적으로 제외.
- `@dannysir/js-te/browser` 를 Node 런타임에서 import 하면 즉시 명확한 에러를 던져 메인 entry 나 `js-te` CLI 로 안내.
- **TypeScript 타입 선언** — 메인(`types/index.d.ts`) 과 `/browser`(`types/browser.d.ts`) 양쪽 entry 용 `.d.ts` 를 직접 작성해 동봉하고 `package.json#exports` 에 연결. 별도 설정 없이 완전한 타입 지원.

### 문서
- README(영/한)에 "브라우저 사용" 섹션 추가 — 신규 entry, export/제외 API, Node 가드 설명.
- [API.md](./docs/reference/API.md) / [API.ko.md](./docs/reference/API.ko.md) 에 "Browser entry" 섹션 신규.

## [0.7.2] 2026-05-02

### 변경
- 글로벌 자동 등록을 명시적 화이트리스트(`test`, `describe`, `beforeEach`, `expect`, `mock`, `unmock`, `isMocked`, `clearAllMocks`, `mockStore`, `fn`)로 교체. `run` 은 더 이상 `global` 에 노출되지 않는다. 사용자가 test 본문 안에서 `run()` 을 호출해 외부 러너에 재진입해 결과가 오염되던 위험 제거. `run` 자체는 패키지 entry 에서 계속 export 되며 CLI 내부 전용으로 `@internal` 표기.

### 개선 (내부)
- `src/testManager.js` 의 `filterTestsByName` 을 module-scope pure 함수로 추출. 공유 러너 큐에 의존하지 않는 순수 단위 테스트가 가능해짐.
- `mockStore` `globalThis` 싱글톤 회귀 통합 테스트 추가 — `@dannysir/js-te/src/mock/store.js` 서브패스로 import 한 mockStore 와 wrapper 가 같은 저장소를 공유하는지, 사용자 모듈의 지역 `const mockStore` 식별자가 wrapper 동작에 새지 않는지 실행 단위로 고정.

## [0.7.1] 2026-04-28

### 수정
- `mockStore` 를 모듈별 `Map` + Babel 식별자 주입 방식에서 `globalThis.__jsTeMockStore__` 싱글톤으로 변경. 사용자 코드와의 식별자 충돌, 패키지가 두 번 이상 resolve 될 때(다중 realm / 중첩 `node_modules`) 발생하던 상태 분열 문제 해결.

### 문서 (내부)
- [docs/internal/로더훅기반인메모리변환.md](docs/internal/로더훅기반인메모리변환.md) 를 globalThis 기반 mockStore 동작으로 갱신.
- 머지 완료된 `docs/internal/plan.md` 제거 (feature-partial-run brunch 산출물).

## [0.7.0] 2026-04-24

### 추가 (CLI)
- Positional 파일 패턴 — `js-te user` 로 전체 경로에 대한 대소문자 구분 부분 문자열 매칭으로 테스트 파일을 필터링 (여러 개면 OR)
- `-t, --testNamePattern <pattern>` — 풀네임(`describe > ... > test 설명`)에 대한 대소문자 구분 부분 문자열 매칭
- `-h, --help` — 사용법·옵션·예제·종료 코드 출력
- 파일 필터와 이름 필터 조합 가능 (`js-te auth -t "token"`)

### 변경 (CLI)
- 매칭 0건일 때 exit 1 로 변경(기존 exit 0) — Vitest 기본 동작과 동일. CI 에서 필터 오타로 "조용한 성공" 이 발생해 리그레션을 놓치는 사고 방지
- 실행 요약에 필터링 상태 표기 (적용된 패턴, 전체 대비 매칭된 파일 수)

### 문서
- [docs/reference/CLI.md](./docs/reference/CLI.md) / [CLI.ko.md](./docs/reference/CLI.ko.md) 신규 — CLI 전체 레퍼런스
- README "빠른 시작" 에 부분 실행 예제 추가

## [0.6.0] 2026-04-20

### 추가 (Matcher)
- `toContain(item)` — 배열 원소 또는 문자열의 부분 문자열 포함 여부 검사
- `toBeInstanceOf(Class)` — `instanceof` 기반 인스턴스 타입 검사
- `toBeNull()` / `toBeUndefined()` / `toBeDefined()` — null·undefined 전용 매처
- `toHaveBeenCalled()` / `toHaveBeenCalledWith(...args)` / `toHaveBeenCalledTimes(n)` — mock 함수 호출 검증
- `.not` 체이닝 — 모든 매처를 반전하여 사용 가능 (`expect(x).not.toBe(y)`)

### 추가 (Mock)
- `fn().mock.calls` — mock 함수가 호출될 때마다 인자 배열을 누적하여 노출

### 변경 (Matcher)
- `toThrow()` 인자 확장
  - 인자 없음 — throw 여부만 확인
  - `RegExp` — 에러 메시지 정규식 매칭
  - `Error` 서브클래스 — `instanceof` 검사
  - predicate 함수 — 에러 객체를 직접 검사
- `toEqual` / `toHaveBeenCalledWith` 가 `JSON.stringify` 대신 재귀 deep equal 사용
  - 키 순서가 달라도 동등한 객체로 인식 (`{a:1,b:2}` ≡ `{b:2,a:1}`)
  - 순환 참조 객체 비교 시 크래시 없이 안전하게 처리
- 에러 메시지 생성에 `safeStringify` 적용 — 순환 참조도 `[Circular]` 로 표시

### 개선 (내부)
- babel plugin · CLI · `loaderHook` · reporter 단위 테스트 추가
- `loaderHook` / `setupEnvironment` 의 테스트 가능성 개선 (Phase 1~5 리팩토링)
- 엣지 케이스 테스트(mock·lifecycle) 보강

### 문서
- `docs/` 를 `docs/reference/` (사용자 참조용) 와 `docs/internal/` (개인 작업용) 로 재구성
- CHANGELOG · API 문서 한/영 분리 (`*.md` = 영문, `*.ko.md` = 한글)

## [0.5.0] 2026-04-16

### 추가
- 가상 메모리 기반 테스트 실행
  - `module.registerHooks()` 기반 `load` 훅으로 교체
  - 테스트 파일·소스 파일을 **디스크에 쓰지 않고** 메모리에서만 Babel 변환하여 Node에 공급
  - ESM `import`, 동적 `import()`, CJS `require()` 를 단일 훅으로 처리
- `src/cli/loaderHook.js` 신규 — `registerHooks({ load })` 설치
- `src/cli/utils/transformSource.js` 신규 — Babel 변환 순수 함수 + `filename:length:hash` 기반 캐시

### 변경
- `setupFiles()` — mock 경로 사전 수집만 수행하도록 단순화
  - 모든 소스 파일을 eager 하게 변환·덮어쓰던 기존 로직 제거
- `runTests()` — 파일별 `transformFiles()` 호출 제거, `pathToFileURL` 로 `import`
- `bin/cli.js` — `installLoaderHook()` 추가, `finally { restoreFiles() }` 제거
- `engines.node` → `>=22.15.0` (`module.registerHooks` 도입 버전)

### 삭제
- `src/cli/utils/transformFiles.js` — 디스크 변환·복구 로직, `originalFiles` Map 모두 불필요
- `src/cli/utils/findFiles.js` 내 `findAllSourceFiles` — eager 탐색 불필요

### 개선 효과
- 비정상 종료(SIGKILL, OOM 등) 시 사용자 원본 소스 훼손 가능성 제거
- 읽기 전용(`chmod 444`) 파일이 있어도 테스트 실행 가능
- mock 이 없는 프로젝트는 Babel 변환 비용 0

### 문서
- `docs/가상메모리기반테스트실행.md` 추가 — 설계 배경과 상세 흐름
- 상세 API 레퍼런스를 README 에서 `docs/API.md` 로 분리
- README 를 현재형으로 재작성 (과거 버전 취소선 메모 제거)

## [0.4.1] 2026-02-16

### mock 기능 개선

- `mock(path, moduleObject)`
  - 문제 : 기존 `path`를 반드시 절대 경로로 등록해야 하는 문제
  - 해결
    - `babelTransformImport` 파일을 수정하여 `mock` 경로를 절대 경로로 변환
    - `babelCollectMock` 에서 절대경로로 등록하도록 수정

### 리펙토링

- `findAbsolutePath` 를 이용하여 중복 로직 제거
- `babelTransformImport`에서 `mock` 경로 변환도 진행하기에 이름을 `babelTransform`으로 변경


## [0.4.0] 2026-01-01

### 추가

- Mock Functions 기능 추가
  - `fn()` - 모킹 가능한 함수 생성
  - `mockImplementation()` - mock 함수의 구현 로직 변경
  - `mockReturnValue()` - mock 함수가 항상 특정 값을 반환하도록 설정
  - `mockReturnValueOnce()` - mock 함수가 한 번만 특정 값을 반환하도록 설정
  - `mockClear()` - mock 함수의 상태 초기화
- Module Mocking 개선
  - `mock()` 함수가 모듈의 모든 함수를 자동으로 mock function으로 변환
  - 변환된 mock functions에 대해 `mockImplementation()`, `mockReturnValue()` 등의 메서드 사용 가능

## [0.3.3] 2025-12-26

### 리펙토링
**해당 리펙토링은 0.4.0 버전을 위한 최종 리펙토링입니다.**
- 파일 위치 수정
  - utils에 일괄적으로 있던 유틸 관련 메서드를 cli에 관련된 요소는 src/cli/utils로 이동
  - 각각의 기능에 해당하는 유틸 파일을 관리하기 쉽운 구조로 변경
- `formatString.js`
  - 파일 내에 있던 `placeHolder`를 테스트 클래스 내부로 옮겨 불필요한 모듈 제거
  - 파일 내에 있던 `getMatcherForReplace` 메서드를 클래스 내부의 private 함수로 변경
  - 파일 내 네이밍 규칙을 일관되게 변경

## [0.3.2] 2025-12-10

### 리펙토링
- cli.js
  - `main()`에서 관리하던 전체 흐름을 `setupEnvironment.js`, `setupFiles.js`, `runTests.js`로 분리
  - `main()`에서는 흐름만 관리하도록 수정
- babel 플러그인
  - 플러그인 내부에 중복된 Wrapper 패턴 생성 로직 분리
  - 플러그인 내부에서는 AST를 이용한 로직 생성만 집중하도록 만듬
- JSDoc 추가
  - babel과 관련된 로직 및 사용자가 사용하는 로직에 JSDoc 추가
  - JSDoc을 통해 매개변수와 리턴 타입에 대해 명시하고 함수의 역할 및 사용 예시를 추가
- 그 외 리펙토링 사항
  - 코드 스타일 통일
    - 일부 function 코드를 arrow function 코드로 수정
  - 미흡한 상수화 보완

### 문서 오류 수정

- README.md 내 오타 수정
  - 부분 모킹 import문 오타 수정
  - 상단 최근 업데이트 내역 갱신

## [0.3.1] 2025-12-08

### 오류 수정 

- `package.json` 내에 파일 누락된 파일 목록 추가
  - `babelCollectMocks.js` 플러그인 누락으로 인한 오류 수정

## [0.3.0] 2025-12-08

### 추가

- `mock` 이후 import를 해야하는 문제 해결
  - 문제 : 기존의 경우 모킹 기능 이용시 반드시 동적 import문을 mock 다음에 작성해야 했음
  - 해결
    - 기존 `mockStore`를 직접 비교하여 import하는 방식에서 wrapper 패턴을 이용하도록 적용
    - 모듈을 새로운 함수로 만들어 함수를 실행할 때마다 `mockStore`와 비교하여 값을 리턴하도록 수정
- 모듈 변환 최적화
  - 문제 : 앞선 변경으로 인해 모든 파일의 모듈들이 사용될 때마다 `mockStore`와 비교하는 로직이 실행됨
  - 해결 
    - `cli`로직에 mock을 미리 검사하여 mock 경로를 미리 저장하는 로직을 추가
    - 미리 확인한 mock 경로를 이용해 import문이 만약 저장된 경로일 때만 babel 변환

## [0.2.3] 2025-12-04

### 문서 수정
- README.md 내에 type 설정 관련 설명 수정
    - 0.2.1 버전부터 ESM 방식과 Common JS 방식 모두 허용
    - 개발 블로그 링크 추가

### 설정 수정
- package.json
    - 레포지토리 및 이슈 링크 추가

### `rollup.config.js` output 파일명 수정
- 기존 `.cjs.js`와 같은 이름에서 `.cjs`로 수정
- `esm.js`에서 `.mjs`로 수정

## [0.2.2] 2025-12-04

### 문서 수정
- README 오타 수정
    - 부분 모킹 적용 버전을 0.1.3(오타) -> 0.2.1

## [0.2.1] 2025-12-02

### 오류 수정
- cli 에러
    - 문제1 : index.js는 export하지 않고 빌드를하여 제공하기 때문에 index 파일을 찾지 못하는 오류 수정
    - 문제2 : rollup에서 빌드를 하는 과정에 testManager가 각각 2개가 생기기 때문에 사용자 시스템에 따라 내부적으로 ejs 방식으로 동작하기 때문에 cjs 메서드가 정상 동작하지 않음
    - 해결 방법 : cli 파일에 사용자 시스템에 맞는 index를 호출하는 기능 추가

## [0.2.0] 2025-12-02

### 추가

- CommonJS 지원
    - require() 구문을 사용하는 프로젝트에서도 사용 가능
    - ESM(import)과 CommonJS(require) 모두 지원
    - Rollup을 통한 dual package 배포 (ESM + CJS)
- 부분 모킹(Partial Mocking) 지원
    - 모듈의 일부 함수만 모킹하고 나머지는 원본 유지 가능
    - 스프레드 연산자를 활용한 모킹 방식 개선
    - ESM과 CommonJS 모두에서 부분 모킹 동작

## [0.1.2] 2025-11-27

### 추가
- 레포지토리 변경으로 인해 깃허브 경로 수정
- cli.js
    - transformFiles : babel을 통한 코드 변경 로직 분리
    - findFiles : 사용자의 테스트 파일과 파일을 찾는 로직 분리
- index.js
    - run 함수의 경우 사용자가 사용할 필요가 없기 때문에 index.js에서 분리
    - expect로직과 matcher 로직을 분리
- tests.js 파일명 수정
    - 클래스를 직접 export하는 방식에서 선언된 변수를 export하는 방식으로 변경

## [0.1.1] 2025-11-24

### 추가
- 문법 오류 발생시 babel로 변환한 파일이 다시 restore 되지않는 문제 해결
    - `babel 변환 -> 원상 복구` 로직이 문법 오류 발생시 진행되지 않는 오류 해결

## [0.1.0]  2025-11-20

### 추가
- test.each() 기능 추가
    - 배열 형태의 테스트 케이스를 반복 실행
    - 플레이스홀더 지원 (%s, %o)
    - 동일한 테스트 로직을 여러 데이터셋으로 검증 가능


- beforeEach()
    - 각 테스트 실행 전 초기화 코드 실행
    - 중첩된 describe 블록에서 상위 beforeEach 자동 실행
    - 테스트 간 독립성 보장


- Babel 절대 경로 변환
    - 사용자 입력 경로(상대/절대)를 절대 경로로 통일
    - 일관된 모킹 동작 보장

### 변경사항
- 내부 테스트 관리 구조 개선

## [0.0.2] 2025-11-17

### 추가
- scoped 패키지로 변경하여 발생한 버그 수정
    - babelTransformImport 파일 내에 `js-te` 경로를 `@dannysir/js-te` 경로로 변경

## [0.0.1] 2025-11-17

### 추가
- 최초 배포
- 테스트 작성 기능 (`test`, `describe`, `expect`)
- Matcher 함수들
    - `toBe()` - 값 비교
    - `toEqual()` - 객체/배열 비교
    - `toThrow()` - 에러 검증
    - `toBeTruthy()` / `toBeFalsy()` - 참/거짓 확인
- 모킹 시스템
    - `mock()` - 모듈 모킹
    - `clearAllMocks()` - 전체 mock 제거
    - `unmock()` - 특정 mock 제거
    - `isMocked()` - mock 상태 확인
- Babel 플러그인 dynamic import를 이용한 import 변환으로 모킹 구현
- 자동 테스트 파일 찾기 (`.test.js` 파일, `test/` 폴더)
- CLI 도구 (`js-te` 명령어)
- 중첩 describe 블록 지원
- 컬러 콘솔 출력

---

## 앞으로 추가할 기능

- mocking 기능 개선
    - 문제점 : mocking한 모듈을 반드시 `mock` 함수 이후에 import 해야함
    - 원인 : import를 상단에서 진행할 경우 mocking전 원본 모듈을 가져오게 됨
- ESM / Common JS
    - 문제점 : 현재 라이브러리가 ESM 방식이기 때문에 사용자도 ESM 방식으로 사용해야함
    - 개선 방법 : rollup과 같은 번들러를 사용해 ESM 방식의 파일과 Common JS 방식의 파일 2 종류를 생성하여 배포
