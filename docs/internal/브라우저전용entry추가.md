# 브라우저 전용 entry 추가

> 외부 사이트 (특히 `dannysir-labs`) 가 브라우저에서 본 라이브러리의 코어 (`describe` / `test` / `expect` / `fn`) 를 직접 import 해 쓸 수 있도록, **브라우저 안전 entry 를 명시적으로 분리**합니다.

## 배경

`dannysir-labs` (라이브러리 시연 사이트) 는 `@dannysir/js-te` 의 인터랙티브 시연을 제공합니다. 본 라이브러리의 CLI 러너는 Node 22.15+ 의 `module.registerHooks` 를 사용하므로 브라우저에서 그대로 돌릴 수 없고, 그래서 시연 사이트는 처음에 **자체 미니 러너로 코어를 모사** 하는 방식으로 출발했습니다.

문제는 **동기화 부담** 입니다. 매처를 추가하거나 `expect` 의 시그니처를 바꾸면, 라이브러리 본체와 시연 사이트의 미니 러너 두 곳을 모두 손봐야 합니다. 모사 코드는 라이브러리의 진실과 어긋날 수 있는 잠재적 거짓말이라 시연 신뢰도도 떨어집니다.

다행히 본 라이브러리의 코어 (`testManager`, `expect/**`, `mock/makeMockFnc`) 는 **이미 순수 JS** 입니다. `fs` / `path` / `module` 같은 Node API import 가 없습니다. 진짜 Node 의존은 다음 두 군데에만 갇혀 있습니다:

- `bin/cli.js` — `module.registerHooks` 진입점
- `babelPlugins/` — babel transform hook

`index.js` (= `dist/index.mjs`) 는 위 둘 어느 쪽도 import 하지 않으므로 `dist/index.mjs` 도 사실상 브라우저에서 import 가능에 가깝습니다. 단, `package.json#dependencies` 에 `@babel/*` 가 있고 rollup 의 `external` 로 흘려보낸 흔적이 있어서 번들러가 깜짝 실패할 위험이 0 은 아닙니다. 그래서 **명시적으로 안전한 entry** 를 새로 만드는 편이 안전합니다.

## 작업 항목

### 1. 루트에 `browser.js` 신규 작성

브라우저에서 안전한 API 만 re-export. Node 전용 (`mock`, `unmock`, `isMocked`, `clearAllMocks`, `mockStore`, `run`) 은 의도적으로 제외합니다.

```js
// browser.js (라이브러리 루트)
import { testManager } from './src/testManager.js';
import { expect } from './src/expect/index.js';
import { makeMockFnc } from './src/mock/makeMockFnc.js';

export const test = (description, fn) => testManager.test(description, fn);
test.each = (cases) => testManager.testEach(cases);

export const describe = (suiteName, fn) => testManager.describe(suiteName, fn);
export const beforeEach = (fn) => testManager.beforeEach(fn);

export { expect, testManager };
export const fn = makeMockFnc;
```

이 entry 가 transitively 끌고 오는 파일은 다음으로 한정됩니다:

- `src/testManager.js`
- `src/expect/index.js` 와 `src/expect/matchers/**`
- `src/expect/matchers/utils/{deepEqual.js, runArgFnc.js}`
- `src/mock/makeMockFnc.js`
- `src/view/{reportMessages.js, errorMessages.js, safeStringify.js, colors.js}`

위 트리에 Node API import 가 없는지는 본 작업 시 grep 으로 다시 확인해 주세요. (현재 시점 기준 모두 깨끗합니다.)

### 2. `rollup.config.js` 에 새 build 추가

```js
{
  input: 'browser.js',
  output: {
    file: 'dist/browser.mjs',
    format: 'esm',
    sourcemap: true,
  },
  external: [], // browser entry 는 babel/fs/path 어느 것도 import 하지 않음
  plugins: [nodeResolve(), commonjs()],
},
```

기존 두 build (`dist/index.mjs`, `dist/index.cjs`) 는 그대로 유지합니다.

### 3. `package.json#exports` 갱신

```json
"exports": {
  ".": {
    "import": "./dist/index.mjs",
    "require": "./dist/index.cjs"
  },
  "./browser": {
    "import": "./dist/browser.mjs",
    "browser": "./dist/browser.mjs",
    "default": "./dist/browser.mjs"
  },
  "./src/mock/store.js": "./src/mock/store.js"
}
```

CJS 가 본 entry 에 필요하지 않다면 `import` / `browser` / `default` 만 둬도 충분합니다 (브라우저 번들러는 모두 ESM 만 요구).

`files` 필드는 이미 `dist/` 를 포함하고 있으므로 추가 변경이 필요 없습니다.

### 4. 빌드 + publish

```bash
npm run build        # dist/browser.mjs 가 생성되는지 확인
node -e "import('./dist/browser.mjs').then(m => console.log(Object.keys(m)))"
# 기대 출력: [ 'test', 'describe', 'beforeEach', 'expect', 'testManager', 'fn' ]

# CLAUDE.md 의 "package.json의 버전은 수정하지 않음" 규칙에 따라
# 버전 bump 는 사용자(메인테이너) 가 직접 결정·반영합니다.
npm publish
```

## 사용자 (시연 사이트) 측 사용 예시

`dannysir-labs` 가 본 entry 를 어떻게 쓸지 (참고용 — 라이브러리 작업 자체와는 무관):

```ts
// dannysir-labs/components/js-te-demo/runner/index.ts (Phase 4 산출 슬림화 후)
import { expect, fn } from '@dannysir/js-te/browser';

// describe / test / beforeEach 는 시연 사이트 측 wrapper 가 직접 처리.
// 이유: 시연은 (a) 트리 구조 결과 (b) 매 실행마다 깨끗한 격리 가 필요하므로,
// 모듈 싱글톤 + 평탄 path 를 쓰는 라이브러리 testManager 직접 사용은 부적합.
// 자주 손이 가는 부분 (matchers, fn) 만 라이브러리 import 로 자동 동기화.

const userFn = new Function(
  'describe', 'test', 'beforeEach', 'expect', 'fn', 'console',
  source,
);
userFn(wrappedDescribe, wrappedTest, wrappedBeforeEach, expect, fn, capturingConsole);
```

## 원리

1. **`package.json#exports` 의 sub-path entry**: Node 12.7+, Webpack/Rollup/Turbopack/Vite 등 모든 메이저 번들러가 표준 지원. 시연 사이트가 `import x from '@dannysir/js-te/browser'` 라고 적으면 번들러가 `node_modules/@dannysir/js-te/package.json` 의 `exports['./browser']` 매핑을 따라가 `dist/browser.mjs` 를 가져옵니다.
2. **ESM 번들 흡수**: Next.js (Turbopack) 가 `dist/browser.mjs` 를 클라이언트 번들에 포함. `'use client'` 컴포넌트 안에서 import 하면 그대로 브라우저에서 실행.
3. **Tree-shaking**: 시연 사이트가 `expect`, `fn` 만 사용하면 사용자 측 번들러가 unused export 를 잘라냅니다 (rollup 빌드 단계에서는 모두 들어가지만 사용처 번들에서 다시 셰이킹).
4. **버전 동기화**: 라이브러리 publish 후 시연 사이트는 `package.json` 의 `^x.y.z` 를 갱신하면 매처 추가/시그니처 변경이 자동 반영됩니다.

## 검증

라이브러리 저장소에서:

1. `npm run build` 가 에러 없이 끝나고 `dist/browser.mjs` 와 `dist/browser.mjs.map` 가 생성되는지 확인.
2. `node -e "import('./dist/browser.mjs').then(m => console.log(Object.keys(m).sort()))"` 출력에 `beforeEach, describe, expect, fn, test, testManager` 가 모두 포함되는지 확인.
3. 다음 한 줄 스모크 테스트가 통과하는지 (브라우저 호환성 사전 점검):

   ```bash
   node -e "
     const m = await import('./dist/browser.mjs');
     m.describe('s', () => m.test('t', () => m.expect(1+2).toBe(3)));
     await m.testManager.run();
   "
   ```

## 위험 / 주의

- **dual entry mismatch**: `'@dannysir/js-te'` (Node entry) 와 `'@dannysir/js-te/browser'` 의 동작 차이는 의도된 것입니다. README 에 한 줄 명시 권장 — 예: "browser entry 는 모듈 모킹 (`mock()`) 과 CLI runner 를 제외한 코어 API 만 export 합니다".
- **`testManager` 싱글톤 누수**: browser entry 도 module-level singleton (`testManager`) 을 노출합니다. 외부 사용자가 같은 페이지에서 여러 번 collect 하려면 `testManager.clearTests()` 로 청소해야 합니다. 이 부분은 시연 사이트가 자체 wrapper 를 쓰면서 우회합니다.
- **`.d.ts` 부재**: 본 작업 범위에는 타입 정의 추가가 포함되지 않습니다. 사용자는 모듈 augmentation 또는 자체 `interface` 로 받게 됩니다. 타입 정의는 후속 작업으로 분리.
- **버전 정책**: 신규 entry 추가는 SemVer minor 에 해당합니다 (기존 API 비파괴). publish 전 메인테이너가 버전 정책에 맞춰 bump.

## Out of scope (별도 작업으로 분리)

- 본 라이브러리에 TypeScript 타입 선언 (`.d.ts`) 추가
- README (한·영) 의 "브라우저 사용" 섹션 추가 — entry publish 후 별도 PR
- `dannysir-labs` 의 러너 슬림화 — 이 entry 가 publish 되고 난 다음 시연 사이트 저장소에서 진행
