# Backlog

다음 작업 단위로 진행할 항목을 정리합니다.

---

## 🔥 최우선: `mockStore` 주입/다중 로드 충돌 버그

`feature-partial-run` Phase 5 작성 중 발견. **현재 공개된 서브패스 export 경로가 `mock()` 과 동시에 쓰이면 즉시 깨짐.**

### 문제

`bin/cli.js` 가 테스트 실행 전 정적 스캔으로 테스트 소스에 `mock(...)` 호출 유무를 판단해 `mockedPaths` 를 채운다. 비어있지 않으면 loader hook 이 프로젝트 내 모든 `.js` / `.mjs` 를 babel 변환 대상에 올린다. 변환 시 [src/babelPlugins/babelTransform.js:35-46](../../src/babelPlugins/babelTransform.js) 의 Program visitor 가 **파일 최상단에 무조건** `const mockStore = global.mockStore;` 를 prepend 한다. 이 주입이 아래 두 시나리오에서 충돌:

1. **자가 충돌** — 변환 대상이 `src/mock/store.js` 자신이면, 파일 원본에 이미 `export const mockStore = new Map();` 가 있어 같은 스코프에서 `mockStore` 가 두 번 선언됨 → `SyntaxError: Identifier 'mockStore' has already been declared`.
2. **사용자 공간 오염** — 사용자 테스트 파일에 `const mockStore = ...` 같은 지역 선언이 있으면 같은 에러.

### 재현

사용자 프로젝트 조건:
- 테스트 어딘가에 `mock('../api.js', ...)` 호출 (정적 스캔이 잡아 hook 활성화).
- 다른 테스트에서 `import {mockStore} from '@dannysir/js-te/src/mock/store.js'` (공식 서브패스 export 사용).

```js
import {mockStore} from '@dannysir/js-te/src/mock/store.js';
test('debug', () => {
  mock('../api.js', { login: () => 'x' });
  console.log('mocked keys:', [...mockStore.keys()]);  // ← 파일 로드 시점에 SyntaxError
});
```

현재 리포 내부에서는 이 조합을 쓰는 코드가 없어서 가려져 있었음. `package.json` 의 `exports` 가 `./src/mock/store.js` 를 공개하므로 외부 사용자는 정상 경로로 부딪힘.

### 해결책 후보

**대안 C — `store.js` 를 `globalThis` 기반 thin 파일로 재편**

```js
export const mockStore = (globalThis.__jsTeMockStore__ ??= new Map());
```

다중 로드되어도 같은 Map 공유. store.js 자체에 대한 충돌은 해소(이름이 바뀐 global 키를 쓰므로).

- 장점: store.js 가 여러 번 로드돼도 싱글톤 보장. dist/src 혼용 경로에도 안전.
- 단점: 사용자 파일에 `const mockStore` 지역 선언이 있는 경우의 주입 충돌은 여전히 남음 (Program visitor 가 계속 주입하기 때문).

**대안 E — babel Program visitor 의 `mockStore` 주입 자체를 삭제**

[src/babelPlugins/babelTransform.js:35-46](../../src/babelPlugins/babelTransform.js) 의 Program visitor 삭제. 래퍼 코드가 `mockStore.has/get` 대신 `globalThis.__jsTeMockStore__.has/get` 으로 직접 접근하도록 [src/babelPlugins/utils/wrapperCreator.js](../../src/babelPlugins/utils/wrapperCreator.js) 수정.

- 장점: 파일 스코프에 식별자를 주입하지 않으므로 어떤 파일이든 충돌 불가. 사용자 공간 오염 해소.
- 단점: store.js 가 두 번 로드되는 경로가 생기면 Map 이 갈라짐 (현재는 발생 안 하지만 구조적 안전망 없음).

**추천: C + E 결합**

두 대안은 상보적. C 는 store.js 쪽 견고성, E 는 변환 쪽 견고성을 담당.

| 남는 위험 | C만 | E만 | **C+E** |
|---|---|---|---|
| 사용자 지역변수 `mockStore` 충돌 | 🔴 | ✅ | ✅ |
| store.js 다중 로드 시 Map 분열 | ✅ | 🔴 | ✅ |
| 현재 리포 버그 | ✅ | ✅ | ✅ |

### 수정 범위

- `src/mock/store.js` — 1줄 (C)
- `src/babelPlugins/babelTransform.js` — Program visitor 블록 삭제 (E)
- `src/babelPlugins/utils/wrapperCreator.js` — `mockStore` 식별자 → `globalThis.__jsTeMockStore__` MemberExpression 치환 (E)
- `src/constants/babel.js` — `STORE_NAME` 제거, `STORE_GLOBAL = '__jsTeMockStore__'` 추가
- `test/plugin/babelTransform.test.js` — "Program visitor mockStore 주입" 케이스 삭제, "wrapper 가 globalThis 로 접근" 케이스 추가
- `dist/` — `npm run build` 재생성
- `test/cli/testNameFilter.test.js` — Phase 5 에서 우회 작성한 marker 방식을 `testManager` 직접 import 스타일로 원복 (선택)

### 공개 API 영향

없음. `mockStore` 는 계속 `@dannysir/js-te` 에서 export. 사용자 코드 수정 불필요.

### 브랜치 전략

`feature-partial-run` 머지 후 별도 브랜치 `fix-mock-store-injection-collision` 에서 처리. 이유: 버그 수정이 현재 브랜치 테마와 무관 + dist 재빌드로 diff 가 커짐.

---

## 다음 브랜치 후보 (간단 메모, 까먹지 않게)

- [ ] **`-t` 필터 시 `Found N test file(s)` 숫자 부정확** — 이름 필터는 import 후 적용되므로 초기 표시 숫자에 반영 안 됨. 2-pass 리팩터로 해결 (pre-scan → `testManager.setTests` 주입 API 신규 → 실제 실행).
- [ ] **라인 번호 기반 단일 테스트 실행 (`--testLocation path:line`)** — IDE 거터 ▶ 버튼 전제 조건. `testManager.test()` 에서 `new Error().stack` 파싱해 `{file, line}` 캡처. 동명 중복 테스트 단일 실행의 유일한 확정 해결책. Jest/Vitest 도 이 케이스는 AST+정규식 근사치만 제공.
- [ ] 코드 레벨 `.only` / `.skip` / `.todo`
- [ ] JSON reporter
- [ ] VSCode / IDEA 확장 (별도 저장소, 위 라인 기반 실행이 선결)
