# refactor-05v 리팩토링 계획

## 진행 현황

세션 단위로 Phase 하나씩 진행. 세션 시작 시 이 문서와 체크박스를 확인하고, 세션 종료 시 해당 Phase 내의 체크박스를 갱신한다.

- [x] **Phase 1** — 소규모 수정·정리 (C1, C4, C6)
- [x] **Phase 2** — 조직·구조 정돈 (D1, D2, D3, C3)
- [x] **Phase 3** — 핵심 아키텍처 (A1, A2, C5)
- [x] **Phase 4** — 기능 확장 (B2, B3, B4)
- [ ] **Phase 5** — 테스트 보강 (E1, E2, E3)

## 목표

`@dannysir/js-te` v0.5 이후 내부 구조·API 확장성·테스트 커버리지를 개선한다.
공개 API(`test`, `describe`, `expect`, `mock`, `fn`, `run`)의 시그니처는 유지하며, 내부 구조만 정돈한다.

## 범위 (선택된 항목)

- **A1** expect ↔ matcher 자동 등록 구조
- **A2** Reporter 추상화
- **B2** `.not` 체이닝 지원
- **B3** `toThrow` 확장 (정규식 / Error 클래스 / predicate)
- **B4** 추가 매처 (`toContain`, `toBeInstanceOf`, `toBeNull`, `toBeUndefined`, `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toHaveBeenCalledTimes`)
- **C1** `run()` 내부 `testManager` 전역 참조 → `this`
- **C3** `changeModuleExports.js` 파일 분리
- **C4** `findTestFiles`의 잉여 인자 정리
- **C5** babel plugin의 Import/Require 공통 로직 추출
- **C6** `transformSource` 캐시 키 충돌 방지
- **D1** 메시지 포맷 중복 통합
- **D2** 상수 구조 정리
- **D3** 모듈 경계 재정리
- **E1** babel plugin 단위 테스트
- **E2** CLI / loaderHook 동작 테스트
- **E3** 엣지 케이스 테스트 보강

## 작업 순서 (의존성 고려)

```
Phase 1: 소규모 수정·정리   (C1, C4, C6)
Phase 2: 조직·구조 정돈     (D1, D2, D3, C3)
Phase 3: 핵심 아키텍처       (A1, A2, C5)
Phase 4: 기능 확장           (B2, B3, B4)
Phase 5: 테스트 보강         (E1, E2, E3)
```

- 먼저 저위험 수정으로 노이즈를 줄인다.
- 재조직을 아키텍처 변경 이전에 수행해 새 코드가 올바른 위치에 들어가도록 한다.
- 매처 기능 확장(B*)은 A1(자동 등록 구조)을 기반으로 한다.
- 새로 추가되는 모든 매처·매니저·플러그인은 도입 즉시 테스트를 작성하고, E* 단계에서는 남은 공백만 채운다.

---

## Phase 1 — 소규모 수정·정리

- [x] C1 완료
- [x] C4 완료
- [x] C6 완료
- [x] `npm test` 통과
- [x] 커밋

### C1. `run()` 내부의 전역 `testManager` 참조 교체
- **대상**: [src/testManager.js:66](src/testManager.js), [src/testManager.js:80](src/testManager.js)
- **변경**: `testManager.getTests()` → `this.getTests()`, `testManager.clearTests()` → `this.clearTests()`
- **검증**: `npm test`가 이전과 동일한 결과 출력.

### C4. `findTestFiles`의 잉여 인자 정리
- **대상**: [src/cli/utils/findFiles.js:27](src/cli/utils/findFiles.js)
- **변경**: `walk(fullPath, isTestDir)` → `walk(fullPath)`
  - `walk`는 인자 하나만 받으므로 두 번째 인자는 무의미. 디렉터리 내부에서 다시 `dirName` 판별이 이루어지므로 동작은 유지된다.
- **부수 작업**: `isTestDir` 계산을 `walk` 내부가 아닌 호출부에서 전달하도록 해야 하는지 재검토. 내부 계산이 자연스러우므로 잉여 인자만 제거.
- **검증**: `npm test`.

### C6. `transformSource` 캐시 키 충돌 방지
- **대상**: [src/cli/utils/transformSource.js](src/cli/utils/transformSource.js)
- **현황**: `hashCode`가 32-bit 누산이라 충돌 위험. 다른 파일이 같은 길이·해시를 가지면 오변환 가능.
- **변경**:
  - 캐시 키를 `filename`으로 두고, 값으로 `{sourceHash, transformed}` 저장.
  - 히트 여부는 `sourceHash`(필요하면 `crypto.createHash('sha1')`)가 일치할 때만 인정.
  - 파일 수가 많지 않으므로 메모리 부담 미미.
- **검증**: 동일 파일 재변환 시 캐시 히트, 파일 내용 변경 시 미스 확인 (단위 테스트 E1에서 포함).

---

## Phase 2 — 조직·구조 정돈

- [x] D1 완료
- [x] D2 완료
- [x] D3 완료
- [x] C3 완료
- [x] `npm test` 통과
- [x] `npm run build` 성공
- [x] `package.json` `exports` 필드 재검토
- [x] 커밋

### D1. 메시지 포맷 중복 통합
- **현황**:
  - [src/utils/formatString.js](src/utils/formatString.js): `formatSuccessMessage`, `formatFailureMessage`, `formatErrorMsg`, `formatThrowErrorMsg`
  - [src/cli/utils/messages.js](src/cli/utils/messages.js): `getTestResultMsg`, `getFileCountString`, `getFilePath`, `getErrorMsgInLogic`
  - 양쪽 모두 ANSI 컬러 유틸을 사용하는 메시지 포맷터인데 분리되어 있음.
- **변경**:
  - `src/view/` 디렉터리를 새로 만들고 다음으로 재편.
    - `src/view/colors.js` ← 기존 [src/utils/consoleColor.js](src/utils/consoleColor.js) + [src/constants/view.js](src/constants/view.js)
    - `src/view/reportMessages.js` ← 테스트 성공·실패·결과 메시지 (A2의 default reporter가 사용)
    - `src/view/errorMessages.js` ← matcher가 throw할 때 쓰는 에러 메시지 (`formatErrorMsg`, `formatThrowErrorMsg`)
  - 모든 import 경로 갱신.
- **검증**: `npm test` 및 `npm run build`의 rollup 산출물 정상.

### D2. 상수 구조 정리
- **현황**: [src/constants/index.js](src/constants/index.js)에 `PATH/RESULT_MSG/NUM/MODULE_TYPE` 혼재. `NUM.ZERO`, `NUM.ONE` 같은 상수는 가독성 가치가 거의 없다.
- **변경**:
  - `constants/index.js`를 제거하고 영역별로 분리.
    - `src/constants/paths.js`: `PATH`
    - `src/constants/module.js`: `MODULE_TYPE`
    - `src/view/messages.constants.js` 또는 D1 통합 파일 내부로 `RESULT_MSG` 흡수
  - `NUM` 제거: `0`, `1` 리터럴 직접 사용.
  - `constants/babel.js`는 유지하되, `BABEL.CONST`처럼 babel API 식별자와 `BABEL.PERIOD`처럼 경로 판별자를 분리해야 하는지 검토. 과도해지면 유지.
- **검증**: 전체 import 경로 정리 후 `npm test`, `npm run build`.

### D3. 모듈 경계 재정리
- **현황**: `src/mock/utils/`, `src/cli/utils/`, `src/babelPlugins/utils/`가 제각각의 하위 `utils/`를 가짐.
- **변경 방침**:
  - 하위 `utils/`는 그 모듈 전용 헬퍼만 담고, 여러 모듈에서 쓰는 것은 상위 `src/utils/`로 승격.
  - 현재 실제 재사용되는 것은 ANSI 컬러뿐이므로 대부분 그대로 둔다.
  - 단, `src/mock/utils/changeModuleExports.js` 같은 파일은 C3에서 이동·분할.
  - `src/babelPlugins/`는 plugin 본체와 helper의 경계가 이미 명확 → 유지.
- **최종 레이아웃 (요약)**:
  ```
  src/
    testManager.js
    expect/                  # A1 이후 사용 (Phase 3)
      index.js
      matchers/
        ...
    mock/
      store.js
      makeMockFnc.js         # C3로 분리 (mockFunctions 내부 흡수)
      changeModuleExports.js # C3 후 순수 변환 함수만
    babelPlugins/
      babelTransform.js
      babelCollectMocks.js
      utils/
        pathHelper.js
        wrapperCreator.js
        getModuleInfo.js
        transformBuilder.js  # C5로 추가
    cli/
      setupEnvironment.js
      setupFiles.js
      runTests.js
      loaderHook.js
      utils/
        findFiles.js
        collectMocks.js
        transformSource.js
      reporters/             # A2로 추가 (Phase 3)
        defaultReporter.js
        silentReporter.js
    view/                    # D1
      colors.js
      reportMessages.js
      errorMessages.js
    constants/
      paths.js
      module.js
      babel.js
  ```

### C3. `changeModuleExports.js` 파일 분리
- **대상**: [src/mock/utils/changeModuleExports.js](src/mock/utils/changeModuleExports.js)
- **변경**:
  - `makeMockFnc` → `src/mock/makeMockFnc.js` (`mockFunctions` 헬퍼도 이 파일 내부로 흡수)
  - `changeModuleExports` → `src/mock/changeModuleExports.js` (순수 변환 함수만)
  - `src/mock/utils/mockFunctions.js` 제거 (내용은 `makeMockFnc.js`에 병합)
  - [index.js](index.js), [store.js](src/mock/store.js) import 경로 갱신.
- **검증**: `npm test`.

---

## Phase 3 — 핵심 아키텍처

- [x] A1 완료
- [x] A2 완료
- [x] C5 완료
- [x] 기존 테스트 전부 통과
- [x] 공개 API 시그니처 유지 확인
- [x] 커밋

### A1. expect ↔ matcher 자동 등록 구조
- **현황**: [src/expect.js](src/expect.js)가 각 매처를 수동 래핑. 새 매처 추가 시 [matchers.js](src/matchers.js) + [expect.js](src/expect.js) 두 곳 수정.
- **설계**:
  - 매처 시그니처 통일: `(actual, ...expected) => { pass: boolean, message: () => string }`
    ```js
    export const toBe = (actual, expected) => ({
      pass: Object.is(actual, expected),
      message: () => formatErrorMsg(expected, actual),
    });
    ```
  - `src/expect/matchers/` 에 매처 파일 분리 (`toBe.js`, `toEqual.js`, `toThrow.js`, `toBeTruthy.js`, `toBeFalsy.js`, …).
  - `src/expect/matchers/index.js`에서 모든 매처를 한 객체로 모아 export.
  - `src/expect/index.js`가 `expect(actual)` 호출 시 matcher 객체를 순회하며 프록시 API를 자동 생성:
    ```js
    const buildExpect = (matchers) => (actual) => {
      const build = (isNot) => Object.fromEntries(
        Object.entries(matchers).map(([name, matcher]) => [name, (...args) => {
          const {pass, message} = matcher(actual, ...args);
          if (pass === isNot) throw new Error(message());
        }])
      );
      const api = build(false);
      api.not = build(true);
      return api;
    };
    ```
  - `runArgFnc`(함수 실행 헬퍼)는 `toBe/toEqual/toBeTruthy/toBeFalsy`에서만 의미가 있으므로 각 매처 내부에서 직접 사용.
- **마이그레이션**:
  - 기존 매처 5종을 새 시그니처로 재작성.
  - [index.js](index.js)의 `export {expect}`는 유지. 내부 경로만 갱신.
- **테스트**: 기존 테스트 전부 통과 확인.

### A2. Reporter 추상화
- **현황**: [testManager.js](src/testManager.js)의 `run()`이 `console.log`를 직접 호출.
- **설계**:
  - Reporter 인터페이스:
    ```
    { onTestPass(test), onTestFail(test, error), onSuiteDone(passed, failed) }
    ```
  - `src/cli/reporters/defaultReporter.js`: 현재 출력과 동일한 포맷 (D1의 `view/reportMessages.js` 사용).
  - `src/cli/reporters/silentReporter.js`: 아무 것도 출력하지 않는 기본 내장형 (E 단계 테스트에서 사용).
  - `TestManager.run(reporter = defaultReporter)`로 변경.
  - [bin/cli.js](bin/cli.js)에서 default reporter 주입.
  - 파일 단위 헤더(`getFilePath`), 전체 합계(`getTestResultMsg(TOTAL,...)`)는 CLI 레벨에서 reporter를 호출 (테스트별 결과와 구분).
- **공개 API 영향**: `run()`이 reporter를 옵션으로 받음 (기본값 존재 → 기존 사용자 영향 없음).

### C5. babel plugin의 Import/Require 공통 로직 추출
- **현황**: [babelTransform.js](src/babelPlugins/babelTransform.js) 내 `ImportDeclaration`·`VariableDeclaration` 비주터가 "절대경로 계산 → 변환 여부 체크 → original 선언 → wrapper 선언" 시퀀스를 각각 재작성.
- **변경**:
  - `src/babelPlugins/utils/transformBuilder.js` 추가:
    - `buildTransformPair({t, source, absolutePath, bindings, originalVar, isRequire})` → `{originalDecl, wrapperDecls}` 반환.
    - `bindings`는 `[{importedName, localName}]` 배열. ImportDeclaration(specifiers)·VariableDeclaration(ObjectPattern/Identifier) 양쪽에서 정규화해 넘김.
    - 기존 `createWrapperFunction` / `createNamespaceWrapper` / `createOriginalDeclaration`은 내부 구현으로 숨김.
  - `babelTransform.js`는 specifier → bindings 정규화와 `replaceWithMultiple` 호출만 담당.
- **검증**: 기존 테스트 통과 + E1의 plugin 단위 테스트 추가.

---

## Phase 4 — 기능 확장

- [x] B2 완료
- [x] B3 완료
- [x] B4 완료 (`makeMockFnc`에 `calls` 추적 포함)
- [x] 새 매처별 테스트 동반 작성
- [ ] 커밋

### B2. `.not` 체이닝 지원
- A1 구조에서 자연스럽게 포함. `expect(x).not.toBe(y)`는 매처의 `pass`를 뒤집어 판정.
- `.not.not`은 지원 불필요(jest도 같음). 필요 시 추후.

### B3. `toThrow` 확장
- **지원 형태**:
  1. `undefined` / 없음 — 어떤 에러든 throw하면 pass.
  2. `string` — 에러 메시지 `.includes(expected)` (기존 호환).
  3. `RegExp` — 에러 메시지가 정규식과 매칭.
  4. `Error` 서브클래스 생성자 — `instanceof` 비교.
  5. `function` — `(error) => boolean` predicate.
- 구현은 A1 시그니처(`{pass, message}`)에 맞춰 재작성.
- 비동기 함수는 이번 라운드 범위 밖 (향후 별도 항목).

### B4. 추가 매처
- `toContain(item)` — 문자열/배열 모두 지원.
- `toBeInstanceOf(Ctor)`.
- `toBeNull()`, `toBeUndefined()`, `toBeDefined()`.
- `toHaveBeenCalled()`, `toHaveBeenCalledWith(...args)`, `toHaveBeenCalledTimes(n)`.
  - 이를 위해 `makeMockFnc`에 호출 추적 필요.
  - `state`에 `calls: Array<args[]>` 추가, mock 호출 시 push.
  - `mockClear()`가 `calls`도 비우도록 확장.
  - `mockFn.mock = { calls }` 접근자를 노출하고, 매처는 이를 읽어 판정.
- 각 매처 파일은 A1 패턴으로 작성 + 테스트 동반 작성.

---

## Phase 5 — 테스트 보강

- [ ] E1 완료
- [ ] E2 완료
- [ ] E3 완료
- [ ] 전체 `npm test` 통과
- [ ] 커밋

### E1. babel plugin 단위 테스트
- `test/plugin/babelTransform.test.js`
  - import 기본/named/namespace 변환.
  - `require` CJS 패턴 변환(객체 패턴, 기본 바인딩).
  - `mock()` 호출의 경로 절대화.
  - `mockedPaths`가 null일 때 전수 변환, set일 때 필터링.
- `test/plugin/babelCollectMocks.test.js`
  - 상대/절대 경로를 절대로 수집.
- `test/plugin/transformSource.test.js` — C6 검증 포함(캐시 미스/히트).

### E2. CLI / loaderHook 동작 테스트
- `test/cli/findFiles.test.js` — 테스트 디렉터리/파일명 규칙, `node_modules` 제외.
- `test/cli/loaderHook.test.js` — `shouldTransform`의 scheme/확장자/`node_modules` 분기.
- `test/cli/setupEnvironment.test.js` — `package.json`의 `type`에 따른 ESM/CJS 감지.
- `test/cli/reporters/defaultReporter.test.js` — A2 reporter가 정확한 포맷을 내는지 (silentReporter로 전환 후 버퍼 캡처).

### E3. 엣지 케이스 테스트 보강
- 중첩 `describe` 하에서 `beforeEach` 범위 복원.
- `mock()` 재호출 시 이전 모킹 교체.
- `mockReturnValueOnce` 큐 소진 후 기본값 동작.
- `partial mocking`에서 모킹 안 된 export가 원본 유지.
- `expect().not.*`, `toThrow(RegExp)`, `toThrow(Error)`, `toHaveBeenCalled*` — B3/B4 커버.
- `mockClear`의 `calls` 초기화 (B4).

---

## 파일 영향 요약

### 삭제 / 이동
- `src/utils/consoleColor.js` → `src/view/colors.js`
- `src/constants/view.js` → `src/view/colors.js`로 흡수
- `src/utils/formatString.js` → `src/view/reportMessages.js` + `src/view/errorMessages.js`
- `src/cli/utils/messages.js` → `src/view/reportMessages.js`로 흡수 (CLI 전용 것은 reporter로 이동)
- `src/constants/index.js` → `src/constants/paths.js`, `src/constants/module.js`
- `src/mock/utils/changeModuleExports.js` → `src/mock/makeMockFnc.js` + `src/mock/changeModuleExports.js`
- `src/mock/utils/mockFunctions.js` → `src/mock/makeMockFnc.js` 내부로 흡수
- `src/matchers.js`, `src/expect.js` → `src/expect/` 디렉터리로 재구성

### 신규
- `src/cli/reporters/defaultReporter.js`
- `src/cli/reporters/silentReporter.js`
- `src/babelPlugins/utils/transformBuilder.js`
- `src/expect/index.js` + `src/expect/matchers/*`
- `test/plugin/*.test.js`, `test/cli/*.test.js` 등

### 수정
- `index.js` — import 경로 갱신, `expect` 새 구현 참조.
- `bin/cli.js` — reporter 주입.
- `src/testManager.js` — `this` 참조 수정 + reporter 인자.
- `src/babelPlugins/babelTransform.js` — `transformBuilder` 사용.
- `src/cli/utils/transformSource.js` — 캐시 키 개선.
- `src/cli/utils/findFiles.js` — 잉여 인자 제거.

---

## 검증 체크리스트

각 Phase 종료 시 확인:

- [ ] `npm test` — 기존 테스트 전부 통과.
- [ ] `npm run build` — rollup dual build 성공.
- [ ] [README.md](README.md) / [API.md](docs/API.md)에 나온 모든 예제 수작업 실행 결과 일치.
- [ ] 공개 export(`test`, `describe`, `beforeEach`, `expect`, `mock`, `unmock`, `clearAllMocks`, `isMocked`, `mockStore`, `fn`, `run`) 시그니처 유지.
- [ ] CLI 종료 코드: 실패 시 1, 성공 시 0.

## 리스크 & 주의

- **A1 도입 시점**: 매처 시그니처를 바꾸면 `src/matchers.js`를 외부에서 직접 import하는 사용자가 깨질 수 있음. `package.json`의 `exports`는 `.` 와 `./src/mock/store.js`만 노출하므로 실질 영향은 없지만, 혹시 문서에 내부 경로가 노출되어 있지는 않은지 확인 필요.
- **D1/D2 이동**: rollup이 번들링을 맡지만, `src/mock/store.js`처럼 `exports`에 별도로 노출된 경로는 유지해야 함. `package.json exports` 필드 갱신 여부 검토.
- **C5 공통화**: babel 플러그인은 리그레션이 잘 드러나지 않으므로 E1 테스트를 먼저 추가한 뒤 리팩토링하는 편이 안전. → 필요 시 Phase 순서를 "E1 선반영 후 C5"로 조정.

## 후속 / 범위 밖

- TypeScript 선언 파일 (A4) — 별도 라운드.
- `--watch`, `--filter`, `--bail` 등 CLI 옵션 (A3) — 별도 라운드.
- 비동기 `toThrow` (`toRejectWith`) — 별도 라운드.
- `toEqual` 깊은 비교(B1) — 선택지에 포함되지 않아 이번 범위 밖. 필요 시 후속.
